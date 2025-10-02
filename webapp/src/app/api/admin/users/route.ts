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
    const { email, name, password, role = "USER", schoolDistrictId } = body;

    // Validate input
    if (!email || !name || !password) {
      return NextResponse.json(
        { error: "Email, name, and password are required" },
        { status: 400 }
      );
    }

    // Validate schoolDistrictId if provided
    let schoolDistrict = null;
    if (schoolDistrictId) {
      schoolDistrict = await prisma.schoolDistrict.findUnique({
        where: { id: schoolDistrictId },
      });

      if (!schoolDistrict) {
        return NextResponse.json(
          { error: "Invalid school district ID" },
          { status: 400 }
        );
      }
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

    // Update user role if needed (trigger creates with default USER role)
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role },
      include: { personalWorkspace: true },
    });

    console.log(`[Admin] User ${email} role set to ${role}`);

    // Create DistrictProfile if schoolDistrictId is provided
    if (schoolDistrictId && schoolDistrict) {
      try {
        await prisma.districtProfile.create({
          data: {
            workspaceId: newUser.personalWorkspace.id,
            schoolDistrictId: schoolDistrictId,
            districtName: schoolDistrict.name,
            state: schoolDistrict.stateCode,
            enrollment: schoolDistrict.enrollment,
            grades: [], // Can be populated later
            priorities: [],
          },
        });

        console.log(
          `[Admin] District profile created for ${email} with district ${schoolDistrict.name}`
        );
      } catch (profileError) {
        console.error(
          `[Admin] Failed to create district profile for ${email}:`,
          profileError
        );
        // Don't fail the user creation, just log the error
      }
    }

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
            districtProfile: {
              select: {
                districtName: true,
                state: true,
                schoolDistrict: {
                  select: {
                    id: true,
                    name: true,
                    stateCode: true,
                    city: true,
                  },
                },
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
