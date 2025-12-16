"use client";

import * as React from "react";
import { EditorContent, EditorContext, useEditor, type Editor } from "@tiptap/react";

// --- Tiptap Core Extensions ---
import { StarterKit } from "@tiptap/starter-kit";
import { Image } from "@tiptap/extension-image";
import { TaskItem, TaskList } from "@tiptap/extension-list";
import { TextAlign } from "@tiptap/extension-text-align";
import { Typography } from "@tiptap/extension-typography";
import { Highlight } from "@tiptap/extension-highlight";
import { Subscript } from "@tiptap/extension-subscript";
import { Superscript } from "@tiptap/extension-superscript";
import { Underline } from "@tiptap/extension-underline";
import { Selection } from "@tiptap/extensions";
import { TextStyle } from "@tiptap/extension-text-style";
import { FontFamily } from "@tiptap/extension-font-family";
import { Color } from "@tiptap/extension-color";
import FontSize from "tiptap-extension-font-size";
import { BackgroundColor } from "@/components/tiptap-node/background-color-node/background-color-extension";
import { Markdown } from "@tiptap/markdown";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import { Fragment, Slice } from "@tiptap/pm/model";
import { EditorView } from "@tiptap/pm/view";
import { Extension } from "@tiptap/core";

import { HeadingWithId } from "@/components/tiptap-extensions/heading-with-id";

// --- UI Primitives ---
import { Button } from "@/components/tiptap-ui-primitive/button";
import { Spacer } from "@/components/tiptap-ui-primitive/spacer";
import {
  Toolbar,
  ToolbarGroup,
  ToolbarSeparator,
} from "@/components/tiptap-ui-primitive/toolbar";

// --- Tiptap Node ---
import { ImageUploadNode } from "@/components/tiptap-node/image-upload-node/image-upload-node-extension";
import { HorizontalRule } from "@/components/tiptap-node/horizontal-rule-node/horizontal-rule-node-extension";
import { PageBreak } from "@/components/tiptap-node/page-break-node/page-break-extension";
import "@/components/tiptap-node/blockquote-node/blockquote-node.scss";
import "@/components/tiptap-node/code-block-node/code-block-node.scss";
import "@/components/tiptap-node/horizontal-rule-node/horizontal-rule-node.scss";
import "@/components/tiptap-node/page-break-node/page-break-node.scss";
import "@/components/tiptap-node/list-node/list-node.scss";
import "@/components/tiptap-node/image-node/image-node.scss";
import "@/components/tiptap-node/heading-node/heading-node.scss";
import "@/components/tiptap-node/paragraph-node/paragraph-node.scss";

// --- Tiptap UI ---
import { HeadingDropdownMenu } from "@/components/tiptap-ui/heading-dropdown-menu";
import { ImageUploadButton } from "@/components/tiptap-ui/image-upload-button";
import { ListDropdownMenu } from "@/components/tiptap-ui/list-dropdown-menu";
import { BlockquoteButton } from "@/components/tiptap-ui/blockquote-button";
import { CodeBlockButton } from "@/components/tiptap-ui/code-block-button";
import {
  ColorHighlightPopover,
  ColorHighlightPopoverContent,
  ColorHighlightPopoverButton,
} from "@/components/tiptap-ui/color-highlight-popover";
import {
  LinkPopover,
  LinkContent,
  LinkButton,
} from "@/components/tiptap-ui/link-popover";
import { MarkButton } from "@/components/tiptap-ui/mark-button";
import { TextAlignButton } from "@/components/tiptap-ui/text-align-button";
import { UndoRedoButton } from "@/components/tiptap-ui/undo-redo-button";
import { PageBreakButton } from "@/components/tiptap-ui/page-break-button";
import { FontFamilyDropdownMenu } from "@/components/tiptap-ui/font-family-dropdown-menu";
import { FontSizeDropdownMenu } from "@/components/tiptap-ui/font-size-dropdown-menu";
import { TextColorPopover } from "@/components/tiptap-ui/text-color-popover";
import { BackgroundColorPopover } from "@/components/tiptap-ui/background-color-popover";
import { SelectionToolbar } from "@/components/tiptap-ui/selection-toolbar";
import { OverflowMenu } from "@/components/tiptap-ui/overflow-menu";
import { AlignIndentDropdownMenu } from "@/components/tiptap-ui/align-indent-dropdown-menu";

