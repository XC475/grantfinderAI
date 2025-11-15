import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import prisma from "@/lib/prisma";

// POST /api/documents/[documentId]/copy - Create a copy of a document
export async function POST(
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

    // Fetch original document ensuring it belongs to user's organization
    const originalDocument = await prisma.document.findFirst({
      where: {
        id: documentId,
        organizationId: dbUser.organizationId,
      },
    });

    if (!originalDocument) {
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 }
      );
    }

    // Get custom title and folderId from request body (optional)
    const body = await request.json().catch(() => ({}));
    const { title, folderId } = body;

    // Use custom title or default to "Copy of {original title}"
    const copyTitle = title || `Copy of ${originalDocument.title}`;

    // Use custom folderId or default to original folder
    const targetFolderId =
      folderId !== undefined ? folderId : originalDocument.folderId;

    // If custom folderId provided, verify it belongs to the organization
    if (targetFolderId !== null) {
      const folder = await prisma.folder.findFirst({
        where: {
          id: targetFolderId,
          organizationId: dbUser.organizationId,
        },
      });

      if (!folder) {
        return NextResponse.json(
          { error: "Target folder not found or access denied" },
          { status: 404 }
        );
      }
    }

    const newDocument = await prisma.document.create({
      data: {
        title: copyTitle,
        content: originalDocument.content,
        contentType: originalDocument.contentType,
        metadata: originalDocument.metadata || undefined,
        folderId: targetFolderId,
        organizationId: dbUser.organizationId,
        applicationId: originalDocument.applicationId,
        version: 1, // New document starts at version 1
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

    return NextResponse.json({ document: newDocument }, { status: 201 });
  } catch (error) {
    console.error("Error copying document:", error);
    return NextResponse.json(
      { error: "Failed to copy document" },
      { status: 500 }
    );
  }
}
