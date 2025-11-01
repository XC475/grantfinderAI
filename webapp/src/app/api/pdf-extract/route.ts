import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

// Force Node.js runtime instead of Edge runtime
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
    const uint8Array = new Uint8Array(arrayBuffer);

    // Use pdfjs-dist directly for text extraction (no canvas/native dependencies needed)
    const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf.mjs");
    const path = await import("path");

    // Set the worker source to the correct location
    // This is required for pdfjs to work properly
    const workerPath = path.join(
      process.cwd(),
      "node_modules",
      "pdfjs-dist",
      "legacy",
      "build",
      "pdf.worker.mjs"
    );

    pdfjsLib.GlobalWorkerOptions.workerSrc = workerPath;

    // Load PDF document
    const loadingTask = pdfjsLib.getDocument({
      data: uint8Array,
      useSystemFonts: true,
      useWorkerFetch: false,
      isEvalSupported: false,
      standardFontDataUrl: undefined,
      disableAutoFetch: true,
      disableStream: true,
    });

    const pdfDocument = await loadingTask.promise;
    const numPages = pdfDocument.numPages;

    // Extract text from all pages
    const textPromises: Promise<string>[] = [];
    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
      textPromises.push(
        pdfDocument.getPage(pageNum).then(async (page) => {
          const textContent = await page.getTextContent();
          const strings = textContent.items.map((item: unknown) => {
            return typeof item === "object" && item !== null && "str" in item
              ? String((item as { str: string }).str)
              : "";
          });
          return strings.join(" ");
        })
      );
    }

    const pagesText = await Promise.all(textPromises);
    let extractedText = pagesText.join("\n\n");

    // Basic text cleaning
    extractedText = extractedText
      .replace(/\s+/g, " ") // Normalize whitespace
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
      pageCount: numPages,
    });
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
