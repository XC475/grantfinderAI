import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

/**
 * POST /api/applications/documents/[documentId]/collaboration
 *
 * Saves document content from the WebSocket server to the database.
 * Called periodically (debounced) as users edit the document.
 *
 * Security: Validates the WS_SERVER_SECRET to ensure requests
 * only come from the authorized WebSocket server.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ documentId: string }> }
) {
  try {
    const { documentId } = await params;

    // Verify request is from WebSocket server
    const serverSecret = request.headers.get("X-WS-Server-Secret");
    if (serverSecret !== process.env.WS_SERVER_SECRET) {
      console.error("❌ [API] Invalid WS server secret");
      return NextResponse.json(
        { error: "Unauthorized: Invalid server secret" },
        { status: 401 }
      );
    }

    const { content } = await request.json();

    if (!content) {
      return NextResponse.json(
        { error: "content is required" },
        { status: 400 }
      );
    }

    console.log(`💾 [API] Saving document via collaboration: ${documentId}`);

    // Convert Tiptap JSON to HTML for the contentHtml field (if needed)
    // For now, we'll just store the JSON content
    const contentString =
      typeof content === "string" ? content : JSON.stringify(content);

    const document = await prisma.application_documents.update({
      where: { id: documentId },
      data: {
        content: contentString,
        contentType: "json",
        updatedAt: new Date(),
      },
      select: {
        id: true,
        title: true,
        updatedAt: true,
      },
    });

    console.log(`✅ [API] Document saved: ${documentId}`);

    return NextResponse.json({
      success: true,
      document: {
        id: document.id,
        title: document.title,
        updatedAt: document.updatedAt,
      },
    });
  } catch (error) {
    console.error("❌ [API] Error saving document:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
