import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import prisma from "@/lib/prisma";
import { writeFile, unlink } from "fs/promises";
import { join } from "path";
import { tmpdir } from "os";
import { randomUUID } from "crypto";
import { extractTextFromFile, cleanExtractedText } from "@/lib/fileExtraction";

export const runtime = "nodejs";

const ALLOWED_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
  "text/csv",
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

// PATCH - Update a knowledge base document
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; docId: string }> }
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: organizationId, docId } = await params;

    // Verify user belongs to this organization
    const userRecord = await prisma.user.findUnique({
      where: { id: user.id },
      select: { organizationId: true },
    });

    if (!userRecord || userRecord.organizationId !== organizationId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Check if document exists and belongs to this organization
    const existingDoc = await prisma.knowledgeBaseDocument.findFirst({
      where: {
        id: docId,
        organizationId,
      },
    });

    if (!existingDoc) {
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 }
      );
    }

    const contentType = req.headers.get("content-type");

    // Handle file replacement (multipart/form-data)
    if (contentType?.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file") as File;

      if (!file) {
        return NextResponse.json(
          { error: "No file provided" },
          { status: 400 }
        );
      }

      // Validate file type
      if (!ALLOWED_TYPES.includes(file.type)) {
        return NextResponse.json(
          {
            error:
              "Unsupported file type. Please upload PDF, Word, or CSV files.",
          },
          { status: 400 }
        );
      }

      // Validate file size
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { error: "File size exceeds 10MB limit" },
          { status: 400 }
        );
      }

      // Save file to temporary location
      const buffer = Buffer.from(await file.arrayBuffer());
      const sanitizedFileName = file.name.replace(/[/\\:*?"<>|]/g, "-");
      const tempFilePath = join(
        tmpdir(),
        `${randomUUID()}-${sanitizedFileName}`
      );
      await writeFile(tempFilePath, buffer);

      let extractedText: string | undefined;

      try {
        // Extract text from file
        extractedText = await extractTextFromFile(tempFilePath, file.type);
        if (extractedText) {
          extractedText = cleanExtractedText(extractedText);
        }
      } catch (error) {
        console.error("Error extracting text from file:", error);
        extractedText = "[Error extracting text from document]";
      } finally {
        // Clean up temp file
        await unlink(tempFilePath);
      }

      if (!extractedText || extractedText.length === 0) {
        return NextResponse.json(
          { error: "No text could be extracted from the file" },
          { status: 400 }
        );
      }

      // Update document with new file and reset vectorization status
      const updatedDoc = await prisma.knowledgeBaseDocument.update({
        where: { id: docId },
        data: {
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
          extractedText,
          vectorizationStatus: "PENDING",
          vectorizedAt: null,
          vectorizationError: null,
          chunkCount: null,
          updatedAt: new Date(),
        },
        select: {
          id: true,
          fileName: true,
          fileType: true,
          fileSize: true,
          fileUrl: true,
          isActive: true,
          vectorizationStatus: true,
          vectorizedAt: true,
          vectorizationError: true,
          chunkCount: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      // Trigger re-vectorization
      const protocol = req.headers.get("x-forwarded-proto") || "http";
      const host = req.headers.get("host") || "localhost:3000";
      const vectorizeUrl = `${protocol}://${host}/api/organizations/${organizationId}/knowledge-base/vectorize`;

      fetch(vectorizeUrl, {
        method: "POST",
        headers: { "x-api-key": process.env.INTERNAL_API_KEY! },
      }).catch((err) => console.error("Failed to trigger vectorization:", err));

      return NextResponse.json({ document: updatedDoc });
    }

    // Handle JSON updates (toggle isActive, rename)
    const body = await req.json();
    const updateData: {
      isActive?: boolean;
      fileName?: string;
      updatedAt?: Date;
    } = {};

    if (typeof body.isActive === "boolean") {
      updateData.isActive = body.isActive;
    }

    if (body.fileName && typeof body.fileName === "string") {
      updateData.fileName = body.fileName;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "No valid fields to update" },
        { status: 400 }
      );
    }

    updateData.updatedAt = new Date();

    const updatedDoc = await prisma.knowledgeBaseDocument.update({
      where: { id: docId },
      data: updateData,
      select: {
        id: true,
        fileName: true,
        fileType: true,
        fileSize: true,
        fileUrl: true,
        isActive: true,
        vectorizationStatus: true,
        vectorizedAt: true,
        vectorizationError: true,
        chunkCount: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ document: updatedDoc });
  } catch (error) {
    console.error("Error updating knowledge base document:", error);
    return NextResponse.json(
      {
        error: "Failed to update document",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// DELETE - Delete a knowledge base document
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; docId: string }> }
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: organizationId, docId } = await params;

    // Verify user belongs to this organization
    const userRecord = await prisma.user.findUnique({
      where: { id: user.id },
      select: { organizationId: true },
    });

    if (!userRecord || userRecord.organizationId !== organizationId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Check if document exists and belongs to this organization
    const existingDoc = await prisma.knowledgeBaseDocument.findFirst({
      where: {
        id: docId,
        organizationId,
      },
    });

    if (!existingDoc) {
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 }
      );
    }

    // Delete the document
    await prisma.knowledgeBaseDocument.delete({
      where: { id: docId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting knowledge base document:", error);
    return NextResponse.json(
      {
        error: "Failed to delete document",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
