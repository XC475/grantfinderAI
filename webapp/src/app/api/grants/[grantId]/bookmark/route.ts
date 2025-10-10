import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { createClient } from "@/utils/supabase/server";

async function getUserOrganizationId(userId: string): Promise<string> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { organizationId: true },
  });
  if (!user?.organizationId) throw new Error("Organization not found");
  return user.organizationId;
}

// GET /api/grants/[grantId]/bookmark - Check if grant is bookmarked
export async function GET(
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
    const organizationId = await getUserOrganizationId(user.id);
    const opportunityId = parseInt(grantId);
    if (isNaN(opportunityId)) {
      return new Response("Invalid opportunity ID", { status: 400 });
    }

    const bookmark = await prisma.grantBookmark.findUnique({
      where: {
        userId_opportunityId_organizationId: {
          userId: user.id,
          opportunityId,
          organizationId,
        },
      },
    });

    return Response.json({ bookmarked: !!bookmark });
  } catch (e) {
    console.error("Error checking bookmark:", e);
    return new Response("Error checking bookmark", { status: 500 });
  }
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
    const organizationId = await getUserOrganizationId(user.id);

    // grantId is actually an opportunity ID (integer from public.opportunities)
    const opportunityId = parseInt(grantId);
    if (isNaN(opportunityId)) {
      return new Response("Invalid opportunity ID", { status: 400 });
    }

    // Check if opportunity exists
    const opportunity = await prisma.$queryRaw<Array<{ id: number }>>`
      SELECT id FROM public.opportunities WHERE id = ${opportunityId} LIMIT 1
    `;

    if (!opportunity || opportunity.length === 0) {
      return new Response("Opportunity not found", { status: 404 });
    }

    // Create bookmark directly with opportunity ID
    const bookmark = await prisma.grantBookmark.upsert({
      where: {
        userId_opportunityId_organizationId: {
          userId: user.id,
          opportunityId,
          organizationId,
        },
      },
      update: {},
      create: {
        userId: user.id,
        opportunityId,
        organizationId,
      },
    });

    return Response.json(bookmark, { status: 201 });
  } catch (e) {
    if (
      typeof e === "object" &&
      e !== null &&
      "code" in e &&
      e.code === "P2002"
    ) {
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
    const organizationId = await getUserOrganizationId(user.id);

    const opportunityId = parseInt(grantId);
    if (isNaN(opportunityId)) {
      return new Response("Invalid opportunity ID", { status: 400 });
    }

    await prisma.grantBookmark.delete({
      where: {
        userId_opportunityId_organizationId: {
          userId: user.id,
          opportunityId,
          organizationId,
        },
      },
    });

    return new Response(null, { status: 204 });
  } catch (e) {
    if (
      typeof e === "object" &&
      e !== null &&
      "code" in e &&
      e.code === "P2025"
    ) {
      return new Response("Bookmark not found", { status: 404 });
    }
    console.error("Error removing bookmark:", e);
    return new Response("Error removing bookmark", { status: 500 });
  }
}
