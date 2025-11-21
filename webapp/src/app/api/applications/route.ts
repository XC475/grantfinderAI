import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { supabaseServer } from "@/lib/supabaseServer";
import prisma from "@/lib/prisma";
import { Prisma } from "@/generated/prisma";
import type { CreateApplicationRequest } from "@/types/application";

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
    const body: CreateApplicationRequest = await request.json();
    const {
      opportunityId,
      organizationSlug,
      alsoBookmark,
      grantTitle,
      title,
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

    if (!organizationSlug) {
      return NextResponse.json(
        { error: "organizationSlug is required" },
        { status: 400 }
      );
    }

    // Find the organization and verify user is a member
    const organization = await prisma.organization.findFirst({
      where: {
        slug: organizationSlug,
        users: {
          some: { id: user.id },
        },
      },
    });

    if (!organization) {
      return NextResponse.json(
        { error: "Organization not found" },
        { status: 404 }
      );
    }

    // Check for existing application with same opportunityId (only if not an outside opportunity)
    if (opportunityId) {
      const existingApplication = await prisma.application.findFirst({
        where: {
          opportunityId,
          organizationId: organization.id,
        },
        select: {
          id: true,
          title: true,
          status: true,
          createdAt: true,
        },
      });

      if (existingApplication) {
        // The existingApplication only has id, title, status, createdAt - no BigInt fields
        return NextResponse.json(
          {
            error: "Application already exists for this grant",
            application: existingApplication,
            isDuplicate: true,
          },
          { status: 409 }
        );
      }
    }

    // Prepare opportunity data
    let opportunityData: Partial<{
      opportunityTitle: string;
      opportunityDescription: string;
      opportunityEligibility: string;
      opportunityAgency: string;
      opportunityCloseDate: Date;
      opportunityTotalFunding: bigint;
      opportunityAwardMin: bigint;
      opportunityAwardMax: bigint;
      opportunityUrl: string;
      opportunityAttachments: Prisma.InputJsonValue;
    }> = {};

    // If opportunityId is provided, fetch the grant data from opportunities table
    if (opportunityId) {
      const { data: opportunity, error: oppError } = await supabaseServer
        .from("opportunities")
        .select("*")
        .eq("id", opportunityId)
        .single();

      if (oppError || !opportunity) {
        return NextResponse.json(
          { error: "Opportunity not found" },
          { status: 404 }
        );
      }

      // Copy fields from opportunity (can be overridden by request body)
      opportunityData = {
        opportunityTitle: opportunityTitle || opportunity.title,
        opportunityDescription:
          opportunityDescription || opportunity.description,
        opportunityEligibility:
          opportunityEligibility || opportunity.eligibility_summary,
        opportunityAgency: opportunityAgency || opportunity.agency,
        opportunityCloseDate: opportunityCloseDate
          ? new Date(opportunityCloseDate)
          : opportunity.close_date
            ? new Date(opportunity.close_date)
            : undefined,
        opportunityTotalFunding:
          opportunityTotalFunding !== undefined &&
          opportunityTotalFunding !== null
            ? BigInt(opportunityTotalFunding)
            : opportunity.total_funding_amount
              ? BigInt(opportunity.total_funding_amount)
              : undefined,
        opportunityAwardMin:
          opportunityAwardMin !== undefined && opportunityAwardMin !== null
            ? BigInt(opportunityAwardMin)
            : opportunity.award_min
              ? BigInt(opportunity.award_min)
              : undefined,
        opportunityAwardMax:
          opportunityAwardMax !== undefined && opportunityAwardMax !== null
            ? BigInt(opportunityAwardMax)
            : opportunity.award_max
              ? BigInt(opportunity.award_max)
              : undefined,
        opportunityUrl: opportunityUrl || opportunity.url,
        opportunityAttachments:
          opportunityAttachments ||
          (opportunity.attachments !== null
            ? opportunity.attachments
            : undefined),
      };
    } else {
      // For outside opportunities, use provided data
      if (!opportunityTitle) {
        return NextResponse.json(
          { error: "opportunityTitle is required for outside opportunities" },
          { status: 400 }
        );
      }

      opportunityData = {
        opportunityTitle,
        opportunityDescription,
        opportunityEligibility,
        opportunityAgency,
        opportunityCloseDate: opportunityCloseDate
          ? new Date(opportunityCloseDate)
          : undefined,
        opportunityTotalFunding:
          opportunityTotalFunding !== undefined &&
          opportunityTotalFunding !== null
            ? BigInt(opportunityTotalFunding)
            : undefined,
        opportunityAwardMin:
          opportunityAwardMin !== undefined && opportunityAwardMin !== null
            ? BigInt(opportunityAwardMin)
            : undefined,
        opportunityAwardMax:
          opportunityAwardMax !== undefined && opportunityAwardMax !== null
            ? BigInt(opportunityAwardMax)
            : undefined,
        opportunityUrl,
        opportunityAttachments,
      };
    }

    // Create the application with opportunity data
    const application = await prisma.application.create({
      data: {
        opportunityId: opportunityId || null,
        organizationId: organization.id,
        status: "DRAFT",
        title:
          title ||
          grantTitle ||
          opportunityData.opportunityTitle ||
          `Application for Grant #${opportunityId || "Outside"}`,
        ...opportunityData,
      },
    });

    // Create folder for the application
    await prisma.folder.create({
      data: {
        name: application.title || "Untitled Application",
        organizationId: organization.id,
        applicationId: application.id,
        parentFolderId: null, // Root level
      },
    });

    // Also bookmark if requested (only if opportunityId exists)
    if (alsoBookmark && opportunityId) {
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

    // Convert BigInt values to strings for JSON serialization
    const serializedApplication = {
      ...application,
      opportunityTotalFunding:
        application.opportunityTotalFunding?.toString() ?? null,
      opportunityAwardMin: application.opportunityAwardMin?.toString() ?? null,
      opportunityAwardMax: application.opportunityAwardMax?.toString() ?? null,
    };

    return NextResponse.json({
      application: serializedApplication,
      alsoBookmarked: alsoBookmark,
    });
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
        users: {
          some: { id: user.id },
        },
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

    // Convert BigInt values to strings for JSON serialization
    const serializedApplications = applications.map((app) => ({
      ...app,
      opportunityTotalFunding: app.opportunityTotalFunding?.toString() ?? null,
      opportunityAwardMin: app.opportunityAwardMin?.toString() ?? null,
      opportunityAwardMax: app.opportunityAwardMax?.toString() ?? null,
    }));

    // Applications now contain their own opportunity data - no need to fetch separately
    return NextResponse.json({ applications: serializedApplications });
  } catch (error) {
    console.error("Error fetching applications:", error);
    return NextResponse.json(
      { error: "Failed to fetch applications" },
      { status: 500 }
    );
  }
}
