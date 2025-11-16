"use client"

import * as React from "react"
import { type Editor } from "@tiptap/react"

// --- Hooks ---
import { useMenuNavigation } from "@/hooks/use-menu-navigation"
import { useIsMobile } from "@/hooks/use-mobile"
import { useTiptapEditor } from "@/hooks/use-tiptap-editor"

// --- Icons ---
import { BanIcon } from "@/components/tiptap-icons/ban-icon"
import { BackgroundColorIcon } from "@/components/tiptap-icons/background-color-icon"

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
import type { UseBackgroundColorConfig } from "@/components/tiptap-ui/background-color-button"
import {
  BackgroundColorButton,
  useBackgroundColor,
} from "@/components/tiptap-ui/background-color-button"

export type BackgroundColor = {
  label: string
  value: string
}

export const BACKGROUND_COLORS: BackgroundColor[] = [
  { label: "Yellow", value: "#FFFF00" },
  { label: "Green", value: "#00FF00" },
  { label: "Cyan", value: "#00FFFF" },
  { label: "Pink", value: "#FF00FF" },
  { label: "Red", value: "#FF0000" },
  { label: "Orange", value: "#FFA500" },
  { label: "Light Yellow", value: "#FFFFE0" },
  { label: "Light Green", value: "#90EE90" },
  { label: "Light Blue", value: "#ADD8E6" },
  { label: "Light Pink", value: "#FFB6C1" },
  { label: "Light Gray", value: "#D3D3D3" },
  { label: "White", value: "#FFFFFF" },
]

export interface BackgroundColorPopoverContentProps {
  /**
   * The Tiptap editor instance.
   */
  editor?: Editor | null
  /**
   * Optional colors to use in the background color popover.
   * If not provided, defaults to a predefined set of colors.
   */
  colors?: BackgroundColor[]
}

export interface BackgroundColorPopoverProps
  extends Omit<ButtonProps, "type">,
    Pick<
      UseBackgroundColorConfig,
      "editor" | "hideWhenUnavailable" | "onApplied"
    > {
  /**
   * Optional colors to use in the background color popover.
   * If not provided, defaults to a predefined set of colors.
   */
  colors?: BackgroundColor[]
}

export const BackgroundColorPopoverButton = React.forwardRef<
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
    aria-label="Background color"
    tooltip="Background Color"
    ref={ref}
    {...props}
  >
    {children ?? <BackgroundColorIcon className="tiptap-button-icon" />}
  </Button>
))

BackgroundColorPopoverButton.displayName = "BackgroundColorPopoverButton"

export function BackgroundColorPopoverContent({
  editor,
  colors = BACKGROUND_COLORS,
}: BackgroundColorPopoverContentProps) {
  const { handleSetBackgroundColor } = useBackgroundColor({ editor })
  const isMobile = useIsMobile()
  const containerRef = React.useRef<HTMLDivElement>(null)

  const handleRemoveColor = React.useCallback(() => {
    if (!editor) return
    editor.chain().focus().unsetBackgroundColor().run()
  }, [editor])

  const menuItems = React.useMemo(
    () => [...colors, { label: "Remove background color", value: "none" }],
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
              <BackgroundColorButton
                key={color.value}
                editor={editor}
                backgroundColor={color.value}
                tooltip={color.label}
                aria-label={`${color.label} background color`}
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
              </BackgroundColorButton>
            ))}
          </ButtonGroup>
          <Separator />
          <ButtonGroup orientation="horizontal">
            <Button
              onClick={handleRemoveColor}
              aria-label="Remove background color"
              tooltip="Remove background color"
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

export function BackgroundColorPopover({
  editor: providedEditor,
  colors = BACKGROUND_COLORS,
  hideWhenUnavailable = false,
  onApplied,
  ...props
}: BackgroundColorPopoverProps) {
  const { editor } = useTiptapEditor(providedEditor)
  const [isOpen, setIsOpen] = React.useState(false)
  const { isVisible, canSet, currentBackgroundColor, label } =
    useBackgroundColor({
      editor,
      hideWhenUnavailable,
      onApplied,
    })

  if (!isVisible) return null

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <BackgroundColorPopoverButton
          disabled={!canSet}
          data-disabled={!canSet}
          aria-label={label}
          tooltip={label}
          {...props}
        >
          <BackgroundColorIcon className="tiptap-button-icon" />
        </BackgroundColorPopoverButton>
      </PopoverTrigger>
      <PopoverContent aria-label="Background colors">
        <BackgroundColorPopoverContent editor={editor} colors={colors} />
      </PopoverContent>
    </Popover>
  )
}

export default BackgroundColorPopover

