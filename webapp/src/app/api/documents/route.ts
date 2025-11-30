import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import prisma from "@/lib/prisma";
import { extractTextFromTiptap } from "@/lib/textExtraction";
import { triggerDocumentVectorization } from "@/lib/textExtraction";
import { VectorizationStatus } from "@/generated/prisma";

/**
 * Documents API Endpoint
 *
 * Returns paginated list of all documents for the authenticated user's organization
 *
 * Query Parameters:
 * - limit (number): Number of results to return (default: 10, max: 100)
 * - offset (number): Number of results to skip for pagination (default: 0)
 *
 * Response Format:
 * {
 *   data: Document[],
 *   pagination: {
 *     total: number,
 *     limit: number,
 *     offset: number,
 *     hasMore: boolean
 *   },
 *   meta: {
 *     requestId: string,
 *     timestamp: string,
 *     processingTimeMs: number
 *   }
 * }
 */
export async function GET(req: NextRequest) {
  const startTime = Date.now();
  const requestId = Math.random().toString(36).substring(7);

  try {
    // Authenticate user
    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's organization
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { organizationId: true },
    });

    if (!dbUser?.organizationId) {
      return NextResponse.json(
        { error: "User organization not found" },
        { status: 404 }
      );
    }

    // Extract pagination parameters
    const { searchParams } = new URL(req.url);
    const withFolders = searchParams.get("withFolders") === "true";
    const isKnowledgeBase = searchParams.get("isKnowledgeBase");
    const fileTag = searchParams.get("fileTag"); // Can be tag name or tag ID
    const vectorizationStatus = searchParams.get("vectorizationStatus");
    let limit = parseInt(searchParams.get("limit") || "10");
    let offset = parseInt(searchParams.get("offset") || "0");

    // Validate parameters
    if (limit > 100) {
      limit = 100;
    }
    if (offset < 0) {
      offset = 0;
    }

    // If withFolders=true, return all documents with folder info (for SourcesModal)
    if (withFolders) {
      const documents = await prisma.document.findMany({
        where: {
          organizationId: dbUser.organizationId,
          ...(isKnowledgeBase !== null && {
            isKnowledgeBase: isKnowledgeBase === "true",
          }),
        },
        select: {
          id: true,
          title: true,
          folderId: true,
          fileUrl: true,
          fileType: true,
          contentType: true,
          updatedAt: true,
          fileTag: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: {
          updatedAt: "desc",
        },
      });

      return NextResponse.json({
        data: documents,
        meta: {
          requestId,
          timestamp: new Date().toISOString(),
          processingTimeMs: Date.now() - startTime,
        },
      });
    }

    // Build where clause with KB filters
    let fileTagId: string | undefined;
    if (fileTag) {
      // Try to find tag by name or ID
      const tag = await prisma.documentTag.findFirst({
        where: {
          organizationId: dbUser.organizationId,
          OR: [{ id: fileTag }, { name: fileTag }],
        },
      });
      if (tag) {
        fileTagId = tag.id;
      }
    }

    const whereClause: {
      organizationId: string;
      isKnowledgeBase?: boolean;
      fileTagId?: string;
      vectorizationStatus?: VectorizationStatus;
    } = {
      organizationId: dbUser.organizationId,
      ...(isKnowledgeBase !== null && {
        isKnowledgeBase: isKnowledgeBase === "true",
      }),
      ...(fileTagId && {
        fileTagId,
      }),
      ...(vectorizationStatus && {
        vectorizationStatus: vectorizationStatus as VectorizationStatus,
      }),
    };

    // Get total count of documents for this organization
    const totalCount = await prisma.document.count({
      where: whereClause,
    });

    // Fetch documents with pagination, including application details and fileTag
    const documents = await prisma.document.findMany({
      where: whereClause,
      include: {
        application: {
          select: {
            id: true,
            title: true,
            opportunityId: true,
            opportunityAgency: true,
            opportunityAwardMax: true,
          },
        },
        fileTag: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
      take: limit,
      skip: offset,
    });

    return NextResponse.json({
      data: documents,
      pagination: {
        total: totalCount,
        limit,
        offset,
        hasMore: offset + limit < totalCount,
      },
      meta: {
        requestId,
        timestamp: new Date().toISOString(),
        processingTimeMs: Date.now() - startTime,
      },
    });
  } catch (e) {
    const processingTime = Date.now() - startTime;
    console.error("Error listing documents:", e);

    return NextResponse.json(
      {
        error: "Error listing documents",
        requestId,
        timestamp: new Date().toISOString(),
        processingTimeMs: processingTime,
      },
      { status: 500 }
    );
  }
}

