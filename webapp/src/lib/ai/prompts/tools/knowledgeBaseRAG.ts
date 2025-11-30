import {
  FILE_CATEGORY_LABELS,
  FILE_CATEGORY_DESCRIPTIONS,
} from "@/lib/fileCategories";
import { FileCategory } from "@/generated/prisma";

export function buildKnowledgeBaseRAGPrompt(organizationName?: string): string {
  const orgContext = organizationName
    ? `${organizationName}'s`
    : "the organization's";

  // Build category list dynamically
  const categoriesList = Object.values(FileCategory)
    .map((category) => {
      const label = FILE_CATEGORY_LABELS[category];
      const description = FILE_CATEGORY_DESCRIPTIONS[category];
      return `- **${label}**: ${description}`;
    })
    .join("\n");

  return `- **Organization Knowledge Base:**  
  You have access to ${orgContext} uploaded organizational documents through semantic search. When users ask questions, relevant document chunks are automatically retrieved based on semantic similarity to their query and provided in your context.

  **How Semantic Search Works:**
  - User queries are processed through semantic search (matching meaning, not just keywords)
  - The search matches against document chunks where metadata (Document Title, Category, Folder) is embedded in the chunk content text
  - Retrieved chunks are automatically provided in your context - you do not need to perform the search yourself

  **Document Chunk Structure:**
  When chunks are retrieved, they appear in this format:
  \`\`\`
  [Knowledge Base - {file_name} (Chunk {index})]
  Document: {title}
  Category: {category_label}
  Folder: {folder_name} (if applicable)
  
  {actual document content}
  \`\`\`

  **Available Document Categories:**
  ${categoriesList}

  **How Users Can Query the Knowledge Base:**
  Users can ask naturally and the semantic search will automatically find relevant chunks. The search matches against the embedded metadata (Title, Category, Folder) in each chunk's content text, so users can query by:
  
  - **By Document Title**: "find the Annual Budget document", "show me documents about strategic planning", "what documents mention our mission statement?"
  - **By Category**: "show me Template documents", "find Winning Applications", "what Budget & Financial documents do we have?", "find documents in the Templates category"
  - **By Folder**: "what's in the Finance folder?", "show documents in My Folder", "find documents in the Applications folder"
  - **By Content**: Any natural language query about document content - the search matches meaning, so users can ask "what do our past proposals say about student outcomes?" or "show me budget information"
  
  Because Document Title, Category, and Folder are embedded in each chunk's content text, queries mentioning these will find relevant chunks through semantic search. For example, a user asking "show me Template documents" will retrieve chunks that contain "Category: Templates" in their embedded content.

  **Usage Instructions:**
  - **CRITICAL: NEVER mention "chunks", "chunk numbers", or technical implementation details to users.** Chunks are internal technical details - users should only see natural references to documents.
  - **CRITICAL: Deduplicate documents when listing.** Multiple chunks from the same document (same Document Title and Category) represent ONE document. When listing or referencing documents, group all chunks by their Document Title and Category, and present each unique document only ONCE.
  - When multiple chunks from the same document are retrieved, synthesize all the information from those chunks into a single, unified reference to that document. Do not list the same document multiple times.
  - When listing available documents, identify unique documents by their Document Title + Category combination. Each unique combination should appear only once in your response.
  - When referencing retrieved documents, refer to them naturally by their **Document Title** and **Category** (e.g., "the Annual Budget document" or "your Template documents"), never by chunk numbers.
  - Help users understand what categories are available when they ask about document types
  - Use document context to provide personalized assistance aligned with ${orgContext} actual content
  - The semantic search automatically retrieves relevant chunks based on the user's query, so you can reference this information naturally
  - When summarizing or listing documents from the knowledge base, present them as complete, unique documents (e.g., "The Annual Report covers...") rather than exposing chunk-based structure or listing the same document multiple times
  - Focus on the content and meaning, not the technical retrieval mechanism
  - **Example:** If you receive Chunk 2, Chunk 3, and Chunk 5 from "AKFCS-Annual-Report-8.1.2025.pdf" (Category: General), present this as ONE document: "**Document:** AKFCS-Annual-Report-8.1.2025.pdf (Category: General)" with a synthesized summary of all three chunks' content`;
}
