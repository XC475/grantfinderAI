import prisma from "@/lib/prisma";
import { getFileTagLabel } from "@/lib/fileTags";

interface KBRetrievalOptions {
  context: "chat" | "editor";
  includeFileTags?: string[];
  excludeFileTags?: string[];
}

/**
 * Retrieves all active knowledge base documents for an organization
 * filtered by user's AI context preferences, and formats them as a context string for AI systems.
 *
 * @param organizationId - The ID of the organization (documents are org-level)
 * @param userId - The ID of the user (for fetching user-specific AI context settings)
 * @param options - Retrieval options including context type and filters
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

    // 2. Determine enabled tag names based on context
    const enabledTagNames =
      options.context === "chat"
        ? settings?.enabledTagsChat
        : settings?.enabledTagsEditor;

    // 3. Get tag IDs for enabled tags
    let tagIdsToInclude: string[] | undefined;
    if (enabledTagNames && enabledTagNames.length > 0) {
      const tags = await prisma.documentTag.findMany({
        where: {
          organizationId,
          name: { in: enabledTagNames },
        },
        select: { id: true },
      });
      tagIdsToInclude = tags.map((t) => t.id);
    }

    // 4. Apply filters
    if (options.includeFileTags) {
      const includeTagIds = await prisma.documentTag.findMany({
        where: {
          organizationId,
          name: { in: options.includeFileTags },
        },
        select: { id: true },
      });
      const includeIds = includeTagIds.map((t) => t.id);
      if (tagIdsToInclude) {
        tagIdsToInclude = tagIdsToInclude.filter((id) =>
          includeIds.includes(id)
        );
      } else {
        tagIdsToInclude = includeIds;
      }
    }

    if (options.excludeFileTags) {
      const excludeTagIds = await prisma.documentTag.findMany({
        where: {
          organizationId,
          name: { in: options.excludeFileTags },
        },
        select: { id: true },
      });
      const excludeIds = excludeTagIds.map((t) => t.id);
      if (tagIdsToInclude) {
        tagIdsToInclude = tagIdsToInclude.filter(
          (id) => !excludeIds.includes(id)
        );
      }
    }

    // 5. Query documents marked as knowledge base (still org-level)
    const docs = await prisma.document.findMany({
      where: {
        organizationId,
        isKnowledgeBase: true,
        ...(tagIdsToInclude && tagIdsToInclude.length > 0
          ? { fileTagId: { in: tagIdsToInclude } }
          : {}),
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

    // 5. Filter out any documents with null extractedText (defensive check)
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

    // 6. Format for AI with type labels and metadata from FKs
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
