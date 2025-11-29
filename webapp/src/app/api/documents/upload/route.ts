import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import prisma from "@/lib/prisma";
import { extractText } from "unpdf";
import { extractTextFromFile, cleanExtractedText } from "@/lib/fileExtraction";
import { writeFile, unlink } from "fs/promises";
import { join } from "path";
import { tmpdir } from "os";
import { randomUUID } from "crypto";
import {
  MAX_DOCUMENT_SIZE,
  validatePageCount,
} from "@/lib/uploadValidation";
import { FileCategory } from "@/generated/prisma";
import { triggerDocumentVectorization } from "@/lib/textExtraction";

// Force Node.js runtime for file processing
export const runtime = "nodejs";

const ALLOWED_TYPES = {
  "application/pdf": ".pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
    ".docx",
  "text/plain": ".txt",
  "text/csv": ".csv",
};

const MAX_SIZE = MAX_DOCUMENT_SIZE; // 40MB

export async function POST(req: NextRequest) {
  try {
    // Authenticate user
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's organization
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { organizationId: true },
    });

    if (!dbUser?.organizationId) {
      return NextResponse.json(
        { error: "User organization not found" },
        { status: 404 }
      );
    }

    // Get the uploaded file and metadata
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const folderId = formData.get("folderId") as string | null;
    const applicationId = formData.get("applicationId") as string | null;
    const fileCategory = (formData.get("fileCategory") as string) || "GENERAL";
    const isKnowledgeBase = formData.get("isKnowledgeBase") === "true";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type
    const mimeType = file.type;
    if (!Object.keys(ALLOWED_TYPES).includes(mimeType)) {
      return NextResponse.json(
        { error: "Supported formats: PDF, Word, TXT, CSV" },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "File must be under 40MB" },
        { status: 400 }
      );
    }

    // Convert file to buffer for both extraction and upload
    const buffer = Buffer.from(await file.arrayBuffer());

    // Save to temporary file for text extraction
    // Use only extension to avoid ENAMETOOLONG error with very long filenames
    const fileExtension = file.name.split(".").pop() || "tmp";
    const tempFilePath = join(tmpdir(), `${randomUUID()}.${fileExtension}`);
    await writeFile(tempFilePath, buffer);

    // Extract text based on file type using shared utility
    let extractedText = "";
    let pageCount: number | undefined;

    try {
      extractedText = await extractTextFromFile(tempFilePath, mimeType);

      // Clean the extracted text
      extractedText = cleanExtractedText(extractedText);

      // For PDFs, also get page count and validate
      if (mimeType === "application/pdf") {
        const uint8Array = new Uint8Array(buffer);
        const { totalPages } = await extractText(uint8Array);
        pageCount = totalPages;
        
        // Validate page count
        const pageValidation = validatePageCount(pageCount);
        if (!pageValidation.valid) {
          await unlink(tempFilePath).catch(console.error);
          return NextResponse.json(
            { error: pageValidation.error },
            { status: 400 }
          );
        }
      }
    } catch (error) {
      console.error("Error extracting text:", error);
      // Clean up temp file
      await unlink(tempFilePath).catch(console.error);
      return NextResponse.json(
        { error: "Could not extract text from file" },
        { status: 500 }
      );
    } finally {
      // Clean up temp file
      await unlink(tempFilePath).catch(console.error);
    }

    // Upload file to Supabase Storage
    const extension =
      ALLOWED_TYPES[mimeType as keyof typeof ALLOWED_TYPES] || "";
    const fileName = `${Date.now()}-${randomUUID()}${extension}`;
    const filePath = `${dbUser.organizationId}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("documents")
      .upload(filePath, buffer, {
        contentType: mimeType,
        upsert: false,
      });

    if (uploadError) {
      console.error("Storage upload error:", uploadError);
      return NextResponse.json(
        { error: "Failed to upload file" },
        { status: 500 }
      );
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from("documents").getPublicUrl(filePath);

    // Verify folderId if provided
    if (folderId && folderId !== "null") {
      const folder = await prisma.folder.findFirst({
        where: {
          id: folderId,
          organizationId: dbUser.organizationId,
        },
      });

      if (!folder) {
        return NextResponse.json(
          { error: "Folder not found or access denied" },
          { status: 404 }
        );
      }
    }

    // Create document record
    const document = await prisma.document.create({
      data: {
        title: file.name,
        content: null,
        contentType: "file",
        fileUrl: publicUrl,
        fileType: mimeType,
        fileSize: file.size,
        fileCategory: fileCategory as FileCategory,
        isKnowledgeBase,
        extractedText: extractedText || null, // Move from metadata to top-level
        vectorizationStatus: extractedText ? "PENDING" : "COMPLETED",
        metadata: {
          originalFileName: file.name,
          ...(pageCount && { pageCount }),
          uploadedAt: new Date().toISOString(),
        },
        folderId: folderId && folderId !== "null" ? folderId : null,
        organizationId: dbUser.organizationId,
        applicationId:
          applicationId && applicationId !== "null" ? applicationId : null,
        version: 1,
      },
      include: {
        application: {
          select: {
            id: true,
            title: true,
          },
        },
        folder: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Trigger vectorization if text was extracted
    if (extractedText) {
      await triggerDocumentVectorization(document.id, dbUser.organizationId);
    }

    return NextResponse.json({ document }, { status: 201 });
  } catch (error) {
    console.error("Error uploading file:", error);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    );
  }
}