const DEFAULT_DOCUMENT_CONTENT = JSON.stringify({
  type: "doc",
  content: [
    {
      type: "heading",
      attrs: { level: 1 },
      content: [{ type: "text", text: "Welcome to Grantware AI" }],
    },
    {
      type: "paragraph",
      content: [
        {
          type: "text",
          text: "This is your document workspace. Start writing your grant application here.",
        },
      ],
    },
    {
      type: "heading",
      attrs: { level: 2 },
      content: [{ type: "text", text: "Getting Started" }],
    },
    {
      type: "bulletList",
      content: [
        {
          type: "listItem",
          content: [
            {
              type: "paragraph",
              content: [
                {
                  type: "text",
                  text: "Use the toolbar above to format your text",
                },
              ],
            },
          ],
        },
        {
          type: "listItem",
          content: [
            {
              type: "paragraph",
              content: [
                {
                  type: "text",
                  text: "Add headings, lists, and other formatting as needed",
                },
              ],
            },
          ],
        },
        {
          type: "listItem",
          content: [
            {
              type: "paragraph",
              content: [
                {
                  type: "text",
                  text: "Your work is automatically saved as you type",
                },
              ],
            },
          ],
        },
        {
          type: "listItem",
          content: [
            {
              type: "paragraph",
              content: [
                {
                  type: "text",
                  text: "Use the save button to manually save your progress",
                },
              ],
            },
          ],
        },
      ],
    },
    {
      type: "heading",
      attrs: { level: 2 },
      content: [{ type: "text", text: "Tips for Grant Writing" }],
    },
    {
      type: "bulletList",
      content: [
        {
          type: "listItem",
          content: [
            {
              type: "paragraph",
              content: [
                { type: "text", text: "Clearly state your project objectives" },
              ],
            },
          ],
        },
        {
          type: "listItem",
          content: [
            {
              type: "paragraph",
              content: [
                { type: "text", text: "Provide detailed budget information" },
              ],
            },
          ],
        },
        {
          type: "listItem",
          content: [
            {
              type: "paragraph",
              content: [
                {
                  type: "text",
                  text: "Include measurable outcomes and timelines",
                },
              ],
            },
          ],
        },
        {
          type: "listItem",
          content: [
            {
              type: "paragraph",
              content: [
                {
                  type: "text",
                  text: "Address all requirements from the grant guidelines",
                },
              ],
            },
          ],
        },
      ],
    },
    {
      type: "paragraph",
      content: [{ type: "text", text: "Happy writing!" }],
    },
  ],
});

// POST /api/documents - Create a standalone document for the organization
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { organizationId: true },
    });

    if (!dbUser?.organizationId) {
      return NextResponse.json(
        { error: "User organization not found" },
        { status: 404 }
      );
    }

    const body = await req.json();
    const {
      title,
      content,
      contentType = "json",
      folderId,
      fileTagId,
      fileTag, // Can be tag name or tag ID
    } = body;

    if (!title || typeof title !== "string") {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    // If folderId is provided, verify it belongs to the organization
    if (folderId) {
      const folder = await prisma.folder.findFirst({
        where: {
          id: folderId,
          organizationId: dbUser.organizationId,
        },
      });

      if (!folder) {
        return NextResponse.json(
          { error: "Folder not found or access denied" },
          { status: 404 }
        );
      }
    }

    // Extract text from Tiptap JSON content if present
    let extractedText = null;
    const finalContent = content || DEFAULT_DOCUMENT_CONTENT;
    if (finalContent && contentType === "json") {
      extractedText = extractTextFromTiptap(finalContent);
    }

    // Resolve fileTagId from fileTag name or use provided fileTagId
    let resolvedFileTagId: string | null = fileTagId || null;
    if (fileTag && !resolvedFileTagId) {
      const tag = await prisma.documentTag.findFirst({
        where: {
          organizationId: dbUser.organizationId,
          OR: [{ id: fileTag }, { name: fileTag }],
        },
      });
      if (tag) {
        resolvedFileTagId = tag.id;
      }
    }
    
    // If no tag specified, use "General" as default
    if (!resolvedFileTagId) {
      const generalTag = await prisma.documentTag.findFirst({
        where: {
          organizationId: dbUser.organizationId,
          name: "General",
        },
      });
      if (generalTag) {
        resolvedFileTagId = generalTag.id;
      }
    }

    const document = await prisma.document.create({
      data: {
        title,
        content: finalContent,
        contentType,
        fileTagId: resolvedFileTagId,
        isKnowledgeBase: true, // Explicitly set - Prisma doesn't always use DB defaults when field is omitted
        extractedText,
        vectorizationStatus: extractedText ? "PENDING" : "COMPLETED",
        organizationId: dbUser.organizationId,
        folderId: folderId || null,
        version: 1,
      },
      include: {
        application: {
          select: {
            id: true,
            title: true,
            opportunityId: true,
          },
        },
        folder: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Trigger vectorization if text exists
    if (extractedText) {
      await triggerDocumentVectorization(document.id, dbUser.organizationId);
    }

    return NextResponse.json({ document }, { status: 201 });
  } catch (error) {
    console.error("Error creating document:", error);
    return NextResponse.json(
      { error: "Failed to create document" },
      { status: 500 }
    );
  }
}
