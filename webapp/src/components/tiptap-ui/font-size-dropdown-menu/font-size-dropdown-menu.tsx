"use client"

import * as React from "react"
import type { Editor } from "@tiptap/core"

// --- Icons ---
import { ChevronDownIcon } from "@/components/tiptap-icons/chevron-down-icon"
import { FontSizeIcon } from "@/components/tiptap-icons/font-size-icon"

// --- Hooks ---
import { useTiptapEditor } from "@/hooks/use-tiptap-editor"

// --- Tiptap UI ---
import { FontSizeButton } from "@/components/tiptap-ui/font-size-button"
import { getFontSize } from "@/components/tiptap-ui/font-size-button"

// --- UI Primitives ---
import type { ButtonProps } from "@/components/tiptap-ui-primitive/button"
import { Button } from "@/components/tiptap-ui-primitive/button"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/tiptap-ui-primitive/dropdown-menu"
import { Card, CardBody } from "@/components/tiptap-ui-primitive/card"

export interface FontSizeDropdownMenuProps
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

const FONT_SIZES = [
  { label: "8pt", value: "8pt" },
  { label: "9pt", value: "9pt" },
  { label: "10pt", value: "10pt" },
  { label: "11pt", value: "11pt" },
  { label: "12pt", value: "12pt" },
  { label: "14pt", value: "14pt" },
  { label: "16pt", value: "16pt" },
  { label: "18pt", value: "18pt" },
  { label: "20pt", value: "20pt" },
  { label: "24pt", value: "24pt" },
  { label: "28pt", value: "28pt" },
  { label: "32pt", value: "32pt" },
  { label: "36pt", value: "36pt" },
  { label: "48pt", value: "48pt" },
  { label: "72pt", value: "72pt" },
]

/**
 * Dropdown menu component for selecting font size in a Tiptap editor.
 */
export const FontSizeDropdownMenu = React.forwardRef<
  HTMLButtonElement,
  FontSizeDropdownMenuProps
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
    const [currentFontSize, setCurrentFontSize] = React.useState<string | null>(
      getFontSize(editor)
    )

    // Update current font size when editor selection changes
    React.useEffect(() => {
      if (!editor) return

      const updateFontSize = () => {
        setCurrentFontSize(getFontSize(editor))
      }

      updateFontSize()
      editor.on("selectionUpdate", updateFontSize)
      editor.on("transaction", updateFontSize)

      return () => {
        editor.off("selectionUpdate", updateFontSize)
        editor.off("transaction", updateFontSize)
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

    // Calculate display label - must be before early return to follow Rules of Hooks
    const displayLabel = React.useMemo(() => {
      if (!currentFontSize) {
        return "Size"
      }
      const size = FONT_SIZES.find((s) => s.value === currentFontSize)
      return size?.label || currentFontSize || "Size"
    }, [currentFontSize])

    if (!editor) {
      return null
    }

    return (
      <DropdownMenu modal open={isOpen} onOpenChange={handleOpenChange}>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            data-style="ghost"
            role="button"
            tabIndex={-1}
            aria-label="Font Size"
            tooltip="Font Size"
            {...buttonProps}
            ref={ref}
          >
            <FontSizeIcon className="tiptap-button-icon" />
            <span className="tiptap-button-text">{displayLabel}</span>
            <ChevronDownIcon className="tiptap-button-dropdown-small" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="start" portal={portal} className="max-h-[200px] overflow-y-auto w-[150px]">
          <Card>
            <CardBody className="p-1">
              <div className="flex flex-col gap-0.5">
                {FONT_SIZES.map((size) => (
                  <DropdownMenuItem
                    key={size.value}
                    asChild
                    onSelect={(e) => {
                      e.preventDefault()
                      // Close dropdown after selection
                      setIsOpen(false)
                    }}
                  >
                    <FontSizeButton
                      editor={editor}
                      fontSize={size.value}
                      text={size.label}
                      onApplied={() => {
                        setIsOpen(false)
                      }}
                    />
                  </DropdownMenuItem>
                ))}
              </div>
            </CardBody>
          </Card>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }
)

FontSizeDropdownMenu.displayName = "FontSizeDropdownMenu"

export default FontSizeDropdownMenu

