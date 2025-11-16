import { generateHTML, generateJSON } from "@tiptap/html";
import StarterKit from "@tiptap/starter-kit";
import { TextStyle } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import { FontFamily } from "@tiptap/extension-font-family";
import { TextAlign } from "@tiptap/extension-text-align";
import { Highlight } from "@tiptap/extension-highlight";
import { Subscript } from "@tiptap/extension-subscript";
import { Superscript } from "@tiptap/extension-superscript";
import { Image } from "@tiptap/extension-image";
import FontSize from "tiptap-extension-font-size";
import mammoth from "mammoth";
import {
  Document as DocxDocument,
  Paragraph,
  TextRun,
  AlignmentType,
  HeadingLevel,
  Packer,
} from "docx";

type TiptapJSON = {
  type: string;
  content?: TiptapJSON[];
  text?: string;
  marks?: Array<{
    type: string;
    attrs?: Record<string, any>;
  }>;
  attrs?: Record<string, any>;
};

const EMPTY_TIPTAP_DOC: TiptapJSON = {
  type: "doc",
  content: [{ type: "paragraph" }],
};

// Extensions used in the editor - must match SimpleEditor configuration
const tiptapExtensions = [
  StarterKit,
  TextStyle,
  Color,
  FontFamily,
  FontSize as any, // Type compatibility workaround for third-party extension
  TextAlign.configure({ types: ["heading", "paragraph"] }),
  Highlight,
  Subscript,
  Superscript,
  Image,
];

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
  const tiptapJSON = generateJSON(html || "", tiptapExtensions) as TiptapJSON;
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
  return generateHTML(json, tiptapExtensions);
}

