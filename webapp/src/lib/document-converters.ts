import { generateHTML, generateJSON } from "@tiptap/html";
import StarterKit from "@tiptap/starter-kit";
import mammoth from "mammoth";
import { Document as DocxDocument, Paragraph, Packer } from "docx";
import { PDFDocument, StandardFonts, PDFFont } from "pdf-lib";

type TiptapJSON = {
  type: string;
  content?: TiptapJSON[];
  text?: string;
  marks?: { type: string }[];
};

const EMPTY_TIPTAP_DOC: TiptapJSON = {
  type: "doc",
  content: [{ type: "paragraph" }],
};

function parseTiptapJSON(jsonString?: string | null): TiptapJSON {
  if (!jsonString) {
    return EMPTY_TIPTAP_DOC;
  }

  try {
    return JSON.parse(jsonString);
  } catch {
    return EMPTY_TIPTAP_DOC;
  }
}

function htmlToPlainText(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<[^>]+>/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export async function convertGoogleDocToTiptap(
  docxBuffer: Buffer
): Promise<string> {
  const { value: html } = await mammoth.convertToHtml({ buffer: docxBuffer });
  const tiptapJSON = generateJSON(html || "", [StarterKit]) as TiptapJSON;
  return JSON.stringify(tiptapJSON);
}

export function plainTextToTiptap(text: string): string {
  const paragraphs = text
    .split(/\r?\n\r?\n/)
    .map((block) => block.trim())
    .map((block) => {
      if (!block) {
        return { type: "paragraph" };
      }

      return {
        type: "paragraph",
        content: [{ type: "text", text: block }],
      };
    });

  return JSON.stringify({
    type: "doc",
    content: paragraphs.length ? paragraphs : [{ type: "paragraph" }],
  });
}

export function tiptapToHTML(jsonString?: string | null): string {
  const json = parseTiptapJSON(jsonString);
  return generateHTML(json, [StarterKit]);
}

export function tiptapToPlainText(jsonString?: string | null): string {
  const html = tiptapToHTML(jsonString);
  return htmlToPlainText(html);
}

export async function convertTiptapToDocx(tiptapJson: string): Promise<Buffer> {
  const text = tiptapToPlainText(tiptapJson);
  const blocks = text.split(/\r?\n\r?\n/);

  const paragraphs =
    blocks.length > 0 && blocks[0].trim().length > 0
      ? blocks.map((block) => new Paragraph(block))
      : [new Paragraph("")];

  const doc = new DocxDocument({
    sections: [
      {
        properties: {},
        children: paragraphs,
      },
    ],
  });

  return Packer.toBuffer(doc);
}

export function convertTiptapToGoogleDoc(tiptapJson: string): Promise<Buffer> {
  // Google Drive API can convert DOCX to native docs, so reuse DOCX generation
  return convertTiptapToDocx(tiptapJson);
}

export async function convertTiptapToPdf(tiptapJson: string): Promise<Buffer> {
  const text = tiptapToPlainText(tiptapJson) || "";
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontSize = 12;
  const lineHeight = fontSize * 1.4;
  const margin = 50;

  let page = pdfDoc.addPage();
  let { width, height } = page.getSize();
  let cursorY = height - margin;
  const maxWidth = width - margin * 2;

  const lines = wrapText(text, font, fontSize, maxWidth);

  for (const line of lines) {
    if (cursorY < margin) {
      page = pdfDoc.addPage();
      ({ width, height } = page.getSize());
      cursorY = height - margin;
    }

    page.drawText(line, {
      x: margin,
      y: cursorY,
      size: fontSize,
      font,
      lineHeight,
    });

    cursorY -= lineHeight;
  }

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}

function wrapText(
  text: string,
  font: PDFFont,
  fontSize: number,
  maxWidth: number
): string[] {
  if (!text.trim()) {
    return [""];
  }

  const paragraphs = text.split(/\r?\n\r?\n/);
  const lines: string[] = [];

  for (const paragraph of paragraphs) {
    if (!paragraph.trim()) {
      lines.push("");
      continue;
    }

    const words = paragraph.split(/\s+/);
    let currentLine = "";

    for (const word of words) {
      const candidate = currentLine ? `${currentLine} ${word}` : word;
      const width = font.widthOfTextAtSize(candidate, fontSize);

      if (width <= maxWidth) {
        currentLine = candidate;
      } else {
        if (currentLine) {
          lines.push(currentLine);
        }
        currentLine = word;
      }
    }

    if (currentLine) {
      lines.push(currentLine);
    }

    lines.push("");
  }

  return lines;
}
