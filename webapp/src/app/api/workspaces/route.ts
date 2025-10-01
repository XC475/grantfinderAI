import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { createClient } from "@/utils/supabase/server";

// GET /api/workspaces - Get all workspaces the user has access to
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Get user's personal workspace
    const userWithWorkspace = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        personalWorkspace: {
          select: {
            id: true,
            name: true,
            slug: true,
            type: true,
          },
        },
      },
    });

    // Get organization workspaces the user is a member of
    const organizationWorkspaces = await prisma.workspace.findMany({
      where: {
        type: "ORGANIZATION",
        organization: {
          members: {
            some: {
              userId: user.id,
            },
          },
        },
      },
      select: {
        id: true,
        name: true,
        slug: true,
        type: true,
      },
    });

    // Combine all workspaces
    const workspaces = [];

    if (userWithWorkspace?.personalWorkspace) {
      workspaces.push(userWithWorkspace.personalWorkspace);
    }

    workspaces.push(...organizationWorkspaces);

    return NextResponse.json(workspaces);
  } catch (error) {
    console.error("Error fetching workspaces:", error);
    return NextResponse.json(
      { error: "Failed to fetch workspaces" },
      { status: 500 }
    );
  }
}
