import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import prisma from "@/lib/prisma";
import { sendWelcomeEmail } from "@/lib/email";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { email, name, role = "MEMBER" } = body;

    // Validate inputs
    if (!email || !name) {
      return NextResponse.json(
        { error: "Email and name are required" },
        { status: 400 }
      );
    }

    // Get current user's role and organization
    const currentUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        role: true,
        organizationId: true,
        organization: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check permission (ADMIN or OWNER only)
    if (currentUser.role !== "ADMIN" && currentUser.role !== "OWNER") {
      return NextResponse.json(
        { error: "Forbidden - Admin or Owner access required" },
        { status: 403 }
      );
    }

    // Validate role (cannot create OWNER)
    if (!["ADMIN", "MEMBER"].includes(role)) {
      return NextResponse.json(
        { error: "Role must be ADMIN or MEMBER" },
        { status: 400 }
      );
    }

    // Generate secure random password
    const password = crypto.randomBytes(16).toString("base64url");

    // Create user in Supabase Auth
    const { data: authData, error: createError } =
      await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          name,
          organizationId: currentUser.organizationId,
          role,
          hasTemporaryPassword: true,
        },
      });

    if (createError) {
      return NextResponse.json({ error: createError.message }, { status: 400 });
    }

    // Wait briefly for database trigger to create user record
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Verify user was created in database
    const newUser = await prisma.user.findUnique({
      where: { id: authData.user.id },
    });

    if (!newUser) {
      console.error("User not created in database by trigger");
    }

    // Send welcome email
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const emailResult = await sendWelcomeEmail({
      to: email,
      name,
      loginUrl: `${siteUrl}/`,
      temporaryPassword: password,
      organizationUrl: `${siteUrl}/private/${currentUser.organization.slug}/dashboard`,
    });

    return NextResponse.json({
      message: "User invited successfully",
      emailSent: emailResult.success,
      user: {
        id: authData.user.id,
        email,
        name,
        role,
      },
    });
  } catch (error) {
    console.error("Error inviting user:", error);
    return NextResponse.json(
      { error: "Failed to invite user" },
      { status: 500 }
    );
  }
}
