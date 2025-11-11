import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import prisma from "@/lib/prisma";

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

    // Delete the application
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
