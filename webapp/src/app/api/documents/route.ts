import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import prisma from "@/lib/prisma";

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
    console.log(`📄 [${requestId}] Documents API called`);

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
    let limit = parseInt(searchParams.get("limit") || "10");
    let offset = parseInt(searchParams.get("offset") || "0");

    // Validate parameters
    if (limit > 100) {
      console.warn(`⚠️ [${requestId}] Limit too high, capping at 100`);
      limit = 100;
    }
    if (offset < 0) {
      console.warn(`⚠️ [${requestId}] Negative offset, setting to 0`);
      offset = 0;
    }

    console.log(
      `📄 [${requestId}] Pagination: limit=${limit}, offset=${offset}`
    );

    // Get total count of documents for this organization
    const totalCount = await prisma.document.count({
      where: {
        organizationId: dbUser.organizationId,
      },
    });

    // Fetch documents with pagination, including application details
    const documents = await prisma.document.findMany({
      where: {
        organizationId: dbUser.organizationId,
      },
      include: {
        application: {
          select: {
            id: true,
            title: true,
            opportunityId: true,
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
      take: limit,
      skip: offset,
    });

    console.log(
      `✅ [${requestId}] Found ${documents.length} of ${totalCount} total documents`
    );

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
    console.error(`❌ [${requestId}] Error listing documents:`, e);
    console.error(`❌ [${requestId}] Processing time: ${processingTime}ms`);

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

const DEFAULT_DOCUMENT_CONTENT = `
      <h1>Welcome to Grantware AI</h1>
      <p>This is your document workspace. Start writing your grant application here.</p>
      <h2>Getting Started</h2>
      <ul>
        <li>Use the toolbar above to format your text</li>
        <li>Add headings, lists, and other formatting as needed</li>
        <li>Your work is automatically saved as you type</li>
        <li>Use the save button to manually save your progress</li>
      </ul>
      <h2>Tips for Grant Writing</h2>
      <ul>
        <li>Clearly state your project objectives</li>
        <li>Provide detailed budget information</li>
        <li>Include measurable outcomes and timelines</li>
        <li>Address all requirements from the grant guidelines</li>
      </ul>
      <p>Happy writing!</p>
    `;

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
    const { title, content, contentType = "html", folderId } = body;

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

    const document = await prisma.document.create({
      data: {
        title,
        content: content || DEFAULT_DOCUMENT_CONTENT,
        contentType,
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

    return NextResponse.json({ document }, { status: 201 });
  } catch (error) {
    console.error("Error creating document:", error);
    return NextResponse.json(
      { error: "Failed to create document" },
      { status: 500 }
    );
  }
}
