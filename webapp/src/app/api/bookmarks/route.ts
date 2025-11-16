import prisma from "@/lib/prisma";
import { createClient } from "@/utils/supabase/server";
import { supabaseServer } from "@/lib/supabaseServer";
import { NextRequest, NextResponse } from "next/server";

/**
 * Bookmarks API Endpoint
 *
 * Returns paginated list of bookmarked grants for the authenticated user
 *
 * Query Parameters:
 * - limit (number): Number of results to return (default: 10, max: 100)
 * - offset (number): Number of results to skip for pagination (default: 0)
 *
 * Response Format:
 * {
 *   data: Bookmark[],
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

    // Extract pagination parameters
    const { searchParams } = new URL(req.url);
    let limit = parseInt(searchParams.get("limit") || "10");
    let offset = parseInt(searchParams.get("offset") || "0");

    // Validate parameters
    if (limit > 100) {
      limit = 100;
    }
    if (offset < 0) {
      offset = 0;
    }

    // Get total count
    const totalCount = await prisma.grantBookmark.count({
      where: { userId: user.id },
    });

    // Fetch bookmarks with pagination
    const bookmarks = await prisma.grantBookmark.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset,
    });

    // Fetch opportunity details for all bookmarks in one query (efficient!)
    const opportunityIds = bookmarks.map((b) => b.opportunityId);

    const { data: opportunities, error: oppError } = await supabaseServer
      .from("opportunities")
      .select("*")
      .in("id", opportunityIds);

    if (oppError) {
      console.error(
        `❌ [${requestId}] Error fetching opportunities:`,
        oppError
      );
    }

    // Create a map for quick lookup
    const opportunityMap = new Map(
      opportunities?.map((opp) => [opp.id, opp]) || []
    );

    // Merge opportunity data with bookmarks
    const bookmarksWithOpportunities = bookmarks.map((bookmark) => ({
      ...bookmark,
      opportunity: opportunityMap.get(bookmark.opportunityId) || null,
    }));

    return NextResponse.json({
      data: bookmarksWithOpportunities,
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
    console.error(`❌ [${requestId}] Error listing bookmarks:`, e);
    console.error(`❌ [${requestId}] Processing time: ${processingTime}ms`);

    return NextResponse.json(
      {
        error: "Error listing bookmarks",
        requestId,
        timestamp: new Date().toISOString(),
        processingTimeMs: processingTime,
      },
      { status: 500 }
    );
  }
}
