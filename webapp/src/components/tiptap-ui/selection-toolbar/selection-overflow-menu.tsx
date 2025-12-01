"use client";

import * as React from "react";
import type { Editor } from "@tiptap/core";
import { toast } from "sonner";

// --- Icons from tiptap-icons (matching top toolbar) ---
import { MoreVerticalIcon } from "@/components/tiptap-icons/more-vertical-icon";

// --- Hooks ---
import { useTiptapEditor } from "@/hooks/use-tiptap-editor";

// --- UI Primitives ---
import { Button } from "@/components/tiptap-ui-primitive/button";

export interface SelectionOverflowMenuProps {
  /**
   * The Tiptap editor instance.
   */
  editor?: Editor | null;
}

/**
 * Overflow menu component for selection toolbar.
 * Shows a "Feature coming soon" toast notification when clicked.
 */
export const SelectionOverflowMenu = React.forwardRef<
  HTMLButtonElement,
  SelectionOverflowMenuProps
>(({ editor: providedEditor }, ref) => {
  const { editor } = useTiptapEditor(providedEditor);

  const handleClick = React.useCallback(() => {
    toast.info("Feature coming soon", {
      description: "Additional formatting options will be available soon.",
      duration: 3000,
    });
  }, []);

  if (!editor) {
    return null;
  }

  return (
    <Button
      type="button"
      data-style="ghost"
      role="button"
      tabIndex={-1}
      aria-label="More options"
      tooltip="More options"
      ref={ref}
      className="h-7 w-7"
      onClick={handleClick}
    >
      <MoreVerticalIcon className="tiptap-button-icon" />
    </Button>
  );
});

SelectionOverflowMenu.displayName = "SelectionOverflowMenu";

export default SelectionOverflowMenu;
