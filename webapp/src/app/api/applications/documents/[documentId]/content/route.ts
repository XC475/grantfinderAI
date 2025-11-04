import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

/**
 * GET /api/applications/documents/[documentId]/content
 *
 * Retrieves document content for the WebSocket server to load into Yjs.
 * Called when a document is first opened for collaboration.
 *
 * Security: Validates the WS_SERVER_SECRET to ensure requests
 * only come from the authorized WebSocket server.
 */
export async function GET(
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

    console.log(`📄 [API] Loading document content: ${documentId}`);

    const document = await prisma.application_documents.findUnique({
      where: { id: documentId },
      select: {
        id: true,
        content: true,
        contentType: true,
      },
    });

    if (!document) {
      console.log(`⚠️  [API] Document not found: ${documentId}`);
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 }
      );
    }

    // Parse JSON content if it's stored as a string
    let content = document.content;
    if (typeof content === "string") {
      try {
        content = JSON.parse(content);
      } catch (e) {
        console.warn(`⚠️  [API] Could not parse document content as JSON`);
      }
    }

    console.log(`✅ [API] Document content loaded: ${documentId}`);

    return NextResponse.json({
      content,
      contentType: document.contentType,
    });
  } catch (error) {
    console.error("❌ [API] Error loading document content:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
