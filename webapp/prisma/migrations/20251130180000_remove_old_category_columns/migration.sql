-- Remove old fileCategory column from documents table
ALTER TABLE "app"."documents" DROP COLUMN IF EXISTS "fileCategory";

-- Remove old enabledCategoriesChat and enabledCategoriesEditor columns from user_ai_context_settings
ALTER TABLE "app"."user_ai_context_settings" DROP COLUMN IF EXISTS "enabledCategoriesChat";
ALTER TABLE "app"."user_ai_context_settings" DROP COLUMN IF EXISTS "enabledCategoriesEditor";

-- Drop the FileCategory enum type
DROP TYPE IF EXISTS "app"."FileCategory";
