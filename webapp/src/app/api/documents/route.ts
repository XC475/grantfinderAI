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
        application: {
          organizationId: dbUser.organizationId,
        },
      },
    });

    // Fetch documents with pagination, including application details
    const documents = await prisma.document.findMany({
      where: {
        application: {
          organizationId: dbUser.organizationId,
        },
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
