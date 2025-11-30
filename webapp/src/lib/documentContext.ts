import prisma from "@/lib/prisma";

interface TipTapNode {
  text?: string;
  content?: TipTapNode[];
  type?: string;
}

/**
 * Extract text from TipTap JSON recursively
 */
function extractTextFromTipTap(node: TipTapNode): string {
  if (!node) return "";

  let text = "";

  // If node has text content, add it
  if (node.text) {
    text += node.text;
  }

  // If node has content array, recursively extract from children
  if (node.content && Array.isArray(node.content)) {
    for (const child of node.content) {
      text += extractTextFromTipTap(child);
    }
  }

  // Add line breaks for block-level elements
  if (node.type === "paragraph" || node.type === "heading") {
    text += "\n";
  }

  return text;
}

/**
 * Extract text content from source documents and format for AI context
 *
 * @param documentIds - Array of document IDs to fetch
 * @returns Formatted string with all document contents
 */
export async function getSourceDocumentContext(
  documentIds: string[]
): Promise<string> {
  if (documentIds.length === 0) {
    return "";
  }

  try {
    // Fetch documents from database
    const documents = await prisma.document.findMany({
      where: {
        id: {
          in: documentIds,
        },
      },
      select: {
        id: true,
        title: true,
        content: true,
        fileUrl: true,
        extractedText: true, // Include top-level extractedText field
        metadata: true,
      },
    });

    if (documents.length === 0) {
      return "";
    }

    // Extract text from each document
    const documentTexts: string[] = [];

    for (const doc of documents) {
      let text = "";

      // For uploaded files, use extracted text from top-level field (preferred) or metadata (fallback)
      if (doc.fileUrl) {
        // Prefer top-level extractedText field
        if (doc.extractedText) {
          text = doc.extractedText;
        } else if (doc.metadata) {
          const metadata = doc.metadata as { extractedText?: string };
          if (metadata.extractedText) {
            text = metadata.extractedText;
          }
        }
      }
      // For normal documents, parse TipTap JSON to plain text
      else if (doc.content) {
        try {
          const contentJson =
            typeof doc.content === "string"
              ? JSON.parse(doc.content)
              : doc.content;

          // Extract text from TipTap JSON structure
          text = extractTextFromTipTap(contentJson).trim();
        } catch (error) {
          console.error(`Failed to parse document ${doc.id} content:`, error);
          // Fallback: try to extract text directly if it's already a string
          text = typeof doc.content === "string" ? doc.content : "";
        }
      }

      // Only add documents with actual content
      if (text.trim()) {
        documentTexts.push(`--- Document: ${doc.title} ---\n${text.trim()}\n`);
      }
    }

    if (documentTexts.length === 0) {
      return "";
    }

    // Format with header
    return `SOURCE DOCUMENTS:\n\n${documentTexts.join("\n")}`;
  } catch (error) {
    console.error("Error fetching source document context:", error);
    return "";
  }
}
