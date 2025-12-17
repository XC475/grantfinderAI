import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import prisma from "@/lib/prisma";
import { getModelUsage } from "@/lib/subscriptions/model-access";

// GET /api/organizations/[id]/subscription/usage
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id: orgId } = await params;
    
    // Verify user has access to this organization
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { organizationId: true },
    });

    if (!dbUser || dbUser.organizationId !== orgId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId") || user.id;

    // Get usage for all models (for now, just return empty array)
    // This can be enhanced to return usage for all models
    const usage = [];

    return NextResponse.json({ usage });
  } catch (error) {
    console.error("Error fetching model usage:", error);
    return NextResponse.json(
      { error: "Failed to fetch model usage" },
      { status: 500 }
    );
  }
}

