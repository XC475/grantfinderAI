/**
 * Admin API: Model Usage Statistics
 * 
 * GET /api/admin/model-usage
 * Returns usage statistics for monitoring and analytics
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import prisma from "@/lib/prisma";
import { getTopModelsByUsage, getModelUsageStats } from "@/lib/subscriptions/model-usage-monitor";

export async function GET(request: NextRequest) {
  try {
    // Authenticate admin user
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { system_admin: true },
    });

    if (!dbUser?.system_admin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const modelId = searchParams.get("modelId");
    const limit = parseInt(searchParams.get("limit") || "10");

    if (modelId) {
      // Get stats for specific model
      const stats = await getModelUsageStats(modelId);
      if (!stats) {
        return NextResponse.json({ error: "Model not found" }, { status: 404 });
      }
      return NextResponse.json(stats);
    }

    // Get top models by usage
    const topModels = await getTopModelsByUsage(limit);
    return NextResponse.json({ topModels });
  } catch (error) {
    console.error("Error fetching model usage stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch usage statistics" },
      { status: 500 }
    );
  }
}

