import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import prisma from "@/lib/prisma";
import { getValidGoogleToken } from "@/lib/google-drive";
import {
  convertGoogleDocToTiptap,
  plainTextToTiptap,
} from "@/lib/document-converters";
import {
  extractTextFromFile,
  cleanExtractedText,
} from "@/lib/fileExtraction";
import { writeFile, unlink } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";
import { randomUUID } from "crypto";
import {
  MAX_DOCUMENT_SIZE,
  validateDocumentUpload,
} from "@/lib/uploadValidation";

export const runtime = "nodejs";

const GOOGLE_DOC_MIME = "application/vnd.google-apps.document";

interface ImportPayload {
  fileId: string;
  fileName: string;
  mimeType: string;
  folderId?: string | null;
  applicationId?: string | null;
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

    const payload = (await request.json()) as ImportPayload;
    const { fileId, fileName, mimeType, folderId, applicationId } = payload;

    if (!fileId || !fileName || !mimeType) {
      return NextResponse.json(
        { error: "fileId, fileName, and mimeType are required" },
        { status: 400 }
      );
    }

    const accessToken = await getValidGoogleToken(user.id);
    if (!accessToken) {
      return NextResponse.json(
        { error: "Google Drive is not connected" },
        { status: 401 }
      );
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { organizationId: true },
    });

    if (!dbUser?.organizationId) {
      return NextResponse.json(
        { error: "Organization not found" },
        { status: 404 }
      );
    }

    if (folderId && folderId !== "null") {
      const folder = await prisma.folder.findFirst({
        where: {
          id: folderId,
          organizationId: dbUser.organizationId,
        },
      });

      if (!folder) {
        return NextResponse.json(
          { error: "Folder not found" },
          { status: 404 }
        );
      }
    }

    let fileBuffer: Buffer;
    let tiptapContent: string | null = null;
    let extractedText: string | null = null;

    if (mimeType === GOOGLE_DOC_MIME) {
      const exportResponse = await fetch(
        `https://www.googleapis.com/drive/v3/files/${fileId}/export?mimeType=application/vnd.openxmlformats-officedocument.wordprocessingml.document`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      if (!exportResponse.ok) {
        console.error("Failed to export Google Doc", await exportResponse.text());
        return NextResponse.json(
          { error: "Failed to download Google Doc" },
          { status: 502 }
        );
      }

      const arrayBuffer = await exportResponse.arrayBuffer();
      fileBuffer = Buffer.from(arrayBuffer);
      
      // Validate file size
      if (fileBuffer.length > MAX_DOCUMENT_SIZE) {
        return NextResponse.json(
          { error: "File size exceeds 40MB limit" },
          { status: 400 }
        );
      }
      
      // Validate page count for converted Google Docs (treated as DOCX)
      const uploadValidation = await validateDocumentUpload(
        { size: fileBuffer.length, type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document", name: fileName },
        fileBuffer
      );
      if (!uploadValidation.valid) {
        return NextResponse.json(
          { error: uploadValidation.error },
          { status: 400 }
        );
      }
      
      tiptapContent = await convertGoogleDocToTiptap(fileBuffer);
    } else {
      const downloadResponse = await fetch(
        `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      if (!downloadResponse.ok) {
        console.error("Failed to download Drive file", await downloadResponse.text());
        return NextResponse.json(
          { error: "Failed to download file" },
          { status: 502 }
        );
      }

      const arrayBuffer = await downloadResponse.arrayBuffer();
      fileBuffer = Buffer.from(arrayBuffer);
      
      // Validate file size
      if (fileBuffer.length > MAX_DOCUMENT_SIZE) {
        return NextResponse.json(
          { error: "File size exceeds 40MB limit" },
          { status: 400 }
        );
      }
      
      // Validate page count for PDFs
      const uploadValidation = await validateDocumentUpload(
        { size: fileBuffer.length, type: mimeType, name: fileName },
        fileBuffer
      );
      if (!uploadValidation.valid) {
        return NextResponse.json(
          { error: uploadValidation.error },
          { status: 400 }
        );
      }

      const extension = fileName.split(".").pop() || "tmp";
      const tempFilePath = join(tmpdir(), `${randomUUID()}.${extension}`);

      try {
        await writeFile(tempFilePath, fileBuffer);
        const text = await extractTextFromFile(tempFilePath, mimeType);
        extractedText = cleanExtractedText(text);
        tiptapContent = plainTextToTiptap(extractedText);
      } catch (error) {
        console.error("Failed to extract text from file", error);
        tiptapContent = null;
      } finally {
        await unlink(tempFilePath).catch(() => {});
      }
    }

    const storagePath = `${dbUser.organizationId}/${Date.now()}-${randomUUID()}-${fileName}`;
    const { error: uploadError } = await supabase.storage
      .from("documents")
      .upload(storagePath, fileBuffer, {
        contentType: mimeType,
        upsert: false,
      });

    if (uploadError) {
      console.error("Supabase storage upload error:", uploadError);
      return NextResponse.json(
        { error: "Failed to store file" },
        { status: 500 }
      );
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("documents").getPublicUrl(storagePath);

    const document = await prisma.document.create({
      data: {
        title: fileName.replace(/\.[^/.]+$/, "") || fileName,
        content: tiptapContent,
        contentType: tiptapContent ? "json" : "file",
        fileUrl: publicUrl,
        fileType: mimeType,
        fileSize: fileBuffer.length,
        organizationId: dbUser.organizationId,
        folderId: folderId && folderId !== "null" ? folderId : null,
        applicationId:
          applicationId && applicationId !== "null" ? applicationId : null,
        version: 1,
        metadata: {
          importedFrom: "google-drive",
          originalFileId: fileId,
          originalFileName: fileName,
          importedAt: new Date().toISOString(),
          extractedText: extractedText || null,
        },
      },
    });

    return NextResponse.json({ document });
  } catch (error) {
    console.error("Google Drive import error:", error);
    return NextResponse.json(
      { error: "Failed to import file from Google Drive" },
      { status: 500 }
    );
  }
}

