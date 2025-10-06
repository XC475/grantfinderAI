import { NextRequest } from "next/server";
import { createClient } from "@/utils/supabase/server";
import prisma from "@/lib/prisma";

// Your n8n webhook URL for recommendations - replace with your actual webhook URL
const N8N_RECOMMENDATIONS_URL = process.env.N8N_RECOMMENDATIONS_URL!;

export async function POST(req: NextRequest) {
  const { message, workspaceId, opportunityId } = await req.json();

  // Get authenticated user
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return new Response("Unauthorized", { status: 401 });
  }

  // Get user's workspace
  const userWorkspaceId = workspaceId || (await getUserWorkspaceId(user.id));

  // Fetch workspace with school district data
  const workspace = await prisma.workspace.findUnique({
    where: { id: userWorkspaceId },
    include: {
      schoolDistrict: true, // Include the full district data
    },
  });

  if (!workspace) {
    return new Response("Workspace not found", { status: 404 });
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
      workspace_id: userWorkspaceId,
      message: message,
      timestamp: Date.now().toString(),
      opportunity_id: opportunityId || null,
      // District information for personalized grant recommendations
      district_info: workspace.schoolDistrict
        ? {
            id: workspace.schoolDistrict.id,
            leaId: workspace.schoolDistrict.leaId,
            name: workspace.schoolDistrict.name,
            stateCode: workspace.schoolDistrict.stateCode,
            stateLeaId: workspace.schoolDistrict.stateLeaId,
            city: workspace.schoolDistrict.city,
            zipCode: workspace.schoolDistrict.zipCode,
            countyName: workspace.schoolDistrict.countyName,
            enrollment: workspace.schoolDistrict.enrollment,
            numberOfSchools: workspace.schoolDistrict.numberOfSchools,
            lowestGrade: workspace.schoolDistrict.lowestGrade,
            highestGrade: workspace.schoolDistrict.highestGrade,
            urbanCentricLocale: workspace.schoolDistrict.urbanCentricLocale,
            year: workspace.schoolDistrict.year,
          }
        : null,
      // Workspace context
      workspace_info: {
        id: workspace.id,
        name: workspace.name,
        type: workspace.type,
        district_linked: !!workspace.schoolDistrict,
      },
    };

    console.log("🔍 [Recommendations API] Sending to n8n with district info:", {
      ...n8nMessage,
      district_name: workspace.schoolDistrict?.name || "No district linked",
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

    const text =
      typeof data === "string"
        ? data
        : data.response ||
          data.message ||
          data.content ||
          data.recommendations ||
          "OK";

    console.log("🔍 [Recommendations API] n8n response:", text);

    // Return the response to the client
    return new Response(JSON.stringify({ recommendations: text }), {
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
async function getUserWorkspaceId(userId: string): Promise<string> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { personalWorkspaceId: true },
  });

  if (!user?.personalWorkspaceId) {
    throw new Error("User workspace not found");
  }

  return user.personalWorkspaceId;
}