// --- Icons ---
import { ArrowLeftIcon } from "@/components/tiptap-icons/arrow-left-icon";
import { HighlighterIcon } from "@/components/tiptap-icons/highlighter-icon";
import { LinkIcon } from "@/components/tiptap-icons/link-icon";

// --- Hooks ---
import { useIsMobile } from "@/hooks/use-mobile";
import { useWindowSize } from "@/hooks/use-window-size";
import { useCursorVisibility } from "@/hooks/use-cursor-visibility";
import { useTiptapEditor } from "@/hooks/use-tiptap-editor";

// --- Components ---

// --- Lib ---
import { handleImageUpload, MAX_FILE_SIZE } from "@/lib/tiptap-utils";

// --- Styles ---
import "@/components/tiptap-templates/simple/simple-editor.scss";

// Extracted EditorToolbar component for use in header
export interface EditorToolbarProps {
  editor?: Editor | null;
  isMobile?: boolean;
}

export const EditorToolbar = React.forwardRef<HTMLDivElement, EditorToolbarProps>(
  ({ editor: providedEditor, isMobile = false }, ref) => {
    const { editor } = useTiptapEditor(providedEditor);
    const [mobileView, setMobileView] = React.useState<"main" | "highlighter" | "link">("main");

  // Reset mobile view when switching between mobile and desktop
  React.useEffect(() => {
    if (!isMobile && mobileView !== "main") {
      setMobileView("main");
    }
  }, [isMobile, mobileView]);

  // Show toolbar immediately, even if editor isn't ready yet
  // Buttons will be disabled automatically when editor is null
  const isEditorReady = Boolean(editor);

  return (
    <Toolbar ref={ref} variant="fixed" data-editor-ready={isEditorReady}>
      {mobileView === "main" ? (
        <MainToolbarContent
          onHighlighterClick={() => setMobileView("highlighter")}
          onLinkClick={() => setMobileView("link")}
          isMobile={isMobile}
        />
      ) : (
        <MobileToolbarContent
          type={mobileView === "highlighter" ? "highlighter" : "link"}
          onBack={() => setMobileView("main")}
        />
      )}
    </Toolbar>
  );
}
);
EditorToolbar.displayName = "EditorToolbar";

