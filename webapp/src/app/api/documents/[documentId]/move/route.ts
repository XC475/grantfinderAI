import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { prisma } from "@/lib/prisma";
import { getApplicationFolderTree } from "@/lib/folders";

// POST /api/documents/[documentId]/move - Move document to folder
export async function POST(
  req: NextRequest,
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

    // Get user's organization
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { organizationId: true },
    });

    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Fetch document ensuring it belongs to user's organization
    const document = await prisma.document.findFirst({
      where: {
        id: documentId,
        organizationId: dbUser.organizationId,
      },
    });

    if (!document) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    const body = await req.json();
    const { folderId } = body;

    // If folderId is provided (not null), verify it belongs to the organization
    if (folderId) {
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

    // Auto-unlink logic: if document has applicationId, check if new folder is in that application's tree
    let newApplicationId = document.applicationId;

    if (document.applicationId) {
      const applicationFolderTree = await getApplicationFolderTree(
        document.applicationId
      );

      // If moving to null (root) or to a folder not in the application's tree, unlink
      if (!folderId || !applicationFolderTree.has(folderId)) {
        newApplicationId = null;
      }
    }

    // Move document
    const updatedDocument = await prisma.document.update({
      where: { id: documentId },
      data: {
        folderId: folderId || null,
        applicationId: newApplicationId,
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

    return NextResponse.json({ document: updatedDocument });
  } catch (error) {
    console.error("Error moving document:", error);
    return NextResponse.json(
      { error: "Failed to move document" },
      { status: 500 }
    );
  }
}

