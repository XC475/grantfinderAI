import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { writeFile, unlink } from "fs/promises";
import { join } from "path";
import { tmpdir } from "os";
import { randomUUID } from "crypto";
import { extractTextFromFile, cleanExtractedText } from "@/lib/fileExtraction";

// Maximum file size: 40MB
const MAX_FILE_SIZE = 40 * 1024 * 1024;

// Allowed file types
const ALLOWED_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
  "text/csv",
];

// File types that are coming soon
const COMING_SOON_TYPES = [
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "image/png",
  "image/jpeg",
  "image/jpg",
];

const COMING_SOON_NAMES: Record<string, string> = {
  "application/vnd.ms-excel": "Excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "Excel",
  "image/png": "Image",
  "image/jpeg": "Image",
  "image/jpg": "Image",
};

interface FileAttachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  extractedText?: string;
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
      // Check if file type is coming soon
      if (COMING_SOON_TYPES.includes(file.type)) {
        const fileTypeName = COMING_SOON_NAMES[file.type] || file.type;
        return NextResponse.json(
          {
            error: `${fileTypeName} file support is currently being developed. For now, please use PDF, Word (.docx), Text (.txt), or CSV files.`,
          },
          { status: 400 }
        );
      }

      // Validate file type
      if (!ALLOWED_TYPES.includes(file.type)) {
        return NextResponse.json(
          {
            error: `File type ${file.type} is not supported. Supported types: PDF, Word (.docx), Text (.txt), CSV.`,
          },
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
      // Sanitize filename by replacing invalid path characters
      const sanitizedFileName = file.name.replace(/[/\\:*?"<>|]/g, '-');
      const tempFilePath = join(tmpdir(), `${randomUUID()}-${sanitizedFileName}`);
      await writeFile(tempFilePath, buffer);

      let extractedText: string | undefined;

      try {
        // 5. Extract text from file using shared utility
        extractedText = await extractTextFromFile(tempFilePath, file.type);
        // 6. Clean extracted text using shared utility
        if (extractedText) {
          extractedText = cleanExtractedText(extractedText);
        }
      } catch (error) {
        console.error("Error extracting text from file:", error);
        extractedText = "[Error extracting text from file]";
      }

      // 7. Upload to Supabase Storage
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

      // 8. Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("chat-attachments").getPublicUrl(storagePath);

      // 9. Clean up temp file
      await unlink(tempFilePath).catch(console.error);

      // 10. Add to uploaded files list
      uploadedFiles.push({
        id: fileId,
        name: file.name,
        type: file.type,
        size: file.size,
        url: publicUrl,
        extractedText,
      });
    }

    // 11. Return uploaded files metadata
    return NextResponse.json({ files: uploadedFiles });
  } catch (error) {
    console.error("Error in upload endpoint:", error);
    return NextResponse.json(
      { error: "Failed to process file upload" },
      { status: 500 }
    );
  }
}
