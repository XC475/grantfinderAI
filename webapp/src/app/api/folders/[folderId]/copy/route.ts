import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma";

// Recursive helper function to copy a folder and all its contents
async function copyFolderRecursive(
  sourceFolderId: string,
  newParentFolderId: string | null,
  organizationId: string,
  customName?: string
): Promise<string> {
  // Fetch the source folder
  const sourceFolder = await prisma.folder.findFirst({
    where: {
      id: sourceFolderId,
      organizationId,
    },
    include: {
      documents: true,
      children: true,
    },
  });

  if (!sourceFolder) {
    throw new Error("Source folder not found");
  }

  // Use custom name if provided, otherwise use original name
  const newFolderName = customName || sourceFolder.name;

  const newFolder = await prisma.folder.create({
    data: {
      name: newFolderName,
      organizationId,
      parentFolderId: newParentFolderId,
      // Don't copy applicationId - copies are independent
      applicationId: null,
    },
  });

  // Copy all documents in this folder
  for (const document of sourceFolder.documents) {
    await prisma.document.create({
      data: {
        title: `Copy of ${document.title}`,
        content: document.content as string | null,
        contentType: document.contentType,
        metadata: document.metadata
          ? (document.metadata as Prisma.InputJsonValue)
          : Prisma.JsonNull,
        fileCategory: document.fileCategory || "GENERAL", // Preserve category
        isKnowledgeBase: false, // Copies are not in KB by default
        extractedText: document.extractedText, // Preserve extracted text
        vectorizationStatus: document.extractedText ? "PENDING" : "COMPLETED", // Re-vectorize if text exists
        folderId: newFolder.id,
        organizationId,
        // Don't copy applicationId - copies are independent
        applicationId: null,
        version: 1,
      },
    });
  }

  // Recursively copy all subfolders (keep their original names)
  for (const childFolder of sourceFolder.children) {
    await copyFolderRecursive(
      childFolder.id,
      newFolder.id,
      organizationId,
      undefined // No custom name for nested folders
    );
  }

  return newFolder.id;
}

// POST /api/folders/[folderId]/copy - Create a copy of a folder
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

    // Get custom name and parentFolderId from request body (optional)
    const body = await req.json().catch(() => ({}));
    const { name, parentFolderId } = body;

    // Use custom name or default to "Copy of {original name}"
    const copyName = name || `Copy of ${folder.name}`;

    // Use custom parentFolderId or default to original parent
    const targetParentId =
      parentFolderId !== undefined ? parentFolderId : folder.parentFolderId;

    // If custom parentFolderId provided, verify it belongs to the organization
    if (targetParentId !== null) {
      const parentFolder = await prisma.folder.findFirst({
        where: {
          id: targetParentId,
          organizationId: dbUser.organizationId,
        },
      });

      if (!parentFolder) {
        return NextResponse.json(
          { error: "Target parent folder not found or access denied" },
          { status: 404 }
        );
      }
    }

    // Copy the folder and all its contents with custom name
    const newFolderId = await copyFolderRecursive(
      folderId,
      targetParentId,
      dbUser.organizationId,
      copyName // Pass the custom name for the root folder
    );

    // Fetch the newly created folder with full details
    const newFolder = await prisma.folder.findUnique({
      where: { id: newFolderId },
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
    });

    return NextResponse.json({ folder: newFolder }, { status: 201 });
  } catch (error) {
    console.error("Error copying folder:", error);
    return NextResponse.json(
      { error: "Failed to copy folder" },
      { status: 500 }
    );
  }
}