const MainToolbarContent = ({
  onHighlighterClick,
  onLinkClick,
  isMobile,
}: {
  onHighlighterClick: () => void;
  onLinkClick: () => void;
  isMobile: boolean;
}) => {
  return (
    <>
      <Spacer />

      {/* Group 1: Undo/Redo */}
      <ToolbarGroup>
        <UndoRedoButton action="undo" />
        <UndoRedoButton action="redo" />
      </ToolbarGroup>

      <ToolbarSeparator />

      {/* Group 2: Text Style */}
      <ToolbarGroup>
        <HeadingDropdownMenu levels={[1, 2, 3, 4]} portal={isMobile} />
      </ToolbarGroup>

      <ToolbarSeparator />

      {/* Group 3: Font and Size */}
      <ToolbarGroup>
        <FontFamilyDropdownMenu portal={isMobile} />
        <FontSizeDropdownMenu portal={isMobile} />
      </ToolbarGroup>

      <ToolbarSeparator />

      {/* Group 4: Text Formatting */}
      <ToolbarGroup>
        <MarkButton type="bold" />
        <MarkButton type="italic" />
        <MarkButton type="underline" />
        <MarkButton type="strike" />
      </ToolbarGroup>

      <ToolbarSeparator />

      {/* Group 5: Text Color and Highlight */}
      <ToolbarGroup>
        {!isMobile ? (
          <>
            <TextColorPopover />
            <ColorHighlightPopover />
          </>
        ) : (
          <ColorHighlightPopoverButton onClick={onHighlighterClick} />
        )}
      </ToolbarGroup>

      <ToolbarSeparator />

      {/* Group 6: Link */}
      <ToolbarGroup>
        {!isMobile ? <LinkPopover /> : <LinkButton onClick={onLinkClick} />}
      </ToolbarGroup>

      <ToolbarSeparator />

      {/* Group 7: Alignment and Indent */}
      <ToolbarGroup>
        <AlignIndentDropdownMenu portal={isMobile} />
      </ToolbarGroup>

      <ToolbarSeparator />

      {/* Group 8: Lists */}
      <ToolbarGroup>
        <ListDropdownMenu
          types={["bulletList", "orderedList", "taskList"]}
          portal={isMobile}
        />
      </ToolbarGroup>

      <ToolbarSeparator />

      {/* Group 9: Insert Options */}
      <ToolbarGroup>
        <ImageUploadButton text="Add" />
        <BlockquoteButton />
        <PageBreakButton />
      </ToolbarGroup>

      <ToolbarSeparator />

      {/* Group 10: More Options */}
      <ToolbarGroup>
        <OverflowMenu isMobile={isMobile} />
      </ToolbarGroup>

      <Spacer />
    </>
  );
};

const MobileToolbarContent = ({
  type,
  onBack,
}: {
  type: "highlighter" | "link";
  onBack: () => void;
}) => (
  <>
    <ToolbarGroup>
      <Button data-style="ghost" onClick={onBack}>
        <ArrowLeftIcon className="tiptap-button-icon" />
        {type === "highlighter" ? (
          <HighlighterIcon className="tiptap-button-icon" />
        ) : (
          <LinkIcon className="tiptap-button-icon" />
        )}
      </Button>
    </ToolbarGroup>

    <ToolbarSeparator />

    {type === "highlighter" ? (
      <ColorHighlightPopoverContent />
    ) : (
      <LinkContent />
    )}
  </>
);

