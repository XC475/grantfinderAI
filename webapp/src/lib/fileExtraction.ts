import { DocxLoader } from "@langchain/community/document_loaders/fs/docx";
import { CSVLoader } from "@langchain/community/document_loaders/fs/csv";
import { readFile } from "fs/promises";
import type { Document } from "@langchain/core/documents";
import { extractText } from "unpdf";

/**
 * Extract text from a file based on its MIME type.
 * This is a shared utility used by both chat uploads and document uploads.
 * 
 * @param filePath - Path to the temporary file on disk
 * @param mimeType - MIME type of the file
 * @returns Extracted text content
 */
export async function extractTextFromFile(
  filePath: string,
  mimeType: string
): Promise<string> {
  switch (mimeType) {
    case "application/pdf": {
      // Use unpdf (reliable in serverless environments)
      const fileBuffer = await readFile(filePath);
      // Convert Buffer to Uint8Array (required by unpdf)
      const uint8Array = new Uint8Array(fileBuffer);
      const { text } = await extractText(uint8Array);
      // unpdf returns an array of text strings (one per page)
      const extractedText = Array.isArray(text) ? text.join("\n\n") : text;
      return extractedText || "[PDF contains no extractable text]";
    }
    case "application/vnd.openxmlformats-officedocument.wordprocessingml.document": {
      // Use LangChain DocxLoader (works with file paths)
      const loader = new DocxLoader(filePath);
      const documents = await loader.load();
      return documents.map((doc: Document) => doc.pageContent).join("\n\n");
    }
    case "text/plain": {
      // For plain text files, just read the content directly
      const content = await readFile(filePath, "utf-8");
      return content;
    }
    case "text/csv": {
      // Use LangChain CSVLoader (works with file paths)
      const loader = new CSVLoader(filePath);
      const documents = await loader.load();
      return documents.map((doc: Document) => doc.pageContent).join("\n\n");
    }
    default:
      throw new Error(`Unsupported file type: ${mimeType}`);
  }
}

/**
 * Clean extracted text by removing NULL bytes that PostgreSQL can't handle
 * and normalizing whitespace.
 * 
 * @param text - The extracted text to clean
 * @returns Cleaned text
 */
export function cleanExtractedText(text: string): string {
  return text
    .replace(/\0/g, "") // Remove NULL bytes
    .replace(/\s+/g, " ") // Normalize whitespace
    .replace(/\n{3,}/g, "\n\n") // Remove excessive line breaks
    .trim();
}

