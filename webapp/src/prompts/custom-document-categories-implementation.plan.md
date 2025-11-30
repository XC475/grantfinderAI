<!-- 93e70b4e-2746-4a7a-80c8-84ba98aa7fe9 38832dca-ddc8-46b6-baee-9f5bc9dbaeea -->

# Custom Document Tags Implementation Plan

## Overview

Transform the file category system from a global enum to organization-specific custom tags. Each organization will have its own set of document tags that can be managed by any organization member. Default tags (General, Winning Application, Template, Financials and Budget) will be created automatically when an organization is created.

## Database Schema Changes

### 1. Create DocumentTag Model

**File: `prisma/schema.prisma`**

Add new model:

```prisma
model DocumentTag {
  id             String       @id @default(cuid())
  name           String
  organizationId String
  createdAt      DateTime     @default(now())
  updatedAt      DateTime     @updatedAt
  organization   Organization @relation("OrganizationTags", fields: [organizationId], references: [id], onDelete: Cascade)
  documents      Document[]   @relation("DocumentTags")

  @@unique([organizationId, name])
  @@index([organizationId])
  @@map("document_tags")
  @@schema("app")
}
```

### 2. Update Organization Model

**File: `prisma/schema.prisma`**

Add relation:

```prisma
model Organization {
  // ... existing fields ...
  documentTags DocumentTag[] @relation("OrganizationTags")
  // ... rest of model ...
}
```

### 3. Update Document Model

**File: `prisma/schema.prisma`**

Change fileCategory field to fileTag:

```prisma
model Document {
  // ... existing fields ...
  fileTagId  String?
  fileTag    DocumentTag? @relation("DocumentTags", fields: [fileTagId], references: [id], onDelete: SetNull)
  // Remove: fileCategory FileCategory @default(GENERAL)
  // ... rest of model ...

  // Update indexes
  @@index([fileTagId])
  @@index([organizationId, fileTagId])
  @@index([organizationId, fileTagId, isKnowledgeBase])
}
```

### 4. Remove FileCategory Enum

**File: `prisma/schema.prisma`**

Remove the enum definition (lines 441-455).

## Default Tags Creation

### 5. Create Default Tags Helper

**File: `src/lib/documentTags.ts` (new file)**

Create utility function:

```typescript
import prisma from "@/lib/prisma";

const DEFAULT_TAGS = [
  "General",
  "Winning Application",
  "Template",
  "Financials and Budget",
];

export async function createDefaultTags(organizationId: string) {
  const tags = await Promise.all(
    DEFAULT_TAGS.map((name) =>
      prisma.documentTag.create({
        data: {
          name,
          organizationId,
        },
      })
    )
  );
  return tags;
}
```

### 6. Update Organization Creation Points

**File: `database-trigger.sql`**

- Add trigger or function to create default tags after organization insert

**File: `src/app/api/admin/users/route.ts`**

- After creating organization (lines 127-133, 137-143), call `createDefaultTags()`

**File: `src/app/api/organizations/invite-member/route.ts`**

- If creating new organization, call `createDefaultTags()`

## API Routes

### 7. Create Document Tags API

**File: `src/app/api/document-tags/route.ts` (new file)**

- GET: List all tags for organization
- POST: Create new tag

**File: `src/app/api/document-tags/[tagId]/route.ts` (new file)**

- PUT: Update tag name
- DELETE: Delete tag (with validation - cannot delete if documents use it)

### 8. Update Documents API

**File: `src/app/api/documents/route.ts`**

- Update queries to use `fileTagId` instead of `fileCategory` enum
- Update filtering logic (change query param from `fileCategory` to `fileTag`)

**File: `src/app/api/documents/[documentId]/route.ts`**

- Update to accept `fileTagId` instead of `fileCategory`

**File: `src/app/api/documents/toggle-category/route.ts`**

- Rename to `toggle-tag/route.ts`
- Update to use `fileTag` and `fileTagId` instead of `fileCategory`

