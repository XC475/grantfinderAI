import { generateHTML } from "@tiptap/html";
import StarterKit from "@tiptap/starter-kit";

/**
 * Extract plain text from Tiptap JSON content
 */
export function extractTextFromTiptap(content: string): string {
  try {
    const json = JSON.parse(content);
    const html = generateHTML(json, [StarterKit]);
    // Strip HTML tags and normalize whitespace
    return html
      .replace(/<[^>]*>/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  } catch (e) {
    console.error("Failed to extract text from Tiptap content:", e);
    return "";
  }
}

/**
 * Trigger document vectorization (fire and forget)
 */
export async function triggerDocumentVectorization(
  documentId: string,
  organizationId: string
): Promise<void> {
  try {
    const protocol = process.env.NEXT_PUBLIC_SITE_URL?.startsWith("https")
      ? "https"
      : "http";
    const host =
      process.env.NEXT_PUBLIC_SITE_URL?.replace(/^https?:\/\//, "") ||
      "localhost:3000";

    // Fire and forget - don't await
    fetch(`${protocol}://${host}/api/documents/vectorize`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.INTERNAL_API_KEY!,
      },
    }).catch((err) => {
      console.error("Failed to trigger vectorization:", err);
    });
  } catch (error) {
    console.error("Error triggering vectorization:", error);
  }
}

