import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import prisma from "@/lib/prisma";

// PATCH /api/organizations/members/[userId] - Update member role (OWNER only)
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

  try {
    const { userId } = await params;
    const body = await request.json();
    const { role } = body;

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 });
    }

    if (!role || !["ADMIN", "MEMBER"].includes(role)) {
      return NextResponse.json(
        { error: "Invalid role. Must be ADMIN or MEMBER" },
        { status: 400 }
      );
    }

    // Get current user's role and organization
    const dbUser = await prisma.user.findUnique({
      where: { id: currentUser.id },
      select: { organizationId: true, role: true },
    });

    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Only OWNER can change roles
    if (dbUser.role !== "OWNER") {
      return NextResponse.json(
        { error: "Forbidden - Only organization owner can change roles" },
        { status: 403 }
      );
    }

    // Get target user and verify same organization
    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { organizationId: true, role: true, email: true },
    });

    if (!targetUser) {
      return NextResponse.json(
        { error: "Target user not found" },
        { status: 404 }
      );
    }

    if (targetUser.organizationId !== dbUser.organizationId) {
      return NextResponse.json(
        { error: "User is not in your organization" },
        { status: 403 }
      );
    }

    // Prevent changing own role
    if (userId === currentUser.id) {
      return NextResponse.json(
        { error: "Cannot change your own role" },
        { status: 400 }
      );
    }

    // Prevent changing another owner's role
    if (targetUser.role === "OWNER") {
      return NextResponse.json(
        { error: "Cannot change owner role" },
        { status: 400 }
      );
    }

    // Update user role
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        lastActiveAt: true,
      },
    });

    return NextResponse.json({
      message: "User role updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error updating user role:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to update user role",
      },
      { status: 500 }
    );
  }
}

// DELETE /api/organizations/members/[userId] - Delete a member
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

  try {
    const { userId } = await params;

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 });
    }

    // Get current user's role and organization
    const dbUser = await prisma.user.findUnique({
      where: { id: currentUser.id },
      select: { organizationId: true, role: true },
    });

    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Only ADMIN and OWNER can delete members
    if (dbUser.role !== "OWNER" && dbUser.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Forbidden - Only admins and owners can delete members" },
        { status: 403 }
      );
    }

    // Get target user and verify same organization
    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        organizationId: true,
        role: true,
        email: true,
        name: true,
      },
    });

    if (!targetUser) {
      return NextResponse.json(
        { error: "Target user not found" },
        { status: 404 }
      );
    }

    if (targetUser.organizationId !== dbUser.organizationId) {
      return NextResponse.json(
        { error: "User is not in your organization" },
        { status: 403 }
      );
    }

    // Prevent deleting yourself
    if (userId === currentUser.id) {
      return NextResponse.json(
        { error: "Cannot delete your own account" },
        { status: 400 }
      );
    }

    // Prevent deleting the owner
    if (targetUser.role === "OWNER") {
      return NextResponse.json(
        { error: "Cannot delete the organization owner" },
        { status: 400 }
      );
    }

    // Admins can only delete MEMBERs
    if (dbUser.role === "ADMIN" && targetUser.role === "ADMIN") {
      return NextResponse.json(
        { error: "Admins can only delete members, not other admins" },
        { status: 403 }
      );
    }

    // Delete from Supabase Auth
    const { error: authError } = await supabase.auth.admin.deleteUser(userId);

    if (authError) {
      console.error("Supabase auth delete error:", authError);
      // Continue with database deletion even if auth delete fails
    }

    // Delete from database (cascade will handle related records)
    await prisma.user.delete({
      where: { id: userId },
    });

    return NextResponse.json({
      message: "User deleted successfully",
      deletedUser: {
        id: userId,
        email: targetUser.email,
        name: targetUser.name,
      },
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to delete user",
      },
      { status: 500 }
    );
  }
}
