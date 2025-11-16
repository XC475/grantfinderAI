"use client"

import * as React from "react"
import { type Editor } from "@tiptap/react"

// --- Hooks ---
import { useMenuNavigation } from "@/hooks/use-menu-navigation"
import { useIsMobile } from "@/hooks/use-mobile"
import { useTiptapEditor } from "@/hooks/use-tiptap-editor"

// --- Icons ---
import { BanIcon } from "@/components/tiptap-icons/ban-icon"
import { TextColorIcon } from "@/components/tiptap-icons/text-color-icon"

// --- UI Primitives ---
import type { ButtonProps } from "@/components/tiptap-ui-primitive/button"
import { Button, ButtonGroup } from "@/components/tiptap-ui-primitive/button"
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/tiptap-ui-primitive/popover"
import { Separator } from "@/components/tiptap-ui-primitive/separator"
import {
  Card,
  CardBody,
  CardItemGroup,
} from "@/components/tiptap-ui-primitive/card"

// --- Tiptap UI ---
import type { UseTextColorConfig } from "@/components/tiptap-ui/text-color-button"
import { TextColorButton, useTextColor } from "@/components/tiptap-ui/text-color-button"

export type TextColor = {
  label: string
  value: string
}

export const TEXT_COLORS: TextColor[] = [
  { label: "Black", value: "#000000" },
  { label: "Dark Gray", value: "#333333" },
  { label: "Gray", value: "#666666" },
  { label: "Light Gray", value: "#999999" },
  { label: "White", value: "#FFFFFF" },
  { label: "Red", value: "#FF0000" },
  { label: "Orange", value: "#FF6600" },
  { label: "Yellow", value: "#FFCC00" },
  { label: "Green", value: "#00CC00" },
  { label: "Blue", value: "#0066FF" },
  { label: "Indigo", value: "#6600FF" },
  { label: "Purple", value: "#9900FF" },
  { label: "Pink", value: "#FF00CC" },
]

export interface TextColorPopoverContentProps {
  /**
   * The Tiptap editor instance.
   */
  editor?: Editor | null
  /**
   * Optional colors to use in the text color popover.
   * If not provided, defaults to a predefined set of colors.
   */
  colors?: TextColor[]
}

export interface TextColorPopoverProps
  extends Omit<ButtonProps, "type">,
    Pick<UseTextColorConfig, "editor" | "hideWhenUnavailable" | "onApplied"> {
  /**
   * Optional colors to use in the text color popover.
   * If not provided, defaults to a predefined set of colors.
   */
  colors?: TextColor[]
}

export const TextColorPopoverButton = React.forwardRef<
  HTMLButtonElement,
  ButtonProps
>(({ className, children, ...props }, ref) => (
  <Button
    type="button"
    className={className}
    data-style="ghost"
    data-appearance="default"
    role="button"
    tabIndex={-1}
    aria-label="Text color"
    tooltip="Text Color"
    ref={ref}
    {...props}
  >
    {children ?? <TextColorIcon className="tiptap-button-icon" />}
  </Button>
))

TextColorPopoverButton.displayName = "TextColorPopoverButton"

export function TextColorPopoverContent({
  editor,
  colors = TEXT_COLORS,
}: TextColorPopoverContentProps) {
  const { handleSetTextColor } = useTextColor({ editor })
  const isMobile = useIsMobile()
  const containerRef = React.useRef<HTMLDivElement>(null)

  const handleRemoveColor = React.useCallback(() => {
    if (!editor) return
    editor.chain().focus().unsetColor().run()
  }, [editor])

  const menuItems = React.useMemo(
    () => [...colors, { label: "Remove color", value: "none" }],
    [colors]
  )

  const { selectedIndex } = useMenuNavigation({
    containerRef,
    items: menuItems,
    orientation: "both",
    onSelect: (item) => {
      if (!containerRef.current) return false
      const highlightedElement = containerRef.current.querySelector(
        '[data-highlighted="true"]'
      ) as HTMLElement
      if (highlightedElement) highlightedElement.click()
      if (item.value === "none") handleRemoveColor()
    },
    autoSelectFirstItem: false,
  })

  return (
    <Card
      ref={containerRef}
      tabIndex={0}
      style={isMobile ? { boxShadow: "none", border: 0 } : {}}
    >
      <CardBody style={isMobile ? { padding: 0 } : {}}>
        <CardItemGroup orientation="horizontal">
          <ButtonGroup orientation="horizontal">
            {colors.map((color, index) => (
              <TextColorButton
                key={color.value}
                editor={editor}
                color={color.value}
                tooltip={color.label}
                aria-label={`${color.label} text color`}
                tabIndex={index === selectedIndex ? 0 : -1}
                data-highlighted={selectedIndex === index}
                showTooltip={false}
              >
                <div
                  style={{
                    width: "1.25rem",
                    height: "1.25rem",
                    borderRadius: "var(--tt-radius-xl)",
                    backgroundColor: color.value,
                    border: "1px solid var(--tt-border-color)",
                  }}
                />
              </TextColorButton>
            ))}
          </ButtonGroup>
          <Separator />
          <ButtonGroup orientation="horizontal">
            <Button
              onClick={handleRemoveColor}
              aria-label="Remove text color"
              tooltip="Remove text color"
              tabIndex={selectedIndex === colors.length ? 0 : -1}
              type="button"
              role="menuitem"
              data-style="ghost"
              data-highlighted={selectedIndex === colors.length}
            >
              <BanIcon className="tiptap-button-icon" />
            </Button>
          </ButtonGroup>
        </CardItemGroup>
      </CardBody>
    </Card>
  )
}

export function TextColorPopover({
  editor: providedEditor,
  colors = TEXT_COLORS,
  hideWhenUnavailable = false,
  onApplied,
  ...props
}: TextColorPopoverProps) {
  const { editor } = useTiptapEditor(providedEditor)
  const [isOpen, setIsOpen] = React.useState(false)
  const { isVisible, canSet, currentColor, label } = useTextColor({
    editor,
    hideWhenUnavailable,
    onApplied,
  })

  if (!isVisible) return null

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <TextColorPopoverButton
          disabled={!canSet}
          data-disabled={!canSet}
          aria-label={label}
          tooltip={label}
          style={currentColor ? { color: currentColor } : undefined}
          {...props}
        >
          <TextColorIcon className="tiptap-button-icon" />
        </TextColorPopoverButton>
      </PopoverTrigger>
      <PopoverContent aria-label="Text colors">
        <TextColorPopoverContent editor={editor} colors={colors} />
      </PopoverContent>
    </Popover>
  )
}

export default TextColorPopover

