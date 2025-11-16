"use client"

import * as React from "react"
import { type Editor } from "@tiptap/react"

// --- Hooks ---
import { useTiptapEditor } from "@/hooks/use-tiptap-editor"

// --- Lib ---
import { isMarkInSchema } from "@/lib/tiptap-utils"

export interface UseFontFamilyConfig {
  /**
   * The Tiptap editor instance.
   */
  editor?: Editor | null
  /**
   * The font family to apply.
   */
  fontFamily?: string
  /**
   * Whether the button should hide when font family is not available.
   * @default false
   */
  hideWhenUnavailable?: boolean
  /**
   * Callback function called after a successful font family change.
   */
  onApplied?: ({ fontFamily }: { fontFamily: string }) => void
}

/**
 * Checks if font family can be applied in the current editor state
 */
export function canSetFontFamily(editor: Editor | null): boolean {
  if (!editor || !editor.isEditable) return false
  if (!isMarkInSchema("textStyle", editor)) return false
  return true
}

/**
 * Checks if the specified font family is active
 */
export function isFontFamilyActive(
  editor: Editor | null,
  fontFamily: string
): boolean {
  if (!editor) return false
  return editor.isActive("textStyle", { fontFamily })
}

/**
 * Gets the current font family from the editor
 */
export function getFontFamily(editor: Editor | null): string | null {
  if (!editor) return null
  const { fontFamily } = editor.getAttributes("textStyle")
  return fontFamily || null
}

/**
 * Sets the font family in the editor
 */
export function setFontFamily(
  editor: Editor | null,
  fontFamily: string
): boolean {
  if (!editor || !canSetFontFamily(editor)) return false

  if (fontFamily === "default" || fontFamily === "") {
    editor.chain().focus().unsetFontFamily().run()
  } else {
    editor.chain().focus().setFontFamily(fontFamily).run()
  }

  return true
}

/**
 * Custom hook that provides font family functionality for Tiptap editor
 */
export function useFontFamily(config: UseFontFamilyConfig) {
  const {
    editor: providedEditor,
    fontFamily,
    hideWhenUnavailable = false,
    onApplied,
  } = config

  const { editor } = useTiptapEditor(providedEditor)
  const [isVisible, setIsVisible] = React.useState<boolean>(true)
  const canSet = canSetFontFamily(editor)
  const isActive = fontFamily ? isFontFamilyActive(editor, fontFamily) : false
  const currentFontFamily = getFontFamily(editor)

  React.useEffect(() => {
    if (!editor) return

    const handleSelectionUpdate = () => {
      setIsVisible(
        !hideWhenUnavailable || (hideWhenUnavailable && canSetFontFamily(editor))
      )
    }

    handleSelectionUpdate()

    editor.on("selectionUpdate", handleSelectionUpdate)

    return () => {
      editor.off("selectionUpdate", handleSelectionUpdate)
    }
  }, [editor, hideWhenUnavailable])

  const handleSetFontFamily = React.useCallback(() => {
    if (!editor || !fontFamily) return false

    const success = setFontFamily(editor, fontFamily)
    if (success) {
      onApplied?.({ fontFamily })
    }
    return success
  }, [editor, fontFamily, onApplied])

  return {
    isVisible,
    isActive,
    handleSetFontFamily,
    canSet,
    currentFontFamily,
    label: fontFamily || "Font Family",
  }
}

