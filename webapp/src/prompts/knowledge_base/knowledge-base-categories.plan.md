# Unified Documents with Types & Vectorization - Implementation Plan

## Overview

Transform the system to use a single unified `Documents` table as the knowledge base, eliminating the separate `KnowledgeBaseDocument` and `KnowledgeBaseVector` tables (which currently exist). All documents get file categories (11 types) and automatic vectorization. The "Knowledge Base" page becomes a filtered view of documents organized by category.

**Key Changes:**

- Documents table extended with file categories and vectorization fields
  - **Important**: `fileCategory` = document purpose (WINNING_APPLICATION, TEMPLATE, etc.)
  - **Different from**: `fileType` = file format (application/pdf, text/csv, etc.)
- Knowledge Base = filtered view where `isKnowledgeBase: true`
- All documents automatically vectorized for AI context
- Single `DocumentVector` table replaces existing `KnowledgeBaseVector`
- Knowledge Base page shows all 11 file categories with expandable lists
- **Category-level toggles**: Each file category has one toggle that controls ALL documents in that category
- **User-level AI context settings**: Each user can control which document categories are included in their AI assistant context (chat vs editor)

---

## Database Schema Changes

**Key Design Decision: Metadata Strategy**

Instead of adding new FK fields for source tracking, we leverage:

- **Existing `applicationId` field** → for documents linked to applications
- **Existing `metadata` JSON field** → for custom fields only (tags, notes, successNotes, etc.)

This approach is:

- ✅ Simpler (no new FK fields or relations)
- ✅ More flexible (metadata can evolve without migrations)
- ✅ No breaking changes to existing documents
- ✅ Already indexed and queryable

---

### 1. Add File Category Enum

**File: `prisma/schema.prisma`**

Add new enum for file categories:

```prisma
enum FileCategory {
  GENERAL               // General documents (default for all new docs)
  WINNING_APPLICATION   // Past successful applications
  TEMPLATE              // Document templates
  OPPORTUNITY           // RFPs, NOFOs, grant announcements
  AWARD_CONTRACT        // Award letters, contracts, amendments
  BUDGET_FINANCIAL      // Budgets, expenses, financial records
  PROGRESS_REPORT       // Interim/periodic reports
  FINAL_REPORT          // Final reports, evaluations
  SUPPORTING_DOCUMENT   // Data analyses, research, evidence
  CORRESPONDENCE        // Communications, letters
  COMPLIANCE_RECORDS    // Audit reports, compliance forms

  @@schema("app")
}
```

### 2. Update Document Model

**Modify existing `Document` model in `prisma/schema.prisma`:**

```prisma
model Document {
  // EXISTING FIELDS
  id             String       @id @default(cuid())
  applicationId  String?
  title          String
  content        String?
  contentType    String       @default("json")
  metadata       Json?
  version        Int          @default(1)
  createdAt      DateTime     @default(now())
  updatedAt      DateTime     @updatedAt
  organizationId String
  folderId       String?
  fileSize       Int?
  fileType       String?
  fileUrl        String?

  // NEW FIELDS - File Category & Knowledge Base
  fileCategory        FileCategory      @default(GENERAL)
  isKnowledgeBase     Boolean           @default(false)  // Visible in KB view
  extractedText       String?           // Text for AI context & vectorization

  // NOTE: Use existing `applicationId` for application-linked docs
  // NOTE: Use existing `metadata` JSON for custom fields only (tags, notes, successNotes, etc.)

  // NEW FIELDS - Vectorization
  vectorizationStatus VectorizationStatus @default(PENDING)
  vectorizedAt        DateTime?
  chunkCount          Int?
  vectorizationError  String?

  // EXISTING RELATIONS (unchanged)
  application    Application? @relation(fields: [applicationId], references: [id], onDelete: Cascade)
  folder         Folder?      @relation(fields: [folderId], references: [id], onDelete: Cascade)
  organization   Organization @relation("OrganizationDocuments", fields: [organizationId], references: [id], onDelete: Cascade)

  // NEW RELATIONS
  vectors             DocumentVector[] @relation("DocumentVectors")

  // UPDATED INDEXES
  @@index([applicationId])
  @@index([updatedAt])
  @@index([applicationId, createdAt])
  @@index([folderId])
  @@index([organizationId, fileCategory])
  @@index([organizationId, isKnowledgeBase])
  @@index([organizationId, fileCategory, isKnowledgeBase])
  @@index([vectorizationStatus])
  @@map("documents")
  @@schema("app")
}
```

### 3. Create DocumentVector Table

**New table to replace existing `KnowledgeBaseVector`:**

```prisma
model DocumentVector {
  id             BigInt                 @id @default(autoincrement())
  documentId     String                 @map("document_id")
  organizationId String                 @map("organization_id")
  chunkIndex     Int                    @map("chunk_index")
  totalChunks    Int                    @map("total_chunks")
  content        String
  embedding      Unsupported("vector")?
  fileName       String                 @map("file_name")
  fileType       String                 @map("file_type")
  contentHash    String                 @map("content_hash")
  vectorizedAt   DateTime               @default(now()) @map("vectorized_at")
  model          String                 @default("text-embedding-3-small")

  document       Document               @relation("DocumentVectors", fields: [documentId], references: [id], onDelete: Cascade)

  @@index([organizationId])
  @@index([documentId])
  @@index([organizationId, documentId])
  @@index([embedding], map: "idx_document_vectors_embedding")
  @@map("document_vectors")
  @@schema("app")
}
```

### 4. Metadata Strategy

**Instead of adding separate FK fields, we use existing fields + metadata JSON:**

**For Application-linked documents:**

```typescript
// Use existing applicationId field (gives access to opportunity via application.opportunityId)
{
  applicationId: "app_123",
  fileCategory: "WINNING_APPLICATION",
  metadata: {
    successNotes: "Strong community partnerships",
    tags: ["STEM", "education"]
  }
}
// Access opportunity data via: document.application.opportunityAgency, opportunityAwardMax, etc.
```

**For standalone OPPORTUNITY category documents (RFP/NOFO PDFs):**

```typescript
// Standalone informational documents about opportunities (not linked via FK)
{
  fileCategory: "OPPORTUNITY",
  metadata: {
    tags: ["federal", "education"],
    notes: "Annual RFP cycle"
  }
  // All opportunity data comes from the document content itself
}
```

**Benefits:**

- Simpler schema (no additional FK fields or relations)
- Leverages existing `applicationId` relation
- `metadata` JSON is already indexed and flexible
- No migration complexity for existing documents

