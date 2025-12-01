"use client";

import * as React from "react";
import { BubbleMenu } from "@tiptap/react/menus";
import type { Editor } from "@tiptap/core";
import { Button } from "@/components/ui/button";
import {
  Wand2,
  MessageSquarePlus,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Import toolbar components
import { HeadingDropdownMenu } from "@/components/tiptap-ui/heading-dropdown-menu";
import { FontFamilyDropdownMenu } from "@/components/tiptap-ui/font-family-dropdown-menu";
import { FontSizeDropdownMenu } from "@/components/tiptap-ui/font-size-dropdown-menu";
import { MarkButton } from "@/components/tiptap-ui/mark-button";
import { TextColorPopover } from "@/components/tiptap-ui/text-color-popover";
import { ColorHighlightPopover } from "@/components/tiptap-ui/color-highlight-popover";
import { AlignIndentDropdownMenu } from "@/components/tiptap-ui/align-indent-dropdown-menu";
import { SelectionOverflowMenu } from "./selection-overflow-menu";
import { ImproveWritingDropdown } from "@/components/tiptap-ui/improve-writing-dropdown";

// Import toolbar primitives
import { ToolbarGroup, ToolbarSeparator } from "@/components/tiptap-ui-primitive/toolbar";

interface SelectionToolbarProps {
  editor: Editor | null;
  onAddToChat?: (text: string) => void;
  onAskAI?: (text: string) => void;
  onImproveWriting?: (text: string) => void;
}

export function SelectionToolbar({
  editor,
  onAddToChat,
  onAskAI,
  onImproveWriting,
}: SelectionToolbarProps) {
  if (!editor) return null;

  const getSelectedText = () => {
    const { from, to } = editor.state.selection;
    return editor.state.doc.textBetween(from, to, " ");
  };

  const handleAddToChat = () => {
    const selectedText = getSelectedText();
    console.log("📤 [SelectionToolbar] handleAddToChat clicked, selectedText:", selectedText);
    if (selectedText && onAddToChat) {
      console.log("📤 [SelectionToolbar] Calling onAddToChat with text");
      onAddToChat(selectedText);
    } else {
      console.log("⚠️ [SelectionToolbar] Cannot add to chat - selectedText:", selectedText, "onAddToChat:", !!onAddToChat);
    }
  };

  const handleAskAI = () => {
    const selectedText = getSelectedText();
    if (selectedText && onAskAI) {
      onAskAI(selectedText);
    }
  };

  const handleImproveWriting = () => {
    const selectedText = getSelectedText();
    if (selectedText && onImproveWriting) {
      onImproveWriting(selectedText);
    }
  };

  // Only show when text is selected (not empty selection)
  const shouldShow = () => {
    const { from, to } = editor.state.selection;
    return from !== to && !editor.state.selection.empty;
  };

  const hasAIActions = onImproveWriting || onAskAI || onAddToChat;

  return (
    <BubbleMenu
      editor={editor}
      options={{
        placement: "top",
        offset: 8,
      }}
      shouldShow={shouldShow}
      className="selection-toolbar-bubble-menu"
    >
      <div 
        className="flex items-center gap-0.5 rounded-lg border bg-white shadow-lg p-1 animate-in fade-in-0 zoom-in-95 duration-200"
        style={{ zIndex: 50 }}
      >
        {/* AI Actions Section (optional) */}
        {hasAIActions && (
          <>
            <ToolbarGroup>
              {onImproveWriting && (
                <ImproveWritingDropdown
                  editor={editor}
                  onPromptSelected={(promptText) => {
                    const selectedText = getSelectedText();
                    if (selectedText) {
                      onImproveWriting(`${promptText}\n\nSelected text: "${selectedText}"`);
                    }
                  }}
                />
              )}

              {onAddToChat && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleAddToChat}
                  className="h-7 px-2 text-xs hover:bg-accent"
                  title="Add to chat"
                >
                  <MessageSquarePlus className="h-3.5 w-3.5 mr-1.5" />
                  <span className="text-xs">Add to chat</span>
                </Button>
              )}
            </ToolbarGroup>

            <ToolbarSeparator />
          </>
        )}

        {/* Text Formatting Section */}
        <ToolbarGroup>
          <MarkButton editor={editor} type="bold" />
          <MarkButton editor={editor} type="italic" />
          <MarkButton editor={editor} type="underline" />
          <MarkButton editor={editor} type="strike" />
        </ToolbarGroup>

        <ToolbarSeparator />

        {/* Color Section */}
        <ToolbarGroup>
          <TextColorPopover editor={editor} />
          <ColorHighlightPopover editor={editor} />
        </ToolbarGroup>

        <ToolbarSeparator />

        {/* More Options */}
        <ToolbarGroup>
          <SelectionOverflowMenu editor={editor} />
        </ToolbarGroup>
      </div>
    </BubbleMenu>
  );
}
