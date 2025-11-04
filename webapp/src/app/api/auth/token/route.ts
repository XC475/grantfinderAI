import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

/**
 * GET /api/auth/token
 * 
 * Returns the current user's authentication token for WebSocket connections.
 * Used by the document editor to authenticate with the collaboration server.
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error || !session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Return the access token for WebSocket authentication
    return NextResponse.json({
      token: session.access_token,
    });
  } catch (error) {
    console.error("Error fetching auth token:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

