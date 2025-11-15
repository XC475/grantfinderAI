import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { prisma } from "@/lib/prisma";
import { wouldCreateCircularReference } from "@/lib/folders";

// POST /api/folders/[folderId]/move - Move folder to new parent
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ folderId: string }> }
) {
  try {
    const { folderId } = await params;
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

    // Fetch folder ensuring it belongs to user's organization
    const folder = await prisma.folder.findFirst({
      where: {
        id: folderId,
        organizationId: dbUser.organizationId,
      },
    });

    if (!folder) {
      return NextResponse.json({ error: "Folder not found" }, { status: 404 });
    }

    const body = await req.json();
    const { newParentFolderId } = body;

    // Validate no circular references
    const wouldBeCircular = await wouldCreateCircularReference(
      folderId,
      newParentFolderId
    );

    if (wouldBeCircular) {
      return NextResponse.json(
        { error: "Cannot move folder: would create circular reference" },
        { status: 400 }
      );
    }

    // If newParentFolderId is provided (not null), verify it belongs to the organization
    if (newParentFolderId) {
      const parentFolder = await prisma.folder.findFirst({
        where: {
          id: newParentFolderId,
          organizationId: dbUser.organizationId,
        },
      });

      if (!parentFolder) {
        return NextResponse.json(
          { error: "Parent folder not found or access denied" },
          { status: 404 }
        );
      }
    }

    // Move folder
    const updatedFolder = await prisma.folder.update({
      where: { id: folderId },
      data: {
        parentFolderId: newParentFolderId || null,
      },
      include: {
        application: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    return NextResponse.json({ folder: updatedFolder });
  } catch (error) {
    console.error("Error moving folder:", error);
    return NextResponse.json(
      { error: "Failed to move folder" },
      { status: 500 }
    );
  }
}

