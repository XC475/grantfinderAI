import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import prisma from "@/lib/prisma";

// GET /api/organizations/[id]/subscription
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

    // Get or create subscription (defaults to FREE)
    const subscription = await prisma.organizationSubscription.findUnique({
      where: { organizationId: orgId },
    });

    if (!subscription) {
      // Return default FREE subscription
      return NextResponse.json({
        id: "",
        organizationId: orgId,
        tier: "FREE",
        status: "ACTIVE",
        currentPeriodStart: null,
        currentPeriodEnd: null,
        cancelAtPeriodEnd: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    return NextResponse.json(subscription);
  } catch (error) {
    console.error("Error fetching subscription:", error);
    return NextResponse.json(
      { error: "Failed to fetch subscription" },
      { status: 500 }
    );
  }
}

