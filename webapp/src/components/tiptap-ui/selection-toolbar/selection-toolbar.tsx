"use client";

import * as React from "react";
import { BubbleMenu } from "@tiptap/react/menus";
import type { Editor } from "@tiptap/core";
import { Button } from "@/components/ui/button";
import {
  Wand2,
  MessageSquare,
  MessageSquarePlus,
  Copy,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Code,
} from "lucide-react";
import { cn } from "@/lib/utils";

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
    if (selectedText && onAddToChat) {
      onAddToChat(selectedText);
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

  const handleCopy = () => {
    const selectedText = getSelectedText();
    if (selectedText) {
      navigator.clipboard.writeText(selectedText);
    }
  };

  // Only show when text is selected (not empty selection)
  const shouldShow = () => {
    const { from, to } = editor.state.selection;
    return from !== to && !editor.state.selection.empty;
  };

  return (
    <BubbleMenu
      editor={editor}
      options={{
        placement: "top",
        offset: 8,
      }}
      shouldShow={shouldShow}
    >
      <div className="flex items-center gap-1 rounded-lg border bg-white shadow-lg p-1">
        {/* AI Actions */}
        {onImproveWriting && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleImproveWriting}
            className="h-8 px-2 text-xs"
            title="Improve writing"
          >
            <Wand2 className="h-3.5 w-3.5 mr-1 text-[#5a8bf2]" />
            Improve writing
          </Button>
        )}

        {onAskAI && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleAskAI}
            className="h-8 px-2 text-xs"
            title="Ask AI"
          >
            <MessageSquare className="h-3.5 w-3.5 mr-1" />
            Ask AI
          </Button>
        )}

        {onAddToChat && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleAddToChat}
            className="h-8 px-2 text-xs"
            title="Add to chat"
          >
            <MessageSquarePlus className="h-3.5 w-3.5 mr-1" />
            Add to chat
          </Button>
        )}

        {/* Separator */}
        {(onImproveWriting || onAskAI || onAddToChat) && (
          <div className="h-6 w-px bg-border mx-1" />
        )}

        {/* Formatting Actions */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={cn(
            "h-8 w-8 p-0",
            editor.isActive("bold") && "bg-accent"
          )}
          title="Bold"
        >
          <Bold className="h-3.5 w-3.5" />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={cn(
            "h-8 w-8 p-0",
            editor.isActive("italic") && "bg-accent"
          )}
          title="Italic"
        >
          <Italic className="h-3.5 w-3.5" />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={cn(
            "h-8 w-8 p-0",
            editor.isActive("underline") && "bg-accent"
          )}
          title="Underline"
        >
          <Underline className="h-3.5 w-3.5" />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={cn(
            "h-8 w-8 p-0",
            editor.isActive("strike") && "bg-accent"
          )}
          title="Strikethrough"
        >
          <Strikethrough className="h-3.5 w-3.5" />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleCode().run()}
          className={cn(
            "h-8 w-8 p-0",
            editor.isActive("code") && "bg-accent"
          )}
          title="Code"
        >
          <Code className="h-3.5 w-3.5" />
        </Button>

        {/* Separator */}
        <div className="h-6 w-px bg-border mx-1" />

        {/* Copy */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCopy}
          className="h-8 w-8 p-0"
          title="Copy"
        >
          <Copy className="h-3.5 w-3.5" />
        </Button>
      </div>
    </BubbleMenu>
  );
}

