import { NextRequest } from "next/server";
import { createClient } from "@/utils/supabase/server";
import prisma from "@/lib/prisma";

// Your n8n webhook URL for recommendations - replace with your actual webhook URL
const N8N_RECOMMENDATIONS_URL = process.env.N8N_RECOMMENDATIONS_URL!;

export async function POST(req: NextRequest) {
  const { message, organizationId, opportunityId } = await req.json();

  // Get authenticated user
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return new Response("Unauthorized", { status: 401 });
  }

  // Get user's organization
  const userOrganizationId =
    organizationId || (await getUserOrganizationId(user.id));

  // Fetch organization with school district data
  const organization = await prisma.organization.findUnique({
    where: { id: userOrganizationId },
    include: {
      schoolDistrict: true, // Include the full district data
    },
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
    // Send to N8N with district information for recommendations
    const n8nMessage = {
      app_source: "grantfinder-ai-webapp",
      user_id: user.id,
      organization_id: userOrganizationId,
      message: message,
      timestamp: Date.now().toString(),
      opportunity_id: opportunityId || null,
      // District information for personalized grant recommendations
      district_info: organization.schoolDistrict
        ? {
            id: organization.schoolDistrict.id,
            leaId: organization.schoolDistrict.leaId,
            name: organization.schoolDistrict.name,
            stateCode: organization.schoolDistrict.stateCode,
            stateLeaId: organization.schoolDistrict.stateLeaId,
            city: organization.schoolDistrict.city,
            zipCode: organization.schoolDistrict.zipCode,
            countyName: organization.schoolDistrict.countyName,
            enrollment: organization.schoolDistrict.enrollment,
            numberOfSchools: organization.schoolDistrict.numberOfSchools,
            lowestGrade: organization.schoolDistrict.lowestGrade,
            highestGrade: organization.schoolDistrict.highestGrade,
            urbanCentricLocale: organization.schoolDistrict.urbanCentricLocale,
            year: organization.schoolDistrict.year,
          }
        : null,
      // Organization context
      organization_info: {
        id: organization.id,
        name: organization.name,
        district_linked: !!organization.schoolDistrict,
      },
    };

    console.log("🔍 [Recommendations API] Sending to n8n with district info:", {
      ...n8nMessage,
      district_name: organization.schoolDistrict?.name || "No district linked",
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

    // Handle n8n response format: [{ output: "stringified JSON" }]
    let recommendations;

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
