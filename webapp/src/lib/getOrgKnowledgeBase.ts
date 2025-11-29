import prisma from "@/lib/prisma";
import { FileCategory } from "@/generated/prisma";
import { getFileCategoryLabel } from "@/lib/fileCategories";

interface KBRetrievalOptions {
  context: "chat" | "editor";
  includeFileCategories?: FileCategory[];
  excludeFileCategories?: FileCategory[];
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

    // 2. Determine enabled document types based on context
    const enabledTypes =
      options.context === "chat"
        ? settings?.enabledCategoriesChat
        : settings?.enabledCategoriesEditor;

    // 3. Apply filters
    let typesToInclude = enabledTypes || getAllFileCategories();

    if (options.includeFileCategories) {
      typesToInclude = typesToInclude.filter((t) =>
        options.includeFileCategories!.includes(t)
      );
    }

    if (options.excludeFileCategories) {
      typesToInclude = typesToInclude.filter(
        (t) => !options.excludeFileCategories!.includes(t)
      );
    }

    // 4. Query documents marked as knowledge base (still org-level)
    const docs = await prisma.document.findMany({
      where: {
        organizationId,
        isKnowledgeBase: true,
        fileCategory: { in: typesToInclude },
        extractedText: { not: null },
      },
      select: {
        title: true,
        extractedText: true,
        fileCategory: true,
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

    // 5. Format for AI with type labels and metadata from FKs
    return formatDocsForAI(docs);
  } catch (error) {
    console.error("Error fetching active knowledge base:", error);
    return "";
  }
}

function formatDocsForAI(docs: any[]): string {
  return docs
    .map((doc) => {
      let header = `[${getFileCategoryLabel(doc.fileCategory)}: ${doc.title}]`;

      // Add context from existing application relation
      if (doc.application) {
        header += `\n(Source: Application "${doc.application.title}")`;
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

function getAllFileCategories(): FileCategory[] {
  return Object.values(FileCategory);
}