// --- Types for cursor formatting inheritance ---
interface CursorFormatting {
  // Active marks (bold, italic, underline, strike)
  marks: {
    bold: boolean;
    italic: boolean;
    underline: boolean;
    strike: boolean;
  };
  // TextStyle attributes
  textStyle: {
    fontFamily?: string;
    fontSize?: string;
    color?: string;
    backgroundColor?: string;
  };
  // Block attributes
  block: {
    textAlign?: string;
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type JSONNode = { type: string; attrs?: Record<string, any>; marks?: any[]; content?: JSONNode[]; text?: string };

/**
 * Extracts textStyle attributes from a ProseMirror Mark array
 */
function extractTextStyleFromMarks(marks: readonly { type: { name: string }; attrs?: Record<string, unknown> }[]): CursorFormatting['textStyle'] {
  const textStyleMark = marks.find(m => m.type.name === 'textStyle');
  if (textStyleMark && textStyleMark.attrs) {
    return {
      fontFamily: (textStyleMark.attrs.fontFamily as string) || undefined,
      fontSize: (textStyleMark.attrs.fontSize as string) || undefined,
      color: (textStyleMark.attrs.color as string) || undefined,
      backgroundColor: (textStyleMark.attrs.backgroundColor as string) || undefined,
    };
  }
  return {};
}

/**
 * Extracts active marks (bold/italic/etc) from a ProseMirror Mark array
 */
function extractActiveMarksFromMarks(marks: readonly { type: { name: string } }[]): CursorFormatting['marks'] {
  return {
    bold: marks.some(m => m.type.name === 'bold'),
    italic: marks.some(m => m.type.name === 'italic'),
    underline: marks.some(m => m.type.name === 'underline'),
    strike: marks.some(m => m.type.name === 'strike'),
  };
}

/**
 * Recursively finds the last text node with formatting in a node tree
 */
function findLastFormattedTextInNode(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  node: any,
  result: { textStyle: CursorFormatting['textStyle']; marks: CursorFormatting['marks'] } | null = null
): { textStyle: CursorFormatting['textStyle']; marks: CursorFormatting['marks'] } | null {
  // If this is a text node with marks, check for textStyle
  if (node.isText && node.marks && node.marks.length > 0) {
    const textStyleAttrs = extractTextStyleFromMarks(node.marks);
    if (textStyleAttrs.fontFamily || textStyleAttrs.fontSize || textStyleAttrs.color || textStyleAttrs.backgroundColor) {
      return {
        textStyle: textStyleAttrs,
        marks: extractActiveMarksFromMarks(node.marks),
      };
    }
  }
  
  // If node has content, traverse children (we want the LAST formatted text, so traverse in order and keep updating)
  if (node.content && node.content.size > 0) {
    node.content.forEach((child: unknown) => {
      const found = findLastFormattedTextInNode(child, result);
      if (found) {
        result = found;
      }
    });
  }
  
  return result;
}

/**
 * Scans backwards from position to find the nearest text node with formatting
 * Uses document tree traversal to properly cross paragraph boundaries
 */
function findNearestTextFormatting(editor: Editor): { textStyle: CursorFormatting['textStyle']; marks: CursorFormatting['marks'] } | null {
  const { state } = editor.view;
  const { $from } = state.selection;
  
  // First check storedMarks (marks that will apply to next typed content)
  if (state.storedMarks && state.storedMarks.length > 0) {
    const textStyle = extractTextStyleFromMarks(state.storedMarks);
    if (textStyle.fontFamily || textStyle.fontSize || textStyle.color || textStyle.backgroundColor) {
      return {
        textStyle,
        marks: extractActiveMarksFromMarks(state.storedMarks),
      };
    }
  }
  
  // Check marks at the current position using $from.marks()
  const posMarks = $from.marks();
  if (posMarks.length > 0) {
    const textStyle = extractTextStyleFromMarks(posMarks);
    if (textStyle.fontFamily || textStyle.fontSize || textStyle.color || textStyle.backgroundColor) {
      return {
        textStyle,
        marks: extractActiveMarksFromMarks(posMarks),
      };
    }
  }
  
  const doc = state.doc;
  const cursorPos = $from.pos;
  
  // Strategy 1: Use nodesBetween to scan all text nodes before cursor
  let foundFormatting: { textStyle: CursorFormatting['textStyle']; marks: CursorFormatting['marks'] } | null = null;
  
  // Scan from start of document to cursor position
  doc.nodesBetween(0, cursorPos, (node) => {
    if (node.isText && node.marks && node.marks.length > 0) {
      const textStyleAttrs = extractTextStyleFromMarks(node.marks);
      if (textStyleAttrs.fontFamily || textStyleAttrs.fontSize || textStyleAttrs.color || textStyleAttrs.backgroundColor) {
        // Keep updating - we want the LAST (closest to cursor) formatted text
        foundFormatting = {
          textStyle: textStyleAttrs,
          marks: extractActiveMarksFromMarks(node.marks),
        };
      }
    }
    return true; // Continue traversing
  });
  
  if (foundFormatting) {
    return foundFormatting;
  }
  
  // Strategy 2: If nothing before cursor, check the entire document for any formatted text
  // This handles cases where cursor is at the very beginning
  doc.nodesBetween(cursorPos, doc.content.size, (node) => {
    if (node.isText && node.marks && node.marks.length > 0) {
      const textStyleAttrs = extractTextStyleFromMarks(node.marks);
      if (textStyleAttrs.fontFamily || textStyleAttrs.fontSize || textStyleAttrs.color || textStyleAttrs.backgroundColor) {
        if (!foundFormatting) {
          foundFormatting = {
            textStyle: textStyleAttrs,
            marks: extractActiveMarksFromMarks(node.marks),
          };
        }
        return false; // Stop at first match after cursor
      }
    }
    return true;
  });
  
  return foundFormatting;
}

/**
 * Captures the current cursor formatting from the editor
 * Uses multiple strategies to find formatting:
 * 1. Direct getAttributes (for when cursor is in formatted text)
 * 2. Stored marks (marks that will apply to next typed content)
 * 3. Scan nearby text nodes for formatting
 */
function captureCursorFormatting(editor: Editor): CursorFormatting {
  const textStyleAttrs = editor.getAttributes("textStyle");
  const paragraphAttrs = editor.getAttributes("paragraph");
  const headingAttrs = editor.getAttributes("heading");

  // Start with direct attribute check
  let formatting: CursorFormatting = {
    marks: {
      bold: editor.isActive("bold"),
      italic: editor.isActive("italic"),
      underline: editor.isActive("underline"),
      strike: editor.isActive("strike"),
    },
    textStyle: {
      fontFamily: textStyleAttrs.fontFamily || undefined,
      fontSize: textStyleAttrs.fontSize || undefined,
      color: textStyleAttrs.color || undefined,
      backgroundColor: textStyleAttrs.backgroundColor || undefined,
    },
    block: {
      textAlign: paragraphAttrs.textAlign || headingAttrs.textAlign || undefined,
    },
  };

  // If no textStyle attrs found via getAttributes, try finding from nearby text
  const hasDirectTextStyle = !!(
    formatting.textStyle.fontFamily ||
    formatting.textStyle.fontSize ||
    formatting.textStyle.color ||
    formatting.textStyle.backgroundColor
  );

  if (!hasDirectTextStyle) {
    const nearestFormatting = findNearestTextFormatting(editor);
    if (nearestFormatting) {
      // Merge in the found textStyle (don't override what we already have)
      formatting.textStyle = {
        fontFamily: formatting.textStyle.fontFamily || nearestFormatting.textStyle.fontFamily,
        fontSize: formatting.textStyle.fontSize || nearestFormatting.textStyle.fontSize,
        color: formatting.textStyle.color || nearestFormatting.textStyle.color,
        backgroundColor: formatting.textStyle.backgroundColor || nearestFormatting.textStyle.backgroundColor,
      };
      // Also merge marks if none were active
      const hasActiveMarks = formatting.marks.bold || formatting.marks.italic || formatting.marks.underline || formatting.marks.strike;
      if (!hasActiveMarks) {
        formatting.marks = {
          bold: formatting.marks.bold || nearestFormatting.marks.bold,
          italic: formatting.marks.italic || nearestFormatting.marks.italic,
          underline: formatting.marks.underline || nearestFormatting.marks.underline,
          strike: formatting.marks.strike || nearestFormatting.marks.strike,
        };
      }
    }
  }

  return formatting;
}

/**
 * Checks if textStyle has any meaningful attributes
 */
function hasTextStyleAttrs(formatting: CursorFormatting): boolean {
  const { fontFamily, fontSize, color, backgroundColor } = formatting.textStyle;
  return !!(fontFamily || fontSize || color || backgroundColor);
}

/**
 * Recursively applies cursor formatting to parsed JSON nodes
 * - Merges textStyle attrs and active marks into text nodes
 * - Applies textAlign to block nodes (paragraph, heading)
 */
function applyFormattingToNodes(nodes: JSONNode[], formatting: CursorFormatting): JSONNode[] {
  return nodes.map((node) => applyFormattingToNode(node, formatting));
}

function applyFormattingToNode(node: JSONNode, formatting: CursorFormatting): JSONNode {
  const result = { ...node };

  // Apply textAlign to block-level nodes (paragraph, heading)
  if ((node.type === "paragraph" || node.type === "heading") && formatting.block.textAlign) {
    result.attrs = {
      ...result.attrs,
      textAlign: result.attrs?.textAlign || formatting.block.textAlign,
    };
  }

  // For text nodes, apply marks and textStyle
  if (node.type === "text" && node.text) {
    const existingMarks = node.marks || [];
    const newMarks = [...existingMarks];

    // Helper to check if a mark type already exists
    const hasMark = (type: string) => newMarks.some((m) => m.type === type);

    // Add cursor marks if active and not already present from markdown
    if (formatting.marks.bold && !hasMark("bold")) {
      newMarks.push({ type: "bold" });
    }
    if (formatting.marks.italic && !hasMark("italic")) {
      newMarks.push({ type: "italic" });
    }
    if (formatting.marks.underline && !hasMark("underline")) {
      newMarks.push({ type: "underline" });
    }
    if (formatting.marks.strike && !hasMark("strike")) {
      newMarks.push({ type: "strike" });
    }

    // Apply textStyle attrs if we have any
    if (hasTextStyleAttrs(formatting)) {
      // Find existing textStyle mark or create one
      let textStyleMark = newMarks.find((m) => m.type === "textStyle");
      
      if (!textStyleMark) {
        textStyleMark = { type: "textStyle", attrs: {} };
        newMarks.push(textStyleMark);
      } else {
        // Clone to avoid mutation
        textStyleMark = { ...textStyleMark, attrs: { ...textStyleMark.attrs } };
        const idx = newMarks.findIndex((m) => m.type === "textStyle");
        newMarks[idx] = textStyleMark;
      }

      // Merge in cursor textStyle attrs (cursor attrs take precedence for inheritance)
      const { fontFamily, fontSize, color, backgroundColor } = formatting.textStyle;
      if (fontFamily && !textStyleMark.attrs.fontFamily) {
        textStyleMark.attrs.fontFamily = fontFamily;
      }
      if (fontSize && !textStyleMark.attrs.fontSize) {
        textStyleMark.attrs.fontSize = fontSize;
      }
      if (color && !textStyleMark.attrs.color) {
        textStyleMark.attrs.color = color;
      }
      if (backgroundColor && !textStyleMark.attrs.backgroundColor) {
        textStyleMark.attrs.backgroundColor = backgroundColor;
      }
    }

    if (newMarks.length > 0) {
      result.marks = newMarks;
    }
  }

  // Recursively process children
  if (node.content && Array.isArray(node.content)) {
    result.content = applyFormattingToNodes(node.content, formatting);
  }

  return result;
}

/**
 * Strips HTML tags and extracts plain text content
 * Used as fallback when text/plain is not available
 */
function stripHtmlToText(html: string): string {
  // Create a temporary element to parse HTML
  const temp = document.createElement("div");
  temp.innerHTML = html;
  // Get text content (strips all HTML tags and styling)
  return temp.textContent || temp.innerText || "";
}

// Custom extension to handle paste with style inheritance
// Always applies document formatting to pasted content, regardless of source
const MarkdownPaste = Extension.create({
  name: "markdownPaste",

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey("markdownPaste"),
        props: {
          handlePaste: (view, event) => {
            // Try to get plain text first
            let text = event.clipboardData?.getData("text/plain");
            
            // If plain text is empty, try to extract from HTML
            // This handles cases where browser only provides HTML (like some web selections)
            if (!text || text.trim().length === 0) {
              const html = event.clipboardData?.getData("text/html");
              if (html && html.trim().length > 0) {
                text = stripHtmlToText(html);
              }
            }
            
            // If still no text, nothing to paste
            if (!text || text.trim().length === 0) {
              return false;
            }

            // Get the editor instance
            const editor = this.editor;

            if (!editor) {
              return false;
            }

            try {
              // Capture current cursor formatting BEFORE parsing
              const cursorFormatting = captureCursorFormatting(editor);

              // Use the editor's markdown manager to parse the text
              const markdownManager = (
                editor as {
                  markdown?: {
                    parse: (text: string) => { content: JSONNode[] };
                  };
                }
              ).markdown;

              if (!markdownManager || !markdownManager.parse) {
                // Fallback: insert as plain text with formatting
                return insertPlainTextWithFormatting(view, editor, text, cursorFormatting);
              }

              const json = markdownManager.parse(text);

              if (!json || !json.content || json.content.length === 0) {
                // Fallback: insert as plain text with formatting
                return insertPlainTextWithFormatting(view, editor, text, cursorFormatting);
              }

              // Apply cursor formatting to the parsed content
              const styledContent = applyFormattingToNodes(json.content, cursorFormatting);

              const { state } = view;
              const { tr } = state;

              // Create nodes from the styled JSON
              const nodes = styledContent.map((nodeJSON: JSONNode) =>
                state.schema.nodeFromJSON(nodeJSON)
              );

              // Create a fragment from the nodes and replace the selection with a slice
              const fragment = Fragment.from(nodes);
              const slice = new Slice(fragment, 0, 0);
              tr.replaceSelection(slice);

              view.dispatch(tr);

              return true; // Prevent default paste
            } catch (error) {
              console.error("Failed to parse/style pasted content:", error);
              // Fallback: try to insert as plain text with formatting
              try {
                const cursorFormatting = captureCursorFormatting(editor);
                return insertPlainTextWithFormatting(view, editor, text, cursorFormatting);
              } catch {
                // Last resort: insert plain text without formatting
                // Still prevent default to avoid HTML styling bleeding through
                const { state } = view;
                const { tr } = state;
                tr.insertText(text);
                view.dispatch(tr);
                return true;
              }
            }
          },
        },
      }),
    ];
  },
});

