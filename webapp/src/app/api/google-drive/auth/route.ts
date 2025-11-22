import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { GOOGLE_AUTH_SCOPES, getGoogleClientConfig } from "@/lib/google-drive";

const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { clientId } = getGoogleClientConfig();
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin;
    const redirectUri = `${baseUrl}/api/google-drive/callback`;

    // Get the referrer path from query params (where the user initiated the connection)
    const returnTo = request.nextUrl.searchParams.get("returnTo") || "";

    // Encode state as JSON with userId and returnTo path
    const state = JSON.stringify({
      userId: user.id,
      returnTo,
    });

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: "code",
      scope: GOOGLE_AUTH_SCOPES.join(" "),
      access_type: "offline",
      prompt: "consent",
      state: Buffer.from(state).toString("base64"),
    });

    return NextResponse.redirect(`${GOOGLE_AUTH_URL}?${params.toString()}`);
  } catch (err) {
    console.error("Google Drive auth error:", err);
    return NextResponse.json(
      { error: "Failed to initiate Google authentication" },
      { status: 500 }
    );
  }
}
