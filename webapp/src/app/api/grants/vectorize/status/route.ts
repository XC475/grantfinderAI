import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    // Check for API key authentication
    const apiKey = req.headers.get("x-api-key");

    // Only allow requests with the correct API key
    if (!apiKey || apiKey !== process.env.INTERNAL_API_KEY) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get row count for both tables
    const opportunitiesCount = await prisma.$queryRaw<[{ count: bigint }]>`
      SELECT COUNT(*) as count FROM public.opportunities
    `;

    const documentsCount = await prisma.$queryRaw<[{ count: bigint }]>`
      SELECT COUNT(*) as count FROM public.documents
    `;

    const totalOpportunities = Number(opportunitiesCount[0].count);
    const totalDocuments = Number(documentsCount[0].count);
    const missing = Math.max(0, totalOpportunities - totalDocuments);
    const percentage =
      totalOpportunities > 0
        ? ((totalDocuments / totalOpportunities) * 100).toFixed(2)
        : "0.00";

    return NextResponse.json({
      success: true,
      opportunities: totalOpportunities,
      documents: totalDocuments,
      missing: missing,
      percentage: `${percentage}%`,
      complete: missing === 0,
    });
  } catch (error) {
    console.error("❌ [Vectorize Status] Error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
