import OpenAI from "openai";
import prisma from "@/lib/prisma";
import { Prisma } from "@/generated/prisma";
import { FileCategory } from "@/generated/prisma";
import { getFileCategoryLabel } from "@/lib/fileCategories";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * Extracts the actual content text from a chunk, removing the metadata prefix.
 * Chunk content format:
 *   Document: {title}
 *   Category: {label}
 *   Folder: {name} (always present, "Root" if no folder)
 *
 *   {actual content}
 */
function extractChunkContent(chunkContent: string): string {
  const lines = chunkContent.split("\n");

  // Find the blank line that separates metadata from content
  let metadataEndIndex = -1;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Check if this is a metadata line
    if (
      line.startsWith("Document:") ||
      line.startsWith("Category:") ||
      line.startsWith("Folder:")
    ) {
      continue;
    }

    // Found blank line - content starts after this
    if (line === "") {
      metadataEndIndex = i;
      break;
    }
  }

  // If we found the metadata separator, return everything after it
  if (metadataEndIndex !== -1 && metadataEndIndex + 1 < lines.length) {
    return lines
      .slice(metadataEndIndex + 1)
      .join("\n")
      .trim();
  }

  // Fallback: remove metadata lines manually (in case format is malformed)
  const filteredLines = lines.filter(
    (line) =>
      !line.trim().startsWith("Document:") &&
      !line.trim().startsWith("Category:") &&
      !line.trim().startsWith("Folder:") &&
      line.trim() !== ""
  );
  return filteredLines.join("\n").trim();
}

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
        dv.chunk_index,
        dv.document_id,
        d.title as document_title,
        d."fileCategory" as document_category,
        f.name as folder_name,
        1 - (dv.embedding <=> '${escapedEmbedding}'::vector) as similarity
      FROM app.document_vectors dv
      INNER JOIN app.documents d ON d.id = dv.document_id
      LEFT JOIN app.folders f ON f.id = d."folderId"
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
        chunk_index: number;
        document_id: string;
        document_title: string;
        document_category: FileCategory;
        folder_name: string | null;
        similarity: number;
      }>
    >(query, organizationId, topK);

    if (results.length === 0) {
      return "";
    }

    console.log(
      `\n🔍 [KnowledgeBaseRAG] Query returned ${results.length} chunks from ${new Set(results.map((r) => r.document_id)).size} unique document(s):`
    );
    results.forEach((r, idx) => {
      console.log(
        `  Chunk ${idx + 1}: Document ID "${r.document_id}", Title: "${r.document_title}", Folder: "${r.folder_name || "Root"}", Chunk Index: ${r.chunk_index}`
      );
    });

    // Group chunks by document_id
    const chunksByDocument = new Map<
      string,
      {
        document_title: string;
        document_category: FileCategory;
        folder_name: string | null;
        chunks: Array<{
          content: string;
          chunk_index: number;
          similarity: number;
        }>;
      }
    >();

    for (const result of results) {
      const documentId = result.document_id;

      if (!chunksByDocument.has(documentId)) {
        chunksByDocument.set(documentId, {
          document_title: result.document_title,
          document_category: result.document_category,
          folder_name: result.folder_name,
          chunks: [],
        });
      }

      const docData = chunksByDocument.get(documentId)!;
      docData.chunks.push({
        content: extractChunkContent(result.content),
        chunk_index: result.chunk_index,
        similarity: result.similarity,
      });
    }

    // Sort chunks within each document by chunk_index
    for (const docData of chunksByDocument.values()) {
      docData.chunks.sort((a, b) => a.chunk_index - b.chunk_index);
    }

    console.log(
      `\n📚 [KnowledgeBaseRAG] After grouping: ${chunksByDocument.size} unique document(s) with chunks:`
    );
    for (const [docId, docData] of chunksByDocument.entries()) {
      console.log(
        `  Document ID: "${docId}", Title: "${docData.document_title}", Folder: "${docData.folder_name || "Root"}", Chunks: ${docData.chunks.length}`
      );
    }

    // Format grouped chunks for AI context
    const formattedDocuments: string[] = [];

    for (const [documentId, docData] of chunksByDocument.entries()) {
      let formatted = `[Knowledge Base - Document: ${docData.document_title}]\n`;
      formatted += `Category: ${getFileCategoryLabel(docData.document_category)}\n`;
      formatted += `Folder: ${docData.folder_name || "Root"}\n`;

      formatted += "\n[Relevant sections from this document:]\n";

      // Add all chunks from this document
      const chunkContents = docData.chunks.map((chunk) => chunk.content);
      formatted += chunkContents.join("\n\n");

      formattedDocuments.push(formatted);
    }

    const finalOutput = formattedDocuments.join("\n\n---\n\n");

    console.log(
      `📝 [KnowledgeBaseRAG] Final formatted output (${formattedDocuments.length} documents):`
    );
    console.log("=".repeat(80));
    console.log(finalOutput);
    console.log("=".repeat(80));

    return finalOutput;
  } catch (error) {
    console.error("Error searching knowledge base:", error);
    return "";
  }
}
