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
    // Fetch all chats excluding editor assistant chats
    // Editor chats have context='DRAFTING' AND metadata.chatType='editor_assistant'
    const chats = await prisma.aiChat.findMany({
      where: {
        userId: user.id,
        OR: [
          // Include all non-DRAFTING contexts
          {
            context: {
              in: ["GENERAL", "APPLICATION", "GRANT_ANALYSIS", "ELIGIBILITY"],
            },
          },
          // Include DRAFTING chats that are NOT editor assistants
          {
            AND: [
              { context: "DRAFTING" },
              {
                OR: [
                  // Chats without metadata (backward compatibility)
                  { metadata: { equals: null } },
                  // Chats with metadata but no chatType
                  {
                    NOT: {
                      metadata: {
                        path: ["chatType"],
                        equals: "editor_assistant",
                      },
                    },
                  },
                ],
              },
            ],
          },
        ],
      },
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
