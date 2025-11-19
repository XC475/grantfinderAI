import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { getValidGoogleToken } from "@/lib/google-drive";

export const runtime = "nodejs";

interface DownloadPayload {
  fileId: string;
  fileName: string;
  mimeType: string;
  asText?: boolean; // If true, extract text content for chat attachments
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as DownloadPayload;
    const { fileId, fileName, mimeType, asText = false } = body;

    if (!fileId || !fileName) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const accessToken = await getValidGoogleToken(user.id);
    if (!accessToken) {
      return NextResponse.json(
        { error: "Google Drive is not connected" },
        { status: 401 }
      );
    }

    // Download file from Google Drive
    let downloadUrl = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`;
    let targetMimeType = mimeType;
    let targetFileName = fileName;

    // For Google Docs, Sheets, Slides, we need to export them
    if (mimeType.startsWith("application/vnd.google-apps.")) {
      // If asText is true (for chat attachments), export as plain text
      if (asText) {
        const textExportMimeTypes: Record<string, string> = {
          "application/vnd.google-apps.document": "text/plain",
          "application/vnd.google-apps.spreadsheet": "text/csv",
          "application/vnd.google-apps.presentation": "text/plain",
        };

        const textExportExtensions: Record<string, string> = {
          "application/vnd.google-apps.document": ".txt",
          "application/vnd.google-apps.spreadsheet": ".csv",
          "application/vnd.google-apps.presentation": ".txt",
        };

        const exportMimeType = textExportMimeTypes[mimeType];
        const exportExtension = textExportExtensions[mimeType];

        if (exportMimeType && exportExtension) {
          downloadUrl = `https://www.googleapis.com/drive/v3/files/${fileId}/export?mimeType=${encodeURIComponent(exportMimeType)}`;
          targetMimeType = exportMimeType;

          if (!fileName.toLowerCase().endsWith(exportExtension)) {
            targetFileName = `${fileName}${exportExtension}`;
          }
        } else {
          return NextResponse.json(
            { error: "Unsupported Google Drive file type for text export" },
            { status: 400 }
          );
        }
      } else {
        // For document import, export as Office formats
        const exportMimeTypes: Record<string, string> = {
          "application/vnd.google-apps.document":
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          "application/vnd.google-apps.spreadsheet":
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "application/vnd.google-apps.presentation":
            "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        };

        const exportExtensions: Record<string, string> = {
          "application/vnd.google-apps.document": ".docx",
          "application/vnd.google-apps.spreadsheet": ".xlsx",
          "application/vnd.google-apps.presentation": ".pptx",
        };

        const exportMimeType = exportMimeTypes[mimeType];
        const exportExtension = exportExtensions[mimeType];

        if (exportMimeType && exportExtension) {
          downloadUrl = `https://www.googleapis.com/drive/v3/files/${fileId}/export?mimeType=${encodeURIComponent(exportMimeType)}`;
          targetMimeType = exportMimeType;

          if (!fileName.toLowerCase().endsWith(exportExtension)) {
            targetFileName = `${fileName}${exportExtension}`;
          }
        } else {
          return NextResponse.json(
            { error: "Unsupported Google Drive file type" },
            { status: 400 }
          );
        }
      }
    }

    const response = await fetch(downloadUrl, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      console.error("Google Drive download failed", await response.text());
      return NextResponse.json(
        { error: "Failed to download file from Google Drive" },
        { status: 502 }
      );
    }

    const fileBuffer = await response.arrayBuffer();

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": targetMimeType,
        "Content-Disposition": `attachment; filename="${targetFileName}"`,
      },
    });
  } catch (error) {
    console.error("Google Drive download error:", error);
    return NextResponse.json(
      { error: "Failed to download file" },
      { status: 500 }
    );
  }
}
