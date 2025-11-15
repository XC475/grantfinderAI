import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { prisma } from "@/lib/prisma";
import { getFolderPath, wouldCreateCircularReference } from "@/lib/folders";

// GET /api/folders/[folderId] - Get folder details with contents
export async function GET(
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
      include: {
        application: {
          select: {
            id: true,
            title: true,
          },
        },
        children: {
          include: {
            _count: {
              select: {
                documents: true,
                children: true,
              },
            },
          },
          orderBy: {
            name: "asc",
          },
        },
        documents: {
          orderBy: {
            updatedAt: "desc",
          },
        },
      },
    });

    if (!folder) {
      return NextResponse.json({ error: "Folder not found" }, { status: 404 });
    }

    // Get breadcrumb path
    const path = await getFolderPath(folderId);

    return NextResponse.json({
      folder: {
        ...folder,
        path,
      },
    });
  } catch (error) {
    console.error("Error fetching folder:", error);
    return NextResponse.json(
      { error: "Failed to fetch folder" },
      { status: 500 }
    );
  }
}

// PUT /api/folders/[folderId] - Update folder (rename or move)
export async function PUT(
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
    const { name, parentFolderId } = body;

    // Application-linked folders cannot be renamed
    if (name && folder.applicationId) {
      return NextResponse.json(
        { error: "Cannot rename application-linked folders. Rename the application instead." },
        { status: 400 }
      );
    }

    // If moving, validate no circular references
    if (parentFolderId !== undefined && parentFolderId !== folder.parentFolderId) {
      const wouldBeCircular = await wouldCreateCircularReference(
        folderId,
        parentFolderId
      );

      if (wouldBeCircular) {
        return NextResponse.json(
          { error: "Cannot move folder: would create circular reference" },
          { status: 400 }
        );
      }

      // If parentFolderId is provided (not null), verify it belongs to the organization
      if (parentFolderId) {
        const parentFolder = await prisma.folder.findFirst({
          where: {
            id: parentFolderId,
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
    }

    // Update folder
    const updatedFolder = await prisma.folder.update({
      where: { id: folderId },
      data: {
        ...(name && { name }),
        ...(parentFolderId !== undefined && { parentFolderId }),
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
    console.error("Error updating folder:", error);
    return NextResponse.json(
      { error: "Failed to update folder" },
      { status: 500 }
    );
  }
}

// DELETE /api/folders/[folderId] - Delete folder recursively
export async function DELETE(
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

    // Application-linked folders can only be deleted when application is deleted
    if (folder.applicationId) {
      return NextResponse.json(
        { error: "Cannot delete application-linked folders. Delete the application instead." },
        { status: 400 }
      );
    }

    // Delete folder (cascade will handle children and documents)
    await prisma.folder.delete({
      where: { id: folderId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting folder:", error);
    return NextResponse.json(
      { error: "Failed to delete folder" },
      { status: 500 }
    );
  }
}

