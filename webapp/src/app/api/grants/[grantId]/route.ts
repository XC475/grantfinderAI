import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

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

    // Fetch the grant from public.opportunities using Supabase (handles BigInt serialization)
    const { data: grant, error } = await supabaseServer
      .from("opportunities")
      .select("*")
      .eq("id", opportunityId)
      .single();

    if (error || !grant) {
      return NextResponse.json({ error: "Grant not found" }, { status: 404 });
    }

    return NextResponse.json(grant);
  } catch (error) {
    console.error("Error fetching grant:", error);
    return NextResponse.json(
      { error: "Failed to fetch grant" },
      { status: 500 }
    );
  }
}
