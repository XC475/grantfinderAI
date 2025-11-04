import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import prisma from "@/lib/prisma";
import { sendWelcomeEmail } from "@/lib/email";

// POST /api/admin/users - Admin creates a new user
export async function POST(request: NextRequest) {
  const supabase = await createClient();

  // Check if current user is admin
  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser();

  if (!currentUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check system admin
  const dbUser = await prisma.user.findUnique({
    where: { id: currentUser.id },
    select: { system_admin: true },
  });

  if (dbUser?.system_admin !== true) {
    return NextResponse.json(
      { error: "Forbidden - System admin only" },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    const {
      email,
      name,
      password,
      mode, // 'add_to_existing' or 'create_new'
      organizationId, // Required for 'add_to_existing'
      role = "MEMBER", // User's role in organization
      organizationType, // 'school_district' or 'custom' for 'create_new'
      districtData, // For school district orgs
      customOrgData, // For custom orgs
    } = body;

    console.log(
      `[Admin] Creating user with email: ${email}, mode: ${mode}, role: ${role}`
    );

    // Validate input
    if (!email || !name || !password) {
      return NextResponse.json(
        { error: "Email, name, and password are required" },
        { status: 400 }
      );
    }

    if (!mode || (mode !== "add_to_existing" && mode !== "create_new")) {
      return NextResponse.json(
        { error: "Mode must be 'add_to_existing' or 'create_new'" },
        { status: 400 }
      );
    }

    // Validate mode-specific requirements
    if (mode === "add_to_existing" && !organizationId) {
      return NextResponse.json(
        { error: "organizationId is required for add_to_existing mode" },
        { status: 400 }
      );
    }

    if (mode === "create_new" && !organizationType) {
      return NextResponse.json(
        {
          error:
            "organizationType ('school_district' or 'custom') is required for create_new mode",
        },
        { status: 400 }
      );
    }

    let targetOrganizationId = organizationId;
    let newOrganizationCreated = false;

    // If creating new organization, handle that first
    if (mode === "create_new") {
      if (organizationType === "school_district" && districtData?.leaId) {
        // Create organization with district data
        const districtInfo = {
          leaId: districtData.leaId,
          state: districtData.state,
          stateLeaId: districtData.stateLeaId,
          city: districtData.city,
          zipCode: districtData.zipCode,
          phone: districtData.phone,
          latitude: districtData.latitude,
          longitude: districtData.longitude,
          countyName: districtData.countyName,
          enrollment: districtData.enrollment,
          numberOfSchools: districtData.numberOfSchools,
          lowestGrade: districtData.lowestGrade,
          highestGrade: districtData.highestGrade,
          urbanCentricLocale: districtData.urbanCentricLocale,
          districtDataYear: districtData.districtDataYear || 2022,
        };

        // Generate slug from district name
        let slug = districtData.name
          .toLowerCase()
          .replace(/[^\w-]/g, "-")
          .replace(/-+/g, "-")
          .replace(/^-+|-+$/g, "");

        // Ensure slug is unique
        let slugCounter = 0;
        let uniqueSlug = slug;
        while (
          await prisma.organization.findUnique({ where: { slug: uniqueSlug } })
        ) {
          slugCounter++;
          uniqueSlug = `${slug}-${slugCounter}`;
        }

        const newOrg = await prisma.organization.create({
          data: {
            name: districtData.name,
            slug: uniqueSlug,
            ...districtInfo,
          },
        });

        targetOrganizationId = newOrg.id;
        newOrganizationCreated = true;
        console.log(
          `[Admin] Created new school district organization: ${newOrg.name} (${newOrg.slug})`
        );
      } else if (organizationType === "custom" && customOrgData?.name) {
        // Create custom organization
        let slug = customOrgData.name
          .toLowerCase()
          .replace(/[^\w-]/g, "-")
          .replace(/-+/g, "-")
          .replace(/^-+|-+$/g, "");

        // Ensure slug is unique
        let slugCounter = 0;
        let uniqueSlug = slug;
        while (
          await prisma.organization.findUnique({ where: { slug: uniqueSlug } })
        ) {
          slugCounter++;
          uniqueSlug = `${slug}-${slugCounter}`;
        }

        const newOrg = await prisma.organization.create({
          data: {
            name: customOrgData.name,
            slug: uniqueSlug,
            website: customOrgData.website || null,
            email: customOrgData.email || null,
            phone: customOrgData.phone || null,
            address: customOrgData.address || null,
            city: customOrgData.city || null,
            state: customOrgData.state || null,
            zipCode: customOrgData.zipCode || null,
          },
        });

        targetOrganizationId = newOrg.id;
        newOrganizationCreated = true;
        console.log(
          `[Admin] Created new custom organization: ${newOrg.name} (${newOrg.slug})`
        );
      } else {
        return NextResponse.json(
          { error: "Invalid organization data provided" },
          { status: 400 }
        );
      }
    }

    // Verify organization exists
    const organization = await prisma.organization.findUnique({
      where: { id: targetOrganizationId },
      include: {
        users: {
          where: { role: "OWNER" },
        },
      },
    });

    if (!organization) {
      return NextResponse.json(
        { error: "Organization not found" },
        { status: 404 }
      );
    }

    // Check for single owner constraint
    if (role === "OWNER" && organization.users.length > 0) {
      return NextResponse.json(
        {
          error: `Organization already has an owner: ${organization.users[0].name} (${organization.users[0].email})`,
        },
        { status: 400 }
      );
    }

    // Create user in Supabase Auth with admin API
    console.log(`[Admin] Creating Supabase Auth user...`);
    const { data: authData, error: authError } =
      await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true, // Auto-confirm email
        user_metadata: {
          name,
          organizationId: targetOrganizationId,
          role: role,
        },
      });

    if (authError) {
      console.error(`[Admin] Supabase Auth error:`, authError);
      return NextResponse.json(
        { error: `Auth error: ${authError.message}` },
        { status: 400 }
      );
    }

    console.log(`[Admin] Supabase user created with ID: ${authData.user.id}`);

    const userId = authData.user.id;

    // Wait for database trigger to create app.users record and organization
    console.log(
      `[Admin] Waiting for database trigger to create user record...`
    );
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Verify user was created by trigger
    console.log(`[Admin] Verifying user creation in app.users...`);
    const newUser = await prisma.user.findUnique({
      where: { id: userId },
      include: { organization: true },
    });

    if (!newUser) {
      console.error(`[Admin] Trigger failed to create user ${email}`);
      return NextResponse.json(
        { error: "Database trigger failed to create user record" },
        { status: 500 }
      );
    }

    console.log(`[Admin] User record found in database`);

    if (!newUser.organization) {
      console.error(
        `[Admin] Trigger failed to create organization for ${email}`
      );
      return NextResponse.json(
        { error: "Database trigger failed to create organization" },
        { status: 500 }
      );
    }

    console.log(`[Admin] Organization found: ${newUser.organization.slug}`);
    console.log(
      `[Admin] User ${email} created in organization ${newUser.organization.slug} with role ${newUser.role}`
    );

    // Get updated user with organization
    const updatedUser = await prisma.user.findUnique({
      where: { id: userId },
      include: { organization: true },
    });

    if (!updatedUser) {
      return NextResponse.json(
        { error: "User not found after creation" },
        { status: 500 }
      );
    }

    // Send welcome email with credentials
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const organizationSlug = updatedUser.organization?.slug;

    const emailResult = await sendWelcomeEmail({
      to: email,
      name: name,
      loginUrl: `${siteUrl}/login`,
      temporaryPassword: password,
      organizationUrl: `${siteUrl}/private/${organizationSlug}/dashboard`,
    });

    if (emailResult.success) {
      console.log(`[Admin] Welcome email sent to ${email}`);
    } else {
      console.warn(
        `[Admin] Failed to send welcome email to ${email}:`,
        emailResult.error
      );
    }

    return NextResponse.json({
      message: "User created successfully",
      emailSent: emailResult.success,
      newOrganizationCreated,
      user: {
        id: updatedUser?.id,
        email: updatedUser?.email,
        name: updatedUser?.name,
        role: updatedUser?.role,
        system_admin: updatedUser?.system_admin,
        organizationSlug: updatedUser?.organization?.slug,
        organizationName: updatedUser?.organization?.name,
        organizationId: updatedUser?.organization?.id,
        districtInfo: updatedUser?.organization?.leaId
          ? {
              name: updatedUser.organization.name,
              leaId: updatedUser.organization.leaId,
              state: updatedUser.organization.state,
              city: updatedUser.organization.city,
              enrollment: updatedUser.organization.enrollment,
            }
          : null,
      },
    });
  } catch (error) {
    console.error("[Admin] Error creating user:", error);
    return NextResponse.json(
      {
        error: "Failed to create user",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// GET /api/admin/users - List all users (admin only)
export async function GET() {
  const supabase = await createClient();

  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser();

  if (!currentUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check system admin
  const dbUser = await prisma.user.findUnique({
    where: { id: currentUser.id },
    select: { system_admin: true },
  });

  if (dbUser?.system_admin !== true) {
    return NextResponse.json(
      { error: "Forbidden - System admin only" },
      { status: 403 }
    );
  }

  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        system_admin: true,
        createdAt: true,
        lastActiveAt: true,
        organization: {
          select: {
            slug: true,
            name: true,
            leaId: true,
            state: true,
            city: true,
            enrollment: true,
            countyName: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ users });
  } catch (error) {
    console.error("[Admin] Error fetching users:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}
