"use client"

import * as React from "react"
import type { Editor } from "@tiptap/core"

// --- Icons ---
import { MoreVerticalIcon } from "@/components/tiptap-icons/more-vertical-icon"

// --- Hooks ---
import { useTiptapEditor } from "@/hooks/use-tiptap-editor"

// --- UI Primitives ---
import { Button } from "@/components/tiptap-ui-primitive/button"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/tiptap-ui-primitive/dropdown-menu"
import { Card, CardBody } from "@/components/tiptap-ui-primitive/card"

// --- Tiptap UI ---
import { CodeBlockButton } from "@/components/tiptap-ui/code-block-button"
import { MarkButton } from "@/components/tiptap-ui/mark-button"

export interface OverflowMenuProps {
  /**
   * The Tiptap editor instance.
   */
  editor?: Editor | null
  /**
   * Whether the menu is in mobile mode
   */
  isMobile?: boolean
}

/**
 * Overflow menu component for less frequently used toolbar options.
 * Contains: Code Block, Code mark, Superscript, Subscript
 */
export const OverflowMenu = React.forwardRef<
  HTMLButtonElement,
  OverflowMenuProps
>(({ editor: providedEditor, isMobile = false }, ref) => {
  const { editor } = useTiptapEditor(providedEditor)
  const [isOpen, setIsOpen] = React.useState(false)

  if (!editor) {
    return null
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          data-style="ghost"
          role="button"
          tabIndex={-1}
          aria-label="More options"
          tooltip="More options"
          ref={ref}
        >
          <MoreVerticalIcon className="tiptap-button-icon" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="min-w-[200px]">
        <Card>
          <CardBody className="p-1">
            <DropdownMenuItem asChild>
              <div className="w-full">
                <CodeBlockButton editor={editor} text="Code Block" />
              </div>
            </DropdownMenuItem>

            <DropdownMenuItem asChild>
              <div className="w-full">
                <MarkButton editor={editor} type="code" text="Code" />
              </div>
            </DropdownMenuItem>

            <DropdownMenuItem asChild>
              <div className="w-full">
                <MarkButton editor={editor} type="superscript" text="Superscript" />
              </div>
            </DropdownMenuItem>

            <DropdownMenuItem asChild>
              <div className="w-full">
                <MarkButton editor={editor} type="subscript" text="Subscript" />
              </div>
            </DropdownMenuItem>
          </CardBody>
        </Card>
      </DropdownMenuContent>
    </DropdownMenu>
  )
})

OverflowMenu.displayName = "OverflowMenu"

export default OverflowMenu