**File: `src/app/api/documents/bulk-update/route.ts`**

- Update to use `fileTag` and `fileTagId` instead of `fileCategory`

## UI Changes

### 9. Rename Knowledge Base Page to Documents

**File: `src/app/private/[slug]/settings/knowledge-base/page.tsx`**

- Rename file to `documents/page.tsx`
- Update page title from "Knowledge Base" to "Documents"
- Update description

### 10. Update Sidebar

**File: `src/components/sidebar/app-sidebar.tsx`**

- Update navSettings item:
  - Change title from "Knowledge Base" to "Documents"
  - Change url from `/settings/knowledge-base` to `/settings/documents`
  - Optionally change icon from Brain to FileText or Files

### 11. Create Document Tags Management Component

**File: `src/components/documents/DocumentTagsManager.tsx` (new file)**

Create component with:

- List of tags with edit/delete actions
- Add new tag form
- Validation (unique names, cannot delete if in use)
- Uses API routes from step 7

### 12. Update Documents Settings Page

**File: `src/app/private/[slug]/settings/documents/page.tsx`**

Restructure to have two sections:

1. **Document Tags** section (new, above)
   - Render `DocumentTagsManager` component

2. **Knowledge Base** section (existing, below)
   - Keep existing `KnowledgeBase` component

### 13. Update KnowledgeBase Component

**File: `src/components/knowledge-base/KnowledgeBase.tsx`**

- Update `fetchDocuments()` to use `fileTagId` instead of enum
- Update tag filtering logic (change `fileCategory` param to `fileTag`)

### 14. Update KnowledgeBaseCategoryList Component

**File: `src/components/knowledge-base/KnowledgeBaseCategoryList.tsx`**

- Rename to `KnowledgeBaseTagList.tsx`
- Remove dependency on `FileCategory` enum
- Fetch tag names from API or props
- Update to work with custom tag names
- Update all variable names from "category" to "tag"

## Utility Updates

### 15. Rename and Update File Categories Utility

**File: `src/lib/fileCategories.ts`**

- Rename file to `src/lib/fileTags.ts`
- Refactor to work with custom tags:
  - Remove enum-based functions
  - Create functions that fetch tags from database
  - Rename functions: `getFileCategoryLabel()` -> `getFileTagLabel()`, `getFileCategoryIcon()` -> `getFileTagIcon()`, etc.
  - Update to accept tag object instead of enum

### 16. Update All FileCategory References

Files to update (change "category" to "tag" throughout):

- `src/lib/getOrgKnowledgeBase.ts` - Update tag filtering (enabledCategoriesChat -> enabledTagsChat, enabledCategoriesEditor -> enabledTagsEditor, includeFileCategories -> includeFileTags, excludeFileCategories -> excludeFileTags)
- `src/lib/ai/knowledgeBaseRAG.ts` - Update tag queries (fileCategory -> fileTag, enabledCategories -> enabledTags)
- `src/lib/ai/prompts/tools/knowledgeBaseRAG.ts` - Update if needed
- `src/components/knowledge-base/AddDocumentsModal.tsx` - Update tag display (fileCategory -> fileTag)
- `src/components/folders/FolderList.tsx` - Update tag usage (fileCategory -> fileTag, onChangeCategory -> onChangeTag, "Category" -> "Tag" in UI)
- `src/components/folders/CreateMenu.tsx` - Update tag selection
- `src/components/folders/DocumentsView.tsx` - Update tag display (fileCategory -> fileTag)
- `src/app/api/applications/[applicationId]/documents/route.ts` - Update tag handling
- `src/app/api/documents/upload/route.ts` - Update tag handling
- `src/app/api/documents/[documentId]/copy/route.ts` - Update tag handling
- `src/app/api/google-drive/import/route.ts` - Update tag handling
- `src/components/google-drive/ImportPicker.tsx` - Update tag display
- `src/app/private/[slug]/documents/[[...folderPath]]/page.tsx` - Update tag usage
- All other files that reference FileCategory or fileCategory

