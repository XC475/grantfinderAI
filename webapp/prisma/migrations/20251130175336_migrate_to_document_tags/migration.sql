-- Create document_tags table
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

-- Add fileTagId to documents
ALTER TABLE "app"."documents" ADD COLUMN IF NOT EXISTS "fileTagId" TEXT;
CREATE INDEX IF NOT EXISTS "documents_fileTagId_idx" ON "app"."documents"("fileTagId");
CREATE INDEX IF NOT EXISTS "documents_organizationId_fileTagId_idx" ON "app"."documents"("organizationId", "fileTagId");
CREATE INDEX IF NOT EXISTS "documents_organizationId_fileTagId_isKnowledgeBase_idx" ON "app"."documents"("organizationId", "fileTagId", "isKnowledgeBase");

-- Create default tags for all existing organizations
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

-- Create additional tags that may be needed based on enum values
INSERT INTO "app"."document_tags" ("id", "name", "organizationId", "createdAt", "updatedAt")
SELECT
  gen_random_uuid()::text,
  tag_name,
  o.id,
  NOW(),
  NOW()
FROM "app"."organizations" o
CROSS JOIN (VALUES
  ('Grant Opportunities'),
  ('Awards & Contracts'),
  ('Progress Reports'),
  ('Final Reports'),
  ('Supporting Documents'),
  ('Correspondence'),
  ('Compliance Records')
) AS additional_tags(tag_name)
ON CONFLICT ("organizationId", "name") DO NOTHING;

-- Map enum values to tag names and migrate documents
DO $$
DECLARE
  org_record RECORD;
  doc_record RECORD;
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
  enum_value TEXT;
BEGIN
  -- For each organization
  FOR org_record IN SELECT id FROM "app"."organizations" LOOP
    -- For each document in this organization
    FOR doc_record IN 
      SELECT id, "fileCategory"::text as enum_val
      FROM "app"."documents"
      WHERE "organizationId" = org_record.id
        AND "fileCategory" IS NOT NULL
        AND "fileTagId" IS NULL
    LOOP
      -- Get tag name from enum value
      tag_name := enum_to_tag_map ->> doc_record.enum_val;
      
      IF tag_name IS NOT NULL THEN
        -- Find or create the tag
        SELECT id INTO tag_id
        FROM "app"."document_tags"
        WHERE "organizationId" = org_record.id
          AND name = tag_name;
        
        -- If tag doesn't exist, create it
        IF tag_id IS NULL THEN
          INSERT INTO "app"."document_tags" ("id", "name", "organizationId", "createdAt", "updatedAt")
          VALUES (gen_random_uuid()::text, tag_name, org_record.id, NOW(), NOW())
          RETURNING id INTO tag_id;
        END IF;
        
        -- Update document with tag ID
        UPDATE "app"."documents"
        SET "fileTagId" = tag_id
        WHERE id = doc_record.id;
      END IF;
    END LOOP;
  END LOOP;
END $$;

-- Add new columns to user_ai_context_settings
ALTER TABLE "app"."user_ai_context_settings"
  ADD COLUMN IF NOT EXISTS "enabledTagsChat" TEXT[],
  ADD COLUMN IF NOT EXISTS "enabledTagsEditor" TEXT[];

-- Migrate UserAIContextSettings: convert enum values to tag names
DO $$
DECLARE
  settings_record RECORD;
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
  chat_tags TEXT[];
  editor_tags TEXT[];
  cat TEXT;
  tag_name TEXT;
BEGIN
  FOR settings_record IN 
    SELECT "userId", "enabledCategoriesChat", "enabledCategoriesEditor"
    FROM "app"."user_ai_context_settings"
    WHERE "enabledCategoriesChat" IS NOT NULL OR "enabledCategoriesEditor" IS NOT NULL
  LOOP
    -- Migrate chat categories
    chat_tags := ARRAY[]::TEXT[];
    IF settings_record."enabledCategoriesChat" IS NOT NULL THEN
      FOREACH cat IN ARRAY settings_record."enabledCategoriesChat"::TEXT[]
      LOOP
        tag_name := enum_to_tag_map ->> cat;
        IF tag_name IS NOT NULL THEN
          chat_tags := array_append(chat_tags, tag_name);
        END IF;
      END LOOP;
    END IF;
    
    -- Migrate editor categories
    editor_tags := ARRAY[]::TEXT[];
    IF settings_record."enabledCategoriesEditor" IS NOT NULL THEN
      FOREACH cat IN ARRAY settings_record."enabledCategoriesEditor"::TEXT[]
      LOOP
        tag_name := enum_to_tag_map ->> cat;
        IF tag_name IS NOT NULL THEN
          editor_tags := array_append(editor_tags, tag_name);
        END IF;
      END LOOP;
    END IF;
    
    -- Update the record
    UPDATE "app"."user_ai_context_settings"
    SET
      "enabledTagsChat" = CASE WHEN array_length(chat_tags, 1) > 0 THEN chat_tags ELSE ARRAY['General', 'Winning Application', 'Template', 'Financials and Budget'] END,
      "enabledTagsEditor" = CASE WHEN array_length(editor_tags, 1) > 0 THEN editor_tags ELSE ARRAY['General', 'Winning Application', 'Template', 'Financials and Budget'] END
    WHERE "userId" = settings_record."userId";
  END LOOP;
  
  -- Set defaults for null values
  UPDATE "app"."user_ai_context_settings"
  SET
    "enabledTagsChat" = ARRAY['General', 'Winning Application', 'Template', 'Financials and Budget']
  WHERE "enabledTagsChat" IS NULL;
  
  UPDATE "app"."user_ai_context_settings"
  SET
    "enabledTagsEditor" = ARRAY['General', 'Winning Application', 'Template', 'Financials and Budget']
  WHERE "enabledTagsEditor" IS NULL;
END $$;

-- Add foreign key constraint
ALTER TABLE "app"."documents"
  ADD CONSTRAINT "documents_fileTagId_fkey"
  FOREIGN KEY ("fileTagId")
  REFERENCES "app"."document_tags"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

-- Remove old columns and enum type
ALTER TABLE "app"."documents" DROP COLUMN IF EXISTS "fileCategory";
ALTER TABLE "app"."user_ai_context_settings" DROP COLUMN IF EXISTS "enabledCategoriesChat";
ALTER TABLE "app"."user_ai_context_settings" DROP COLUMN IF EXISTS "enabledCategoriesEditor";
DROP TYPE IF EXISTS "app"."FileCategory";

