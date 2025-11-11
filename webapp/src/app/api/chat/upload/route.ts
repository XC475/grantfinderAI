import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { DocxLoader } from "@langchain/community/document_loaders/fs/docx";
import { CSVLoader } from "@langchain/community/document_loaders/fs/csv";
import { writeFile, unlink, readFile } from "fs/promises";
import { join } from "path";
import { tmpdir } from "os";
import { randomUUID } from "crypto";
import type { Document } from "@langchain/core/documents";
import { extractText } from "unpdf";

// Maximum file size: 40MB
const MAX_FILE_SIZE = 40 * 1024 * 1024;

// Allowed file types
const ALLOWED_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
  "text/csv",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "image/png",
  "image/jpeg",
  "image/jpg",
];

interface FileAttachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  extractedText?: string;
}

async function extractTextFromFile(
  filePath: string,
  mimeType: string
): Promise<string> {
  switch (mimeType) {
    case "application/pdf": {
      // Use unpdf instead of pdf-parse (more reliable in serverless environments)
      const fileBuffer = await readFile(filePath);
      // Convert Buffer to Uint8Array (required by unpdf)
      const uint8Array = new Uint8Array(fileBuffer);
      const { text } = await extractText(uint8Array);
      // unpdf returns an array of text strings (one per page)
      const extractedText = Array.isArray(text) ? text.join("\n\n") : text;
      return extractedText || "[PDF contains no extractable text]";
    }
    case "application/vnd.openxmlformats-officedocument.wordprocessingml.document": {
      const loader = new DocxLoader(filePath);
      const documents = await loader.load();
      return documents.map((doc: Document) => doc.pageContent).join("\n\n");
    }
    case "text/plain": {
      // For plain text files, just read the content directly
      const content = await readFile(filePath, "utf-8");
      return content;
    }
    case "text/csv": {
      const loader = new CSVLoader(filePath);
      const documents = await loader.load();
      return documents.map((doc: Document) => doc.pageContent).join("\n\n");
    }
    case "application/vnd.ms-excel":
    case "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": {
      // For Excel files, treat as CSV for now
      // In production, you might want to use a specialized Excel loader
      const loader = new CSVLoader(filePath);
      const documents = await loader.load();
      return documents.map((doc: Document) => doc.pageContent).join("\n\n");
    }
    case "image/png":
    case "image/jpeg":
    case "image/jpg":
      // Images: For now, return a placeholder
      // To implement OCR, you would need additional libraries like tesseract.js
      return "[Image file - OCR not yet implemented]";
    default:
      throw new Error(`Unsupported file type: ${mimeType}`);
  }
}

export async function POST(req: NextRequest) {
  try {
    // 1. Authenticate user
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Parse the multipart form data
    const formData = await req.formData();
    const files = formData.getAll("files") as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 });
    }

    const uploadedFiles: FileAttachment[] = [];

    // 3. Process each file
    for (const file of files) {
      // Validate file type
      if (!ALLOWED_TYPES.includes(file.type)) {
        return NextResponse.json(
          { error: `File type ${file.type} is not allowed` },
          { status: 400 }
        );
      }

      // Validate file size
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { error: `File ${file.name} exceeds maximum size of 40MB` },
          { status: 400 }
        );
      }

      // 4. Save file to temporary location for text extraction
      const buffer = Buffer.from(await file.arrayBuffer());
      const tempFilePath = join(tmpdir(), `${randomUUID()}-${file.name}`);
      await writeFile(tempFilePath, buffer);

      let extractedText: string | undefined;

      try {
        // 5. Extract text from file
        extractedText = await extractTextFromFile(tempFilePath, file.type);
      } catch (error) {
        console.error("Error extracting text from file:", error);
        extractedText = "[Error extracting text from file]";
      }

      // 6. Upload to Supabase Storage
      const fileId = randomUUID();
      const fileExtension = file.name.split(".").pop();
      const storagePath = `${user.id}/${fileId}.${fileExtension}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("chat-attachments")
        .upload(storagePath, buffer, {
          contentType: file.type,
          upsert: false,
        });

      if (uploadError) {
        console.error("Error uploading to Supabase:", uploadError);
        // Clean up temp file
        await unlink(tempFilePath).catch(console.error);
        return NextResponse.json(
          { error: `Failed to upload ${file.name}` },
          { status: 500 }
        );
      }

      // 7. Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("chat-attachments").getPublicUrl(storagePath);

      // 8. Clean up temp file
      await unlink(tempFilePath).catch(console.error);

      // 9. Add to uploaded files list
      uploadedFiles.push({
        id: fileId,
        name: file.name,
        type: file.type,
        size: file.size,
        url: publicUrl,
        extractedText,
      });
    }

    // 10. Return uploaded files metadata
    return NextResponse.json({ files: uploadedFiles });
  } catch (error) {
    console.error("Error in upload endpoint:", error);
    return NextResponse.json(
      { error: "Failed to process file upload" },
      { status: 500 }
    );
  }
}
