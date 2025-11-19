import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { encryptToken } from "@/lib/token-encryption";
import { getGoogleClientConfig } from "@/lib/google-drive";

const GOOGLE_TOKEN_ENDPOINT = "https://oauth2.googleapis.com/token";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const authError = url.searchParams.get("error");
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || url.origin;
  const redirectOnError = `${baseUrl}/settings/account?gdrive=error`;

  if (authError) {
    return NextResponse.redirect(
      `${redirectOnError}&reason=${encodeURIComponent(authError)}`
    );
  }

  if (!code || !state) {
    return NextResponse.redirect(
      `${redirectOnError}&reason=missing-auth-code`
    );
  }

  try {
    const { clientId, clientSecret } = getGoogleClientConfig();
    const redirectUri = `${baseUrl}/api/google-drive/callback`;

    const tokenResponse = await fetch(GOOGLE_TOKEN_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    if (!tokenResponse.ok) {
      console.error("Failed to exchange Google auth code", await tokenResponse.text());
      return NextResponse.redirect(
        `${redirectOnError}&reason=token-exchange-failed`
      );
    }

    const tokens = (await tokenResponse.json()) as {
      access_token?: string;
      refresh_token?: string;
      expires_in?: number;
    };

    if (!tokens.access_token) {
      return NextResponse.redirect(
        `${redirectOnError}&reason=missing-access-token`
      );
    }

    await prisma.user.update({
      where: { id: state },
      data: {
        googleAccessToken: encryptToken(tokens.access_token),
        googleRefreshToken: tokens.refresh_token
          ? encryptToken(tokens.refresh_token)
          : null,
        googleTokenExpiry: tokens.expires_in
          ? new Date(Date.now() + tokens.expires_in * 1000)
          : null,
        googleDriveConnected: true,
      },
    });

    const dbUser = await prisma.user.findUnique({
      where: { id: state },
      select: {
        organization: {
          select: { slug: true },
        },
      },
    });

    const slug = dbUser?.organization?.slug;
    const destination = slug
      ? `/private/${slug}/documents?gdrive=connected`
      : "/?gdrive=connected";

    return NextResponse.redirect(`${baseUrl}${destination}`);
  } catch (error) {
    console.error("Google Drive callback error:", error);
    return NextResponse.redirect(
      `${redirectOnError}&reason=unexpected-error`
    );
  }
}

