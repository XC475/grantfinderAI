import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { prisma } from "@/lib/prisma";
import { getFolderMetadata } from "@/lib/folders";

// GET /api/folders - List folders for organization
export async function GET(req: NextRequest) {
  try {
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

    const { searchParams } = new URL(req.url);
    const parentFolderId = searchParams.get("parentFolderId");
    const applicationId = searchParams.get("applicationId");

    // Build where clause
    const where: any = {
      organizationId: dbUser.organizationId,
    };

    if (applicationId) {
      where.applicationId = applicationId;
    }

    if (parentFolderId === "null" || parentFolderId === null) {
      where.parentFolderId = null;
    } else if (parentFolderId) {
      where.parentFolderId = parentFolderId;
    }

    // Fetch folders
    const folders = await prisma.folder.findMany({
      where,
      include: {
        application: {
          select: {
            id: true,
            title: true,
          },
        },
        _count: {
          select: {
            documents: true,
            children: true,
          },
        },
      },
      orderBy: [
        { name: "asc" },
      ],
    });

    // Format response with metadata
    const foldersWithMetadata = folders.map((folder) => ({
      id: folder.id,
      name: folder.name,
      organizationId: folder.organizationId,
      parentFolderId: folder.parentFolderId,
      applicationId: folder.applicationId,
      createdAt: folder.createdAt,
      updatedAt: folder.updatedAt,
      application: folder.application,
      documentCount: folder._count.documents,
      subfolderCount: folder._count.children,
    }));

    return NextResponse.json({ folders: foldersWithMetadata });
  } catch (error) {
    console.error("Error fetching folders:", error);
    return NextResponse.json(
      { error: "Failed to fetch folders" },
      { status: 500 }
    );
  }
}

// POST /api/folders - Create a new folder
export async function POST(req: NextRequest) {
  try {
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

    const body = await req.json();
    const { name, parentFolderId, applicationId } = body;

    if (!name || typeof name !== "string") {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    // If applicationId is provided, verify user has access to that application
    if (applicationId) {
      const application = await prisma.application.findFirst({
        where: {
          id: applicationId,
          organizationId: dbUser.organizationId,
        },
      });

      if (!application) {
        return NextResponse.json(
          { error: "Application not found or access denied" },
          { status: 404 }
        );
      }
    }

    // If parentFolderId is provided, verify it belongs to the organization
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

    // Create folder
    const folder = await prisma.folder.create({
      data: {
        name,
        organizationId: dbUser.organizationId,
        parentFolderId: parentFolderId || null,
        applicationId: applicationId || null,
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

    // Get folder path for breadcrumb
    const { getFolderPath } = await import("@/lib/folders");
    const path = await getFolderPath(folder.id);

    return NextResponse.json(
      {
        folder: {
          ...folder,
          path,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating folder:", error);
    return NextResponse.json(
      { error: "Failed to create folder" },
      { status: 500 }
    );
  }
}

