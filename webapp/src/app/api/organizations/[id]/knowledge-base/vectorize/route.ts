import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import OpenAI from "openai";
import crypto from "crypto";
import { chunkText } from "@/lib/textChunking";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const EMBEDDING_MODEL = "text-embedding-3-small";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: organizationId } = await params;

  // Auth check
  const apiKey = req.headers.get("x-api-key");
  if (!apiKey || apiKey !== process.env.INTERNAL_API_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Get all knowledge base docs that need vectorization
  const docsToVectorize = await prisma.knowledgeBaseDocument.findMany({
    where: {
      organizationId,
      vectorizationStatus: { in: ["PENDING", "FAILED"] },
    },
  });

  let vectorizedCount = 0;
  const errors: Array<{ id: string; error: string }> = [];

  for (const doc of docsToVectorize) {
    try {
      await prisma.knowledgeBaseDocument.update({
        where: { id: doc.id },
        data: { vectorizationStatus: "PROCESSING" },
      });

      // Chunk the text
      const chunks = await chunkText(doc.extractedText);

      // Delete old vectors for this document
      await prisma.knowledgeBaseVector.deleteMany({
        where: { kbDocumentId: doc.id },
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
          INSERT INTO app.knowledge_base_vectors (
            kb_document_id,
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
            ${organizationId},
            ${chunk.index},
            ${chunks.length},
            ${chunk.content},
            ${`[${embedding.join(",")}]`}::vector,
            ${doc.fileName},
            ${doc.fileType},
            ${contentHash},
            NOW(),
            ${EMBEDDING_MODEL}
          )
        `;
      }

      // Update status to COMPLETED
      await prisma.knowledgeBaseDocument.update({
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
      await prisma.knowledgeBaseDocument.update({
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
    errors: errors.length > 0 ? errors : undefined,
  });
}
