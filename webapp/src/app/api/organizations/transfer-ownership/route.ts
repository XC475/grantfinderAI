import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import prisma from "@/lib/prisma";

// POST /api/organizations/transfer-ownership - Transfer ownership to an admin
export async function POST(request: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser();

  if (!currentUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { targetUserId, password } = body;

    if (!targetUserId || !password) {
      return NextResponse.json(
        { error: "Target user ID and password are required" },
        { status: 400 }
      );
    }

    // Get current user's details (owner)
    const currentDbUser = await prisma.user.findUnique({
      where: { id: currentUser.id },
      select: {
        id: true,
        email: true,
        organizationId: true,
        role: true,
      },
    });

    if (!currentDbUser) {
      return NextResponse.json(
        { error: "Current user not found" },
        { status: 404 }
      );
    }

    // Verify current user is OWNER
    if (currentDbUser.role !== "OWNER") {
      return NextResponse.json(
        { error: "Only organization owner can transfer ownership" },
        { status: 403 }
      );
    }

    // Verify password
    const { error: authError } = await supabase.auth.signInWithPassword({
      email: currentDbUser.email,
      password: password,
    });

    if (authError) {
      return NextResponse.json(
        { error: "Invalid password" },
        { status: 401 }
      );
    }

    // Get target user details
    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
      select: {
        id: true,
        email: true,
        name: true,
        organizationId: true,
        role: true,
      },
    });

    if (!targetUser) {
      return NextResponse.json(
        { error: "Target user not found" },
        { status: 404 }
      );
    }

    // Verify target user is in the same organization
    if (targetUser.organizationId !== currentDbUser.organizationId) {
      return NextResponse.json(
        { error: "Target user is not in your organization" },
        { status: 403 }
      );
    }

    // Verify target user is ADMIN
    if (targetUser.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Can only transfer ownership to an admin" },
        { status: 400 }
      );
    }

    // Prevent transferring to yourself (shouldn't happen, but just in case)
    if (targetUserId === currentUser.id) {
      return NextResponse.json(
        { error: "Cannot transfer ownership to yourself" },
        { status: 400 }
      );
    }

    // Perform atomic role swap in a transaction
    await prisma.$transaction([
      // Current owner becomes admin
      prisma.user.update({
        where: { id: currentUser.id },
        data: { role: "ADMIN" },
      }),
      // Target admin becomes owner
      prisma.user.update({
        where: { id: targetUserId },
        data: { role: "OWNER" },
      }),
    ]);

    return NextResponse.json({
      message: "Ownership transferred successfully",
      newOwner: {
        id: targetUser.id,
        email: targetUser.email,
        name: targetUser.name,
      },
    });
  } catch (error) {
    console.error("Error transferring ownership:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to transfer ownership",
      },
      { status: 500 }
    );
  }
}

