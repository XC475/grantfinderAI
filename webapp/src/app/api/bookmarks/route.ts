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
      include: {
        grant: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return Response.json(bookmarks);
  } catch (e) {
    console.error("Error listing bookmarks:", e);
    return new Response("Error listing bookmarks", { status: 500 });
  }
}
