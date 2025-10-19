import { NextRequest } from "next/server";
import { createClient } from "@/utils/supabase/server";
import prisma from "@/lib/prisma";

// Your n8n webhook URL for recommendations - replace with your actual webhook URL
const N8N_RECOMMENDATIONS_URL = process.env.N8N_RECOMMENDATIONS_URL!;

export async function POST(req: NextRequest) {
  const { message, organizationId, opportunityId } = await req.json();

  // Check for API key authentication first
  const apiKey = req.headers.get("x-api-key");
  let user, userOrganizationId;

  if (apiKey && apiKey === process.env.INTERNAL_API_KEY) {
    // API key authentication - skip user validation
    console.log("✅ API key authenticated request to recommendations");
    user = { id: "api-user" }; // Dummy user for API key requests
    userOrganizationId = organizationId; // Must provide organizationId in request

    if (!userOrganizationId) {
      return new Response(
        "organizationId is required for API key authentication",
        { status: 400 }
      );
    }
  } else {
    // Regular Supabase authentication
    const supabase = await createClient();
    const {
      data: { user: supabaseUser },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !supabaseUser) {
      return new Response("Unauthorized", { status: 401 });
    }

    user = supabaseUser;
    userOrganizationId =
      organizationId || (await getUserOrganizationId(user.id));
  }

  // Fetch organization data
  const organization = await prisma.organization.findUnique({
    where: { id: userOrganizationId },
  });

  if (!organization) {
    return new Response("Organization not found", { status: 404 });
  }

  // Check if N8N webhook URL is configured
  if (!N8N_RECOMMENDATIONS_URL) {
    return new Response("N8N recommendations webhook URL not configured", {
      status: 500,
    });
  }

  try {
    // Fetch grants: first state-specific, then USA-wide to fill up to 100 total
    console.log(
      "📊 [Recommendations API] Fetching grants for recommendations..."
    );
    let topGrants = [];

    // Step 1: Fetch all posted grants for the organization's state (if available)
    if (organization.state) {
      console.log(
        `📊 [Recommendations API] Fetching grants for state: ${organization.state}`
      );
      const stateGrantsUrl = new URL(
        `${req.nextUrl.protocol}//${req.nextUrl.host}/api/grants/search`
      );
      stateGrantsUrl.searchParams.set("status", "posted");
      stateGrantsUrl.searchParams.set("stateCode", organization.state);
      stateGrantsUrl.searchParams.set("limit", "100"); // Fetch all state grants
      stateGrantsUrl.searchParams.set("offset", "0");

      const stateGrantsResponse = await fetch(stateGrantsUrl.toString(), {
        headers: {
          "x-api-key": process.env.INTERNAL_API_KEY || "",
        },
      });

      if (stateGrantsResponse.ok) {
        const stateGrantsData = await stateGrantsResponse.json();
        topGrants = stateGrantsData.data || [];
        console.log(
          `📊 [Recommendations API] Fetched ${topGrants.length} state-specific grants`
        );
      } else {
        console.warn("⚠️ [Recommendations API] Failed to fetch state grants");
      }
    }

    // Step 2: Calculate how many more grants we need to reach 100
    const remainingSlots = Math.max(0, 100 - topGrants.length);

    if (remainingSlots > 0) {
      console.log(
        `📊 [Recommendations API] Fetching ${remainingSlots} USA-wide grants to fill remaining slots`
      );
      const usaGrantsUrl = new URL(
        `${req.nextUrl.protocol}//${req.nextUrl.host}/api/grants/search`
      );
      usaGrantsUrl.searchParams.set("status", "posted");
      usaGrantsUrl.searchParams.set("limit", remainingSlots.toString());
      usaGrantsUrl.searchParams.set("offset", "0");

      const usaGrantsResponse = await fetch(usaGrantsUrl.toString(), {
        headers: {
          "x-api-key": process.env.INTERNAL_API_KEY || "",
        },
      });

      if (usaGrantsResponse.ok) {
        const usaGrantsData = await usaGrantsResponse.json();
        const usaGrants = usaGrantsData.data || [];

        // Filter out any USA grants that are already in the state grants (by ID)
        const stateGrantIds = new Set(
          topGrants.map((g: { id: number }) => g.id)
        );
        const uniqueUsaGrants = usaGrants.filter(
          (g: { id: number }) => !stateGrantIds.has(g.id)
        );

        topGrants = [...topGrants, ...uniqueUsaGrants];
        console.log(
          `📊 [Recommendations API] Added ${uniqueUsaGrants.length} USA-wide grants`
        );
      } else {
        console.warn("⚠️ [Recommendations API] Failed to fetch USA grants");
      }
    }

    console.log(
      `📊 [Recommendations API] Total grants to send to n8n: ${topGrants.length}`
    );

    // Send to N8N with district information for recommendations
    const n8nMessage = {
      app_source: "grantfinder-ai-webapp",
      user_id: user.id,
      organization_id: userOrganizationId,
      message: message,
      timestamp: Date.now().toString(),
      opportunity_id: opportunityId || null,
      // Top 100 available grants
      available_grants: topGrants,
      // District information for personalized grant recommendations
      district_info: organization.leaId
        ? {
            id: organization.id,
            leaId: organization.leaId,
            name: organization.name,
            state: organization.state,
            stateLeaId: organization.stateLeaId,
            city: organization.city,
            zipCode: organization.zipCode,
            countyName: organization.countyName,
            enrollment: organization.enrollment,
            numberOfSchools: organization.numberOfSchools,
            lowestGrade: organization.lowestGrade,
            highestGrade: organization.highestGrade,
            urbanCentricLocale: organization.urbanCentricLocale,
            districtDataYear: organization.districtDataYear,
          }
        : null,
      // Organization context
      organization_info: {
        id: organization.id,
        name: organization.name,
        district_linked: !!organization.leaId,
        missionStatement: organization.missionStatement || null,
        strategicPlan: organization.strategicPlan || null,
        annualOperatingBudget: organization.annualOperatingBudget
          ? organization.annualOperatingBudget.toString()
          : null,
        fiscalYearEnd: organization.fiscalYearEnd || null,
      },
    };

    console.log("🔍 [Recommendations API] Sending to n8n with district info:", {
      ...n8nMessage,
      district_name: organization.leaId
        ? organization.name
        : "No district linked",
    });

    const response = await fetch(N8N_RECOMMENDATIONS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(n8nMessage),
    });

    if (!response.ok) {
      throw new Error(`N8N webhook responded with status: ${response.status}`);
    }

    // Accept either JSON or text from n8n
    const contentType = response.headers.get("content-type") || "";
    const data = contentType.includes("application/json")
      ? await response.json()
      : await response.text();

    console.log(
      "🔍 [Recommendations API] Raw n8n response:",
      JSON.stringify(data, null, 2)
    );

    // Handle n8n response format
    let recommendations;
    let recommendationsArray = [];

    if (Array.isArray(data)) {
      // n8n returns array format
      if (data.length > 0 && data[0].output) {
        recommendations = data[0].output;
      } else {
        recommendations = data;
      }
    } else if (typeof data === "string") {
      recommendations = data;
    } else if (typeof data === "object") {
      // Try to extract from various possible fields
      recommendations =
        data.response ||
        data.message ||
        data.content ||
        data.recommendations ||
        data.output ||
        JSON.stringify(data);
    } else {
      recommendations = "OK";
    }

    console.log(
      "🔍 [Recommendations API] Processed recommendations:",
      typeof recommendations === "string" && recommendations.length > 100
        ? recommendations.substring(0, 100) + "..."
        : recommendations
    );

    // Parse recommendations if it's a string
    if (typeof recommendations === "string") {
      try {
        const parsed = JSON.parse(recommendations);
        if (parsed.recommendations && Array.isArray(parsed.recommendations)) {
          recommendationsArray = parsed.recommendations;
        }
      } catch {
        console.warn("Could not parse recommendations as JSON");
      }
    } else if (Array.isArray(recommendations)) {
      recommendationsArray = recommendations;
    } else if (
      recommendations?.recommendations &&
      Array.isArray(recommendations.recommendations)
    ) {
      recommendationsArray = recommendations.recommendations;
    }

    // Save recommendations to database
    if (recommendationsArray.length > 0) {
      console.log(
        `💾 [Recommendations API] Saving ${recommendationsArray.length} recommendations to database`
      );

      try {
        // Check if there are existing recommendations and delete them to avoid duplicates
        const existingCount = await prisma.recommendation.count({
          where: { organizationId: userOrganizationId },
        });

        if (existingCount > 0) {
          await prisma.recommendation.deleteMany({
            where: { organizationId: userOrganizationId },
          });
          console.log(
            `🗑️ [Recommendations API] Deleted ${existingCount} old recommendations`
          );
        }

        // Save new recommendations
        const savedRecommendations = await prisma.recommendation.createMany({
          data: recommendationsArray.map(
            (rec: {
              opportunity_id?: number | string;
              fit_score?: number;
              fit_reasoning?: string;
              fit_description?: string;
              district_name?: string;
              query_date?: string;
            }) => ({
              organizationId: userOrganizationId,
              opportunityId: rec.opportunity_id?.toString() || "",
              fitScore: rec.fit_score || 0,
              fitReasoning: rec.fit_reasoning || "",
              fitDescription: rec.fit_description || "",
              districtName: rec.district_name || "",
              queryDate: rec.query_date ? new Date(rec.query_date) : new Date(),
            })
          ),
        });

        console.log(
          `✅ [Recommendations API] Saved ${savedRecommendations.count} recommendations`
        );
      } catch (dbError) {
        console.error(
          "❌ [Recommendations API] Error saving to database:",
          dbError
        );
        // Continue anyway - don't fail the entire request if DB save fails
      }
    }

    // Return the response to the client
    return new Response(JSON.stringify({ recommendations }), {
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("❌ [Recommendations API] Error:", error);
    return new Response("Error processing recommendations request", {
      status: 500,
    });
  }
}

// Helper functions
async function getUserOrganizationId(userId: string): Promise<string> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { organizationId: true },
  });

  if (!user?.organizationId) {
    throw new Error("User organization not found");
  }

  return user.organizationId;
}
