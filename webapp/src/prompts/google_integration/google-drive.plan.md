<!-- 4d8a886a-bd03-4ed1-ba94-68903d9a8335 df8150bb-dafa-4282-8002-1a7966bfb4a3 -->

# Google Drive Integration Implementation Plan

## Google Cloud Console Setup

### Step 1: Create OAuth 2.0 Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing project
3. Navigate to **APIs & Services > Library**
4. Enable these APIs:
   - **Google Drive API**
   - **Google Docs API**
   - **Google Picker API**

5. Navigate to **APIs & Services > Credentials**
6. Click **Create Credentials > OAuth client ID**
7. Configure OAuth consent screen (if not done):
   - User Type: **External** (or Internal if workspace)
   - Add app name, support email, developer contact
   - Scopes: Add these scopes:
     - `https://www.googleapis.com/auth/drive.file` (read/write files created by app)
     - `https://www.googleapis.com/auth/drive.readonly` (read all Drive files)
     - `https://www.googleapis.com/auth/documents` (Google Docs creation)
   - Test users: Add your email for testing

8. Create OAuth client ID:
   - Application type: **Web application**
   - Name: "GrantWare AI - Google Drive"
   - Authorized redirect URIs:
     - `http://localhost:3000/api/google-drive/callback` (development)
     - `https://yourdomain.com/api/google-drive/callback` (production)

9. Save the **Client ID** and **Client Secret**

### Step 2: Environment Variables

**Already configured:**

```
GOOGLE_CLOUD_CLIENT_ID=<your_client_id>
GOOGLE_CLOUD_CLIENT_SECRET=<your_client_secret>
NEXT_PUBLIC_GOOGLE_PICKER_API_KEY=<your_picker_api_key>
NEXT_PUBLIC_GOOGLE_CLOUD_CLIENT_ID=<your_client_id>
NEXT_PUBLIC_APP_URL=http://localhost:3000
TOKEN_ENCRYPTION_KEY=<generate-with-crypto.randomBytes(32).toString('hex')>
```

**Generate encryption key:** Run in Node.js:

```javascript
require("crypto").randomBytes(32).toString("hex");
```

## Database Schema Changes

### Migration: Add Google OAuth tokens to User model

Update `prisma/schema.prisma`:

```prisma
model User {
  // ... existing fields ...
  googleAccessToken    String?
  googleRefreshToken   String?
  googleTokenExpiry    DateTime?
  googleDriveConnected Boolean  @default(false)
}
```

Run: `npx prisma migrate`

## Backend Implementation

### 1. OAuth Flow - Auth Initiation (`/api/google-drive/auth/route.ts`)

```typescript
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/google-drive/callback`;
  const scopes = [
    "https://www.googleapis.com/auth/drive.file",
    "https://www.googleapis.com/auth/drive.readonly",
    "https://www.googleapis.com/auth/documents",
  ].join(" ");

  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${new URLSearchParams(
    {
      client_id: process.env.GOOGLE_CLOUD_CLIENT_ID!,
      redirect_uri: redirectUri,
      response_type: "code",
      scope: scopes,
      access_type: "offline",
      prompt: "consent",
      state: user.id, // Pass user ID for verification
    }
  )}`;

  return NextResponse.redirect(authUrl);
}
```

### 2. OAuth Callback (`/api/google-drive/callback/route.ts`)

Exchange auth code for tokens, store in database:

```typescript
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state"); // userId

  // Exchange code for tokens
  const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code: code!,
      client_id: process.env.GOOGLE_CLOUD_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLOUD_CLIENT_SECRET!,
      redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/google-drive/callback`,
      grant_type: "authorization_code",
    }),
  });

  const tokens = await tokenResponse.json();

  // Encrypt tokens before storing
  const { encryptToken } = await import("@/lib/token-encryption");

  await prisma.user.update({
    where: { id: state! },
    data: {
      googleAccessToken: encryptToken(tokens.access_token),
      googleRefreshToken: encryptToken(tokens.refresh_token),
      googleTokenExpiry: new Date(Date.now() + tokens.expires_in * 1000),
      googleDriveConnected: true,
    },
  });

  return NextResponse.redirect(
    `${process.env.NEXT_PUBLIC_APP_URL}/private/[slug]/documents?gdrive=connected`
  );
}
```

### 3. Token Encryption Utility (`/lib/token-encryption.ts`)

Add encryption/decryption for tokens at rest:

```typescript
import crypto from "crypto";

