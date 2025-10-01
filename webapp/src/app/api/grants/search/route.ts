import { supabaseServer } from "@/lib/supabaseServer";
import { NextRequest, NextResponse } from "next/server";

/**
 * Grants Search API Endpoint
 *
 * This endpoint provides a comprehensive search interface for grant opportunities
 * stored in the Supabase 'opportunities' table. It supports text search, filtering,
 * pagination, and returns detailed grant information with metadata.
 *
 * @param req - NextRequest object containing the search parameters
 * @returns JSON response with grants data, pagination info, and search metadata
 *
 * Query Parameters:
 * - q (string): Search query for text matching in title, description, and source_grant_id
 * - status (string): Filter by grant status - options: "posted", "forecasted", "closed"
 * - category (string): Filter by grant category - options: "Discretionary", "Entitlement/Allocation"
 * - minAmount (number): Minimum funding amount filter
 * - maxAmount (number): Maximum funding amount filter
 * - limit (number): Number of results to return (default: 50, max: 100)
 * - offset (number): Number of results to skip for pagination (default: 0)
 *
 * Response Format:
 * {
 *   data: Grant[],                    // Array of grant objects
 *   pagination: {                     // Pagination information
 *     total: number,                  // Total number of grants matching criteria
 *     limit: number,                  // Number of results per page
 *     offset: number,                 // Number of results skipped
 *     hasMore: boolean               // Whether more results are available
 *   },
 *   searchParams: {                   // Echo of search parameters used
 *     query: string,
 *     status: string,
 *     category: string,
 *     minAmount: string | null,
 *     maxAmount: string | null
 *   },
 *   meta: {                          // Request metadata
 *     requestId: string,             // Unique request identifier for logging
 *     timestamp: string,             // ISO timestamp of response
 *     processingTimeMs: number,      // Time taken to process request
 *     source: string                 // API source identifier
 *   }
 * }
 *
 * Grant Object Structure:
 * {
 *   id: number,                      // Unique grant identifier
 *   title: string,                   // Grant title
 *   description: string,             // Grant description (HTML)
 *   source_grant_id: string,         // Official grant identifier from source
 *   status: string,                  // Current status (posted/forecasted/closed)
 *   category: string,                // Grant category
 *   total_funding_amount: number,    // Total funding available
 *   award_min: number,               // Minimum award amount
 *   award_max: number,               // Maximum award amount
 *   close_date: string,              // Application deadline (ISO date)
 *   contact_name: string,            // Contact person name
 *   contact_email: string,           // Contact email address
 *   url: string,                     // Link to full grant details
 *   post_date: string                // When the grant was posted (ISO date)
 * }
 *
 * Usage Examples:
 * - Basic search: GET /api/grants/search?q=education&limit=10
 * - Filtered search: GET /api/grants/search?q=healthcare&status=posted&category=Discretionary&minAmount=10000&limit=5
 * - Pagination: GET /api/grants/search?q=grants&limit=10&offset=20
 *
 * @throws {Error} When Supabase query fails or unexpected errors occur
 * @example
 * // Search for education grants
 * const response = await fetch('/api/grants/search?q=education&limit=5');
 * const data = await response.json();
 * console.log(data.data); // Array of grant objects
 */
