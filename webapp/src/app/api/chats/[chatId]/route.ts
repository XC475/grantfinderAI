import { createClient } from "@/utils/supabase/server";
import prisma from "@/lib/prisma";
import { deleteAllChatAttachments } from "@/lib/chatStorageCleanup";

// GET /api/chats/[chatId] - Get specific chat with messages
export async function GET(
  req: Request,
  { params }: { params: Promise<{ chatId: string }> }
) {
  const { chatId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const chat = await prisma.aiChat.findFirst({
      where: {
        id: chatId,
        userId: user.id, // Ensure user owns this chat
      },
      include: {
        messages: {
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!chat) {
      return new Response("Chat not found", { status: 404 });
    }

    return Response.json(chat);
  } catch (error) {
    console.error("Error fetching chat:", error);
    return new Response("Error fetching chat", { status: 500 });
  }
}

// DELETE /api/chats/[chatId] - Delete a chat
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ chatId: string }> }
) {
  const { chatId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    // Verify user owns this chat before deleting
    const chat = await prisma.aiChat.findFirst({
      where: {
        id: chatId,
        userId: user.id,
      },
    });

    if (!chat) {
      return new Response("Chat not found", { status: 404 });
    }

    // Clean up chat attachments from storage BEFORE deleting
    // (must happen before cascade delete removes message metadata)
    await deleteAllChatAttachments(chatId, prisma);

    // Delete the chat (messages will be deleted due to cascade)
    await prisma.aiChat.delete({
      where: { id: chatId },
    });

    return new Response("Chat deleted", { status: 200 });
  } catch (error) {
    console.error("Error deleting chat:", error);
    return new Response("Error deleting chat", { status: 500 });
  }
}
