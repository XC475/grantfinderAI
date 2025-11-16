import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import prisma from "@/lib/prisma";
import { deleteFileFromStorage } from "@/lib/documentStorageCleanup";

// GET /api/applications/[applicationId]/documents/[documentId] - Get specific document
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ applicationId: string; documentId: string }> }
) {
  try {
    const { applicationId, documentId } = await params;

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify user has access to this application and document
    const document = await prisma.document.findFirst({
      where: {
        id: documentId,
        applicationId: applicationId,
        application: {
          organization: {
            users: {
              some: { id: user.id },
            },
          },
        },
      },
    });

    if (!document) {
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ document });
  } catch (error) {
    console.error("Error fetching document:", error);
    return NextResponse.json(
      { error: "Failed to fetch document" },
      { status: 500 }
    );
  }
}

// PUT /api/applications/[applicationId]/documents/[documentId] - Update specific document
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ applicationId: string; documentId: string }> }
) {
  try {
    const { applicationId, documentId } = await params;

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify user has access to this application and document
    const existingDocument = await prisma.document.findFirst({
      where: {
        id: documentId,
        applicationId: applicationId,
        application: {
          organization: {
            users: {
              some: { id: user.id },
            },
          },
        },
      },
    });

    if (!existingDocument) {
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { title, content, contentType = "json" } = body;

    // Update document
    const document = await prisma.document.update({
      where: { id: documentId },
      data: {
        ...(title && { title }),
        ...(content !== undefined && { content }),
        contentType,
        version: existingDocument.version + 1,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({ document });
  } catch (error) {
    console.error("Error updating document:", error);
    return NextResponse.json(
      { error: "Failed to update document" },
      { status: 500 }
    );
  }
}

// DELETE /api/applications/[applicationId]/documents/[documentId] - Delete specific document
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ applicationId: string; documentId: string }> }
) {
  try {
    const { applicationId, documentId } = await params;

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify user has access to this application and document
    const existingDocument = await prisma.document.findFirst({
      where: {
        id: documentId,
        applicationId: applicationId,
        application: {
          organization: {
            users: {
              some: { id: user.id },
            },
          },
        },
      },
    });

    if (!existingDocument) {
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 }
      );
    }

    // Delete file from storage if it exists
    if (existingDocument.fileUrl) {
      await deleteFileFromStorage(existingDocument.fileUrl);
      // Continue even if storage deletion fails (DB consistency is priority)
    }

    // Delete document
    await prisma.document.delete({
      where: { id: documentId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting document:", error);
    return NextResponse.json(
      { error: "Failed to delete document" },
      { status: 500 }
    );
  }
}
