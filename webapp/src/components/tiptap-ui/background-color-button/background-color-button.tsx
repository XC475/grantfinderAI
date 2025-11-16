"use client"

import * as React from "react"

// --- Hooks ---
import { useTiptapEditor } from "@/hooks/use-tiptap-editor"

// --- Tiptap UI ---
import type { UseBackgroundColorConfig } from "@/components/tiptap-ui/background-color-button"
import { useBackgroundColor } from "@/components/tiptap-ui/background-color-button"

// --- UI Primitives ---
import type { ButtonProps } from "@/components/tiptap-ui-primitive/button"
import { Button } from "@/components/tiptap-ui-primitive/button"

export interface BackgroundColorButtonProps
  extends Omit<ButtonProps, "type">,
    UseBackgroundColorConfig {
  /**
   * Optional show tooltip
   * @default true
   */
  showTooltip?: boolean
}

/**
 * Button component for setting background color in a Tiptap editor.
 */
export const BackgroundColorButton = React.forwardRef<
  HTMLButtonElement,
  BackgroundColorButtonProps
>(
  (
    {
      editor: providedEditor,
      backgroundColor,
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
      handleSetBackgroundColor,
      canSet,
      label,
    } = useBackgroundColor({
      editor,
      backgroundColor,
      hideWhenUnavailable,
      onApplied,
    })

    const handleClick = React.useCallback(
      (event: React.MouseEvent<HTMLButtonElement>) => {
        onClick?.(event)
        if (event.defaultPrevented) return
        handleSetBackgroundColor()
      },
      [handleSetBackgroundColor, onClick]
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
        {...buttonProps}
        ref={ref}
      >
        {children}
      </Button>
    )
  }
)

BackgroundColorButton.displayName = "BackgroundColorButton"