/**
 * Fallback function to insert plain text with document formatting
 * Used when markdown parsing fails or is unavailable
 */
function insertPlainTextWithFormatting(
  view: EditorView,
  editor: Editor,
  text: string,
  formatting: CursorFormatting
): boolean {
  try {
    // Build marks array based on formatting
    const marks: { type: string; attrs?: Record<string, unknown> }[] = [];
    
    // Add style marks
    if (formatting.marks.bold) marks.push({ type: "bold" });
    if (formatting.marks.italic) marks.push({ type: "italic" });
    if (formatting.marks.underline) marks.push({ type: "underline" });
    if (formatting.marks.strike) marks.push({ type: "strike" });
    
    // Add textStyle if we have any attributes
    if (hasTextStyleAttrs(formatting)) {
      const textStyleAttrs: Record<string, unknown> = {};
      if (formatting.textStyle.fontFamily) textStyleAttrs.fontFamily = formatting.textStyle.fontFamily;
      if (formatting.textStyle.fontSize) textStyleAttrs.fontSize = formatting.textStyle.fontSize;
      if (formatting.textStyle.color) textStyleAttrs.color = formatting.textStyle.color;
      if (formatting.textStyle.backgroundColor) textStyleAttrs.backgroundColor = formatting.textStyle.backgroundColor;
      marks.push({ type: "textStyle", attrs: textStyleAttrs });
    }
    
    // Split text into paragraphs
    const paragraphs = text.split(/\n\n+/);
    const content: JSONNode[] = paragraphs.map(para => {
      const lines = para.split(/\n/);
      const textNodes: JSONNode[] = [];
      
      lines.forEach((line, idx) => {
        if (line.length > 0) {
          textNodes.push({
            type: "text",
            text: line,
            marks: marks.length > 0 ? marks : undefined,
          });
        }
        // Add hard break between lines within a paragraph
        if (idx < lines.length - 1) {
          textNodes.push({ type: "hardBreak" });
        }
      });
      
      return {
        type: "paragraph",
        attrs: formatting.block.textAlign ? { textAlign: formatting.block.textAlign } : undefined,
        content: textNodes.length > 0 ? textNodes : undefined,
      };
    });
    
    const { state } = view;
    const { tr } = state;
    
    const nodes = content.map((nodeJSON: JSONNode) =>
      state.schema.nodeFromJSON(nodeJSON)
    );
    
    const fragment = Fragment.from(nodes);
    const slice = new Slice(fragment, 0, 0);
    tr.replaceSelection(slice);
    
    view.dispatch(tr);
    return true;
  } catch (error) {
    console.error("Failed to insert plain text with formatting:", error);
    return false;
  }
}

