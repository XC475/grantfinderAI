import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import prisma from "@/lib/prisma";
import { getValidGoogleToken } from "@/lib/google-drive";
import {
  convertTiptapToDocx,
  convertTiptapToGoogleDoc,
  convertTiptapToPdf,
} from "@/lib/document-converters";

type ExportFormat = "google-doc" | "pdf" | "docx";

export const runtime = "nodejs";

interface ExportPayload {
  documentId: string;
  format: ExportFormat;
}

const MIME_TYPES: Record<ExportFormat, string> = {
  "google-doc": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  pdf: "application/pdf",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
};

const GOOGLE_DOC_METADATA_TYPE = "application/vnd.google-apps.document";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as ExportPayload;
    const { documentId, format } = body;

    if (!documentId || !format || !MIME_TYPES[format]) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const accessToken = await getValidGoogleToken(user.id);
    if (!accessToken) {
      return NextResponse.json(
        { error: "Google Drive is not connected" },
        { status: 401 }
      );
    }

    const document = await prisma.document.findFirst({
      where: {
        id: documentId,
        organization: {
          users: {
            some: { id: user.id },
          },
        },
      },
    });

    if (!document) {
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 }
      );
    }

    if (!document.content) {
      return NextResponse.json(
        { error: "Document has no editable content" },
        { status: 400 }
      );
    }

    let fileBuffer: Buffer;
    switch (format) {
      case "google-doc":
        fileBuffer = await convertTiptapToGoogleDoc(document.content);
        break;
      case "docx":
        fileBuffer = await convertTiptapToDocx(document.content);
        break;
      case "pdf":
        fileBuffer = await convertTiptapToPdf(document.content);
        break;
    }

    const metadata: Record<string, string> = {
      name: `${document.title || "Document"}.${format === "pdf" ? "pdf" : "docx"}`,
      mimeType:
        format === "google-doc" ? GOOGLE_DOC_METADATA_TYPE : MIME_TYPES[format],
    };

    const formData = new FormData();
    formData.append(
      "metadata",
      new Blob([JSON.stringify(metadata)], { type: "application/json" })
    );
    formData.append(
      "file",
      new Blob([fileBuffer], { type: MIME_TYPES[format] })
    );

    const uploadResponse = await fetch(
      "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,webViewLink",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body: formData,
      }
    );

    if (!uploadResponse.ok) {
      console.error(
        "Google Drive upload failed",
        await uploadResponse.text()
      );
      return NextResponse.json(
        { error: "Failed to upload file to Google Drive" },
        { status: 502 }
      );
    }

    const result = await uploadResponse.json();

    return NextResponse.json({
      success: true,
      fileId: result.id,
      webViewLink: result.webViewLink,
    });
  } catch (error) {
    console.error("Google Drive export error:", error);
    return NextResponse.json(
      { error: "Failed to export document to Google Drive" },
      { status: 500 }
    );
  }
}