### 5. Add UserAIContextSettings

**New model to control which file categories are enabled for AI context (user-level preferences):**

```prisma
model UserAIContextSettings {
  id                         String         @id @default(cuid())
  userId                     String         @unique @db.Uuid
  enabledCategoriesChat      FileCategory[] @default([GENERAL, WINNING_APPLICATION, TEMPLATE, OPPORTUNITY, AWARD_CONTRACT, BUDGET_FINANCIAL, PROGRESS_REPORT, FINAL_REPORT, SUPPORTING_DOCUMENT, CORRESPONDENCE, COMPLIANCE_RECORDS])
  enabledCategoriesEditor    FileCategory[] @default([GENERAL, WINNING_APPLICATION, TEMPLATE, OPPORTUNITY, AWARD_CONTRACT, BUDGET_FINANCIAL, PROGRESS_REPORT, FINAL_REPORT, SUPPORTING_DOCUMENT, CORRESPONDENCE, COMPLIANCE_RECORDS])
  createdAt                  DateTime       @default(now())
  updatedAt                  DateTime       @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("user_ai_context_settings")
  @@schema("app")
}
```

Add relation to User:

```prisma
model User {
  // Existing fields...
  aiContextSettings UserAIContextSettings?
}
```

**Note:** Documents are still organization-level (shared), but each user can control which categories they want included in their AI context.

### 7. Remove Existing KB Tables

**After migration, delete these models from schema:**

- `KnowledgeBaseDocument` (currently exists)
- `KnowledgeBaseVector` (currently exists)

### 8. Metadata JSON Structure

Simplified - only for custom fields, not duplicating FK data:

```typescript
interface DocumentMetadata {
  // Flexible JSON for custom fields only
  // All structured data (funder, amounts, dates) comes from application relation or document content

  // Custom fields
  successNotes?: string; // Why this succeeded
  tags?: string[]; // Custom tags for filtering
  notes?: string; // General notes
  customFields?: Record<string, any>; // Org-specific metadata

  // Existing metadata for uploaded files (keep for backwards compatibility)
  originalFileName?: string;
  extractedText?: string; // Currently stored here, moving to top-level field
  pageCount?: number;
  uploadedAt?: string;
}
```

### 9. Migration Commands

```bash
# Create migration
npx prisma migrate dev --name unified_documents_with_types

# Generate Prisma client
npx prisma generate

# Optional: Run data migration script if existing KB docs need migration
# (See Migration Strategy section below)
```

---

## API Endpoint Updates

**Simplified Architecture: Extend Existing Document APIs**

Instead of creating separate `/api/knowledge-base/*` routes, we extend existing document endpoints:

| Operation        | Endpoint                              | Method | Description                     |
| ---------------- | ------------------------------------- | ------ | ------------------------------- |
| List KB docs     | `/api/documents?isKnowledgeBase=true` | GET    | Filter existing list endpoint   |
| Update KB fields | `/api/documents/[id]`                 | PUT    | Extend existing update endpoint |
| Bulk operations  | `/api/documents/bulk-update`          | POST   | NEW - update multiple docs      |
| Toggle category  | `/api/documents/toggle-category`      | POST   | NEW - toggle all in category    |
| Vectorize docs   | `/api/documents/vectorize`            | POST   | NEW - process vectorization     |

**Benefits:** RESTful, no code duplication, Knowledge Base is just a filtered view.

---

### 10. Update Document Upload

**File: `src/app/api/documents/upload/route.ts`**

**Changes needed:**

1. Add `fileCategory` parameter from form data (default: GENERAL for uploads)
2. Add `isKnowledgeBase` parameter (default: false for regular uploads, true when uploading to KB)
3. Move `extractedText` from metadata to top-level field
4. Set `vectorizationStatus: PENDING`
5. Trigger vectorization after successful upload

```typescript
// Add to formData parsing:
const fileCategory = (formData.get("fileCategory") as string) || "GENERAL";
const isKnowledgeBase = formData.get("isKnowledgeBase") === "true";

// In document.create:
const document = await prisma.document.create({
  data: {
    // ... existing fields
    fileCategory: fileCategory as FileCategory,
    isKnowledgeBase,
    extractedText: extractedText || null, // Move from metadata
    vectorizationStatus: "PENDING",
  },
});

// After successful creation, trigger vectorization:
if (extractedText) {
  await triggerDocumentVectorization(document.id, dbUser.organizationId);
}
```

### 11. Update Document Creation (Tiptap)

**File: `src/app/api/documents/route.ts` - POST endpoint**

**Changes needed:**

1. Default `fileCategory: GENERAL` for all new documents
2. Extract text from Tiptap JSON content
3. Store in `extractedText` field
4. Trigger vectorization

```typescript
// After document creation:
let extractedText = null;
if (content && contentType === "json") {
  extractedText = extractTextFromTiptap(content);
}

const document = await prisma.document.create({
  data: {
    // ... existing fields
    fileCategory: "GENERAL", // Default for all new docs
    extractedText,
    vectorizationStatus: extractedText ? "PENDING" : "COMPLETED",
  },
});

// Trigger vectorization if text exists
if (extractedText) {
  await triggerDocumentVectorization(document.id, dbUser.organizationId);
}
```

### 12. Update Document Update

**File: `src/app/api/documents/[documentId]/route.ts` - PUT endpoint**

**Changes needed:**

1. When content changes, re-extract text
2. Update `extractedText` field
3. Reset `vectorizationStatus: PENDING`
4. Trigger re-vectorization

```typescript
// If content is being updated:
if (content !== undefined && existingDocument.contentType === "json") {
  const newExtractedText = extractTextFromTiptap(content);

  updateData.extractedText = newExtractedText;
  updateData.vectorizationStatus = "PENDING";

  // After update, trigger vectorization
  await triggerDocumentVectorization(
    documentId,
    existingDocument.organizationId
  );
}
```

### 13. Create Document Vectorization Endpoint

**New file: `src/app/api/documents/vectorize/route.ts`**

Similar to current KB vectorization but for Documents table:

