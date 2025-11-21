import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import prisma from "@/lib/prisma";

// GET /api/folders/path/[folderId] - Get full path from root to folder
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ folderId: string }> }
) {
  try {
    const { folderId } = await params;

    // Authenticate user
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Build path by recursively traversing parent folders
    const path: Array<{ id: string; name: string }> = [];
    let currentFolderId: string | null = folderId;

    while (currentFolderId) {
      const folder = await prisma.folder.findFirst({
        where: {
          id: currentFolderId,
          organization: {
            users: {
              some: { id: user.id },
            },
          },
        },
        select: {
          id: true,
          name: true,
          parentFolderId: true,
        },
      });

      if (!folder) {
        return NextResponse.json({ error: "Folder not found" }, { status: 404 });
      }

      // Add to beginning of path (we're traversing backwards)
      path.unshift({ id: folder.id, name: folder.name });

      // Move to parent
      currentFolderId = folder.parentFolderId;
    }

    return NextResponse.json({ path });
  } catch (error) {
    console.error("Error fetching folder path:", error);
    return NextResponse.json(
      { error: "Failed to fetch folder path" },
      { status: 500 }
    );
  }
}

