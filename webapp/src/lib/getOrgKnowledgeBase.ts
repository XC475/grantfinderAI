import prisma from "@/lib/prisma";
import { getFileTagLabel } from "@/lib/fileTags";

interface KBRetrievalOptions {
  context: "chat" | "editor";
}

/**
 * Retrieves all active knowledge base documents for an organization
 * filtered by user's AI context preferences, and formats them as a context string for AI systems.
 *
 * @param organizationId - The ID of the organization (documents are org-level)
 * @param userId - The ID of the user (for fetching user-specific AI context settings)
 * @param options - Retrieval options including context type
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

    // 2. Check if knowledge base is enabled for this context
    const isEnabled =
      options.context === "chat"
        ? (settings?.enableKnowledgeBaseChat ?? true)
        : (settings?.enableKnowledgeBaseEditor ?? true);

    // If knowledge base is disabled, return empty string
    if (!isEnabled) {
      return "";
    }

    // 3. Query documents marked as knowledge base (all documents, no tag filtering)
    const docs = await prisma.document.findMany({
      where: {
        organizationId,
        isKnowledgeBase: true,
        extractedText: { not: null },
      },
      select: {
        title: true,
        extractedText: true,
        fileTag: {
          select: {
            id: true,
            name: true,
          },
        },
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

    // 4. Filter out any documents with null extractedText (defensive check)
    // Type assertion is safe here because:
    // - We filter for extractedText: { not: null } in the query
    // - We filter again here as a defensive check
    // - The structure matches DocumentForAI (metadata is JsonValue but handled safely in formatDocsForAI)
    const validDocs = docs.filter(
      (doc) => doc.extractedText !== null
    ) as DocumentForAI[];

    if (validDocs.length === 0) {
      return "";
    }

    // 5. Format for AI with type labels and metadata from FKs
    return formatDocsForAI(validDocs);
  } catch (error) {
    console.error("Error fetching active knowledge base:", error);
    return "";
  }
}

interface DocumentForAI {
  title: string;
  extractedText: string; // Non-null after filtering
  fileTag: {
    id: string;
    name: string;
  } | null;
  metadata: {
    successNotes?: string;
    tags?: string[];
  } | null;
  applicationId: string | null;
  application: {
    id: string;
    title: string | null; // Prisma returns string | null
    opportunityAgency: string | null;
    opportunityAwardMax: bigint | null;
    opportunityAwardMin: bigint | null;
  } | null;
}

function formatDocsForAI(docs: DocumentForAI[]): string {
  return docs
    .map((doc) => {
      const tagName = doc.fileTag
        ? getFileTagLabel(doc.fileTag.name)
        : "Untagged";
      let header = `[${tagName}: ${doc.title}]`;

      // Add context from existing application relation
      if (doc.application) {
        const appTitle = doc.application.title || "Untitled Application";
        header += `\n(Source: Application "${appTitle}")`;
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
