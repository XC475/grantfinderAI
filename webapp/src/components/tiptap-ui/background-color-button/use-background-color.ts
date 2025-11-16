"use client"

import * as React from "react"
import { type Editor } from "@tiptap/react"

// --- Hooks ---
import { useTiptapEditor } from "@/hooks/use-tiptap-editor"

// --- Lib ---
import { isMarkInSchema } from "@/lib/tiptap-utils"

export interface UseBackgroundColorConfig {
  /**
   * The Tiptap editor instance.
   */
  editor?: Editor | null
  /**
   * The background color to apply.
   */
  backgroundColor?: string
  /**
   * Whether the button should hide when background color is not available.
   * @default false
   */
  hideWhenUnavailable?: boolean
  /**
   * Callback function called after a successful background color change.
   */
  onApplied?: ({ backgroundColor }: { backgroundColor: string }) => void
}

/**
 * Checks if background color can be applied in the current editor state
 */
export function canSetBackgroundColor(editor: Editor | null): boolean {
  if (!editor || !editor.isEditable) return false
  if (!isMarkInSchema("textStyle", editor)) return false
  return true
}

/**
 * Checks if the specified background color is active
 */
export function isBackgroundColorActive(
  editor: Editor | null,
  backgroundColor: string
): boolean {
  if (!editor) return false
  return editor.isActive("textStyle", { backgroundColor })
}

/**
 * Gets the current background color from the editor
 */
export function getBackgroundColor(editor: Editor | null): string | null {
  if (!editor) return null
  const { backgroundColor } = editor.getAttributes("textStyle")
  return backgroundColor || null
}

/**
 * Sets the background color in the editor
 */
export function setBackgroundColor(
  editor: Editor | null,
  backgroundColor: string
): boolean {
  if (!editor || !canSetBackgroundColor(editor)) return false

  if (backgroundColor === "default" || backgroundColor === "") {
    editor.chain().focus().unsetBackgroundColor().run()
  } else {
    editor.chain().focus().setBackgroundColor(backgroundColor).run()
  }

  return true
}

/**
 * Custom hook that provides background color functionality for Tiptap editor
 */
export function useBackgroundColor(config: UseBackgroundColorConfig) {
  const {
    editor: providedEditor,
    backgroundColor,
    hideWhenUnavailable = false,
    onApplied,
  } = config

  const { editor } = useTiptapEditor(providedEditor)
  const [isVisible, setIsVisible] = React.useState<boolean>(true)
  const canSet = canSetBackgroundColor(editor)
  const isActive = backgroundColor
    ? isBackgroundColorActive(editor, backgroundColor)
    : false
  const currentBackgroundColor = getBackgroundColor(editor)

  React.useEffect(() => {
    if (!editor) return

    const handleSelectionUpdate = () => {
      setIsVisible(
        !hideWhenUnavailable ||
          (hideWhenUnavailable && canSetBackgroundColor(editor))
      )
    }

    handleSelectionUpdate()

    editor.on("selectionUpdate", handleSelectionUpdate)

    return () => {
      editor.off("selectionUpdate", handleSelectionUpdate)
    }
  }, [editor, hideWhenUnavailable])

  const handleSetBackgroundColor = React.useCallback(() => {
    if (!editor || !backgroundColor) return false

    const success = setBackgroundColor(editor, backgroundColor)
    if (success) {
      onApplied?.({ backgroundColor })
    }
    return success
  }, [editor, backgroundColor, onApplied])

  return {
    isVisible,
    isActive,
    handleSetBackgroundColor,
    canSet,
    currentBackgroundColor,
    label: backgroundColor || "Background Color",
  }
}