interface SimpleEditorProps {
  initialContent?: string;
  onContentChange?: (content: string) => void;
  onSelectionAddToChat?: (text: string) => void;
  onSelectionAskAI?: (text: string) => void;
  onSelectionImproveWriting?: (text: string) => void;
  onEditorReady?: (editor: Editor | null) => void;
}

export function SimpleEditor({
  initialContent,
  onContentChange,
  onSelectionAddToChat,
  onSelectionAskAI,
  onSelectionImproveWriting,
  onEditorReady,
}: SimpleEditorProps = {}) {
  const isMobile = useIsMobile();
  const { height } = useWindowSize();
  const [mobileView, setMobileView] = React.useState<
    "main" | "highlighter" | "link"
  >("main");
  const toolbarRef = React.useRef<HTMLDivElement>(null);

  const editor = useEditor({
    immediatelyRender: false,
    shouldRerenderOnTransaction: false,
    editorProps: {
      attributes: {
        autocomplete: "off",
        autocorrect: "off",
        autocapitalize: "off",
        "aria-label": "Main content area, start typing to enter text.",
        class: "simple-editor",
      },
    },
    extensions: [
      StarterKit.configure({
        heading: false,
        horizontalRule: false,
        link: {
          openOnClick: false,
          enableClickSelection: true,
        },
      }),
      HeadingWithId.configure({
        levels: [1, 2, 3, 4, 5, 6],
      }),
      Markdown,
      MarkdownPaste,
      HorizontalRule,
      PageBreak,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Highlight.configure({ multicolor: true }),
      Image,
      Typography,
      Superscript,
      Subscript,
      Underline,
      Selection,
      TextStyle,
      FontFamily,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      FontSize as any, // Type compatibility issue with third-party extension
      Color,
      BackgroundColor,
      ImageUploadNode.configure({
        accept: "image/*",
        maxSize: MAX_FILE_SIZE,
        limit: 3,
        upload: handleImageUpload,
        onError: (error) => console.error("Upload failed:", error),
      }),
    ],
    content: initialContent
      ? typeof initialContent === "string"
        ? JSON.parse(initialContent)
        : initialContent
      : undefined,
    onUpdate: ({ editor }) => {
      if (onContentChange) {
        onContentChange(JSON.stringify(editor.getJSON()));
      }
    },
  });

  const rect = useCursorVisibility({
    editor,
    overlayHeight: toolbarRef.current?.getBoundingClientRect().height ?? 0,
  });

  React.useEffect(() => {
    if (!isMobile && mobileView !== "main") {
      setMobileView("main");
    }
  }, [isMobile, mobileView]);

  // Notify parent when editor is ready
  React.useEffect(() => {
    if (editor && onEditorReady) {
      onEditorReady(editor);
    }
  }, [editor, onEditorReady]);

  return (
    <div className="simple-editor-wrapper">
      <EditorContext.Provider value={{ editor }}>
        {editor && (
          <SelectionToolbar
            editor={editor}
            onAddToChat={onSelectionAddToChat}
            onAskAI={onSelectionAskAI}
            onImproveWriting={onSelectionImproveWriting}
          />
        )}

        <EditorContent
          editor={editor}
          role="presentation"
          className="simple-editor-content"
        />
      </EditorContext.Provider>
    </div>
  );
}
