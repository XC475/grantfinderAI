import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import prisma from "@/lib/prisma";

/**
 * PATCH /api/chats/editor/{chatId}/title
 * Update chat title
 */
export async function PATCH(
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
    const { title } = await req.json();

    if (!chatId) {
      return NextResponse.json(
        { error: "chatId is required" },
        { status: 400 }
      );
    }

    if (!title || typeof title !== "string" || title.trim().length === 0) {
      return NextResponse.json(
        { error: "Valid title is required" },
        { status: 400 }
      );
    }

    // Update chat title
    const updatedChat = await prisma.aiChat.update({
      where: {
        id: chatId,
        userId: user.id, // Ensure user owns this chat
      },
      data: {
        title: title.trim(),
      },
    });

    if (!updatedChat) {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, title: updatedChat.title });
  } catch (error) {
    console.error("Error updating chat title:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
