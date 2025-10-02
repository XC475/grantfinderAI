import prisma from "@/lib/prisma";
import { createClient } from "@/utils/supabase/server";

// GET /api/bookmarks - list bookmarks for the authenticated user
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) return new Response("Unauthorized", { status: 401 });

  try {
    const bookmarks = await prisma.grantBookmark.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });

    // Fetch opportunity details for each bookmark
    const bookmarksWithOpportunities = await Promise.all(
      bookmarks.map(async (bookmark) => {
        const opportunity = await prisma.$queryRaw<Array<Record<string, unknown>>>`
          SELECT * FROM public.opportunities WHERE id = ${bookmark.opportunityId} LIMIT 1
        `;
        return {
          ...bookmark,
          opportunity: opportunity[0] || null,
        };
      })
    );

    return Response.json(bookmarksWithOpportunities);
  } catch (e) {
    console.error("Error listing bookmarks:", e);
    return new Response("Error listing bookmarks", { status: 500 });
  }
}
