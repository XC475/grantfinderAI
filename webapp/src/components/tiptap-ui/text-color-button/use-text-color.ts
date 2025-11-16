"use client"

import * as React from "react"
import { type Editor } from "@tiptap/react"

// --- Hooks ---
import { useTiptapEditor } from "@/hooks/use-tiptap-editor"

// --- Lib ---
import { isMarkInSchema } from "@/lib/tiptap-utils"

export interface UseTextColorConfig {
  /**
   * The Tiptap editor instance.
   */
  editor?: Editor | null
  /**
   * The text color to apply.
   */
  color?: string
  /**
   * Whether the button should hide when text color is not available.
   * @default false
   */
  hideWhenUnavailable?: boolean
  /**
   * Callback function called after a successful text color change.
   */
  onApplied?: ({ color }: { color: string }) => void
}

/**
 * Checks if text color can be applied in the current editor state
 */
export function canSetTextColor(editor: Editor | null): boolean {
  if (!editor || !editor.isEditable) return false
  if (!isMarkInSchema("textStyle", editor)) return false
  return true
}

/**
 * Checks if the specified text color is active
 */
export function isTextColorActive(editor: Editor | null, color: string): boolean {
  if (!editor) return false
  return editor.isActive("textStyle", { color })
}

/**
 * Gets the current text color from the editor
 */
export function getTextColor(editor: Editor | null): string | null {
  if (!editor) return null
  const { color } = editor.getAttributes("textStyle")
  return color || null
}

/**
 * Sets the text color in the editor
 */
export function setTextColor(editor: Editor | null, color: string): boolean {
  if (!editor || !canSetTextColor(editor)) return false

  if (color === "default" || color === "") {
    editor.chain().focus().unsetColor().run()
  } else {
    editor.chain().focus().setColor(color).run()
  }

  return true
}

/**
 * Custom hook that provides text color functionality for Tiptap editor
 */
export function useTextColor(config: UseTextColorConfig) {
  const {
    editor: providedEditor,
    color,
    hideWhenUnavailable = false,
    onApplied,
  } = config

  const { editor } = useTiptapEditor(providedEditor)
  const [isVisible, setIsVisible] = React.useState<boolean>(true)
  const canSet = canSetTextColor(editor)
  const isActive = color ? isTextColorActive(editor, color) : false
  const currentColor = getTextColor(editor)

  React.useEffect(() => {
    if (!editor) return

    const handleSelectionUpdate = () => {
      setIsVisible(
        !hideWhenUnavailable || (hideWhenUnavailable && canSetTextColor(editor))
      )
    }

    handleSelectionUpdate()

    editor.on("selectionUpdate", handleSelectionUpdate)

    return () => {
      editor.off("selectionUpdate", handleSelectionUpdate)
    }
  }, [editor, hideWhenUnavailable])

  const handleSetTextColor = React.useCallback(() => {
    if (!editor || !color) return false

    const success = setTextColor(editor, color)
    if (success) {
      onApplied?.({ color })
    }
    return success
  }, [editor, color, onApplied])

  return {
    isVisible,
    isActive,
    handleSetTextColor,
    canSet,
    currentColor,
    label: color || "Text Color",
  }
}

