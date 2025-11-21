import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import prisma from "@/lib/prisma";
import {
  getDocumentsInFolderTree,
  deleteFileFromStorage,
} from "@/lib/documentStorageCleanup";
import type { UpdateApplicationOpportunityRequest } from "@/types/application";
import { Prisma, ApplicationStatus } from "@/generated/prisma";

// GET /api/applications/[applicationId] - Get application by ID
export async function GET(
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
    const application = await prisma.application.findFirst({
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
            slug: true,
            name: true,
          },
        },
      },
    });

    if (!application) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ application });
  } catch (error) {
    console.error("Error fetching application:", error);
    return NextResponse.json(
      { error: "Failed to fetch application" },
      { status: 500 }
    );
  }
}

// PUT /api/applications/[applicationId] - Update application
export async function PUT(
  request: NextRequest,
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

    // Verify user has access to this application
    const application = await prisma.application.findFirst({
      where: {
        id: applicationId,
        organization: {
          users: {
            some: { id: user.id },
          },
        },
      },
    });

    if (!application) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      );
    }

    const body: UpdateApplicationOpportunityRequest & {
      status?: ApplicationStatus;
    } = await request.json();
    const {
      title,
      status,
      opportunityTitle,
      opportunityDescription,
      opportunityEligibility,
      opportunityAgency,
      opportunityCloseDate,
      opportunityTotalFunding,
      opportunityAwardMin,
      opportunityAwardMax,
      opportunityUrl,
      opportunityAttachments,
    } = body;

    // Build update data
    const updateData: Prisma.ApplicationUpdateInput = {
      ...(title !== undefined && { title }),
      ...(status !== undefined && { status }),
      ...(opportunityTitle !== undefined && { opportunityTitle }),
      ...(opportunityDescription !== undefined && { opportunityDescription }),
      ...(opportunityEligibility !== undefined && { opportunityEligibility }),
      ...(opportunityAgency !== undefined && { opportunityAgency }),
      ...(opportunityCloseDate !== undefined && {
        opportunityCloseDate: opportunityCloseDate
          ? new Date(opportunityCloseDate)
          : null,
      }),
      ...(opportunityTotalFunding !== undefined && {
        opportunityTotalFunding:
          opportunityTotalFunding !== null
            ? BigInt(opportunityTotalFunding)
            : null,
      }),
      ...(opportunityAwardMin !== undefined && {
        opportunityAwardMin:
          opportunityAwardMin !== null ? BigInt(opportunityAwardMin) : null,
      }),
      ...(opportunityAwardMax !== undefined && {
        opportunityAwardMax:
          opportunityAwardMax !== null ? BigInt(opportunityAwardMax) : null,
      }),
      ...(opportunityUrl !== undefined && { opportunityUrl }),
      ...(opportunityAttachments !== undefined && { opportunityAttachments }),
      updatedAt: new Date(),
    };

    // Update application
    const updatedApplication = await prisma.application.update({
      where: { id: applicationId },
      data: updateData,
    });

    // If title changed, update linked folder name
    if (title && title !== application.title) {
      await prisma.folder.updateMany({
        where: { applicationId: applicationId },
        data: { name: title },
      });
    }

    return NextResponse.json({ application: updatedApplication });
  } catch (error) {
    console.error("Error updating application:", error);
    return NextResponse.json(
      { error: "Failed to update application" },
      { status: 500 }
    );
  }
}

// DELETE /api/applications/[applicationId] - Delete application and all associated documents
export async function DELETE(
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

    // Verify user has access to this application
    const application = await prisma.application.findFirst({
      where: {
        id: applicationId,
        organization: {
          users: {
            some: { id: user.id },
          },
        },
      },
      include: {
        documents: true,
      },
    });

    if (!application) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      );
    }

    // Delete files from storage for documents that will be cascade deleted
    const appFolder = await prisma.folder.findFirst({
      where: { applicationId },
    });

    if (appFolder) {
      // Get all docs in folder tree
      const docs = await getDocumentsInFolderTree(appFolder.id, prisma);
      const fileDocs = docs.filter((d) => d.fileUrl);

      if (fileDocs.length > 0) {
        for (const doc of fileDocs) {
          if (doc.fileUrl) {
            await deleteFileFromStorage(doc.fileUrl);
          }
        }
      }
    }

    // Unlink documents from application (set applicationId to null)
    // instead of deleting them
    await prisma.document.updateMany({
      where: {
        applicationId: applicationId,
      },
      data: {
        applicationId: null,
      },
    });

    // Delete the application (cascade deletes folder + remaining docs)
    await prisma.application.delete({
      where: {
        id: applicationId,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message:
          "Application deleted successfully. Documents have been preserved.",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting application:", error);
    return NextResponse.json(
      { error: "Failed to delete application" },
      { status: 500 }
    );
  }
}
