import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { createClient } from "@/utils/supabase/server";

// PATCH /api/organizations/[id] - Update organization
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await request.json();

    // Verify user is a member of this organization (with ADMIN or OWNER role)
    const organization = await prisma.organization.findUnique({
      where: { id },
      select: {
        id: true,
        users: {
          where: {
            id: user.id,
            role: { in: ["ADMIN", "OWNER"] },
          },
          select: { id: true, role: true },
        },
      },
    });

    if (!organization) {
      return NextResponse.json(
        { error: "Organization not found" },
        { status: 404 }
      );
    }

    if (organization.users.length === 0) {
      return NextResponse.json(
        { error: "Forbidden - Admin or Owner access required" },
        { status: 403 }
      );
    }

    // Update organization
    const updatedOrganization = await prisma.organization.update({
      where: { id },
      data: {
        name: body.name,
        logoUrl: body.logoUrl,
        website: body.website,
        missionStatement: body.missionStatement,
        strategicPlan: body.strategicPlan,
        annualOperatingBudget: body.annualOperatingBudget
          ? parseFloat(body.annualOperatingBudget)
          : null,
        fiscalYearEnd: body.fiscalYearEnd,
        phone: body.phone,
        email: body.email,
        organizationLeaderName: body.organizationLeaderName,
        address: body.address,
        city: body.city,
        state: body.state,
        zipCode: body.zipCode,
        enrollment: body.enrollment !== undefined ? body.enrollment : undefined,
        numberOfSchools: body.numberOfSchools !== undefined ? body.numberOfSchools : undefined,
        lowestGrade: body.lowestGrade !== undefined ? body.lowestGrade : undefined,
        highestGrade: body.highestGrade !== undefined ? body.highestGrade : undefined,
        services: body.services !== undefined ? body.services : undefined,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        logoUrl: true,
        website: true,
        missionStatement: true,
        strategicPlan: true,
        annualOperatingBudget: true,
        fiscalYearEnd: true,
        phone: true,
        email: true,
        organizationLeaderName: true,
        address: true,
        city: true,
        state: true,
        zipCode: true,
        enrollment: true,
        numberOfSchools: true,
        lowestGrade: true,
        highestGrade: true,
        services: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(updatedOrganization);
  } catch (error) {
    console.error("Error updating organization:", error);
    return NextResponse.json(
      { error: "Failed to update organization" },
      { status: 500 }
    );
  }
}
