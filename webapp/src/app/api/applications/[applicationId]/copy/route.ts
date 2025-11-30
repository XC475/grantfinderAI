import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import prisma from "@/lib/prisma";
import { Prisma } from "@/generated/prisma";

// Helper function to copy a folder recursively with documents linked to a specific application
async function copyFolderRecursiveForApplication(
  sourceFolderId: string,
  newParentFolderId: string | null,
  organizationId: string,
  targetApplicationId: string,
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
      applicationId: targetApplicationId,
    },
  });

  // Copy all documents in this folder, linking to the new application
  for (const document of sourceFolder.documents) {
    await prisma.document.create({
      data: {
        title: document.title, // Keep original title for nested documents
        content: document.content as string | null,
        contentType: document.contentType,
        metadata: document.metadata
          ? (document.metadata as Prisma.InputJsonValue)
          : Prisma.JsonNull,
        fileCategory: document.fileCategory || "GENERAL", // Preserve category
        isKnowledgeBase: true, // Copies are in KB by default
        extractedText: document.extractedText, // Preserve extracted text
        vectorizationStatus: document.extractedText ? "PENDING" : "COMPLETED", // Re-vectorize if text exists
        folderId: newFolder.id,
        organizationId,
        applicationId: targetApplicationId,
        version: 1,
      },
    });
  }

  // Recursively copy all subfolders
  for (const childFolder of sourceFolder.children) {
    await copyFolderRecursiveForApplication(
      childFolder.id,
      newFolder.id,
      organizationId,
      targetApplicationId,
      undefined // Keep original names for nested folders
    );
  }

  return newFolder.id;
}

// POST /api/applications/[applicationId]/copy - Create a copy of an application
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ applicationId: string }> }
) {
  try {
    const { applicationId } = await params;

    // Authenticate user
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch application and verify user has access
    const originalApplication = await prisma.application.findFirst({
      where: {
        id: applicationId,
        organization: {
          users: {
            some: { id: user.id },
          },
        },
      },
      include: {
        organization: {
          select: {
            id: true,
            slug: true,
            name: true,
          },
        },
      },
    });

    if (!originalApplication) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      );
    }

    // Find the folder associated with this application
    const originalFolder = await prisma.folder.findFirst({
      where: {
        applicationId: applicationId,
        organizationId: originalApplication.organizationId,
      },
    });

    // Create new application with "Copy of" prefix
    const newApplication = await prisma.application.create({
      data: {
        title: `Copy of ${originalApplication.title}`,
        opportunityId: originalApplication.opportunityId,
        organizationId: originalApplication.organizationId,
        status: "DRAFT", // New copies start as DRAFT
        opportunityTitle: originalApplication.opportunityTitle,
        opportunityDescription: originalApplication.opportunityDescription,
        opportunityEligibility: originalApplication.opportunityEligibility,
        opportunityAgency: originalApplication.opportunityAgency,
        opportunityCloseDate: originalApplication.opportunityCloseDate,
        opportunityTotalFunding: originalApplication.opportunityTotalFunding,
        opportunityAwardMin: originalApplication.opportunityAwardMin,
        opportunityAwardMax: originalApplication.opportunityAwardMax,
        opportunityUrl: originalApplication.opportunityUrl,
        opportunityAttachments: originalApplication.opportunityAttachments
          ? (originalApplication.opportunityAttachments as Prisma.InputJsonValue)
          : Prisma.JsonNull,
      },
      include: {
        organization: {
          select: {
            slug: true,
            name: true,
          },
        },
      },
    });

    // If there's a folder, copy it and all its contents
    if (originalFolder) {
      await copyFolderRecursiveForApplication(
        originalFolder.id,
        null, // Root level
        originalApplication.organizationId,
        newApplication.id,
        `Copy of ${originalFolder.name}` // Custom name for root folder
      );
    } else {
      // If no folder exists, create one for the new application
      await prisma.folder.create({
        data: {
          name: newApplication.title || "Untitled Application",
          organizationId: originalApplication.organizationId,
          applicationId: newApplication.id,
          parentFolderId: null,
        },
      });
    }

    // Convert BigInt values to strings for JSON serialization
    const serializedApplication = {
      ...newApplication,
      opportunityTotalFunding:
        newApplication.opportunityTotalFunding?.toString() ?? null,
      opportunityAwardMin:
        newApplication.opportunityAwardMin?.toString() ?? null,
      opportunityAwardMax:
        newApplication.opportunityAwardMax?.toString() ?? null,
    };

    return NextResponse.json(
      { application: serializedApplication },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error copying application:", error);
    return NextResponse.json(
      { error: "Failed to copy application" },
      { status: 500 }
    );
  }
}
