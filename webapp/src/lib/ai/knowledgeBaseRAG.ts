import OpenAI from "openai";
import prisma from "@/lib/prisma";
import { Prisma } from "@/generated/prisma";
import { FileCategory } from "@/generated/prisma";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function searchKnowledgeBase(
  searchQuery: string,
  organizationId: string,
  options?: {
    topK?: number;
    userId?: string;
    context?: "chat" | "editor";
  }
): Promise<string> {
  const topK = options?.topK || 5;

  try {
    // Get user AI context settings if userId provided
    let enabledCategories: FileCategory[] | null = null;
    if (options?.userId && options?.context) {
      const settings = await prisma.userAIContextSettings.findUnique({
        where: { userId: options.userId },
      });
      enabledCategories =
        options.context === "chat"
          ? settings?.enabledCategoriesChat || null
          : settings?.enabledCategoriesEditor || null;
    }

    // Generate embedding for query
    const embeddingResponse = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: searchQuery,
    });
    const queryEmbedding = embeddingResponse.data[0].embedding;
    const embeddingArrayString = `[${queryEmbedding.join(",")}]`;

    // Build category filter SQL if user settings exist
    let categoryFilterSQL = "";
    if (enabledCategories && enabledCategories.length > 0) {
      const categoriesList = enabledCategories.map((c) => `'${c}'`).join(",");
      categoryFilterSQL = `AND d."fileCategory" = ANY(ARRAY[${categoriesList}]::"FileCategory"[])`;
    }

    // Search using cosine similarity in app.document_vectors
    // Use $queryRawUnsafe to properly handle vector array syntax
    // Template literals try to parameterize the [0.1,0.2,...] array which causes syntax errors
    // Escape single quotes in embedding array to prevent SQL injection (though it's from OpenAI, not user input)
    const escapedEmbedding = embeddingArrayString.replace(/'/g, "''");

    const query = `
      SELECT 
        dv.content,
        dv.file_name,
        dv.chunk_index,
        1 - (dv.embedding <=> '${escapedEmbedding}'::vector) as similarity
      FROM app.document_vectors dv
      INNER JOIN app.documents d ON d.id = dv.document_id
      WHERE dv.organization_id = $1
        AND d."isKnowledgeBase" = true
        AND d."vectorizationStatus" = 'COMPLETED'
        ${categoryFilterSQL}
      ORDER BY dv.embedding <=> '${escapedEmbedding}'::vector
      LIMIT $2
    `;

    const results = await prisma.$queryRawUnsafe<
      Array<{
        content: string;
        file_name: string;
        chunk_index: number;
        similarity: number;
      }>
    >(query, organizationId, topK);

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
