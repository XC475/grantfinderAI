import { createClient } from "@/utils/supabase/server";
import prisma from "@/lib/prisma";

// PATCH /api/chats/[chatId]/title - Update chat title
export async function PATCH(
  req: Request,
  { params }: { params: { chatId: string } }
) {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const { title } = await req.json();

    if (!title || typeof title !== "string") {
      return new Response("Invalid title", { status: 400 });
    }

    // Verify user owns this chat before updating
    const chat = await prisma.aiChat.findFirst({
      where: {
        id: params.chatId,
        userId: user.id,
      },
    });

    if (!chat) {
      return new Response("Chat not found", { status: 404 });
    }

    // Update the chat title
    const updatedChat = await prisma.aiChat.update({
      where: { id: params.chatId },
      data: {
        title: title.substring(0, 100), // Limit title length
        updatedAt: new Date(),
      },
    });

    return Response.json({
      id: updatedChat.id,
      title: updatedChat.title,
    });
  } catch (error) {
    console.error("Error updating chat title:", error);
    return new Response("Error updating chat title", { status: 500 });
  }
}
