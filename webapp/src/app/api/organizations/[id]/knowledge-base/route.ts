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
const MAX_DOCUMENTS = 10;

// GET - List all knowledge base documents for an organization
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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

    const { id: organizationId } = await params;

    // Verify user belongs to this organization
    const userRecord = await prisma.user.findUnique({
      where: { id: user.id },
      select: { organizationId: true },
    });

    if (!userRecord || userRecord.organizationId !== organizationId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Fetch all knowledge base documents for this organization
    const documents = await prisma.knowledgeBaseDocument.findMany({
      where: { organizationId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        fileName: true,
        fileType: true,
        fileSize: true,
        fileUrl: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ documents });
  } catch (error) {
    console.error("Error fetching knowledge base documents:", error);
    return NextResponse.json(
      { error: "Failed to fetch knowledge base documents" },
      { status: 500 }
    );
  }
}

// POST - Upload a new knowledge base document
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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

    const { id: organizationId } = await params;

    // Verify user belongs to this organization
    const userRecord = await prisma.user.findUnique({
      where: { id: user.id },
      select: { organizationId: true },
    });

    if (!userRecord || userRecord.organizationId !== organizationId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Check document limit
    const existingDocCount = await prisma.knowledgeBaseDocument.count({
      where: { organizationId },
    });

    if (existingDocCount >= MAX_DOCUMENTS) {
      return NextResponse.json(
        {
          error: `Maximum ${MAX_DOCUMENTS} documents allowed. Delete a document to upload a new one.`,
        },
        { status: 400 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Unsupported file type. Please upload PDF, Word, or CSV files." },
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
    const tempFilePath = join(tmpdir(), `${randomUUID()}-${sanitizedFileName}`);
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

    // Create knowledge base document in database
    const document = await prisma.knowledgeBaseDocument.create({
      data: {
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        extractedText,
        organizationId,
        isActive: true,
      },
      select: {
        id: true,
        fileName: true,
        fileType: true,
        fileSize: true,
        fileUrl: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ document }, { status: 201 });
  } catch (error) {
    console.error("Error uploading knowledge base document:", error);
    return NextResponse.json(
      {
        error: "Failed to upload document",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

