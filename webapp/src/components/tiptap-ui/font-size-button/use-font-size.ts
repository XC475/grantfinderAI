"use client"

import * as React from "react"
import { type Editor } from "@tiptap/react"

// --- Hooks ---
import { useTiptapEditor } from "@/hooks/use-tiptap-editor"

// --- Lib ---
import { isMarkInSchema } from "@/lib/tiptap-utils"

export interface UseFontSizeConfig {
  /**
   * The Tiptap editor instance.
   */
  editor?: Editor | null
  /**
   * The font size to apply.
   */
  fontSize?: string
  /**
   * Whether the button should hide when font size is not available.
   * @default false
   */
  hideWhenUnavailable?: boolean
  /**
   * Callback function called after a successful font size change.
   */
  onApplied?: ({ fontSize }: { fontSize: string }) => void
}

/**
 * Checks if font size can be applied in the current editor state
 */
export function canSetFontSize(editor: Editor | null): boolean {
  if (!editor || !editor.isEditable) return false
  if (!isMarkInSchema("textStyle", editor)) return false
  return true
}

/**
 * Checks if the specified font size is active
 */
export function isFontSizeActive(
  editor: Editor | null,
  fontSize: string
): boolean {
  if (!editor) return false
  return editor.isActive("textStyle", { fontSize })
}

/**
 * Gets the current font size from the editor
 */
export function getFontSize(editor: Editor | null): string | null {
  if (!editor) return null
  const { fontSize } = editor.getAttributes("textStyle")
  return fontSize || null
}

/**
 * Sets the font size in the editor
 */
export function setFontSize(editor: Editor | null, fontSize: string): boolean {
  if (!editor || !canSetFontSize(editor)) return false

  if (fontSize === "default" || fontSize === "") {
    // Check if unsetFontSize method exists
    if (editor.can().unsetFontSize()) {
      editor.chain().focus().unsetFontSize().run()
    } else {
      // Fallback: set to empty string
      editor.chain().focus().setFontSize("").run()
    }
  } else {
    editor.chain().focus().setFontSize(fontSize).run()
  }

  return true
}

/**
 * Custom hook that provides font size functionality for Tiptap editor
 */
export function useFontSize(config: UseFontSizeConfig) {
  const {
    editor: providedEditor,
    fontSize,
    hideWhenUnavailable = false,
    onApplied,
  } = config

  const { editor } = useTiptapEditor(providedEditor)
  const [isVisible, setIsVisible] = React.useState<boolean>(true)
  const canSet = canSetFontSize(editor)
  const isActive = fontSize ? isFontSizeActive(editor, fontSize) : false
  const currentFontSize = getFontSize(editor)

  React.useEffect(() => {
    if (!editor) return

    const handleSelectionUpdate = () => {
      setIsVisible(
        !hideWhenUnavailable || (hideWhenUnavailable && canSetFontSize(editor))
      )
    }

    handleSelectionUpdate()

    editor.on("selectionUpdate", handleSelectionUpdate)

    return () => {
      editor.off("selectionUpdate", handleSelectionUpdate)
    }
  }, [editor, hideWhenUnavailable])

  const handleSetFontSize = React.useCallback(() => {
    if (!editor || !fontSize) return false

    const success = setFontSize(editor, fontSize)
    if (success) {
      onApplied?.({ fontSize })
    }
    return success
  }, [editor, fontSize, onApplied])

  return {
    isVisible,
    isActive,
    handleSetFontSize,
    canSet,
    currentFontSize,
    label: fontSize || "Font Size",
  }
}

