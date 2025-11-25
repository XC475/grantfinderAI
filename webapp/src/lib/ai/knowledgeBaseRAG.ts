import OpenAI from "openai";
import prisma from "@/lib/prisma";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function searchKnowledgeBase(
  query: string,
  organizationId: string,
  options?: { topK?: number }
): Promise<string> {
  const topK = options?.topK || 5;

  try {
    // Generate embedding for query
    const embeddingResponse = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: query,
    });
    const queryEmbedding = embeddingResponse.data[0].embedding;

    // Search using cosine similarity in app.knowledge_base_vectors
    const results = await prisma.$queryRaw<
      Array<{
        content: string;
        file_name: string;
        chunk_index: number;
        similarity: number;
      }>
    >`
      SELECT 
        kbv.content,
        kbv.file_name,
        kbv.chunk_index,
        1 - (kbv.embedding <=> ${`[${queryEmbedding.join(",")}]`}::vector) as similarity
      FROM app.knowledge_base_vectors kbv
      INNER JOIN app.knowledge_base_documents kbd ON kbd.id = kbv.kb_document_id
      WHERE kbv.organization_id = ${organizationId}
        AND kbd."isActive" = true
        AND kbd."vectorizationStatus" = 'COMPLETED'
      ORDER BY kbv.embedding <=> ${`[${queryEmbedding.join(",")}]`}::vector
      LIMIT ${topK}
    `;

    if (results.length === 0) {
      return "";
    }

    // Format results for AI context
    const formattedChunks = results.map((r) => {
      return `[Knowledge Base - ${r.file_name} (Chunk ${r.chunk_index + 1})]\n${r.content}`;
    });

    return formattedChunks.join("\n\n---\n\n");
  } catch (error) {
    console.error("Error searching knowledge base:", error);
    return "";
  }
}