```typescript
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import OpenAI from "openai";
import crypto from "crypto";
import { chunkText } from "@/lib/textChunking";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const EMBEDDING_MODEL = "text-embedding-3-small";

export async function POST(req: NextRequest) {
  // Auth check - internal API key only
  const apiKey = req.headers.get("x-api-key");
  if (!apiKey || apiKey !== process.env.INTERNAL_API_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Get all documents that need vectorization
  const docsToVectorize = await prisma.document.findMany({
    where: {
      vectorizationStatus: { in: ["PENDING", "FAILED"] },
      extractedText: { not: null },
    },
    take: 50, // Process in batches
  });

  let vectorizedCount = 0;
  const errors: Array<{ id: string; error: string }> = [];

  for (const doc of docsToVectorize) {
    try {
      // Update status to PROCESSING
      await prisma.document.update({
        where: { id: doc.id },
        data: { vectorizationStatus: "PROCESSING" },
      });

      // Chunk the text
      const chunks = await chunkText(doc.extractedText!);

      // Delete old vectors for this document
      await prisma.documentVector.deleteMany({
        where: { documentId: doc.id },
      });

      // Vectorize each chunk
      for (const chunk of chunks) {
        const embeddingResponse = await openai.embeddings.create({
          model: EMBEDDING_MODEL,
          input: chunk.content,
        });

        const embedding = embeddingResponse.data[0].embedding;
        const contentHash = crypto
          .createHash("sha256")
          .update(chunk.content)
          .digest("hex");

        // Insert using raw SQL to handle vector type
        await prisma.$executeRaw`
          INSERT INTO app.document_vectors (
            document_id,
            organization_id,
            chunk_index,
            total_chunks,
            content,
            embedding,
            file_name,
            file_type,
            content_hash,
            vectorized_at,
            model
          ) VALUES (
            ${doc.id},
            ${doc.organizationId},
            ${chunk.index},
            ${chunks.length},
            ${chunk.content},
            ${`[${embedding.join(",")}]`}::vector,
            ${doc.title},
            ${doc.fileType || "text/plain"},
            ${contentHash},
            NOW(),
            ${EMBEDDING_MODEL}
          )
        `;
      }

      // Update status to COMPLETED
      await prisma.document.update({
        where: { id: doc.id },
        data: {
          vectorizationStatus: "COMPLETED",
          vectorizedAt: new Date(),
          chunkCount: chunks.length,
        },
      });

      vectorizedCount++;
    } catch (error) {
      console.error(`Failed to vectorize doc ${doc.id}:`, error);
      await prisma.document.update({
        where: { id: doc.id },
        data: {
          vectorizationStatus: "FAILED",
          vectorizationError:
            error instanceof Error ? error.message : "Unknown error",
        },
      });
      errors.push({
        id: doc.id,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  return NextResponse.json({
    success: true,
    vectorized: vectorizedCount,
    total: docsToVectorize.length,
    errors: errors.length > 0 ? errors : undefined,
  });
}
```

### 14. Extend Existing Documents API

**File: `src/app/api/documents/route.ts`**

**Add new query parameters to existing GET method:**

```typescript
// Add to existing GET method after line 61:
const isKnowledgeBase = searchParams.get("isKnowledgeBase");
const fileCategory = searchParams.get("fileCategory");
const vectorizationStatus = searchParams.get("vectorizationStatus");

// Update the where clause (line 112):
const documents = await prisma.document.findMany({
  where: {
    organizationId: dbUser.organizationId,
    ...(isKnowledgeBase !== null && {
      isKnowledgeBase: isKnowledgeBase === "true",
    }),
    ...(fileCategory && {
      fileCategory: fileCategory as FileCategory,
    }),
    ...(vectorizationStatus && {
      vectorizationStatus: vectorizationStatus as VectorizationStatus,
    }),
  },
  include: {
    application: {
      select: {
        id: true,
        title: true,
        opportunityId: true,
        opportunityAgency: true,
        opportunityAwardMax: true,
      },
    },
  },
  orderBy: {
    updatedAt: "desc",
  },
  take: limit,
  skip: offset,
});
```

**Usage examples:**

- All documents: `GET /api/documents`
- KB documents only: `GET /api/documents?isKnowledgeBase=true`
- KB winning apps: `GET /api/documents?isKnowledgeBase=true&fileCategory=WINNING_APPLICATION`
- Pending vectorization: `GET /api/documents?vectorizationStatus=PENDING`

### 15. Extend Existing Document Update API

**File: `src/app/api/documents/[documentId]/route.ts`**

**Extend existing PUT method to handle new KB fields (add to line 168):**

```typescript
// Add after line 168 (after existing body destructuring):
const {
  title,
  content,
  contentType = "json",
  folderId,
  // NEW KB fields:
  isKnowledgeBase,
  fileCategory,
  metadata,
} = body;

// In the prisma.document.update (around line 203), add:
const document = await prisma.document.update({
  where: { id: documentId },
  data: {
    ...(title && { title }),
    ...(content !== undefined && { content }),
    ...(contentType && { contentType }),
    ...(folderId !== undefined && { folderId }),
    ...(newApplicationId !== existingDocument.applicationId && {
      applicationId: newApplicationId,
    }),
    // NEW KB fields:
    ...(isKnowledgeBase !== undefined && { isKnowledgeBase }),
    ...(fileCategory && { fileCategory }),
    ...(metadata && {
      metadata: {
        ...((existingDocument.metadata as object) || {}),
        ...metadata,
      },
    }),
    version: existingDocument.version + 1,
    updatedAt: new Date(),
  },
  // ... existing include
});

// After update, trigger vectorization if needed:
if (
  document.isKnowledgeBase &&
  document.vectorizationStatus !== "COMPLETED" &&
  document.extractedText
) {
  await triggerVectorization(documentId, dbUser.organizationId);
}
```

**Usage:**

- Add to KB: `PUT /api/documents/{id}` with `{ isKnowledgeBase: true, fileCategory: "WINNING_APPLICATION" }`
- Remove from KB: `PUT /api/documents/{id}` with `{ isKnowledgeBase: false }`
- Update metadata: `PUT /api/documents/{id}` with `{ metadata: { tags: ["STEM"], successNotes: "Strong partnerships" } }`

### 16. Bulk Update Documents

**New file: `src/app/api/documents/bulk-update/route.ts`**

