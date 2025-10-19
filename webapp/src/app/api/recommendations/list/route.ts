import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    // Get authenticated user
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's organization
    const userRecord = await prisma.user.findUnique({
      where: { id: user.id },
      select: { organizationId: true },
    });

    if (!userRecord?.organizationId) {
      return NextResponse.json(
        { error: "Organization not found" },
        { status: 404 }
      );
    }

    // Fetch recommendations for this organization
    const recommendations = await prisma.recommendation.findMany({
      where: {
        organizationId: userRecord.organizationId,
      },
      orderBy: [
        { fitScore: "desc" }, // Sort by fit score descending
        { createdAt: "desc" }, // Then by creation date
      ],
    });

    return NextResponse.json({
      success: true,
      recommendations,
      count: recommendations.length,
    });
  } catch (error) {
    console.error("❌ [Recommendations List API] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch recommendations" },
      { status: 500 }
    );
  }
}