## Migration Considerations

### 17. Database Migration Strategy

The migration needs to:

1. Create the new `document_tags` table
2. Add `fileTagId` column to `documents` table
3. Create default tags for all existing organizations
4. Migrate existing documents to use tags (map enum values to tag names)
5. Migrate UserAIContextSettings from enum arrays to string arrays
6. Remove old `fileCategory` enum column
7. Drop `FileCategory` enum type

**File: Create migration script `prisma/migrations/[timestamp]_migrate_to_document_tags/migration.sql`**

The migration should:

1. **Create document_tags table:**

```sql
CREATE TABLE IF NOT EXISTS "app"."document_tags" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "document_tags_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "document_tags_organizationId_name_key" ON "app"."document_tags"("organizationId", "name");
CREATE INDEX "document_tags_organizationId_idx" ON "app"."document_tags"("organizationId");
```

2. **Add fileTagId to documents:**

```sql
ALTER TABLE "app"."documents" ADD COLUMN "fileTagId" TEXT;
CREATE INDEX "documents_fileTagId_idx" ON "app"."documents"("fileTagId");
CREATE INDEX "documents_organizationId_fileTagId_idx" ON "app"."documents"("organizationId", "fileTagId");
CREATE INDEX "documents_organizationId_fileTagId_isKnowledgeBase_idx" ON "app"."documents"("organizationId", "fileTagId", "isKnowledgeBase");
```

3. **Create default tags for all existing organizations:**

```sql
-- Insert default tags for each organization
INSERT INTO "app"."document_tags" ("id", "name", "organizationId", "createdAt", "updatedAt")
SELECT
  gen_random_uuid()::text as id,
  tag_name,
  o.id as "organizationId",
  NOW() as "createdAt",
  NOW() as "updatedAt"
FROM "app"."organizations" o
CROSS JOIN (VALUES
  ('General'),
  ('Winning Application'),
  ('Template'),
  ('Financials and Budget')
) AS tags(tag_name)
ON CONFLICT DO NOTHING;
```

4. **Map enum values to tag names and migrate documents:**

```sql
-- Create mapping function
DO $$
DECLARE
  org_record RECORD;
  tag_record RECORD;
  enum_to_tag_map JSONB := '{
    "GENERAL": "General",
    "WINNING_APPLICATION": "Winning Application",
    "TEMPLATE": "Template",
    "OPPORTUNITY": "Grant Opportunities",
    "AWARD_CONTRACT": "Awards & Contracts",
    "BUDGET_FINANCIAL": "Financials and Budget",
    "PROGRESS_REPORT": "Progress Reports",
    "FINAL_REPORT": "Final Reports",
    "SUPPORTING_DOCUMENT": "Supporting Documents",
    "CORRESPONDENCE": "Correspondence",
    "COMPLIANCE_RECORDS": "Compliance Records"
  }'::JSONB;
  tag_name TEXT;
  tag_id TEXT;
BEGIN
  -- For each document, find or create matching tag and update fileTagId
  FOR org_record IN SELECT id FROM "app"."organizations" LOOP
    -- Ensure all default tags exist for this org
    INSERT INTO "app"."document_tags" ("id", "name", "organizationId", "createdAt", "updatedAt")
    SELECT
      gen_random_uuid()::text,
      tag_name,
      org_record.id,
      NOW(),
      NOW()
    FROM (VALUES
      ('General'),
      ('Winning Application'),
      ('Template'),
      ('Financials and Budget')
    ) AS defaults(tag_name)
    ON CONFLICT ("organizationId", "name") DO NOTHING;

    -- Migrate documents
    FOR tag_name, tag_id IN
      SELECT name, id FROM "app"."document_tags" WHERE "organizationId" = org_record.id
    LOOP
      -- Update documents that match enum values mapped to this tag
      UPDATE "app"."documents" d
      SET "fileTagId" = tag_id
      WHERE d."organizationId" = org_record.id
        AND d."fileCategory"::text = ANY(
          SELECT jsonb_object_keys(enum_to_tag_map)
          WHERE enum_to_tag_map->>jsonb_object_keys(enum_to_tag_map) = tag_name
        )
        AND d."fileTagId" IS NULL;
    END LOOP;
  END LOOP;
END $$;
```

