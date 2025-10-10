import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import prisma from "@/lib/prisma";
import { Prisma } from "@/generated/prisma";

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
    const { opportunityId, organizationSlug, alsoBookmark } = body;

    if (!opportunityId || !organizationSlug) {
      return NextResponse.json(
        { error: "opportunityId and organizationSlug are required" },
        { status: 400 }
      );
    }

    // Find the organization
    const organization = await prisma.organization.findFirst({
      where: {
        slug: organizationSlug,
        user: { id: user.id },
      },
    });

    if (!organization) {
      return NextResponse.json(
        { error: "Organization not found" },
        { status: 404 }
      );
    }

    // Check if application already exists
    const existing = await prisma.application.findUnique({
      where: {
        opportunityId_organizationId: {
          opportunityId,
          organizationId: organization.id,
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
        organizationId: organization.id,
        status: "DRAFT",
      },
    });

    // Also bookmark if requested
    if (alsoBookmark) {
      await prisma.grantBookmark.upsert({
        where: {
          userId_opportunityId_organizationId: {
            userId: user.id,
            opportunityId,
            organizationId: organization.id,
          },
        },
        create: {
          userId: user.id,
          opportunityId,
          organizationId: organization.id,
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

// GET /api/applications - List all applications for user's organization
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
    const organizationSlug = searchParams.get("organizationSlug");

    // Build where clause
    const whereClause: Prisma.ApplicationWhereInput = {
      organization: {
        user: { id: user.id },
        ...(organizationSlug ? { slug: organizationSlug } : {}),
      },
    };

    const applications = await prisma.application.findMany({
      where: whereClause,
      include: {
        organization: {
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
