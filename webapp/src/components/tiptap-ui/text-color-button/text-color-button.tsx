"use client"

import * as React from "react"

// --- Hooks ---
import { useTiptapEditor } from "@/hooks/use-tiptap-editor"

// --- Tiptap UI ---
import type { UseTextColorConfig } from "@/components/tiptap-ui/text-color-button"
import { useTextColor } from "@/components/tiptap-ui/text-color-button"

// --- UI Primitives ---
import type { ButtonProps } from "@/components/tiptap-ui-primitive/button"
import { Button } from "@/components/tiptap-ui-primitive/button"

export interface TextColorButtonProps
  extends Omit<ButtonProps, "type">,
    UseTextColorConfig {
  /**
   * Optional show tooltip
   * @default true
   */
  showTooltip?: boolean
}

/**
 * Button component for setting text color in a Tiptap editor.
 */
export const TextColorButton = React.forwardRef<
  HTMLButtonElement,
  TextColorButtonProps
>(
  (
    {
      editor: providedEditor,
      color,
      hideWhenUnavailable = false,
      onApplied,
      showTooltip = true,
      onClick,
      children,
      ...buttonProps
    },
    ref
  ) => {
    const { editor } = useTiptapEditor(providedEditor)
    const {
      isVisible,
      isActive,
      handleSetTextColor,
      canSet,
      label,
    } = useTextColor({
      editor,
      color,
      hideWhenUnavailable,
      onApplied,
    })

    const handleClick = React.useCallback(
      (event: React.MouseEvent<HTMLButtonElement>) => {
        onClick?.(event)
        if (event.defaultPrevented) return
        handleSetTextColor()
      },
      [handleSetTextColor, onClick]
    )

    if (!isVisible) {
      return null
    }

    return (
      <Button
        type="button"
        data-style="ghost"
        data-active-state={isActive ? "on" : "off"}
        role="button"
        tabIndex={-1}
        disabled={!canSet}
        data-disabled={!canSet}
        aria-label={label}
        aria-pressed={isActive}
        tooltip={showTooltip ? label : undefined}
        onClick={handleClick}
        style={color && color !== "default" ? { color } : undefined}
        {...buttonProps}
        ref={ref}
      >
        {children}
      </Button>
    )
  }
)

TextColorButton.displayName = "TextColorButton"