5. **Migrate UserAIContextSettings:**

```sql
-- Add new columns
ALTER TABLE "app"."user_ai_context_settings"
  ADD COLUMN "enabledTagsChat" TEXT[],
  ADD COLUMN "enabledTagsEditor" TEXT[];

-- Migrate data: convert enum values to tag names
UPDATE "app"."user_ai_context_settings" uacs
SET
  "enabledTagsChat" = ARRAY(
    SELECT CASE
      WHEN cat = 'GENERAL' THEN 'General'
      WHEN cat = 'WINNING_APPLICATION' THEN 'Winning Application'
      WHEN cat = 'TEMPLATE' THEN 'Template'
      WHEN cat = 'OPPORTUNITY' THEN 'Grant Opportunities'
      WHEN cat = 'AWARD_CONTRACT' THEN 'Awards & Contracts'
      WHEN cat = 'BUDGET_FINANCIAL' THEN 'Financials and Budget'
      WHEN cat = 'PROGRESS_REPORT' THEN 'Progress Reports'
      WHEN cat = 'FINAL_REPORT' THEN 'Final Reports'
      WHEN cat = 'SUPPORTING_DOCUMENT' THEN 'Supporting Documents'
      WHEN cat = 'CORRESPONDENCE' THEN 'Correspondence'
      WHEN cat = 'COMPLIANCE_RECORDS' THEN 'Compliance Records'
      ELSE cat::text
    END
    FROM unnest(uacs."enabledCategoriesChat"::text[]) AS cat
  ),
  "enabledTagsEditor" = ARRAY(
    SELECT CASE
      WHEN cat = 'GENERAL' THEN 'General'
      WHEN cat = 'WINNING_APPLICATION' THEN 'Winning Application'
      WHEN cat = 'TEMPLATE' THEN 'Template'
      WHEN cat = 'OPPORTUNITY' THEN 'Grant Opportunities'
      WHEN cat = 'AWARD_CONTRACT' THEN 'Awards & Contracts'
      WHEN cat = 'BUDGET_FINANCIAL' THEN 'Financials and Budget'
      WHEN cat = 'PROGRESS_REPORT' THEN 'Progress Reports'
      WHEN cat = 'FINAL_REPORT' THEN 'Final Reports'
      WHEN cat = 'SUPPORTING_DOCUMENT' THEN 'Supporting Documents'
      WHEN cat = 'CORRESPONDENCE' THEN 'Correspondence'
      WHEN cat = 'COMPLIANCE_RECORDS' THEN 'Compliance Records'
      ELSE cat::text
    END
    FROM unnest(uacs."enabledCategoriesEditor"::text[]) AS cat
  )
WHERE "enabledCategoriesChat" IS NOT NULL OR "enabledCategoriesEditor" IS NOT NULL;

-- Set defaults for null values
UPDATE "app"."user_ai_context_settings"
SET
  "enabledTagsChat" = ARRAY['General', 'Winning Application', 'Template', 'Financials and Budget']
WHERE "enabledTagsChat" IS NULL;

UPDATE "app"."user_ai_context_settings"
SET
  "enabledTagsEditor" = ARRAY['General', 'Winning Application', 'Template', 'Financials and Budget']
WHERE "enabledTagsEditor" IS NULL;

-- Remove old columns (after verifying migration)
-- ALTER TABLE "app"."user_ai_context_settings" DROP COLUMN "enabledCategoriesChat";
-- ALTER TABLE "app"."user_ai_context_settings" DROP COLUMN "enabledCategoriesEditor";
```

