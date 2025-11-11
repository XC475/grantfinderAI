import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import prisma from "@/lib/prisma";

/**
 * GET /api/chats/editor/{chatId}
 * Get full chat session with messages
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ chatId: string }> }
) {
  try {
    // Get authenticated user
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { chatId } = await params;

    if (!chatId) {
      return NextResponse.json(
        { error: "chatId is required" },
        { status: 400 }
      );
    }

    // Get chat with messages
    const chat = await prisma.aiChat.findUnique({
      where: {
        id: chatId,
        userId: user.id, // Ensure user owns this chat
      },
      include: {
        messages: {
          orderBy: { createdAt: "asc" },
          select: {
            id: true,
            role: true,
            content: true,
            createdAt: true,
            metadata: true,
          },
        },
      },
    });

    if (!chat) {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 });
    }

    // Verify this is an editor assistant chat
    const metadata = chat.metadata as {
      chatType?: string;
      documentId?: string;
    } | null;

    if (metadata?.chatType !== "editor_assistant") {
      return NextResponse.json(
        { error: "Not an editor chat" },
        { status: 400 }
      );
    }

    // Format response
    const formattedChat = {
      id: chat.id,
      title: chat.title,
      createdAt: chat.createdAt.toISOString(),
      updatedAt: chat.updatedAt.toISOString(),
      messages: chat.messages.map((msg) => ({
        id: msg.id,
        role: msg.role,
        content: msg.content,
        createdAt: msg.createdAt.toISOString(),
        metadata: msg.metadata,
      })),
    };

    return NextResponse.json({ chat: formattedChat });
  } catch (error) {
    console.error("Error fetching editor chat:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
