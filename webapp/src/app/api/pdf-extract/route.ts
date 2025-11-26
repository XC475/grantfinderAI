import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { extractTextFromFile, cleanExtractedText } from "@/lib/fileExtraction";
import { writeFile, unlink } from "fs/promises";
import { join } from "path";
import { tmpdir } from "os";
import { randomUUID } from "crypto";
import { extractText } from "unpdf";
import {
  MAX_DOCUMENT_SIZE,
  validatePageCount,
} from "@/lib/uploadValidation";

// Force Node.js runtime instead of Edge runtime
export const runtime = "nodejs";

// Allowed file types
const ALLOWED_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
];

export async function POST(req: NextRequest) {
  let tempFilePath: string | null = null;

  try {
    // Verify authentication
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the uploaded file
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Only PDF and Word (.docx) files are allowed" },
        { status: 400 }
      );
    }

    // Validate file size (max 40MB)
    if (file.size > MAX_DOCUMENT_SIZE) {
      return NextResponse.json(
        { error: "File size must be less than 40MB" },
        { status: 400 }
      );
    }

    // Save file to temporary location for text extraction
    const buffer = Buffer.from(await file.arrayBuffer());
    const sanitizedFileName = file.name.replace(/[/\\:*?"<>|]/g, "-");
    tempFilePath = join(tmpdir(), `${randomUUID()}-${sanitizedFileName}`);
    await writeFile(tempFilePath, buffer);

    // Extract text using shared utility
    let extractedText: string;
    let pageCount: number | undefined;

    if (file.type === "application/pdf") {
      // For PDFs, use unpdf directly to get page count
      const uint8Array = new Uint8Array(buffer);
      const { text, totalPages } = await extractText(uint8Array);
      const joinedText = Array.isArray(text) ? text.join("\n\n") : text;
      extractedText = joinedText || "";
      pageCount = totalPages;
      
      // Validate page count
      const pageValidation = validatePageCount(pageCount);
      if (!pageValidation.valid) {
        return NextResponse.json(
          { error: pageValidation.error },
          { status: 400 }
        );
      }
    } else {
      // For DOCX and other types, use the shared utility
      extractedText = await extractTextFromFile(tempFilePath, file.type);
      // DOCX doesn't have pages, so we'll estimate based on content length
      // Rough estimate: ~500 words per page
      const wordCount = extractedText.split(/\s+/).length;
      pageCount = Math.max(1, Math.ceil(wordCount / 500));
    }

    // Clean extracted text
    extractedText = cleanExtractedText(extractedText);

    if (!extractedText || extractedText.length === 0) {
      return NextResponse.json(
        { error: "No text could be extracted from the file" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      text: extractedText,
      pageCount: pageCount || 1,
    });
  } catch (error) {
    console.error("Error extracting text from file:", error);
    return NextResponse.json(
      {
        error: "Failed to extract text from file",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  } finally {
    // Clean up temporary file
    if (tempFilePath) {
      try {
        await unlink(tempFilePath);
      } catch (cleanupError) {
        console.warn("Failed to clean up temporary file:", cleanupError);
      }
    }
  }
}