6. **Add foreign key constraint:**

```sql
ALTER TABLE "app"."documents"
  ADD CONSTRAINT "documents_fileTagId_fkey"
  FOREIGN KEY ("fileTagId")
  REFERENCES "app"."document_tags"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
```

7. **Remove old fileCategory column and enum (after verification):**

```sql
-- Remove old column
ALTER TABLE "app"."documents" DROP COLUMN "fileCategory";

-- Drop enum type (if no longer used)
-- DROP TYPE IF EXISTS "app"."FileCategory";
```

**Note:** The migration should be done in steps with verification between steps. Consider creating a separate verification script to check:

- All organizations have default tags
- All documents have fileTagId set
- UserAIContextSettings have been migrated correctly

### 18. Update UserAIContextSettings Model

**File: `prisma/schema.prisma`**

Update UserAIContextSettings to use tags:

```prisma
model UserAIContextSettings {
  // ... existing fields ...
  enabledTagsChat      String[] @default(["General", "Winning Application", "Template", "Financials and Budget"])
  enabledTagsEditor    String[] @default(["General", "Winning Application", "Template", "Financials and Budget"])
  // Remove: enabledCategoriesChat, enabledCategoriesEditor
  // ... rest of model ...
}
```

Note: This stores tag names as strings, matching the default tag names. Alternatively, could store tag IDs if preferred.

## Testing Checklist

- [ ] New organizations get default tags
- [ ] Tags can be added, edited, deleted
- [ ] Cannot delete tag if documents use it
- [ ] Tag names must be unique per organization
- [ ] Documents page shows tags section above knowledge base
- [ ] Knowledge base filtering works with custom tags
- [ ] All document queries updated to use new system
- [ ] AI context settings work with custom tags
- [ ] All UI text updated from "category/categories" to "tag/tags"
- [ ] All API endpoints updated from "category" to "tag"
- [ ] All variable names updated from "category" to "tag"

### To-dos

- [ ] Create DocumentTag model in Prisma schema with id, name, organizationId
- [ ] Add documentTags relation to Organization model
- [ ] Replace fileCategory enum with fileTagId relation in Document model
- [ ] Remove FileCategory enum from Prisma schema
- [ ] Update UserAIContextSettings to use enabledTagsChat/enabledTagsEditor (String[]) instead of enabledCategoriesChat/enabledCategoriesEditor
- [ ] Create createDefaultTags() function in src/lib/documentTags.ts
- [ ] Update database-trigger.sql to create default tags on org creation
- [ ] Call createDefaultTags() in admin users API after org creation
- [ ] Create /api/document-tags route with GET and POST handlers
- [ ] Create /api/document-tags/[tagId] route with PUT and DELETE handlers
- [ ] Update documents API routes to use fileTagId instead of fileCategory enum
- [ ] Rename /api/documents/toggle-category to /api/documents/toggle-tag and update implementation
- [ ] Update /api/documents/bulk-update to use fileTag instead of fileCategory
- [ ] Rename knowledge-base page to documents and update title/description
- [ ] Update sidebar navSettings to show 'Documents' instead of 'Knowledge Base'
- [ ] Create DocumentTagsManager component for add/edit/delete tags
- [ ] Add Document Tags section above Knowledge Base section in documents page
- [ ] Update KnowledgeBase component to use fileTagId instead of enum
- [ ] Rename KnowledgeBaseCategoryList to KnowledgeBaseTagList and update to work with custom tag names
- [ ] Rename src/lib/fileCategories.ts to src/lib/fileTags.ts and refactor to work with database tags instead of enum
- [ ] Update all files that reference FileCategory enum or fileCategory to use new tag system
- [ ] Update all UI text from "category/categories" to "tag/tags"
- [ ] Update all variable names from "category" to "tag" throughout codebase
- [ ] Create Prisma migration for schema changes
