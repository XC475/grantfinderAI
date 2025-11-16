import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import prisma from "@/lib/prisma";
import { OrganizationRole } from "@/generated/prisma";
import { deleteAllUserChatAttachments } from "@/lib/chatStorageCleanup";

// DELETE /api/admin/users/[userId] - Delete a user (admin only).
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const supabase = await createClient();

  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser();

  if (!currentUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

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
    const { userId } = await params;

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 });
    }

    // Prevent deleting yourself
    if (userId === currentUser.id) {
      return NextResponse.json(
        { error: "Cannot delete your own account" },
        { status: 400 }
      );
    }

    // Clean up all chat attachments for this user BEFORE deleting
    // (user deletion cascades to chats, so we must cleanup first)
    await deleteAllUserChatAttachments(userId, prisma);

    // Delete from Supabase Auth
    const { error: authError } = await supabase.auth.admin.deleteUser(userId);

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }

    // Delete from database (or let cascade delete handle it)
    await prisma.user.delete({
      where: { id: userId },
    });

    return NextResponse.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      {
        error:
          (error instanceof Error ? error.message : String(error)) ||
          "Failed to delete user",
      },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/users/[userId] - Update user role (admin only)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const supabase = await createClient();

  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser();

  if (!currentUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

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
    const { userId } = await params;
    const body = await request.json();
    const { system_admin, role } = body;

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 });
    }

    // Validate inputs
    if (system_admin !== undefined && typeof system_admin !== "boolean") {
      return NextResponse.json(
        { error: "system_admin must be a boolean" },
        { status: 400 }
      );
    }

    if (role && !["OWNER", "ADMIN", "MEMBER"].includes(role)) {
      return NextResponse.json(
        { error: "Invalid role. Must be OWNER, ADMIN, or MEMBER" },
        { status: 400 }
      );
    }

    // If updating to OWNER role, check for existing owner
    if (role === "OWNER") {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { organizationId: true },
      });

      if (user?.organizationId) {
        const existingOwner = await prisma.user.findFirst({
          where: {
            organizationId: user.organizationId,
            role: "OWNER",
            id: { not: userId }, // Exclude current user
          },
        });

        if (existingOwner) {
          return NextResponse.json(
            {
              error: `Organization already has an owner: ${existingOwner.name} (${existingOwner.email})`,
            },
            { status: 400 }
          );
        }
      }
    }

    // Build update data
    const updateData: { system_admin?: boolean; role?: OrganizationRole } = {};
    if (system_admin !== undefined) {
      updateData.system_admin = system_admin;
    }
    if (role) {
      updateData.role = role as OrganizationRole;
    }

    // Update user
    await prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    // Get updated user with organization
    const updatedUser = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        system_admin: true,
        organization: {
          select: {
            slug: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json({
      message: "User updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      {
        error:
          (error instanceof Error ? error.message : String(error)) ||
          "Failed to update user",
      },
      { status: 500 }
    );
  }
}
