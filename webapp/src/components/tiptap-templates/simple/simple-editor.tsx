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

// Custom extension to handle markdown paste
const MarkdownPaste = Extension.create({
  name: "markdownPaste",

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey("markdownPaste"),
        props: {
          handlePaste: (view, event) => {
            const text = event.clipboardData?.getData("text/plain");

            // Check if the pasted content looks like markdown
            if (
              text &&
              (text.includes("# ") ||
                text.includes("## ") ||
                text.includes("### ") ||
                /^\s*[-*+]\s/m.test(text) || // bullet lists
                /^\s*\d+\.\s/m.test(text) || // ordered lists
                text.includes("**") || // bold
                text.includes("__")) // bold alternative
            ) {
              try {
                // Get the editor instance
                const editor = this.editor;

                if (editor) {
                  // Use the editor's markdown manager to parse the text
                  // The markdown extension adds a 'markdown' property to the editor
                  const markdownManager = (
                    editor as {
                      markdown?: {
                        parse: (text: string) => { content: unknown[] };
                      };
                    }
                  ).markdown;

                  if (markdownManager && markdownManager.parse) {
                    const json = markdownManager.parse(text);

                    if (json && json.content && json.content.length > 0) {
                      const { state } = view;
                      const { tr } = state;

                      // Create nodes from the parsed JSON
                      const nodes = json.content.map((nodeJSON: unknown) =>
                        state.schema.nodeFromJSON(nodeJSON)
                      );

                      // Create a fragment from the nodes and replace the selection with a slice
                      const fragment = Fragment.from(nodes);
                      const slice = new Slice(fragment, 0, 0);
                      tr.replaceSelection(slice);

                      view.dispatch(tr);

                      return true; // Prevent default paste
                    }
                  }
                }
              } catch (error) {
                console.error("Failed to parse markdown:", error);
                // Fall through to default paste behavior
              }
            }

            return false; // Use default paste behavior
          },
        },
      }),
    ];
  },
});

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
