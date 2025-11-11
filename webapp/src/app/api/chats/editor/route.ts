import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import prisma from "@/lib/prisma";

/**
 * GET /api/chats/editor?documentId={id}
 * List all editor chat sessions for a document
 */
export async function GET(req: NextRequest) {
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

    // Get documentId from query params
    const { searchParams } = new URL(req.url);
    const documentId = searchParams.get("documentId");

    if (!documentId) {
      return NextResponse.json(
        { error: "documentId is required" },
        { status: 400 }
      );
    }

    // Verify user has access to this document
    const document = await prisma.document.findUnique({
      where: { id: documentId },
      select: {
        id: true,
        application: {
          select: {
            organizationId: true,
            organization: {
              select: {
                users: {
                  where: { id: user.id },
                  select: { id: true },
                },
              },
            },
          },
        },
      },
    });

    if (!document) {
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 }
      );
    }

    // Check if user has access (either via application's org or standalone document)
    const hasAccess =
      !document.application ||
      (document.application.organization.users.length > 0);

    if (!hasAccess) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get all editor chat sessions for this document
    const chats = await prisma.aiChat.findMany({
      where: {
        userId: user.id,
        context: "DRAFTING",
        metadata: {
          path: ["documentId"],
          equals: documentId,
        },
      },
      include: {
        _count: {
          select: { messages: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Filter chats that have the editor_assistant chatType in metadata
    const editorChats = chats.filter((chat) => {
      const metadata = chat.metadata as {
        chatType?: string;
        documentId?: string;
      } | null;
      return metadata?.chatType === "editor_assistant";
    });

    // Format response
    const formattedChats = editorChats.map((chat) => ({
      id: chat.id,
      title: chat.title,
      createdAt: chat.createdAt.toISOString(),
      updatedAt: chat.updatedAt.toISOString(),
      messageCount: chat._count.messages,
    }));

    return NextResponse.json({ chats: formattedChats });
  } catch (error) {
    console.error("Error fetching editor chats:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

