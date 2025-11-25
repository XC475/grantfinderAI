import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

export interface TextChunk {
  content: string;
  index: number;
  startChar: number;
  endChar: number;
}

export async function chunkText(
  text: string,
  options?: {
    chunkSize?: number;
    chunkOverlap?: number;
  }
): Promise<TextChunk[]> {
  const chunkSize = options?.chunkSize || 1000; // tokens ~= chars/4
  const chunkOverlap = options?.chunkOverlap || 200;

  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: chunkSize * 4, // Convert tokens to chars
    chunkOverlap: chunkOverlap * 4,
    separators: ["\n\n", "\n", ". ", " ", ""],
  });

  const chunks = await splitter.createDocuments([text]);

  return chunks.map((chunk, index) => ({
    content: chunk.pageContent,
    index,
    startChar: 0,
    endChar: chunk.pageContent.length,
  }));
}
