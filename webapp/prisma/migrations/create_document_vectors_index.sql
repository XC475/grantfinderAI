-- Create pgvector index for document_vectors table
-- This must be run manually after Prisma migration creates the table
-- Prisma cannot create pgvector indexes, so we use raw SQL

-- Ensure pgvector extension is enabled
CREATE EXTENSION IF NOT EXISTS vector;

-- Drop the B-tree index if Prisma created one (it will fail, but safe to try)
DROP INDEX IF EXISTS app.idx_document_vectors_embedding;

-- Ensure the embedding column has dimensions (1536 for text-embedding-3-small)
ALTER TABLE app.document_vectors 
ALTER COLUMN embedding TYPE vector(1536) 
USING embedding::vector(1536);

-- Create proper pgvector index using ivfflat (same as old knowledge_base_vectors)
CREATE INDEX idx_document_vectors_embedding 
ON app.document_vectors 
USING ivfflat (embedding vector_cosine_ops);

