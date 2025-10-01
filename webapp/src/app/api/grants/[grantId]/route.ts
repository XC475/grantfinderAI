import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/grants/[grantId] - Get a single grant by ID
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ grantId: string }> }
) {
  const { grantId } = await context.params;

  try {
    const opportunityId = parseInt(grantId);
    if (isNaN(opportunityId)) {
      return NextResponse.json({ error: "Invalid grant ID" }, { status: 400 });
    }

    // Fetch the grant from public.opportunities
    const grant = await prisma.$queryRaw<any[]>`
      SELECT * FROM public.opportunities WHERE id = ${opportunityId} LIMIT 1
    `;

    if (!grant || grant.length === 0) {
      return NextResponse.json({ error: "Grant not found" }, { status: 404 });
    }

    return NextResponse.json(grant[0]);
  } catch (error) {
    console.error("Error fetching grant:", error);
    return NextResponse.json(
      { error: "Failed to fetch grant" },
      { status: 500 }
    );
  }
}
