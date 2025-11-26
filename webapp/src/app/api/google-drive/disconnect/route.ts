import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import prisma from "@/lib/prisma";
import { decryptToken } from "@/lib/token-encryption";

const GOOGLE_REVOKE_ENDPOINT = "https://oauth2.googleapis.com/revoke";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's current tokens
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        googleAccessToken: true,
        googleRefreshToken: true,
      },
    });

    // Revoke tokens with Google
    if (dbUser?.googleAccessToken) {
      try {
        const accessToken = decryptToken(dbUser.googleAccessToken);

        await fetch(GOOGLE_REVOKE_ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({ token: accessToken }),
        });
      } catch (error) {
        // Log but don't fail - we still want to clear from our database
        console.error("Failed to revoke Google access token:", error);
      }
    }

    // Also try to revoke refresh token if it exists
    if (dbUser?.googleRefreshToken) {
      try {
        const refreshToken = decryptToken(dbUser.googleRefreshToken);

        await fetch(GOOGLE_REVOKE_ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({ token: refreshToken }),
        });
      } catch (error) {
        console.error("Failed to revoke Google refresh token:", error);
      }
    }

    // Clear tokens from database
    await prisma.user.update({
      where: { id: user.id },
      data: {
        googleAccessToken: null,
        googleRefreshToken: null,
        googleTokenExpiry: null,
        googleDriveConnected: false,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Google Drive disconnected successfully",
    });
  } catch (err) {
    console.error("Google Drive disconnect error:", err);
    return NextResponse.json(
      { error: "Failed to disconnect Google Drive" },
      { status: 500 }
    );
  }
}
