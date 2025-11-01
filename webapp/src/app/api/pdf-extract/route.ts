import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

// Force Node.js runtime instead of Edge runtime to support DOM APIs needed by pdf-parse
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
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
    if (file.type !== "application/pdf") {
      return NextResponse.json(
        { error: "Only PDF files are allowed" },
        { status: 400 }
      );
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File size must be less than 10MB" },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Use dynamic import to load pdf-parse only at runtime in Node.js context
    // This prevents DOMMatrix errors during module initialization
    const { PDFParse } = await import("pdf-parse");
    const { join } = await import("path");

    // Configure worker for Node.js/Next.js environment
    const workerPath = join(
      process.cwd(),
      "node_modules",
      "pdf-parse",
      "dist",
      "worker",
      "pdf.worker.mjs"
    );
    PDFParse.setWorker(workerPath);

    // Use pdf-parse v2 to extract text
    const parser = new PDFParse({ data: buffer });

    try {
      const result = await parser.getText();

      // Extract and clean the text
      let extractedText = result.text;

      // Basic text cleaning
      extractedText = extractedText
        .replace(/\r\n/g, "\n") // Normalize line endings
        .replace(/\n{3,}/g, "\n\n") // Remove excessive line breaks
        .trim();

      if (!extractedText || extractedText.length === 0) {
        return NextResponse.json(
          { error: "No text could be extracted from the PDF" },
          { status: 400 }
        );
      }

      return NextResponse.json({
        success: true,
        text: extractedText,
        pageCount: result.total,
      });
    } finally {
      // Always call destroy() to free memory
      await parser.destroy();
    }
  } catch (error) {
    console.error("Error extracting PDF text:", error);
    return NextResponse.json(
      {
        error: "Failed to extract text from PDF",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
