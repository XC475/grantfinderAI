import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { createClient } from "@/utils/supabase/server";

// GET /api/user - Get current user
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        onboardingCompleted: true,
        hasTemporaryPassword: true,
        createdAt: true,
        updatedAt: true,
        avatarUrl: true,
        lastActiveAt: true,
        organizationId: true,
        system_admin: true,
        googleDriveConnected: true,
      },
    });

    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(dbUser);
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { error: "Failed to fetch user" },
      { status: 500 }
    );
  }
}

// PATCH /api/user - Update current user
export async function PATCH(request: NextRequest) {
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
    const { onboardingCompleted, name, avatarUrl } = body;

    // Build update data object
    const updateData: {
      onboardingCompleted?: boolean;
      name?: string;
      avatarUrl?: string;
      updatedAt: Date;
    } = {
      updatedAt: new Date(),
    };

    if (onboardingCompleted !== undefined) {
      updateData.onboardingCompleted = onboardingCompleted;
    }
    if (name !== undefined) {
      updateData.name = name;
    }
    if (avatarUrl !== undefined) {
      updateData.avatarUrl = avatarUrl;
    }

    // Update user's data
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        onboardingCompleted: true,
        createdAt: true,
        updatedAt: true,
        avatarUrl: true,
        lastActiveAt: true,
        organizationId: true,
        system_admin: true,
        googleDriveConnected: true,
      },
    });

    // Revalidate cache for the user's organization pages if onboarding was completed
    if (onboardingCompleted !== undefined) {
      const userWithOrg = await prisma.user.findUnique({
        where: { id: user.id },
        select: {
          organization: {
            select: { slug: true },
          },
        },
      });

      if (userWithOrg?.organization?.slug) {
        // Revalidate the organization layout to ensure fresh data
        revalidatePath(`/private/${userWithOrg.organization.slug}`, "layout");
        revalidatePath(`/private/${userWithOrg.organization.slug}/dashboard`);
        revalidatePath(`/private/${userWithOrg.organization.slug}/onboarding`);
      }
    }

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    );
  }
}
