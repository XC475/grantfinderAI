"use client"

import * as React from "react"

// --- Hooks ---
import { useTiptapEditor } from "@/hooks/use-tiptap-editor"

// --- Tiptap UI ---
import type { UseFontFamilyConfig } from "@/components/tiptap-ui/font-family-button"
import { useFontFamily } from "@/components/tiptap-ui/font-family-button"

// --- UI Primitives ---
import type { ButtonProps } from "@/components/tiptap-ui-primitive/button"
import { Button } from "@/components/tiptap-ui-primitive/button"

export interface FontFamilyButtonProps
  extends Omit<ButtonProps, "type">,
    UseFontFamilyConfig {
  /**
   * Optional text to display alongside the icon.
   */
  text?: string
}

/**
 * Button component for setting font family in a Tiptap editor.
 */
export const FontFamilyButton = React.forwardRef<
  HTMLButtonElement,
  FontFamilyButtonProps
>(
  (
    {
      editor: providedEditor,
      fontFamily,
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
      handleSetFontFamily,
      canSet,
      label,
    } = useFontFamily({
      editor,
      fontFamily,
      hideWhenUnavailable,
      onApplied,
    })

    const handleClick = React.useCallback(
      (event: React.MouseEvent<HTMLButtonElement>) => {
        onClick?.(event)
        if (event.defaultPrevented) return
        handleSetFontFamily()
      },
      [handleSetFontFamily, onClick]
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

FontFamilyButton.displayName = "FontFamilyButton"