Mark multiple documents as KB documents:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import prisma from "@/lib/prisma";
import { FileCategory } from "@/generated/prisma";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { organizationId: true },
    });

    if (!dbUser?.organizationId) {
      return NextResponse.json(
        { error: "User organization not found" },
        { status: 404 }
      );
    }

    const { documentIds, updates } = await req.json();
    // updates can contain: { isKnowledgeBase, fileCategory, metadata }

    if (
      !documentIds ||
      !Array.isArray(documentIds) ||
      documentIds.length === 0
    ) {
      return NextResponse.json(
        { error: "No documents provided" },
        { status: 400 }
      );
    }

    if (!updates || typeof updates !== "object") {
      return NextResponse.json(
        { error: "Updates object required" },
        { status: 400 }
      );
    }

    // Update all documents (note: metadata requires individual updates)
    if (updates.metadata) {
      // Individual updates for metadata merge
      await Promise.all(
        documentIds.map(async (id) => {
          const doc = await prisma.document.findFirst({
            where: { id, organizationId: dbUser.organizationId },
          });
          if (doc) {
            await prisma.document.update({
              where: { id },
              data: {
                ...(updates.isKnowledgeBase !== undefined && {
                  isKnowledgeBase: updates.isKnowledgeBase,
                }),
                ...(updates.fileCategory && {
                  fileCategory: updates.fileCategory,
                }),
                metadata: {
                  ...((doc.metadata as object) || {}),
                  ...updates.metadata,
                },
              },
            });
          }
        })
      );
    } else {
      // Bulk update without metadata
      await prisma.document.updateMany({
        where: {
          id: { in: documentIds },
          organizationId: dbUser.organizationId, // Security check
        },
        data: {
          ...(updates.isKnowledgeBase !== undefined && {
            isKnowledgeBase: updates.isKnowledgeBase,
          }),
          ...(updates.fileCategory && {
            fileCategory: updates.fileCategory as FileCategory,
          }),
        },
      });
    }

    // Trigger vectorization for all
    const protocol = process.env.NEXT_PUBLIC_SITE_URL?.startsWith("https")
      ? "https"
      : "http";
    const host =
      process.env.NEXT_PUBLIC_SITE_URL?.replace(/^https?:\/\//, "") ||
      "localhost:3000";

    fetch(`${protocol}://${host}/api/documents/vectorize`, {
      method: "POST",
      headers: { "x-api-key": process.env.INTERNAL_API_KEY! },
    }).catch((err) => console.error("Vectorization trigger failed:", err));

    return NextResponse.json({ success: true, count: documentIds.length });
  } catch (error) {
    console.error("Error bulk adding documents to KB:", error);
    return NextResponse.json(
      { error: "Failed to bulk add documents" },
      { status: 500 }
    );
  }
}
```

**Usage:**

- Add to KB: `POST /api/documents/bulk-update` with `{ documentIds: [...], updates: { isKnowledgeBase: true } }`
- Remove from KB: `POST /api/documents/bulk-update` with `{ documentIds: [...], updates: { isKnowledgeBase: false } }`
- Set category: `POST /api/documents/bulk-update` with `{ documentIds: [...], updates: { fileCategory: "WINNING_APPLICATION" } }`

### 17. Toggle All Documents of a Category

**New file: `src/app/api/documents/toggle-category/route.ts`**

Toggle all documents of a specific type in/out of knowledge base:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import prisma from "@/lib/prisma";
import { FileCategory } from "@/generated/prisma";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { organizationId: true },
    });

    if (!dbUser?.organizationId) {
      return NextResponse.json(
        { error: "User organization not found" },
        { status: 404 }
      );
    }

    const { fileCategory, isKnowledgeBase } = await req.json();

    if (!fileCategory || typeof isKnowledgeBase !== "boolean") {
      return NextResponse.json(
        { error: "fileCategory and isKnowledgeBase are required" },
        { status: 400 }
      );
    }

    if (!Object.values(FileCategory).includes(fileCategory as FileCategory)) {
      return NextResponse.json(
        { error: "Invalid document type" },
        { status: 400 }
      );
    }

    // Update ALL documents of this type for this organization
    const result = await prisma.document.updateMany({
      where: {
        organizationId: dbUser.organizationId,
        fileCategory: fileCategory as FileCategory,
      },
      data: {
        isKnowledgeBase,
      },
    });

    // If enabling KB, trigger vectorization for documents without extractedText
    if (isKnowledgeBase) {
      const docsNeedingVectorization = await prisma.document.findMany({
        where: {
          organizationId: dbUser.organizationId,
          fileCategory: fileCategory as FileCategory,
          extractedText: { not: null },
          vectorizationStatus: { not: "COMPLETED" },
        },
        select: { id: true },
      });

      if (docsNeedingVectorization.length > 0) {
        // Trigger vectorization endpoint
        const protocol = process.env.NEXT_PUBLIC_SITE_URL?.startsWith("https")
          ? "https"
          : "http";
        const host =
          process.env.NEXT_PUBLIC_SITE_URL?.replace(/^https?:\/\//, "") ||
          "localhost:3000";

        fetch(`${protocol}://${host}/api/documents/vectorize`, {
          method: "POST",
          headers: { "x-api-key": process.env.INTERNAL_API_KEY! },
        }).catch((err) => console.error("Vectorization trigger failed:", err));
      }
    }

    return NextResponse.json({
      success: true,
      updated: result.count,
      fileCategory,
      isKnowledgeBase,
    });
  } catch (error) {
    console.error("Error toggling document type in KB:", error);
    return NextResponse.json(
      { error: "Failed to toggle document type" },
      { status: 500 }
    );
  }
}
```

---

## AI Integration

### 19. Update Knowledge Base Retrieval

**File: `src/lib/getOrgKnowledgeBase.ts`**

Replace entirely with document-based version:

```typescript
import prisma from "@/lib/prisma";
import { FileCategory } from "@/generated/prisma";

interface KBRetrievalOptions {
  context: "chat" | "editor";
  includeFileCategories?: FileCategory[];
  excludeFileCategories?: FileCategory[];
}

/**
 * Retrieves all active knowledge base documents for an organization
 * filtered by user's AI context preferences, and formats them as a context string for AI systems.
 *
 * @param organizationId - The ID of the organization (documents are org-level)
 * @param userId - The ID of the user (for fetching user-specific AI context settings)
 * @param options - Retrieval options including context type and filters
 */
