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

  // Check admin role
  const dbUser = await prisma.user.findUnique({
    where: { id: currentUser.id },
    select: { role: true },
  });

  if (dbUser?.role !== "ADMIN") {
    return NextResponse.json(
      { error: "Forbidden - Admin only" },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    const { email, name, password, role = "USER", districtData } = body;

    // Validate input
    if (!email || !name || !password) {
      return NextResponse.json(
        { error: "Email, name, and password are required" },
        { status: 400 }
      );
    }

    // Create or find school district if provided
    let schoolDistrictId = null;
    let schoolDistrict = null;
    if (districtData && districtData.leaId) {
      // Check if district already exists
      schoolDistrict = await prisma.schoolDistrict.findUnique({
        where: { leaId: districtData.leaId },
      });

      // If not, create it
      if (!schoolDistrict) {
        schoolDistrict = await prisma.schoolDistrict.create({
          data: {
            leaId: districtData.leaId,
            name: districtData.name,
            stateCode: districtData.stateCode,
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
            year: districtData.year || 2022,
          },
        });
      }

      schoolDistrictId = schoolDistrict.id;
    }

    // Create user in Supabase Auth with admin API
    const { data: authData, error: authError } =
      await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true, // Auto-confirm email
        user_metadata: {
          name,
        },
      });

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }

    const userId = authData.user.id;

    // Wait for database trigger to create app.users record and workspace
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Verify user was created by trigger
    const newUser = await prisma.user.findUnique({
      where: { id: userId },
      include: { personalWorkspace: true },
    });

    if (!newUser) {
      console.error(`[Admin] Trigger failed to create user ${email}`);
      return NextResponse.json(
        { error: "Failed to create user - database trigger error" },
        { status: 500 }
      );
    }

    if (!newUser.personalWorkspace) {
      console.error(`[Admin] Trigger failed to create workspace for ${email}`);
      return NextResponse.json(
        { error: "Failed to create workspace - database trigger error" },
        { status: 500 }
      );
    }

    console.log(
      `[Admin] User ${email} created with workspace ${newUser.personalWorkspace.slug}`
    );

    // Update user role and link workspace to school district
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role },
      include: { personalWorkspace: true },
    });

    // Link workspace to school district if provided
    if (schoolDistrictId) {
      await prisma.workspace.update({
        where: { id: newUser.personalWorkspace.id },
        data: { schoolDistrictId },
      });

      console.log(
        `[Admin] Workspace linked to district ${schoolDistrict?.name}`
      );
    }

    console.log(`[Admin] User ${email} role set to ${role}`);

    // Send welcome email with credentials
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const workspaceSlug = updatedUser.personalWorkspace?.slug;

    const emailResult = await sendWelcomeEmail({
      to: email,
      name: name,
      loginUrl: `${siteUrl}/login`,
      temporaryPassword: password,
      workspaceUrl: `${siteUrl}/private/${workspaceSlug}/chat`,
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
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        role: updatedUser.role,
        workspaceSlug: updatedUser.personalWorkspace?.slug,
        schoolDistrict: schoolDistrict
          ? {
              id: schoolDistrict.id,
              name: schoolDistrict.name,
              stateCode: schoolDistrict.stateCode,
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

  // Check admin role
  const dbUser = await prisma.user.findUnique({
    where: { id: currentUser.id },
    select: { role: true },
  });

  if (dbUser?.role !== "ADMIN") {
    return NextResponse.json(
      { error: "Forbidden - Admin only" },
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
        createdAt: true,
        lastActiveAt: true,
        personalWorkspace: {
          select: {
            slug: true,
            schoolDistrict: {
              select: {
                id: true,
                leaId: true,
                name: true,
                stateCode: true,
                city: true,
                enrollment: true,
                countyName: true,
              },
            },
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