const ENCRYPTION_KEY = process.env.TOKEN_ENCRYPTION_KEY!;
const ALGORITHM = "aes-256-gcm";

export function encryptToken(token: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(
    ALGORITHM,
    Buffer.from(ENCRYPTION_KEY, "hex"),
    iv
  );

  let encrypted = cipher.update(token, "utf8", "hex");
  encrypted += cipher.final("hex");
  const authTag = cipher.getAuthTag();

  // Format: iv:authTag:encrypted
  return iv.toString("hex") + ":" + authTag.toString("hex") + ":" + encrypted;
}

export function decryptToken(encryptedToken: string): string {
  const [ivHex, authTagHex, encrypted] = encryptedToken.split(":");
  const iv = Buffer.from(ivHex, "hex");
  const authTag = Buffer.from(authTagHex, "hex");

  const decipher = crypto.createDecipheriv(
    ALGORITHM,
    Buffer.from(ENCRYPTION_KEY, "hex"),
    iv
  );
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
}
```

### 4. Token Refresh Utility (`/lib/google-drive.ts`)

```typescript
import prisma from "./prisma";
import { encryptToken, decryptToken } from "./token-encryption";

export async function getValidGoogleToken(
  userId: string
): Promise<string | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { googleAccessToken, googleRefreshToken, googleTokenExpiry },
  });

  if (!user?.googleAccessToken) return null;

  // Decrypt stored tokens
  const accessToken = decryptToken(user.googleAccessToken);
  const refreshToken = user.googleRefreshToken
    ? decryptToken(user.googleRefreshToken)
    : null;

  // Check if token expired
  if (user.googleTokenExpiry && user.googleTokenExpiry < new Date()) {
    if (!refreshToken) return null;

    // Refresh token
    const refreshResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        refresh_token: refreshToken,
        client_id: process.env.GOOGLE_CLOUD_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLOUD_CLIENT_SECRET!,
        grant_type: "refresh_token",
      }),
    });

    const tokens = await refreshResponse.json();

    // Encrypt new access token before storing
    await prisma.user.update({
      where: { id: userId },
      data: {
        googleAccessToken: encryptToken(tokens.access_token),
        googleTokenExpiry: new Date(Date.now() + tokens.expires_in * 1000),
      },
    });

    return tokens.access_token;
  }

  return accessToken;
}
```

### 5. Import from Drive (`/api/google-drive/import/route.ts`)

Downloads file from Drive, converts to Tiptap, saves original to Supabase:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import prisma from "@/lib/prisma";
import { getValidGoogleToken } from "@/lib/google-drive";
import { extractTextFromFile } from "@/lib/fileExtraction";
import { convertGoogleDocToTiptap } from "@/lib/google-docs-converter";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { fileId, fileName, mimeType, folderId, applicationId } =
    await req.json();

  const accessToken = await getValidGoogleToken(user.id);
  if (!accessToken)
    return NextResponse.json(
      { error: "Not connected to Google Drive" },
      { status: 401 }
    );

  // Download file from Google Drive
  let fileBuffer: Buffer;
  let tiptapContent = "";

  if (mimeType === "application/vnd.google-apps.document") {
    // Export Google Doc as DOCX for Tiptap conversion
    const exportUrl = `https://www.googleapis.com/drive/v3/files/${fileId}/export?mimeType=application/vnd.openxmlformats-officedocument.wordprocessingml.document`;
    const response = await fetch(exportUrl, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    fileBuffer = Buffer.from(await response.arrayBuffer());

    // Convert to Tiptap JSON
    tiptapContent = await convertGoogleDocToTiptap(fileBuffer);
  } else {
    // Download regular file
    const downloadUrl = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`;
    const response = await fetch(downloadUrl, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    fileBuffer = Buffer.from(await response.arrayBuffer());
  }

  // Upload original file to Supabase Storage
  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { organizationId: true },
  });
  const filePath = `${dbUser!.organizationId}/${Date.now()}-${fileName}`;

  await supabase.storage.from("documents").upload(filePath, fileBuffer);
  const {
    data: { publicUrl },
  } = supabase.storage.from("documents").getPublicUrl(filePath);

  // Create document with both Tiptap content and file reference
  const document = await prisma.document.create({
    data: {
      title: fileName.replace(/\.[^/.]+$/, ""),
      content: tiptapContent,
      contentType: "json",
      fileUrl: publicUrl,
      fileType: mimeType,
      fileSize: fileBuffer.length,
      organizationId: dbUser!.organizationId,
      folderId,
      applicationId,
      metadata: { importedFrom: "google-drive", originalFileId: fileId },
    },
  });

  return NextResponse.json({ document });
}
```

### 6. Export to Drive (`/api/google-drive/export/route.ts`)

Exports Tiptap document to Google Drive in chosen format:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { getValidGoogleToken } from "@/lib/google-drive";
import {
  convertTiptapToGoogleDoc,
  convertTiptapToPdf,
  convertTiptapToDocx,
} from "@/lib/document-converters";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { documentId, format } = await req.json(); // format: "google-doc" | "pdf" | "docx"

  const accessToken = await getValidGoogleToken(user.id);
  if (!accessToken)
    return NextResponse.json(
      { error: "Not connected to Google Drive" },
      { status: 401 }
    );

  // Fetch document
  const document = await prisma.document.findFirst({
    where: {
      id: documentId,
      organization: { users: { some: { id: user.id } } },
    },
  });

  if (!document)
    return NextResponse.json({ error: "Document not found" }, { status: 404 });

  let fileBuffer: Buffer;
  let mimeType: string;
  let fileName: string;

  switch (format) {
    case "google-doc":
      fileBuffer = await convertTiptapToGoogleDoc(document.content!);
      mimeType = "application/vnd.google-apps.document";
      fileName = `${document.title}.gdoc`;
      break;
    case "pdf":
      fileBuffer = await convertTiptapToPdf(document.content!);
      mimeType = "application/pdf";
      fileName = `${document.title}.pdf`;
      break;
    case "docx":
      fileBuffer = await convertTiptapToDocx(document.content!);
      mimeType =
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
      fileName = `${document.title}.docx`;
      break;
  }

  // Upload to Google Drive
  const metadata = { name: fileName, mimeType };
  const form = new FormData();
  form.append(
    "metadata",
    new Blob([JSON.stringify(metadata)], { type: "application/json" })
  );
  form.append("file", new Blob([fileBuffer], { type: mimeType }));

  const uploadResponse = await fetch(
    "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart",
    {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}` },
      body: form,
    }
  );

  const result = await uploadResponse.json();

  return NextResponse.json({
    success: true,
    fileId: result.id,
    webViewLink: result.webViewLink,
  });
}
```

### 7. Document Converter Utilities (`/lib/document-converters.ts`)

Conversion functions between Tiptap and various formats:

```typescript
import { generateHTML } from "@tiptap/html";
import StarterKit from "@tiptap/starter-kit";
import mammoth from "mammoth";

export async function convertGoogleDocToTiptap(
  docxBuffer: Buffer
): Promise<string> {
  const result = await mammoth.convertToHtml({ buffer: docxBuffer });
  // Convert HTML to Tiptap JSON (implement HTML-to-Tiptap parser)
  // For MVP, store HTML and let editor parse it
  return JSON.stringify({
    type: "doc",
    content: [
      { type: "paragraph", content: [{ type: "text", text: result.value }] },
    ],
  });
}

export async function convertTiptapToGoogleDoc(
  tiptapJson: string
): Promise<Buffer> {
  // Convert Tiptap to HTML then to DOCX format for Google Docs import
  const json = JSON.parse(tiptapJson);
  const html = generateHTML(json, [StarterKit]);
  // Use library to convert HTML to DOCX buffer
  // Return buffer
}

export async function convertTiptapToPdf(tiptapJson: string): Promise<Buffer> {
  // Use puppeteer or similar to render HTML and generate PDF
}

export async function convertTiptapToDocx(tiptapJson: string): Promise<Buffer> {
  // Use docx library to convert Tiptap JSON to DOCX buffer
}
```

## Frontend Implementation

### 1. Google Drive Connect Button (`/components/google-drive/ConnectButton.tsx`)

```tsx
"use client";

import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

export function GoogleDriveConnectButton() {
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    fetch("/api/google-drive/status")
      .then((res) => res.json())
      .then((data) => setConnected(data.connected));
  }, []);

  const handleConnect = () => {
    window.location.href = "/api/google-drive/auth";
  };

  if (connected) {
    return (
      <Button variant="outline" disabled>
        Google Drive Connected
      </Button>
    );
  }

  return <Button onClick={handleConnect}>Connect Google Drive</Button>;
}
```

### 2. Import Picker Component (`/components/google-drive/ImportPicker.tsx`)

Use Google Picker API for file selection:

```tsx
"use client";

import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { toast } from "sonner";

export function GoogleDriveImportPicker({
  folderId,
  applicationId,
  onImported,
}: Props) {
  const handleImport = () => {
    // Load Google Picker
    const picker = new google.picker.PickerBuilder()
      .addView(google.picker.ViewId.DOCS)
      .setOAuthToken(/* get from status API */)
      .setCallback(async (data) => {
        if (data.action === google.picker.Action.PICKED) {
          const file = data.docs[0];

          const res = await fetch("/api/google-drive/import", {
            method: "POST",
            body: JSON.stringify({
              fileId: file.id,
              fileName: file.name,
              mimeType: file.mimeType,
              folderId,
              applicationId,
            }),
          });

          if (res.ok) {
            toast.success("File imported successfully");
            onImported?.();
          }
        }
      })
      .build();

    picker.setVisible(true);
  };

  return (
    <Button onClick={handleImport}>
      <Upload className="w-4 h-4 mr-2" />
      Import from Google Drive
    </Button>
  );
}
```

### 3. Export Dialog (`/components/google-drive/ExportDialog.tsx`)

```tsx
"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState } from "react";

export function ExportToGoogleDriveDialog({
  documentId,
  open,
  onOpenChange,
}: Props) {
  const [format, setFormat] = useState<"google-doc" | "pdf" | "docx">(
    "google-doc"
  );
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    const res = await fetch("/api/google-drive/export", {
      method: "POST",
      body: JSON.stringify({ documentId, format }),
    });

    if (res.ok) {
      const data = await res.json();
      toast.success("Exported to Google Drive");
      window.open(data.webViewLink, "_blank");
    }

    setExporting(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Export to Google Drive</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <select value={format} onChange={(e) => setFormat(e.target.value)}>
            <option value="google-doc">Google Docs</option>
            <option value="pdf">PDF</option>
            <option value="docx">Word Document</option>
          </select>
          <Button onClick={handleExport} disabled={exporting}>
            Export
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

### 4. Integration in Document Editor (`/components/applications/DocumentEditor.tsx`)

Add import/export buttons to toolbar - update existing file to include:

```tsx
import { GoogleDriveImportPicker } from "@/components/google-drive/ImportPicker";
import { ExportToGoogleDriveDialog } from "@/components/google-drive/ExportDialog";

// Add to toolbar
<GoogleDriveImportPicker onImported={refetch} />
<ExportToGoogleDriveDialog documentId={document.id} />
```

### 5. Integration in Documents List (`/components/folders/DocumentsView.tsx`)

Add bulk import button in toolbar area.

## Dependencies to Install

```bash
npm install googleapis puppeteer-core docx @types/mammoth
```

**Note:** `mammoth` is already installed (v1.11.0)

## Security Notes

### Token Encryption

- Tokens are encrypted at rest using AES-256-GCM
- Each token includes unique IV (initialization vector) and authentication tag
- Encryption key must be 32 bytes (64 hex characters)
- Keep `TOKEN_ENCRYPTION_KEY` secret and never commit to git

### Token Storage Best Practices

- Access tokens expire after 1 hour (short-lived)
- Refresh tokens are long-lived but encrypted
- OAuth scopes are limited to minimum required permissions
- Tokens are decrypted only when needed and never logged

## Testing Checklist

1. OAuth flow completes and tokens stored (encrypted)
2. Import Google Doc converts to Tiptap correctly
3. Import saves original file to Supabase
4. Export creates file in Drive with correct format
5. Token refresh works when expired
6. Token encryption/decryption works correctly
7. UI shows connection status
8. Both editor and list locations work