export async function getActiveKnowledgeBase(
  organizationId: string,
  userId: string,
  options: KBRetrievalOptions
): Promise<string> {
  try {
    // 1. Fetch user AI context settings
    const settings = await prisma.userAIContextSettings.findUnique({
      where: { userId },
    });

    // 2. Determine enabled document types based on context
    const enabledTypes =
      options.context === "chat"
        ? settings?.enabledCategoriesChat
        : settings?.enabledCategoriesEditor;

    // 3. Apply filters
    let typesToInclude = enabledTypes || getAllFileCategories();

    if (options.includeFileCategories) {
      typesToInclude = typesToInclude.filter((t) =>
        options.includeFileCategories!.includes(t)
      );
    }

    if (options.excludeFileCategories) {
      typesToInclude = typesToInclude.filter(
        (t) => !options.excludeFileCategories!.includes(t)
      );
    }

    // 4. Query documents marked as knowledge base (still org-level)
    const docs = await prisma.document.findMany({
      where: {
        organizationId,
        isKnowledgeBase: true,
        fileCategory: { in: typesToInclude },
        extractedText: { not: null },
      },
      select: {
        title: true,
        extractedText: true,
        fileCategory: true,
        metadata: true,
        applicationId: true,
        application: {
          select: {
            id: true,
            title: true,
            opportunityAgency: true,
            opportunityAwardMax: true,
            opportunityAwardMin: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    if (docs.length === 0) {
      return "";
    }

    // 5. Format for AI with type labels and metadata from FKs
    return formatDocsForAI(docs);
  } catch (error) {
    console.error("Error fetching active knowledge base:", error);
    return "";
  }
}

function formatDocsForAI(docs: any[]): string {
  return docs
    .map((doc) => {
      let header = `[${getFileCategoryLabel(doc.fileCategory)}: ${doc.title}]`;

      // Add context from existing application relation
      if (doc.application) {
        header += `\n(Source: Application "${doc.application.title}")`;
        if (doc.application.opportunityAgency) {
          header += `\nFunder: ${doc.application.opportunityAgency}`;
        }
        if (doc.application.opportunityAwardMax) {
          header += `\nAward: $${doc.application.opportunityAwardMax.toLocaleString()}`;
        }
      }

      // Add custom metadata
      if (doc.metadata?.successNotes) {
        header += `\nSuccess Notes: ${doc.metadata.successNotes}`;
      }
      if (doc.metadata?.tags && doc.metadata.tags.length > 0) {
        header += `\nTags: ${doc.metadata.tags.join(", ")}`;
      }

      return `${header}\n${doc.extractedText}`;
    })
    .join("\n\n---\n\n");
}

function getAllFileCategories(): FileCategory[] {
  return Object.values(FileCategory);
}

function getFileCategoryLabel(type: FileCategory): string {
  const labels: Record<FileCategory, string> = {
    GENERAL: "General Document",
    WINNING_APPLICATION: "Winning Application",
    TEMPLATE: "Template",
    OPPORTUNITY: "Grant Opportunity",
    AWARD_CONTRACT: "Award/Contract",
    BUDGET_FINANCIAL: "Budget/Financial",
    PROGRESS_REPORT: "Progress Report",
    FINAL_REPORT: "Final Report",
    SUPPORTING_DOCUMENT: "Supporting Document",
    CORRESPONDENCE: "Correspondence",
    COMPLIANCE_RECORDS: "Compliance Records",
  };
  return labels[type] || type;
}
```

### 20. Update AI Assistant Endpoints

**Files: `src/app/api/ai/assistant-agent/route.ts` and `src/app/api/chat/editor/route.ts`**

Update to pass userId for user-specific AI context settings:

```typescript
import { getActiveKnowledgeBase } from "@/lib/getOrgKnowledgeBase";

// Get user and organization IDs
const dbUser = await prisma.user.findUnique({
  where: { id: user.id },
  select: { organizationId: true },
});

// Usage - now requires userId for user-level settings:
const knowledgeBaseContext = await getActiveKnowledgeBase(
  dbUser.organizationId, // Documents are org-level
  user.id, // Settings are user-level
  {
    context: "chat", // or 'editor'
  }
);
```

**Note:** Documents are still queried by organizationId (shared across org), but filtering is based on user's personal AI context preferences.

---

## Helper Utilities

### 21. Document Type Utilities

**New file: `src/lib/fileCategories.ts`**

```typescript
import { FileCategory } from "@/generated/prisma";
import {
  FileEdit,
  FileText,
  Award,
  Layout,
  Target,
  FileCheck,
  DollarSign,
  TrendingUp,
  CheckCircle,
  FileSpreadsheet,
  Mail,
  Shield,
  LucideIcon,
} from "lucide-react";

export const FILE_CATEGORY_LABELS: Record<FileCategory, string> = {
  GENERAL: "General Documents",
  WINNING_APPLICATION: "Winning Applications",
  TEMPLATE: "Templates",
  OPPORTUNITY: "Grant Opportunities",
  AWARD_CONTRACT: "Awards & Contracts",
  BUDGET_FINANCIAL: "Budgets & Financial",
  PROGRESS_REPORT: "Progress Reports",
  FINAL_REPORT: "Final Reports",
  SUPPORTING_DOCUMENT: "Supporting Documents",
  CORRESPONDENCE: "Correspondence",
  COMPLIANCE_RECORDS: "Compliance Records",
};

export const FILE_CATEGORY_ICONS: Record<FileCategory, LucideIcon> = {
  GENERAL: FileText,
  WINNING_APPLICATION: Award,
  TEMPLATE: Layout,
  OPPORTUNITY: Target,
  AWARD_CONTRACT: FileCheck,
  BUDGET_FINANCIAL: DollarSign,
  PROGRESS_REPORT: TrendingUp,
  FINAL_REPORT: CheckCircle,
  SUPPORTING_DOCUMENT: FileSpreadsheet,
  CORRESPONDENCE: Mail,
  COMPLIANCE_RECORDS: Shield,
};

export const FILE_CATEGORY_DESCRIPTIONS: Record<FileCategory, string> = {
  GENERAL: "General organizational documents and references",
  WINNING_APPLICATION: "Past successful grant applications",
  TEMPLATE: "Document templates and boilerplate content",
  OPPORTUNITY: "RFPs, NOFOs, and grant opportunity announcements",
  AWARD_CONTRACT: "Award letters, executed contracts, and amendments",
  BUDGET_FINANCIAL: "Budgets, expense reports, and financial records",
  PROGRESS_REPORT: "Interim and periodic narrative reports",
  FINAL_REPORT: "Final reports, evaluations, and closeout documents",
  SUPPORTING_DOCUMENT: "Data analyses, research, and supporting evidence",
  CORRESPONDENCE: "Communications, letters, and regulatory correspondence",
  COMPLIANCE_RECORDS: "Audit reports, compliance forms, and internal controls",
};

export function getFileCategoryLabel(type: FileCategory): string {
  return FILE_CATEGORY_LABELS[type] || type;
}

export function getFileCategoryIcon(type: FileCategory): LucideIcon {
  return FILE_CATEGORY_ICONS[type] || FileText;
}

export function getFileCategoryDescription(type: FileCategory): string {
  return FILE_CATEGORY_DESCRIPTIONS[type] || "";
}

export function getAllFileCategories(): FileCategory[] {
  return Object.values(FileCategory);
}

export function getKnowledgeBaseFileCategories(): FileCategory[] {
  // Returns all file categories for KB selection
  return getAllFileCategories();
}
```

### 22. Text Extraction Utilities

**New file: `src/lib/textExtraction.ts`**

```typescript
import { generateHTML } from "@tiptap/html";
import StarterKit from "@tiptap/starter-kit";

/**
 * Extract plain text from Tiptap JSON content
 */
export function extractTextFromTiptap(content: string): string {
  try {
    const json = JSON.parse(content);
    const html = generateHTML(json, [StarterKit]);
    // Strip HTML tags and normalize whitespace
    return html
      .replace(/<[^>]*>/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  } catch (e) {
    console.error("Failed to extract text from Tiptap content:", e);
    return "";
  }
}

/**
 * Trigger document vectorization (fire and forget)
 */
export async function triggerDocumentVectorization(
  documentId: string,
  organizationId: string
): Promise<void> {
  try {
    const protocol = process.env.NEXT_PUBLIC_SITE_URL?.startsWith("https")
      ? "https"
      : "http";
    const host =
      process.env.NEXT_PUBLIC_SITE_URL?.replace(/^https?:\/\//, "") ||
      "localhost:3000";

    // Fire and forget - don't await
    fetch(`${protocol}://${host}/api/documents/vectorize`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.INTERNAL_API_KEY!,
      },
    }).catch((err) => {
      console.error("Failed to trigger vectorization:", err);
    });
  } catch (error) {
    console.error("Error triggering vectorization:", error);
  }
}
```

---

## Frontend Implementation

### 23. Create Knowledge Base Page

**New file: `src/app/private/[slug]/knowledge-base/page.tsx`**

Full-page view showing all document types with category-level toggles:

```typescript
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import prisma from "@/lib/prisma";
import { KnowledgeBaseHeader } from "@/components/knowledge-base/KnowledgeBaseHeader";
import { KnowledgeBaseCategoryList } from "@/components/knowledge-base/KnowledgeBaseCategoryList";
import { getAllFileCategories } from "@/lib/fileCategories";

export default async function KnowledgeBasePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // Authenticate
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Get organization
  const organization = await prisma.organization.findFirst({
    where: {
      slug,
      users: { some: { id: user.id } },
    },
    select: { id: true, name: true, slug: true },
  });

  if (!organization) {
    redirect("/");
  }

  // Fetch ALL documents grouped by type with KB status
  const allFileCategories = getAllFileCategories();
  const documentsByType = await Promise.all(
    allFileCategories.map(async (type) => {
      const documents = await prisma.document.findMany({
        where: {
          organizationId: organization.id,
          fileCategory: type,
        },
        select: {
          id: true,
          title: true,
          isKnowledgeBase: true,
          fileCategory: true,
          fileSize: true,
          fileType: true,
          createdAt: true,
          updatedAt: true,
          vectorizationStatus: true,
          metadata: true, // Contains custom fields (tags, notes, successNotes, etc.)
          applicationId: true,
          application: { // Use existing relation
            select: {
              id: true,
              title: true,
              opportunityAgency: true,
              opportunityAwardMax: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      // Determine toggle state: true if ANY document is in KB
      const hasKBDocs = documents.some(doc => doc.isKnowledgeBase);
      const allInKB = documents.length > 0 && documents.every(doc => doc.isKnowledgeBase);

      return {
        type,
        documents,
        hasKBDocs,
        allInKB,
        totalCount: documents.length,
        kbCount: documents.filter(d => d.isKnowledgeBase).length,
      };
    })
  );

  return (
    <div className="container py-6 space-y-6">
      <KnowledgeBaseHeader organizationSlug={slug} organizationId={organization.id} />
      <KnowledgeBaseCategoryList
        documentsByType={documentsByType}
        organizationSlug={slug}
        organizationId={organization.id}
      />
    </div>
  );
}
```

### 24. Knowledge Base Header

**New component: `src/components/knowledge-base/KnowledgeBaseHeader.tsx`**

```typescript
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DocumentSelectorModal } from "./DocumentSelectorModal";
import { FileUploadModal } from "./FileUploadModal";
import { GoogleDriveImportModal } from "./GoogleDriveImportModal";

interface KnowledgeBaseHeaderProps {
  organizationSlug: string;
}

export function KnowledgeBaseHeader({ organizationSlug }: KnowledgeBaseHeaderProps) {
  const [showDocumentSelector, setShowDocumentSelector] = useState(false);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [showGoogleDrive, setShowGoogleDrive] = useState(false);

  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Knowledge Base</h1>
          <p className="text-muted-foreground mt-1">
            Manage documents that provide context to AI assistants
          </p>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="lg">
              <Plus className="mr-2 h-4 w-4" />
              Add
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem onClick={() => setShowDocumentSelector(true)}>
              <FileText className="mr-2 h-4 w-4" />
              From Documents
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setShowFileUpload(true)}>
              <Upload className="mr-2 h-4 w-4" />
              Upload File
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setShowGoogleDrive(true)}>
              <img
                src="/logos/google-drive.svg"
                alt="Google Drive"
                className="mr-2 h-4 w-4"
              />
              From Google Drive
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Modals */}
      <DocumentSelectorModal
        isOpen={showDocumentSelector}
        onClose={() => setShowDocumentSelector(false)}
        organizationSlug={organizationSlug}
      />

      <FileUploadModal
        isOpen={showFileUpload}
        onClose={() => setShowFileUpload(false)}
        organizationSlug={organizationSlug}
      />

      <GoogleDriveImportModal
        isOpen={showGoogleDrive}
        onClose={() => setShowGoogleDrive(false)}
        organizationSlug={organizationSlug}
      />
    </>
  );
}
```

### 25. Document Selector Modal

**New component: `src/components/knowledge-base/DocumentSelectorModal.tsx`**

```typescript
"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { getAllFileCategories, getFileCategoryLabel } from "@/lib/fileCategories";

interface DocumentSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  organizationSlug: string;
}

export function DocumentSelectorModal({
  isOpen,
  onClose,
  organizationSlug,
}: DocumentSelectorModalProps) {
  const [documents, setDocuments] = useState<any[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [fileCategory, setFileCategory] = useState<string>("GENERAL");
  const [successNotes, setSuccessNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchDocuments();
    }
  }, [isOpen]);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/documents?organizationSlug=${organizationSlug}`);
      const data = await response.json();
      // Filter out documents already in KB
      const nonKBDocs = data.documents.filter((doc: any) => !doc.isKnowledgeBase);
      setDocuments(nonKBDocs);
    } catch (error) {
      toast.error("Failed to load documents");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (selectedIds.length === 0) {
      toast.error("Please select at least one document");
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch("/api/documents/bulk-update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentIds: selectedIds,
          fileCategory,
          metadata: {
            successNotes: successNotes || undefined,
          },
        }),
      });

      if (!response.ok) throw new Error("Failed to add documents");

      toast.success(`Added ${selectedIds.length} document(s) to knowledge base`);
      onClose();
      window.location.reload(); // Refresh to show new KB docs
    } catch (error) {
      toast.error("Failed to add documents to knowledge base");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Documents to Knowledge Base</DialogTitle>
          <DialogDescription>
            Select existing documents to add to your knowledge base
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Document Type Selector */}
          <div className="space-y-2">
            <Label>Document Type</Label>
            <Select value={fileCategory} onValueChange={setFileCategory}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {getKnowledgeBaseFileCategories().map((type) => (
                  <SelectItem key={type} value={type}>
                    {getFileCategoryLabel(type)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Document List */}
          <div className="space-y-3">
            <Label>Select Documents ({selectedIds.length} selected)</Label>
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : documents.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No documents available to add
              </div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto border rounded-lg p-3">
                {documents.map((doc) => (
                  <div key={doc.id} className="flex items-start space-x-3 p-2 hover:bg-accent/50 rounded">
                    <Checkbox
                      checked={selectedIds.includes(doc.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedIds([...selectedIds, doc.id]);
                        } else {
                          setSelectedIds(selectedIds.filter((id) => id !== doc.id));
                        }
                      }}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="font-medium">{doc.title}</div>
                      <div className="text-xs text-muted-foreground">
                        {doc.fileType || 'Tiptap Document'} • Created {new Date(doc.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Success Notes */}
          {selectedIds.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="success-notes">Notes (Optional)</Label>
              <Textarea
                id="success-notes"
                placeholder="Add notes about these documents..."
                value={successNotes}
                onChange={(e) => setSuccessNotes(e.target.value)}
                rows={3}
                className="resize-none"
              />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={selectedIds.length === 0 || submitting}
          >
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Adding...
              </>
            ) : (
              `Add ${selectedIds.length} Document${selectedIds.length !== 1 ? 's' : ''}`
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

### 26. Knowledge Base Category List

**New component: `src/components/knowledge-base/KnowledgeBaseCategoryList.tsx`**

Shows all document types with category-level toggles:

```typescript
"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { getFileCategoryLabel, getFileCategoryIcon, getFileCategoryDescription } from "@/lib/fileCategories";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface DocumentsByTypeData {
  type: string;
  documents: any[];
  hasKBDocs: boolean;
  allInKB: boolean;
  totalCount: number;
  kbCount: number;
}

interface KnowledgeBaseCategoryListProps {
  documentsByType: DocumentsByTypeData[];
  organizationSlug: string;
  organizationId: string;
}

export function KnowledgeBaseCategoryList({
  documentsByType,
  organizationSlug,
  organizationId,
}: KnowledgeBaseCategoryListProps) {
  const [expandedTypes, setExpandedTypes] = useState<Set<string>>(new Set());
  const [togglingType, setTogglingType] = useState<string | null>(null);

  const toggleExpand = (type: string) => {
    setExpandedTypes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(type)) {
        newSet.delete(type);
      } else {
        newSet.add(type);
      }
      return newSet;
    });
  };

  const handleToggleType = async (type: string, currentState: boolean) => {
    setTogglingType(type);
    try {
      const response = await fetch("/api/documents/toggle-category", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileCategory: type,
          isKnowledgeBase: !currentState,
        }),
      });

      if (!response.ok) throw new Error("Failed to toggle");

      const data = await response.json();
      toast.success(
        `${data.isKnowledgeBase ? "Added" : "Removed"} ${data.updated} document(s) ${data.isKnowledgeBase ? "to" : "from"} knowledge base`
      );

      // Refresh page to show updated state
      window.location.reload();
    } catch (error) {
      toast.error("Failed to update knowledge base");
    } finally {
      setTogglingType(null);
    }
  };

  return (
    <div className="space-y-3">
      {documentsByType.map(({ type, documents, hasKBDocs, totalCount, kbCount }) => {
        const Icon = getFileCategoryIcon(type as any);
        const isExpanded = expandedTypes.has(type);
        const isToggling = togglingType === type;

        return (
          <Card key={type} className="overflow-hidden">
            <div className="p-4">
              <div className="flex items-center justify-between gap-4">
                {/* Left side - Category info */}
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <Icon className="h-6 w-6 text-primary flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-base">
                        {getFileCategoryLabel(type as any)}
                      </h3>
                      <Badge variant="outline" className="text-xs">
                        {kbCount}/{totalCount}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {getFileCategoryDescription(type as any)}
                    </p>
                  </div>
                </div>

                {/* Right side - Toggle and expand */}
                <div className="flex items-center gap-3">
                  {totalCount > 0 && (
                    <>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                          {hasKBDocs ? "In Knowledge Base" : "Not in Knowledge Base"}
                        </span>
                        <Switch
                          checked={hasKBDocs}
                          onCheckedChange={() => handleToggleType(type, hasKBDocs)}
                          disabled={totalCount === 0 || isToggling}
                          className="data-[state=checked]:bg-green-600"
                        />
                      </div>

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => toggleExpand(type)}
                        className="h-8 w-8"
                      >
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </Button>
                    </>
                  )}
                </div>
              </div>

              {/* Collapsible document list */}
              {totalCount > 0 && isExpanded && (
                <div className="mt-4 pt-4 border-t space-y-2">
                  {documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm truncate">
                            {doc.title}
                          </span>
                          {doc.isKnowledgeBase && (
                            <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                              In KB
                            </Badge>
                          )}
                        </div>
                        {doc.application && (
                          <p className="text-xs text-muted-foreground mt-1">
                            From: {doc.application.title}
                            {doc.application.opportunityAgency && ` • ${doc.application.opportunityAgency}`}
                          </p>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          if (doc.contentType === "json") {
                            window.open(`/private/${organizationSlug}/editor/${doc.id}`, '_blank');
                          } else {
                            window.open(doc.fileUrl, '_blank');
                          }
                        }}
                      >
                        View
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        );
      })}
    </div>
  );
}
```

---

## Testing Checklist

### Core Functionality

- [ ] Upload file with document type selection
- [ ] File automatically extracts text and vectorizes
- [ ] Create Tiptap document, text extracted and vectorized
- [ ] Update Tiptap document, re-vectorization triggered
- [ ] Document appears in KB page under correct type accordion
- [ ] Select existing documents and add to KB (bulk)
- [ ] Remove document from KB (sets isKnowledgeBase: false)
- [ ] Vectorization status displays correctly (pending/processing/completed/failed)

### AI Integration

- [ ] AI context includes KB documents correctly
- [ ] AI context respects document type toggles
- [ ] Source application info fetched via FK and shown in AI context
- [ ] Source opportunity info fetched via FK and shown in AI context
- [ ] Custom metadata (successNotes) included in AI context
- [ ] Chat assistant uses correct enabled document types
- [ ] Editor assistant uses correct enabled document types

### UI/UX

- [ ] KB page loads and shows ALL document types (even those with 0 documents)
- [ ] Each category shows total count and KB count (e.g., "3/10")
- [ ] Category toggle switch shows correct state (ON if any docs are in KB)
- [ ] Toggle switch updates all documents of that type
- [ ] Toggling ON triggers vectorization for non-vectorized docs
- [ ] Toggling OFF removes all docs of that type from KB
- [ ] Categories with documents can be expanded to show document list
- [ ] Document list shows KB status badge for each document
- [ ] "Add" dropdown shows 3 options (Documents, Upload, Google Drive)
- [ ] Document selector modal works
- [ ] File upload modal works
- [ ] Google Drive import works
- [ ] Can view individual documents (opens in editor or file viewer)
- [ ] Source info displays for documents with FK relationships

### Performance

- [ ] Vectorization doesn't block document creation
- [ ] Large documents (10MB) vectorize successfully
- [ ] Multiple documents can be added to KB simultaneously
- [ ] KB page loads quickly with 100+ documents

---

## Implementation Order

1. **Database Schema** (Steps 1-9)
   - Add FileCategory enum
   - Update Document model with new fields
   - Create DocumentVector table
   - Update relations
   - Run migration
   - Generate Prisma client

2. **Utilities** (Steps 21-22)
   - Create fileCategories.ts helper
   - Create textExtraction.ts helper

3. **API - Vectorization** (Step 13)
   - Create /api/documents/vectorize endpoint
   - Test vectorization pipeline

4. **API - Document Updates** (Steps 10-12)
   - Update upload endpoint
   - Update create endpoint
   - Update update endpoint
   - Add vectorization triggers

5. **API - Knowledge Base** (Steps 14-18)
   - Create /api/knowledge-base endpoint
   - Extend existing PUT /api/documents/[documentId] for KB fields
   - Create /api/documents/bulk-update endpoint (bulk operations)
   - Create /api/documents/toggle-category endpoint (category-level toggle)

6. **AI Integration** (Steps 19-20)
   - Update getOrgKnowledgeBase function
   - Verify AI assistant endpoints

7. **Frontend - Components** (Steps 23-26)
   - Create KB page
   - Create header with dropdown
   - Create document selector modal
   - Create file upload modal
   - Create category list component with toggles

8. **Testing** (All checklist items)
   - Test each feature thoroughly
   - Fix any bugs
   - Performance testing

---

## Key Benefits

1. **Unified System**: One document model, simpler architecture
2. **Automatic Vectorization**: All documents get AI capabilities
3. **Flexible Categorization**: Any document can be any type
4. **Better Organization**: Types group documents logically
5. **Easier Management**: KB is just a filtered view
6. **Source Tracking**: FK references preserve relationships
7. **Simpler Codebase**: Remove entire KB subsystem
8. **No Duplication**: Documents exist in one place

---

## Key Files Modified

- `prisma/schema.prisma`
- `src/app/api/documents/upload/route.ts`
- `src/app/api/documents/route.ts`
- `src/app/api/documents/[documentId]/route.ts`
- `src/lib/getOrgKnowledgeBase.ts`
- `src/app/api/ai/assistant-agent/route.ts`
- `src/app/api/chat/editor/route.ts`

## Key Files Created

- `src/app/api/documents/vectorize/route.ts`
- `src/app/api/documents/route.ts` (extend GET with KB filters)
- `src/app/api/documents/[documentId]/route.ts` (extend PUT with KB fields)
- `src/app/api/documents/bulk-update/route.ts` (NEW - bulk operations)
- `src/app/api/documents/toggle-category/route.ts` (NEW - category-level toggle)
- `src/lib/fileCategories.ts`
- `src/lib/textExtraction.ts`
- `src/app/private/[slug]/knowledge-base/page.tsx`
- `src/components/knowledge-base/KnowledgeBaseHeader.tsx`
- `src/components/knowledge-base/DocumentSelectorModal.tsx`
- `src/components/knowledge-base/FileUploadModal.tsx`
- `src/components/knowledge-base/GoogleDriveImportModal.tsx`
- `src/components/knowledge-base/KnowledgeBaseCategoryList.tsx`
- `scripts/migrate-kb-to-documents.ts`

---

**This unified approach treats the knowledge base as a view layer over your existing documents rather than a separate system, resulting in a much cleaner and more maintainable architecture!**

---

## UX Summary: Category-Level Toggle Behavior

**How it works:**

1. Knowledge Base page displays ALL 11 file categories (even if no documents exist for that category)
2. Each category card shows:
   - Category name and icon
   - Document count badge (e.g., "3/10" means 3 out of 10 documents are in KB)
   - Toggle switch (ON if any documents of that type are in KB)
   - Expand button (to view document list)

3. **When user toggles a category ON:**
   - ALL documents of that type get `isKnowledgeBase: true`
   - Non-vectorized documents trigger vectorization
   - AI assistants will include all documents of that type in context

4. **When user toggles a category OFF:**
   - ALL documents of that type get `isKnowledgeBase: false`
   - Documents remain in the system (not deleted)
   - Vectors remain (for quick re-enabling)
   - AI assistants will exclude all documents of that type from context

5. **Document list (expanded view):**
   - Shows all documents of that type
   - Each document shows "In KB" badge if included
   - "View" button to open document
   - Documents cannot be individually toggled (only at category level)

**Benefits:**

- Simple, intuitive control at the category level
- Easy to enable/disable entire categories for AI context
- No confusion about which individual documents are included
- Bulk operations are fast and efficient
