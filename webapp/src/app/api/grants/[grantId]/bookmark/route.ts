import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { createClient } from "@/utils/supabase/server";

async function getUserWorkspaceId(userId: string): Promise<string> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { personalWorkspaceId: true },
  });
  if (!user?.personalWorkspaceId) throw new Error("Workspace not found");
  return user.personalWorkspaceId;
}

// POST /api/grants/[grantId]/bookmark
export async function POST(
  _req: NextRequest,
  context: { params: Promise<{ grantId: string }> }
) {
  const { grantId } = await context.params;
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) return new Response("Unauthorized", { status: 401 });

  if (!grantId) return new Response("Missing grantId", { status: 400 });

  try {
    // Ensure grant exists
    const grant = await prisma.grant.findUnique({ where: { id: grantId } });
    if (!grant) return new Response("Grant not found", { status: 404 });

    const workspaceId = await getUserWorkspaceId(user.id);

    // Upsert bookmark (unique on userId, grantId, workspaceId)
    const bookmark = await prisma.grantBookmark.upsert({
      where: {
        userId_grantId_workspaceId: {
          userId: user.id,
          grantId,
          workspaceId,
        },
      },
      update: {},
      create: {
        userId: user.id,
        grantId,
        workspaceId,
      },
      include: { grant: true },
    });

    return Response.json(bookmark, { status: 201 });
  } catch (e: any) {
    if (e?.code === "P2002") {
      return new Response("Already bookmarked", { status: 409 });
    }
    console.error("Error bookmarking grant:", e);
    return new Response("Error bookmarking grant", { status: 500 });
  }
}

// DELETE /api/grants/[grantId]/bookmark
export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ grantId: string }> }
) {
  const { grantId } = await context.params;
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) return new Response("Unauthorized", { status: 401 });

  if (!grantId) return new Response("Missing grantId", { status: 400 });

  try {
    const workspaceId = await getUserWorkspaceId(user.id);

    await prisma.grantBookmark.delete({
      where: {
        userId_grantId_workspaceId: {
          userId: user.id,
          grantId,
          workspaceId,
        },
      },
    });

    return new Response(null, { status: 204 });
  } catch (e: any) {
    if (e?.code === "P2025") {
      return new Response("Bookmark not found", { status: 404 });
    }
    console.error("Error removing bookmark:", e);
    return new Response("Error removing bookmark", { status: 500 });
  }
}
