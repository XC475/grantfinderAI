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
      organizationRole = "ADMIN",
      districtData,
    } = body;

    console.log(
      `[Admin] Creating user with email: ${email}, has district data: ${!!districtData}`
    );
    if (districtData) {
      console.log(
        `[Admin] District data:`,
        JSON.stringify(districtData, null, 2)
      );
    }

    // Validate input
    if (!email || !name || !password) {
      return NextResponse.json(
        { error: "Email, name, and password are required" },
        { status: 400 }
      );
    }

    // Store district data for later organization update
    const districtInfo = districtData?.leaId
      ? {
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
        }
      : null;

    // Store district name separately to update organization name
    const districtName = districtData?.name;

    // Create user in Supabase Auth with admin API
    console.log(`[Admin] Creating Supabase Auth user...`);
    const { data: authData, error: authError } =
      await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true, // Auto-confirm email
        user_metadata: {
          name,
          ...(districtName && districtInfo?.leaId
            ? {
                districtName: districtName,
                leaId: districtInfo.leaId,
              }
            : {}),
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
      `[Admin] User ${email} created with organization ${newUser.organization.slug}`
    );

    // Update organization with role and district data
    const updateData = {
      role: organizationRole,
      ...(districtName ? { name: districtName } : {}),
      ...(districtInfo || {}),
    };

    console.log(
      `[Admin] Updating organization with data:`,
      JSON.stringify(updateData, null, 2)
    );

    try {
      await prisma.organization.update({
        where: { id: newUser.organization.id },
        data: updateData,
      });
      console.log(`[Admin] Organization role set to ${organizationRole}`);

      if (districtInfo && districtName) {
        console.log(
          `[Admin] Organization created for district: ${districtName}`
        );
      }
    } catch (updateError) {
      console.error(`[Admin] Error updating organization:`, updateError);
      throw new Error(
        `Failed to update organization: ${updateError instanceof Error ? updateError.message : "Unknown error"}`
      );
    }

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
      user: {
        id: updatedUser?.id,
        email: updatedUser?.email,
        name: updatedUser?.name,
        system_admin: updatedUser?.system_admin,
        organizationSlug: updatedUser?.organization?.slug,
        organizationRole: updatedUser?.organization?.role,
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
        system_admin: true,
        createdAt: true,
        lastActiveAt: true,
        organization: {
          select: {
            slug: true,
            role: true,
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