export async function GET(req: NextRequest) {
  const startTime = Date.now();
  const requestId = Math.random().toString(36).substring(7);

  try {
    console.log(`🔍 [${requestId}] Grants search API called`);
    console.log(`🔍 [${requestId}] Request URL: ${req.url}`);

    const { searchParams } = new URL(req.url);

    // Extract search parameters
    const query = searchParams.get("q") || "";
    const status = searchParams.get("status") || "";
    const category = searchParams.get("category") || "";
    const minAmount = searchParams.get("minAmount");
    const maxAmount = searchParams.get("maxAmount");
    const stateCode = searchParams.get("stateCode") || "";
    const agency = searchParams.get("agency") || "";
    const fundingInstrument = searchParams.get("fundingInstrument") || "";
    const costSharing = searchParams.get("costSharing");
    const fiscalYear = searchParams.get("fiscalYear");
    const source = searchParams.get("source") || "";
    const closeDateFrom = searchParams.get("closeDateFrom");
    const closeDateTo = searchParams.get("closeDateTo");
    let limit = parseInt(searchParams.get("limit") || "50");
    let offset = parseInt(searchParams.get("offset") || "0");

    console.log(`🔍 [${requestId}] Search parameters:`, {
      query,
      status,
      category,
      minAmount,
      maxAmount,
      stateCode,
      agency,
      fundingInstrument,
      costSharing,
      fiscalYear,
      source,
      closeDateFrom,
      closeDateTo,
      limit,
      offset,
    });

    // Validate parameters
    if (limit > 100) {
      console.warn(`⚠️ [${requestId}] Limit too high, capping at 100`);
      limit = 100;
    }

    if (offset < 0) {
      console.warn(`⚠️ [${requestId}] Negative offset, setting to 0`);
      offset = 0;
    }

    // Build the base query
    console.log(`🔍 [${requestId}] Building Supabase query...`);
    let supabaseQuery = supabaseServer.from("opportunities").select("*");

    // Add text search if query is provided
    if (query) {
      console.log(`🔍 [${requestId}] Adding text search for: "${query}"`);
      supabaseQuery = supabaseQuery.or(
        `title.ilike.%${query}%,description.ilike.%${query}%,source_grant_id.ilike.%${query}%`
      );
    }

    // Add status filter
    if (status) {
      console.log(`🔍 [${requestId}] Adding status filter: "${status}"`);
      supabaseQuery = supabaseQuery.eq("status", status);
    }

    // Add category filter
    if (category) {
      console.log(`🔍 [${requestId}] Adding category filter: "${category}"`);
      supabaseQuery = supabaseQuery.eq("category", category);
    }

    // Add amount range filters
    if (minAmount) {
      const minAmountNum = parseInt(minAmount);
      console.log(
        `🔍 [${requestId}] Adding minimum amount filter: ${minAmountNum}`
      );
      supabaseQuery = supabaseQuery.gte("total_funding_amount", minAmountNum);
    }
    if (maxAmount) {
      const maxAmountNum = parseInt(maxAmount);
      console.log(
        `🔍 [${requestId}] Adding maximum amount filter: ${maxAmountNum}`
      );
      supabaseQuery = supabaseQuery.lte("total_funding_amount", maxAmountNum);
    }

    // Add state filter
    if (stateCode) {
      console.log(`🔍 [${requestId}] Adding state filter: "${stateCode}"`);
      supabaseQuery = supabaseQuery.eq("state_code", stateCode);
    }

    // Add agency filter
    if (agency) {
      console.log(`🔍 [${requestId}] Adding agency filter: "${agency}"`);
      supabaseQuery = supabaseQuery.eq("agency", agency);
    }

    // Add funding instrument filter
    if (fundingInstrument) {
      console.log(
        `🔍 [${requestId}] Adding funding instrument filter: "${fundingInstrument}"`
      );
      supabaseQuery = supabaseQuery.eq("funding_instrument", fundingInstrument);
    }

    // Add cost sharing filter
    if (costSharing !== null && costSharing !== undefined) {
      const requiresCostSharing = costSharing === "true";
      console.log(
        `🔍 [${requestId}] Adding cost sharing filter: ${requiresCostSharing}`
      );
      supabaseQuery = supabaseQuery.eq("cost_sharing", requiresCostSharing);
    }

    // Add fiscal year filter
    if (fiscalYear) {
      const fiscalYearNum = parseInt(fiscalYear);
      console.log(
        `🔍 [${requestId}] Adding fiscal year filter: ${fiscalYearNum}`
      );
      supabaseQuery = supabaseQuery.eq("fiscal_year", fiscalYearNum);
    }

    // Add source filter
    if (source) {
      console.log(`🔍 [${requestId}] Adding source filter: "${source}"`);
      supabaseQuery = supabaseQuery.eq("source", source);
    }

    // Add close date range filters
    if (closeDateFrom) {
      console.log(
        `🔍 [${requestId}] Adding close date from filter: "${closeDateFrom}"`
      );
      supabaseQuery = supabaseQuery.gte("close_date", closeDateFrom);
    }
    if (closeDateTo) {
      console.log(
        `🔍 [${requestId}] Adding close date to filter: "${closeDateTo}"`
      );
      supabaseQuery = supabaseQuery.lte("close_date", closeDateTo);
    }

    // Add pagination
    console.log(
      `🔍 [${requestId}] Adding pagination: offset=${offset}, limit=${limit}`
    );
    supabaseQuery = supabaseQuery
      .range(offset, offset + limit - 1)
      .order("post_date", { ascending: false });

    console.log(`🔍 [${requestId}] Executing Supabase query...`);
    const { data, error, count } = await supabaseQuery;

    if (error) {
      console.error(`❌ [${requestId}] Supabase query error:`, error);
      return NextResponse.json(
        {
          error: error.message,
          requestId,
          timestamp: new Date().toISOString(),
        },
        {
          status: 500,
          //   headers: corsHeaders,
        }
      );
    }

    console.log(
      `✅ [${requestId}] Supabase query successful. Found ${
        data?.length || 0
      } records`
    );

    // Get total count for pagination
    let totalCount = 0;
    if (
      query ||
      status ||
      category ||
      minAmount ||
      maxAmount ||
      stateCode ||
      agency ||
      fundingInstrument ||
      costSharing ||
      fiscalYear ||
      source ||
      closeDateFrom ||
      closeDateTo
    ) {
      console.log(`🔍 [${requestId}] Getting filtered count...`);
      let countQuery = supabaseServer
        .from("opportunities")
        .select("*", { count: "exact", head: true });

      // Apply the same filters to count query
      if (query) {
        countQuery = countQuery.or(
          `title.ilike.%${query}%,description.ilike.%${query}%,source_grant_id.ilike.%${query}%`
        );
      }
      if (status) {
        countQuery = countQuery.eq("status", status);
      }
      if (category) {
        countQuery = countQuery.eq("category", category);
      }
      if (minAmount) {
        const minAmountNum = parseInt(minAmount);
        countQuery = countQuery.gte("total_funding_amount", minAmountNum);
      }
      if (maxAmount) {
        const maxAmountNum = parseInt(maxAmount);
        countQuery = countQuery.lte("total_funding_amount", maxAmountNum);
      }
      if (stateCode) {
        countQuery = countQuery.eq("state_code", stateCode);
      }
      if (agency) {
        countQuery = countQuery.eq("agency", agency);
      }
      if (fundingInstrument) {
        countQuery = countQuery.eq("funding_instrument", fundingInstrument);
      }
      if (costSharing !== null && costSharing !== undefined) {
        const requiresCostSharing = costSharing === "true";
        countQuery = countQuery.eq("cost_sharing", requiresCostSharing);
      }
      if (fiscalYear) {
        const fiscalYearNum = parseInt(fiscalYear);
        countQuery = countQuery.eq("fiscal_year", fiscalYearNum);
      }
      if (source) {
        countQuery = countQuery.eq("source", source);
      }
      if (closeDateFrom) {
        countQuery = countQuery.gte("close_date", closeDateFrom);
      }
      if (closeDateTo) {
        countQuery = countQuery.lte("close_date", closeDateTo);
      }

      const { count: filteredCount } = await countQuery;
      totalCount = filteredCount || 0;
    } else {
      // For unfiltered queries, get total count
      console.log(`🔍 [${requestId}] Getting total count...`);
      const { count } = await supabaseServer
        .from("opportunities")
        .select("*", { count: "exact", head: true });
      totalCount = count || 0;
    }
    console.log(`🔍 [${requestId}] Total count: ${totalCount}`);

    const responseData = {
      data: data || [],
      pagination: {
        total: totalCount || 0,
        limit,
        offset,
        hasMore: offset + limit < (totalCount || 0),
      },
      searchParams: {
        query,
        status,
        category,
        minAmount,
        maxAmount,
      },
      meta: {
        requestId,
        timestamp: new Date().toISOString(),
        processingTimeMs: Date.now() - startTime,
        source: "grants-search-api",
      },
    };

    console.log(`✅ [${requestId}] Response prepared:`, {
      dataCount: data?.length || 0,
      totalCount: totalCount || 0,
      processingTimeMs: Date.now() - startTime,
    });

    return NextResponse.json(responseData, {
      status: 200,
      //   headers: corsHeaders,
    });
  } catch (error) {
    const processingTime = Date.now() - startTime;
    console.error(`❌ [${requestId}] Unexpected error:`, error);
    console.error(`❌ [${requestId}] Processing time: ${processingTime}ms`);

    return NextResponse.json(
      {
        error: "Internal server error",
        requestId,
        timestamp: new Date().toISOString(),
        processingTimeMs: processingTime,
      },
      {
        status: 500,
        // headers: corsHeaders,
      }
    );
  }
}

// Handle CORS preflight requests
export async function OPTIONS(req: NextRequest) {
  console.log(`🔍 CORS preflight request received`);
  return new NextResponse(null, {
    status: 200,
    // headers: corsHeaders,
  });
}
