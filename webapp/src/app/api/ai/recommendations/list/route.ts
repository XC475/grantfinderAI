import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    console.log("📋 [Recommendations List] Fetching recommendations...");

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

    // 3. Fetch recommendations for this organization
    const recommendations = await prisma.recommendation.findMany({
      where: {
        organizationId: dbUser.organizationId,
      },
      orderBy: [
        { fitScore: "desc" }, // Sort by fit score (highest first)
        { queryDate: "desc" }, // Then by query date (most recent first)
      ],
    });

    console.log(
      `✅ [Recommendations List] Found ${recommendations.length} recommendations`
    );

    // 4. Return recommendations
    return NextResponse.json({
      success: true,
      count: recommendations.length,
      recommendations: recommendations,
    });
  } catch (error) {
    console.error("❌ [Recommendations List] Error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch recommendations",
      },
      { status: 500 }
    );
  }
}
