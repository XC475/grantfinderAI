import { NextRequest } from "next/server";
import { createClient } from "@/utils/supabase/server";
import prisma from "@/lib/prisma";
// UPDATED
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
    console.log(
      "📊 [Recommendations API] Preparing district profile for n8n..."
    );

    // Send to N8N with district information for recommendations
    const n8nMessage = {
      app_source: "grantfinder-ai-webapp",
      user_id: user.id,
      organization_id: userOrganizationId,
      message: message,
      timestamp: Date.now().toString(),
      opportunity_id: opportunityId || null,
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
            annualOperatingBudget: organization.annualOperatingBudget
              ? organization.annualOperatingBudget.toString()
              : null,
            fiscalYearEnd: organization.fiscalYearEnd || null,
            missionStatement: organization.missionStatement || null,
            strategicPlan: organization.strategicPlan || null,
          }
        : null,
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

    // Handle n8n response format - expect {output: "[...]"} structure
    let recommendationsArray = [];

    console.log("🔍 [Recommendations API] Raw n8n response type:", typeof data);

    // Parse the response based on type - n8n returns {output: "[...]"} or {output: "{...}"}
    if (typeof data === "object" && data.output) {
      try {
        if (typeof data.output === "string") {
          // Parse the stringified JSON
          const parsed = JSON.parse(data.output);

          // Check if it's an array or a single object
          if (Array.isArray(parsed)) {
            recommendationsArray = parsed;
          } else if (typeof parsed === "object" && parsed !== null) {
            // Single object - wrap it in an array
            recommendationsArray = [parsed];
          }

          console.log(
            `🔍 [Recommendations API] Parsed ${recommendationsArray.length} recommendation(s) from output string`
          );
        } else if (Array.isArray(data.output)) {
          // Already an array
          recommendationsArray = data.output;
        } else if (typeof data.output === "object" && data.output !== null) {
          // Single object - wrap it in an array
          recommendationsArray = [data.output];
        }
      } catch (parseError) {
        console.error(
          "❌ [Recommendations API] Failed to parse output:",
          parseError
        );
      }
    } else if (Array.isArray(data)) {
      // Direct array format
      recommendationsArray = data;
    } else if (typeof data === "object" && data !== null) {
      // Single object response - wrap it in an array
      recommendationsArray = [data];
    }

    console.log(
      `🔍 [Recommendations API] Processing ${recommendationsArray.length} recommendations`
    );

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
              organization_name?: string;
              organization_id?: string;
              query_date?: string;
            }) => ({
              organizationId: userOrganizationId,
              opportunityId: rec.opportunity_id?.toString() || "",
              fitScore: rec.fit_score || 0,
              fitReasoning: rec.fit_reasoning || "",
              fitDescription: rec.fit_description || "",
              districtName: rec.organization_name || organization.name || "",
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

    // Return the parsed recommendations array to the client
    return new Response(
      JSON.stringify({
        recommendations: recommendationsArray,
        count: recommendationsArray.length,
      }),
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
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
