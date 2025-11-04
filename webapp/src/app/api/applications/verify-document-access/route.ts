import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import prisma from "@/lib/prisma";

/**
 * POST /api/applications/verify-document-access
 * 
 * Verifies that a user has access to a specific document.
 * Called by the WebSocket server during authentication.
 * 
 * Security: Validates the WS_SERVER_SECRET to ensure requests
 * only come from the authorized WebSocket server.
 */
export async function POST(request: NextRequest) {
  try {
    // Verify request is from WebSocket server
    const serverSecret = request.headers.get("X-WS-Server-Secret");
    if (serverSecret !== process.env.WS_SERVER_SECRET) {
      console.error("❌ [API] Invalid WS server secret");
      return NextResponse.json(
        { error: "Unauthorized: Invalid server secret" },
        { status: 401 }
      );
    }

    const { documentId, userId } = await request.json();

    if (!documentId || !userId) {
      return NextResponse.json(
        { error: "documentId and userId are required" },
        { status: 400 }
      );
    }

    console.log(`🔐 [API] Verifying document access: ${documentId} for user ${userId}`);

    // Find the document and check if user's organization owns it
    const document = await prisma.application_documents.findUnique({
      where: { id: documentId },
      include: {
        applications: {
          include: {
            organization: {
              include: {
                users: {
                  where: { id: userId },
                  select: { id: true },
                },
              },
            },
          },
        },
      },
    });

    if (!document) {
      console.error(`❌ [API] Document not found: ${documentId}`);
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 }
      );
    }

    // Check if user is a member of the organization that owns the document
    const hasAccess = document.applications.organization.users.length > 0;

    if (!hasAccess) {
      console.error(`❌ [API] Access denied: User ${userId} not in organization`);
      return NextResponse.json(
        { error: "Access denied: User not in organization" },
        { status: 403 }
      );
    }

    console.log(`✅ [API] Access verified for document ${documentId}`);

    return NextResponse.json({
      success: true,
      organizationId: document.applications.organizationId,
      applicationId: document.applicationId,
    });
  } catch (error) {
    console.error("❌ [API] Error verifying document access:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