export function tiptapToStyledHTML(jsonString?: string | null): string {
  const html = tiptapToHTML(jsonString);

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    @page {
      margin: 1in;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      font-size: 12pt;
      line-height: 1.6;
      color: #000;
      max-width: 8.5in;
      margin: 0 auto;
      padding: 0;
    }
    h1, h2, h3, h4, h5, h6 {
      margin-top: 1em;
      margin-bottom: 0.5em;
      font-weight: bold;
      line-height: 1.2;
    }
    h1 { font-size: 24pt; }
    h2 { font-size: 20pt; }
    h3 { font-size: 16pt; }
    h4 { font-size: 14pt; }
    h5 { font-size: 12pt; }
    h6 { font-size: 11pt; }
    p {
      margin: 0 0 1em 0;
    }
    strong { font-weight: bold; }
    em { font-style: italic; }
    u { text-decoration: underline; }
    s { text-decoration: line-through; }
    code {
      font-family: 'Courier New', Courier, monospace;
      background-color: #f4f4f4;
      padding: 2px 4px;
      border-radius: 3px;
    }
    pre {
      background-color: #f4f4f4;
      padding: 1em;
      border-radius: 5px;
      overflow-x: auto;
    }
    pre code {
      background: none;
      padding: 0;
    }
    ul, ol {
      margin: 0 0 1em 0;
      padding-left: 2em;
    }
    li {
      margin: 0.25em 0;
    }
    blockquote {
      border-left: 4px solid #ccc;
      margin: 1em 0;
      padding-left: 1em;
      color: #666;
    }
    hr {
      border: none;
      border-top: 1px solid #ccc;
      margin: 2em 0;
    }
    table {
      border-collapse: collapse;
      width: 100%;
      margin: 1em 0;
    }
    table td, table th {
      border: 1px solid #ddd;
      padding: 8px;
    }
    table th {
      background-color: #f4f4f4;
      font-weight: bold;
    }
    mark {
      background-color: yellow;
      padding: 2px 0;
    }
    a {
      color: #0066cc;
      text-decoration: underline;
    }
    img {
      max-width: 100%;
      height: auto;
    }
  </style>
</head>
<body>
  ${html}
</body>
</html>
  `.trim();
}

export function tiptapToPlainText(jsonString?: string | null): string {
  const html = tiptapToHTML(jsonString);
  return htmlToPlainText(html);
}

export async function convertTiptapToDocx(tiptapJson: string): Promise<Buffer> {
  const json = parseTiptapJSON(tiptapJson);
  const paragraphs: Paragraph[] = [];

  function processNode(node: TiptapJSON): Paragraph[] {
    const results: Paragraph[] = [];

    if (node.type === "doc" && node.content) {
      node.content.forEach((child) => {
        results.push(...processNode(child));
      });
    } else if (node.type === "paragraph") {
      const textRuns = extractTextRuns(node);
      results.push(
        new Paragraph({
          children: textRuns.length > 0 ? textRuns : [new TextRun("")],
          alignment: getAlignment(node.attrs?.textAlign),
        })
      );
    } else if (node.type.startsWith("heading")) {
      const level = parseInt(node.type.replace("heading", "")) || 1;
      const textRuns = extractTextRuns(node);
      results.push(
        new Paragraph({
          children: textRuns.length > 0 ? textRuns : [new TextRun("")],
          heading: getHeadingLevel(level),
          alignment: getAlignment(node.attrs?.textAlign),
        })
      );
    } else if (node.type === "bulletList" && node.content) {
      node.content.forEach((listItem) => {
        if (listItem.type === "listItem" && listItem.content) {
          listItem.content.forEach((para) => {
            const textRuns = extractTextRuns(para);
            results.push(
              new Paragraph({
                children: textRuns.length > 0 ? textRuns : [new TextRun("")],
                bullet: { level: 0 },
              })
            );
          });
        }
      });
    } else if (node.type === "orderedList" && node.content) {
      node.content.forEach((listItem, index) => {
        if (listItem.type === "listItem" && listItem.content) {
          listItem.content.forEach((para) => {
            const textRuns = extractTextRuns(para);
            results.push(
              new Paragraph({
                children: textRuns.length > 0 ? textRuns : [new TextRun("")],
                numbering: { reference: "default-numbering", level: 0 },
              })
            );
          });
        }
      });
    } else if (node.content) {
      node.content.forEach((child) => {
        results.push(...processNode(child));
      });
    }

    return results;
  }

  function extractTextRuns(node: TiptapJSON): TextRun[] {
    const runs: TextRun[] = [];

    if (node.content) {
      node.content.forEach((child) => {
        if (child.type === "text" && child.text) {
          const marks = child.marks || [];
          const isBold = marks.some((m) => m.type === "bold");
          const isItalic = marks.some((m) => m.type === "italic");
          const isUnderline = marks.some((m) => m.type === "underline");
          const isStrike = marks.some((m) => m.type === "strike");
          const colorMark = marks.find((m) => m.type === "textStyle");
          const color = colorMark?.attrs?.color;

          runs.push(
            new TextRun({
              text: child.text,
              bold: isBold,
              italics: isItalic,
              underline: isUnderline ? {} : undefined,
              strike: isStrike,
              color: color ? color.replace("#", "") : undefined,
            })
          );
        }
      });
    }

    return runs;
  }

  function getAlignment(align?: string) {
    switch (align) {
      case "left":
        return AlignmentType.LEFT;
      case "center":
        return AlignmentType.CENTER;
      case "right":
        return AlignmentType.RIGHT;
      case "justify":
        return AlignmentType.JUSTIFIED;
      default:
        return undefined;
    }
  }

  function getHeadingLevel(level: number) {
    const levels = {
      1: HeadingLevel.HEADING_1,
      2: HeadingLevel.HEADING_2,
      3: HeadingLevel.HEADING_3,
      4: HeadingLevel.HEADING_4,
      5: HeadingLevel.HEADING_5,
      6: HeadingLevel.HEADING_6,
    } as const;
    return levels[level as keyof typeof levels] || HeadingLevel.HEADING_1;
  }

  const processedParagraphs = processNode(json);

  const doc = new DocxDocument({
    sections: [
      {
        properties: {},
        children:
          processedParagraphs.length > 0
            ? processedParagraphs
            : [new Paragraph("")],
      },
    ],
  });

  return Packer.toBuffer(doc);
}

export function convertTiptapToGoogleDoc(tiptapJson: string): Promise<Buffer> {
  // Google Drive API can convert DOCX to native docs, so reuse DOCX generation
  return convertTiptapToDocx(tiptapJson);
}
