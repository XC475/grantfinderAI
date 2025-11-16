import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import {
  getValidGoogleToken,
  isGoogleDriveConnected,
} from "@/lib/google-drive";

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ connected: false }, { status: 401 });
    }

    const connected = await isGoogleDriveConnected(user.id);
    const accessToken = connected ? await getValidGoogleToken(user.id) : null;

    return NextResponse.json({
      connected: Boolean(connected && accessToken),
      pickerApiKey: process.env.NEXT_PUBLIC_GOOGLE_PICKER_API_KEY ?? null,
      clientId: process.env.NEXT_PUBLIC_GOOGLE_CLOUD_CLIENT_ID ?? null,
      accessToken,
    });
  } catch (error) {
    console.error("Google Drive status error:", error);
    return NextResponse.json(
      { error: "Failed to check Google Drive status" },
      { status: 500 }
    );
  }
}

