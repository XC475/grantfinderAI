import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import prisma from "@/lib/prisma";
import { deleteFileFromStorage } from "@/lib/storageCleanup";

// GET /api/documents/[documentId] - Get specific document
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ documentId: string }> }
) {
  try {
    const { documentId } = await params;

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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

    // Fetch document ensuring it belongs to user's organization
    const document = await prisma.document.findFirst({
      where: {
        id: documentId,
        organizationId: dbUser.organizationId,
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

// DELETE /api/documents/[documentId] - Delete specific document
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ documentId: string }> }
) {
  try {
    const { documentId } = await params;

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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

    // Verify user has access to this document
    const existingDocument = await prisma.document.findFirst({
      where: {
        id: documentId,
        organizationId: dbUser.organizationId,
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

// PUT /api/documents/[documentId] - Update a standalone document
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ documentId: string }> }
) {
  try {
    const { documentId } = await params;

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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

    const existingDocument = await prisma.document.findFirst({
      where: {
        id: documentId,
        organizationId: dbUser.organizationId,
      },
    });

    if (!existingDocument) {
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { title, content, contentType = "json", folderId } = body;

    // If folderId is being updated, verify it belongs to the organization
    if (folderId !== undefined && folderId !== null) {
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

    // Auto-unlink logic: if document has applicationId and folderId is being changed
    let newApplicationId = existingDocument.applicationId;

    if (folderId !== undefined && existingDocument.applicationId) {
      const { getApplicationFolderTree } = await import("@/lib/folders");
      const applicationFolderTree = await getApplicationFolderTree(
        existingDocument.applicationId
      );

      // If moving to null (root) or to a folder not in the application's tree, unlink
      if (!folderId || !applicationFolderTree.has(folderId)) {
        newApplicationId = null;
      }
    }

    const document = await prisma.document.update({
      where: { id: documentId },
      data: {
        ...(title && { title }),
        ...(content !== undefined && { content }),
        ...(contentType && { contentType }),
        ...(folderId !== undefined && { folderId }),
        ...(newApplicationId !== existingDocument.applicationId && {
          applicationId: newApplicationId,
        }),
        version: existingDocument.version + 1,
        updatedAt: new Date(),
      },
      include: {
        application: {
          select: {
            id: true,
            title: true,
            opportunityId: true,
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

    return NextResponse.json({ document });
  } catch (error) {
    console.error("Error updating document:", error);
    return NextResponse.json(
      { error: "Failed to update document" },
      { status: 500 }
    );
  }
}
