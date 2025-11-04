import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import prisma from "@/lib/prisma";

// PATCH /api/applications/[applicationId]/checklist - Update application checklist
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ applicationId: string }> }
) {
  try {
    const { applicationId } = await params;

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

    const body = await request.json();
    const { checklist } = body;

    if (!Array.isArray(checklist)) {
      return NextResponse.json(
        { error: "Checklist must be an array" },
        { status: 400 }
      );
    }

    // Update the application checklist
    const updatedApplication = await prisma.application.update({
      where: { id: applicationId },
      data: {
        checklist: checklist,
        updatedAt: new Date(),
      },
      select: {
        id: true,
        checklist: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      checklist: updatedApplication.checklist,
      updatedAt: updatedApplication.updatedAt,
    });
  } catch (error) {
    console.error("Error updating checklist:", error);
    return NextResponse.json(
      { error: "Failed to update checklist" },
      { status: 500 }
    );
  }
}

// GET /api/applications/[applicationId]/checklist - Get application checklist
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ applicationId: string }> }
) {
  try {
    const { applicationId } = await params;

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
      select: {
        id: true,
        checklist: true,
      },
    });

    if (!application) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      checklist: application.checklist || [],
    });
  } catch (error) {
    console.error("Error fetching checklist:", error);
    return NextResponse.json(
      { error: "Failed to fetch checklist" },
      { status: 500 }
    );
  }
}
