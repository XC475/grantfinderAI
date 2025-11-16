import prisma from "@/lib/prisma";
import { decryptToken, encryptToken } from "@/lib/token-encryption";

const GOOGLE_TOKEN_ENDPOINT = "https://oauth2.googleapis.com/token";
export const GOOGLE_AUTH_SCOPES = [
  "https://www.googleapis.com/auth/drive.file",
  "https://www.googleapis.com/auth/drive.readonly",
  "https://www.googleapis.com/auth/documents",
];

type TokenResponse = {
  access_token: string;
  expires_in: number;
  refresh_token?: string;
  token_type: string;
  scope: string;
};

export function getGoogleClientConfig() {
  const clientId = process.env.GOOGLE_CLOUD_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLOUD_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("Google Cloud OAuth credentials are not configured");
  }

  return { clientId, clientSecret };
}

async function requestNewAccessToken(
  refreshToken: string
): Promise<TokenResponse> {
  const { clientId, clientSecret } = getGoogleClientConfig();

  const response = await fetch(GOOGLE_TOKEN_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      refresh_token: refreshToken,
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "refresh_token",
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to refresh Google access token");
  }

  const data = (await response.json()) as TokenResponse;
  if (!data.access_token) {
    throw new Error("Google token refresh response missing access_token");
  }

  return data;
}

export async function getValidGoogleToken(
  userId: string
): Promise<string | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      googleAccessToken: true,
      googleRefreshToken: true,
      googleTokenExpiry: true,
    },
  });

  if (!user?.googleAccessToken) {
    return null;
  }

  const accessToken = decryptToken(user.googleAccessToken);
  const expiresAt = user.googleTokenExpiry;

  if (!expiresAt || expiresAt > new Date()) {
    return accessToken;
  }

  if (!user.googleRefreshToken) {
    return null;
  }

  const refreshToken = decryptToken(user.googleRefreshToken);

  try {
    const refreshed = await requestNewAccessToken(refreshToken);

    await prisma.user.update({
      where: { id: userId },
      data: {
        googleAccessToken: encryptToken(refreshed.access_token),
        googleTokenExpiry: new Date(
          Date.now() + (refreshed.expires_in ?? 3600) * 1000
        ),
        ...(refreshed.refresh_token && {
          googleRefreshToken: encryptToken(refreshed.refresh_token),
        }),
      },
    });

    return refreshed.access_token;
  } catch (error) {
    console.error("Failed to refresh Google access token", error);
    return null;
  }
}

export async function isGoogleDriveConnected(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { googleDriveConnected: true },
  });

  return user?.googleDriveConnected ?? false;
}
