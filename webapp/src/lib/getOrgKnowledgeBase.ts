import prisma from "@/lib/prisma";

/**
 * Retrieves all active knowledge base documents for an organization
 * and formats them as a context string for AI systems.
 * 
 * @param organizationId - The ID of the organization
 * @returns A formatted string containing all active knowledge base content
 */
export async function getActiveKnowledgeBase(
  organizationId: string
): Promise<string> {
  try {
    const docs = await prisma.knowledgeBaseDocument.findMany({
      where: {
        organizationId,
        isActive: true,
      },
      select: {
        fileName: true,
        extractedText: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (docs.length === 0) {
      return "";
    }

    // Format as context string with clear document boundaries
    return docs
      .map((doc) => `[Document: ${doc.fileName}]\n${doc.extractedText}`)
      .join("\n\n---\n\n");
  } catch (error) {
    console.error("Error fetching active knowledge base:", error);
    return "";
  }
}

