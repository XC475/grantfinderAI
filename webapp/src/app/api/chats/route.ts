import { createClient } from "@/utils/supabase/server";
import prisma from "@/lib/prisma";

// GET /api/chats - List user's chats
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const chats = await prisma.aiChat.findMany({
      where: { userId: user.id },
      select: {
        id: true,
        title: true,
        context: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: { messages: true },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    return Response.json(chats);
  } catch (error) {
    console.error("Error fetching chats:", error);
    return new Response("Error fetching chats", { status: 500 });
  }
}
