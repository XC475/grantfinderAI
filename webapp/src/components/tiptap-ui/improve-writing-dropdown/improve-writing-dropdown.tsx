"use client";

import * as React from "react";
import type { Editor } from "@tiptap/core";
import { Wand2 } from "lucide-react";

// --- Hooks ---
import { useTiptapEditor } from "@/hooks/use-tiptap-editor";

// --- UI Primitives ---
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/tiptap-ui-primitive/dropdown-menu";
import { Card, CardBody } from "@/components/tiptap-ui-primitive/card";

interface PromptCategory {
  label: string;
  prompts: Array<{
    label: string;
    prompt: string;
  }>;
}

const PROMPT_CATEGORIES: PromptCategory[] = [
  {
    label: "Editing",
    prompts: [
      { label: "Fix spelling & grammar", prompt: "Fix spelling and grammar in this text:" },
      { label: "Make this section more concise", prompt: "Make this section more concise while keeping key points:" },
      { label: "Improve clarity and readability", prompt: "Improve the clarity and readability of this text:" },
      { label: "Remove redundant language", prompt: "Remove redundant language and improve conciseness in this text:" },
      { label: "Strengthen this argument", prompt: "Strengthen the argument in this text:" },
    ],
  },
  {
    label: "Tone",
    prompts: [
      { label: "Make this more professional", prompt: "Rewrite this text to be more professional:" },
      { label: "Make this more persuasive", prompt: "Rewrite this text to be more persuasive:" },
      { label: "Make this more formal", prompt: "Rewrite this text to be more formal:" },
      { label: "Make this more compelling", prompt: "Rewrite this text to be more compelling:" },
      { label: "Adjust tone to be more confident", prompt: "Adjust the tone of this text to be more confident:" },
    ],
  },
  {
    label: "Structure",
    prompts: [
      { label: "Improve paragraph flow", prompt: "Improve the paragraph flow and transitions in this text:" },
      { label: "Add transitions between ideas", prompt: "Add better transitions between ideas in this text:" },
      { label: "Reorganize for better logic", prompt: "Reorganize this text for better logical flow:" },
      { label: "Create a stronger opening", prompt: "Create a stronger opening for this text:" },
      { label: "Strengthen the conclusion", prompt: "Strengthen the conclusion of this text:" },
    ],
  },
  {
    label: "Length",
    prompts: [
      { label: "Make shorter (keep key points)", prompt: "Make this text shorter while keeping all key points:" },
      { label: "Expand with more detail", prompt: "Expand this text with more detail and supporting information:" },
      { label: "Condense to 100 words", prompt: "Condense this text to approximately 100 words:" },
      { label: "Condense to 250 words", prompt: "Condense this text to approximately 250 words:" },
    ],
  },
];

export interface ImproveWritingDropdownProps {
  /**
   * The Tiptap editor instance.
   */
  editor?: Editor | null;
  /**
   * Callback when a prompt is selected.
   */
  onPromptSelected: (promptText: string) => void;
}

/**
 * Dropdown menu component for "Improve Writing" with categorized prompts.
 */
export const ImproveWritingDropdown = React.forwardRef<
  HTMLButtonElement,
  ImproveWritingDropdownProps
>(({ editor: providedEditor, onPromptSelected }, ref) => {
  const { editor } = useTiptapEditor(providedEditor);
  const [isOpen, setIsOpen] = React.useState(false);

  if (!editor) {
    return null;
  }

  const handlePromptClick = (prompt: string) => {
    onPromptSelected(prompt);
    setIsOpen(false);
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          ref={ref}
          className="h-7 px-2 text-xs hover:bg-accent"
          title="Improve writing"
        >
          <Wand2 className="h-3.5 w-3.5 mr-1.5 text-[#5a8bf2]" />
          <span className="text-xs">Improve writing</span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start" className="min-w-[280px] max-h-[400px] overflow-y-auto">
        <Card>
          <CardBody className="p-1">
            {PROMPT_CATEGORIES.map((category, categoryIndex) => (
              <div key={category.label}>
                {categoryIndex > 0 && (
                  <div className="h-px bg-border my-1" />
                )}
                <div className="px-3 py-2">
                  <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                    {category.label}
                  </div>
                  <div className="space-y-0.5">
                    {category.prompts.map((prompt) => (
                      <DropdownMenuItem
                        key={prompt.label}
                        className="flex items-center gap-2 px-2 py-2 cursor-pointer text-sm hover:bg-accent rounded"
                        onClick={() => handlePromptClick(prompt.prompt)}
                      >
                        <span>{prompt.label}</span>
                      </DropdownMenuItem>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </CardBody>
        </Card>
      </DropdownMenuContent>
    </DropdownMenu>
  );
});

ImproveWritingDropdown.displayName = "ImproveWritingDropdown";

export default ImproveWritingDropdown;

