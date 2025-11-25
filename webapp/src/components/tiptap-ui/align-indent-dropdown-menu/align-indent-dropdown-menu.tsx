"use client"

import * as React from "react"
import type { Editor } from "@tiptap/core"

// --- Icons ---
import { ChevronDownIcon } from "@/components/tiptap-icons/chevron-down-icon"
import { AlignLeftIcon } from "@/components/tiptap-icons/align-left-icon"

// --- Hooks ---
import { useTiptapEditor } from "@/hooks/use-tiptap-editor"

// --- Tiptap UI ---
import { TextAlignButton } from "@/components/tiptap-ui/text-align-button"
import {
  textAlignIcons,
  isTextAlignActive,
  type TextAlign,
} from "@/components/tiptap-ui/text-align-button/use-text-align"

// --- UI Primitives ---
import type { ButtonProps } from "@/components/tiptap-ui-primitive/button"
import { Button } from "@/components/tiptap-ui-primitive/button"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from "@/components/tiptap-ui-primitive/dropdown-menu"
import { Card, CardBody } from "@/components/tiptap-ui-primitive/card"

export interface AlignIndentDropdownMenuProps
  extends Omit<ButtonProps, "type"> {
  /**
   * The Tiptap editor instance.
   */
  editor?: Editor | null
  /**
   * Whether to render the dropdown menu in a portal
   * @default false
   */
  portal?: boolean
  /**
   * Callback for when the dropdown opens or closes
   */
  onOpenChange?: (isOpen: boolean) => void
}

/**
 * Dropdown menu component for text alignment and indentation in a Tiptap editor.
 * Displays all alignment options in a horizontal row, similar to Google Docs.
 */
export const AlignIndentDropdownMenu = React.forwardRef<
  HTMLButtonElement,
  AlignIndentDropdownMenuProps
>(
  (
    {
      editor: providedEditor,
      portal = false,
      onOpenChange,
      ...buttonProps
    },
    ref
  ) => {
    const { editor } = useTiptapEditor(providedEditor)
    const [isOpen, setIsOpen] = React.useState(false)

    // Determine current alignment
    const currentAlign = React.useMemo((): TextAlign => {
      if (!editor) return "left"
      
      if (isTextAlignActive(editor, "center")) return "center"
      if (isTextAlignActive(editor, "right")) return "right"
      if (isTextAlignActive(editor, "justify")) return "justify"
      return "left"
    }, [editor])

    // Update when editor selection changes
    const [, forceUpdate] = React.useReducer((x) => x + 1, 0)
    
    React.useEffect(() => {
      if (!editor) return

      const updateAlignment = () => {
        forceUpdate()
      }

      editor.on("selectionUpdate", updateAlignment)
      editor.on("transaction", updateAlignment)

      return () => {
        editor.off("selectionUpdate", updateAlignment)
        editor.off("transaction", updateAlignment)
      }
    }, [editor])

    const handleOpenChange = React.useCallback(
      (open: boolean) => {
        if (!editor) return
        setIsOpen(open)
        onOpenChange?.(open)
      },
      [editor, onOpenChange]
    )

    if (!editor) {
      return null
    }

    // Get the icon for the current alignment
    const CurrentAlignIcon = textAlignIcons[currentAlign] || AlignLeftIcon

    return (
      <DropdownMenu modal open={isOpen} onOpenChange={handleOpenChange}>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            data-style="ghost"
            role="button"
            tabIndex={-1}
            aria-label="Align and indent"
            tooltip="Align and indent"
            {...buttonProps}
            ref={ref}
          >
            <CurrentAlignIcon className="tiptap-button-icon" />
            <ChevronDownIcon className="tiptap-button-dropdown-small" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="start"
          portal={portal}
          onCloseAutoFocus={(e) => {
            // Prevent focus from moving back to trigger button
            e.preventDefault()
          }}
        >
          <Card>
            <CardBody className="p-2">
              <div className="flex flex-row gap-1">
                <TextAlignButton
                  align="left"
                  editor={editor}
                  onAligned={() => setIsOpen(false)}
                />
                <TextAlignButton
                  align="center"
                  editor={editor}
                  onAligned={() => setIsOpen(false)}
                />
                <TextAlignButton
                  align="right"
                  editor={editor}
                  onAligned={() => setIsOpen(false)}
                />
                <TextAlignButton
                  align="justify"
                  editor={editor}
                  onAligned={() => setIsOpen(false)}
                />
                {/* Future: Add indent buttons when indent extension is added */}
              </div>
            </CardBody>
          </Card>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }
)

AlignIndentDropdownMenu.displayName = "AlignIndentDropdownMenu"

export default AlignIndentDropdownMenu

