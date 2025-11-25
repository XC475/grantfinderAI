"use client"

import * as React from "react"
import type { Editor } from "@tiptap/core"

// --- Icons ---
import { ChevronDownIcon } from "@/components/tiptap-icons/chevron-down-icon"
import { FontFamilyIcon } from "@/components/tiptap-icons/font-family-icon"

// --- Hooks ---
import { useTiptapEditor } from "@/hooks/use-tiptap-editor"

// --- Tiptap UI ---
import { FontFamilyButton } from "@/components/tiptap-ui/font-family-button"
import { getFontFamily } from "@/components/tiptap-ui/font-family-button"

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

export interface FontFamilyDropdownMenuProps
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

const FONT_FAMILIES = [
  { label: "Default", value: "default" },
  { label: "Arial", value: "Arial, sans-serif" },
  { label: "Arial Black", value: '"Arial Black", sans-serif' },
  { label: "Calibri", value: "Calibri, sans-serif" },
  { label: "Cambria", value: "Cambria, serif" },
  { label: "Candara", value: "Candara, sans-serif" },
  { label: "Comic Sans MS", value: '"Comic Sans MS", cursive' },
  { label: "Consolas", value: "Consolas, monospace" },
  { label: "Constantia", value: "Constantia, serif" },
  { label: "Corbel", value: "Corbel, sans-serif" },
  { label: "Courier New", value: '"Courier New", monospace' },
  { label: "Franklin Gothic Medium", value: '"Franklin Gothic Medium", sans-serif' },
  { label: "Garamond", value: "Garamond, serif" },
  { label: "Georgia", value: "Georgia, serif" },
  { label: "Helvetica", value: "Helvetica, sans-serif" },
  { label: "Impact", value: "Impact, fantasy" },
  { label: "Lucida Console", value: '"Lucida Console", monospace' },
  { label: "Lucida Sans Unicode", value: '"Lucida Sans Unicode", sans-serif' },
  { label: "Palatino Linotype", value: '"Palatino Linotype", serif' },
  { label: "Tahoma", value: "Tahoma, sans-serif" },
  { label: "Times New Roman", value: '"Times New Roman", serif' },
  { label: "Trebuchet MS", value: '"Trebuchet MS", sans-serif' },
  { label: "Verdana", value: "Verdana, sans-serif" },
  { label: "Book Antiqua", value: '"Book Antiqua", serif' },
  { label: "Century Gothic", value: '"Century Gothic", sans-serif' },
  { label: "Courier", value: "Courier, monospace" },
  { label: "Geneva", value: "Geneva, sans-serif" },
  { label: "Monaco", value: "Monaco, monospace" },
  { label: "MS Sans Serif", value: '"MS Sans Serif", sans-serif' },
  { label: "MS Serif", value: '"MS Serif", serif' },
  { label: "Symbol", value: "Symbol, sans-serif" },
  { label: "Wingdings", value: "Wingdings, sans-serif" },
]

/**
 * Dropdown menu component for selecting font family in a Tiptap editor.
 */
export const FontFamilyDropdownMenu = React.forwardRef<
  HTMLButtonElement,
  FontFamilyDropdownMenuProps
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
    const [currentFontFamily, setCurrentFontFamily] = React.useState<string | null>(
      getFontFamily(editor)
    )

    // Update current font family when editor selection changes
    React.useEffect(() => {
      if (!editor) return

      const updateFontFamily = () => {
        setCurrentFontFamily(getFontFamily(editor))
      }

      updateFontFamily()
      editor.on("selectionUpdate", updateFontFamily)
      editor.on("transaction", updateFontFamily)

      return () => {
        editor.off("selectionUpdate", updateFontFamily)
        editor.off("transaction", updateFontFamily)
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
      if (!currentFontFamily || currentFontFamily === "default") {
        return "Font"
      }
      
      // Try to find exact match first
      let font = FONT_FAMILIES.find((f) => f.value === currentFontFamily)
      
      // If not found, try to match by extracting the font name from the value
      if (!font) {
        const fontName = currentFontFamily.split(",")[0].replace(/['"]/g, "")
        font = FONT_FAMILIES.find((f) => {
          const fName = f.value.split(",")[0].replace(/['"]/g, "")
          return fName.toLowerCase() === fontName.toLowerCase()
        })
      }
      
      const fullLabel = font?.label || currentFontFamily.split(",")[0].replace(/['"]/g, "") || "Font"
      
      // Truncate multi-word font names to show only first word + "..."
      const words = fullLabel.split(" ")
      if (words.length > 1) {
        return words[0] + "..."
      }
      return fullLabel
    }, [currentFontFamily])

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
            aria-label="Font Family"
            tooltip="Font Family"
            {...buttonProps}
            ref={ref}
          >
            <FontFamilyIcon className="tiptap-button-icon" />
            <span className="tiptap-button-text">{displayLabel}</span>
            <ChevronDownIcon className="tiptap-button-dropdown-small" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="start" portal={portal} className="max-h-[150px] overflow-y-auto w-[250px] max-w-[250px]">
          <Card>
            <CardBody className="p-1">
              <div className="flex flex-col gap-0.5">
                {FONT_FAMILIES.map((font) => (
                  <DropdownMenuItem
                    key={font.value}
                    asChild
                    onSelect={(e) => {
                      e.preventDefault()
                      // Close dropdown after selection
                      setIsOpen(false)
                    }}
                  >
                    <FontFamilyButton
                      editor={editor}
                      fontFamily={font.value}
                      text={font.label}
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

FontFamilyDropdownMenu.displayName = "FontFamilyDropdownMenu"

export default FontFamilyDropdownMenu

