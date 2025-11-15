import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { supabaseServer } from "@/lib/supabaseServer";
import prisma from "@/lib/prisma";

/**
 * Recommendations List API Endpoint
 *
 * Returns paginated list of grant recommendations for the authenticated user's organization
 *
 * Query Parameters:
 * - limit (number): Number of results to return (default: 10, max: 100)
 * - offset (number): Number of results to skip for pagination (default: 0)
 *
 * Response Format:
 * {
 *   data: Recommendation[],
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
    console.log(`📋 [${requestId}] Recommendations List API called`);

    // 1. Authenticate user
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Get user's organization
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

    // 3. Extract pagination parameters
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
      `📋 [${requestId}] Pagination: limit=${limit}, offset=${offset}`
    );

    // 4. Get total count
    const totalCount = await prisma.recommendation.count({
      where: {
        organizationId: dbUser.organizationId,
      },
    });

    // 5. Fetch recommendations for this organization with pagination
    const recommendations = await prisma.recommendation.findMany({
      where: {
        organizationId: dbUser.organizationId,
      },
      orderBy: [
        { fitScore: "desc" }, // Sort by fit score (highest first)
        { queryDate: "desc" }, // Then by query date (most recent first)
      ],
      take: limit,
      skip: offset,
    });

    console.log(
      `✅ [${requestId}] Found ${recommendations.length} of ${totalCount} total recommendations`
    );

    // 6. Fetch opportunity details for all recommendations in one query (efficient!)
    const opportunityIds = recommendations.map((r) =>
      parseInt(r.opportunityId)
    );

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

    // Merge opportunity data with recommendations
    const recommendationsWithGrants = recommendations.map((rec) => ({
      ...rec,
      grant: opportunityMap.get(parseInt(rec.opportunityId)) || null,
    }));

    // 7. Return recommendations with grant details and pagination info
    return NextResponse.json({
      data: recommendationsWithGrants,
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
  } catch (error) {
    const processingTime = Date.now() - startTime;
    console.error(`❌ [${requestId}] Recommendations List Error:`, error);
    console.error(`❌ [${requestId}] Processing time: ${processingTime}ms`);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch recommendations",
        requestId,
        timestamp: new Date().toISOString(),
        processingTimeMs: processingTime,
      },
      { status: 500 }
    );
  }
}
