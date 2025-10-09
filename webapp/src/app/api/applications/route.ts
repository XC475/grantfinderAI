import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";

// POST /api/applications - Create a new application
export async function POST(request: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { opportunityId, workspaceSlug, alsoBookmark } = body;

    if (!opportunityId || !workspaceSlug) {
      return NextResponse.json(
        { error: "opportunityId and workspaceSlug are required" },
        { status: 400 }
      );
    }

    // Find the workspace
    const workspace = await prisma.workspace.findFirst({
      where: {
        slug: workspaceSlug,
        OR: [
          { personalUser: { id: user.id } },
          { organization: { members: { some: { userId: user.id } } } },
        ],
      },
    });

    if (!workspace) {
      return NextResponse.json(
        { error: "Workspace not found" },
        { status: 404 }
      );
    }

    // Check if application already exists
    const existing = await prisma.application.findUnique({
      where: {
        opportunityId_workspaceId: {
          opportunityId,
          workspaceId: workspace.id,
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        {
          error: "Application already exists for this grant",
          application: existing,
        },
        { status: 409 }
      );
    }

    // Create the application
    const application = await prisma.application.create({
      data: {
        opportunityId,
        workspaceId: workspace.id,
        status: "DRAFT",
      },
    });

    // Also bookmark if requested
    if (alsoBookmark) {
      await prisma.grantBookmark.upsert({
        where: {
          userId_opportunityId_workspaceId: {
            userId: user.id,
            opportunityId,
            workspaceId: workspace.id,
          },
        },
        create: {
          userId: user.id,
          opportunityId,
          workspaceId: workspace.id,
        },
        update: {},
      });
    }

    return NextResponse.json({ application, alsoBookmarked: alsoBookmark });
  } catch (error) {
    console.error("Error creating application:", error);
    return NextResponse.json(
      { error: "Failed to create application" },
      { status: 500 }
    );
  }
}

// GET /api/applications - List all applications for user's workspaces
export async function GET(request: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const searchParams = request.nextUrl.searchParams;
    const workspaceSlug = searchParams.get("workspaceSlug");

    // Build where clause
    const whereClause: Prisma.ApplicationWhereInput = {
      workspace: {
        OR: [
          { personalUser: { id: user.id } },
          { organization: { members: { some: { userId: user.id } } } },
        ],
        ...(workspaceSlug ? { slug: workspaceSlug } : {}),
      },
    };

    const applications = await prisma.application.findMany({
      where: whereClause,
      include: {
        workspace: {
          select: {
            slug: true,
            name: true,
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    return NextResponse.json({ applications });
  } catch (error) {
    console.error("Error fetching applications:", error);
    return NextResponse.json(
      { error: "Failed to fetch applications" },
      { status: 500 }
    );
  }
}
