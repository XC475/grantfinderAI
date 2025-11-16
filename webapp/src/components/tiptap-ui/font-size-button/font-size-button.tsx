"use client"

import * as React from "react"

// --- Hooks ---
import { useTiptapEditor } from "@/hooks/use-tiptap-editor"

// --- Tiptap UI ---
import type { UseFontSizeConfig } from "@/components/tiptap-ui/font-size-button"
import { useFontSize } from "@/components/tiptap-ui/font-size-button"

// --- UI Primitives ---
import type { ButtonProps } from "@/components/tiptap-ui-primitive/button"
import { Button } from "@/components/tiptap-ui-primitive/button"

export interface FontSizeButtonProps
  extends Omit<ButtonProps, "type">,
    UseFontSizeConfig {
  /**
   * Optional text to display alongside the icon.
   */
  text?: string
}

/**
 * Button component for setting font size in a Tiptap editor.
 */
export const FontSizeButton = React.forwardRef<
  HTMLButtonElement,
  FontSizeButtonProps
>(
  (
    {
      editor: providedEditor,
      fontSize,
      text,
      hideWhenUnavailable = false,
      onApplied,
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
      handleSetFontSize,
      canSet,
      label,
    } = useFontSize({
      editor,
      fontSize,
      hideWhenUnavailable,
      onApplied,
    })

    const handleClick = React.useCallback(
      (event: React.MouseEvent<HTMLButtonElement>) => {
        onClick?.(event)
        if (event.defaultPrevented) return
        handleSetFontSize()
      },
      [handleSetFontSize, onClick]
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
        tooltip={label}
        onClick={handleClick}
        className="w-full justify-start"
        {...buttonProps}
        ref={ref}
      >
        {children ?? (
          <>
            {text && <span className="tiptap-button-text">{text}</span>}
          </>
        )}
      </Button>
    )
  }
)

FontSizeButton.displayName = "FontSizeButton"

