"use client"

import { Editor } from "@tiptap/core"
import { PageBreakIcon } from "@/components/tiptap-icons/page-break-icon"

export interface UsePageBreakConfig {
  editor: Editor | null
  hideWhenUnavailable?: boolean
  onInserted?: () => void
}

/**
 * Checks if a page break can be inserted
 */
export function canInsertPageBreak(editor: Editor | null): boolean {
  if (!editor || !editor.isEditable) return false

  try {
    return editor.can().setPageBreak()
  } catch {
    return false
  }
}

/**
 * Inserts a page break in the editor
 */
export function insertPageBreak(editor: Editor | null): boolean {
  if (!editor || !editor.isEditable) return false
  if (!canInsertPageBreak(editor)) return false

  try {
    // Insert page break and then add a paragraph after it
    return editor
      .chain()
      .focus()
      .setPageBreak()
      .insertContent("<p></p>")
      .run()
  } catch {
    return false
  }
}

/**
 * Determines if the page break button should be shown
 */
export function shouldShowButton(props: {
  editor: Editor | null
  hideWhenUnavailable: boolean
}): boolean {
  const { editor, hideWhenUnavailable } = props

  if (!editor) return !hideWhenUnavailable

  if (hideWhenUnavailable) {
    return canInsertPageBreak(editor)
  }

  return true
}

/**
 * Hook for page break functionality
 */
export function usePageBreak(config: UsePageBreakConfig) {
  const { editor, hideWhenUnavailable = false, onInserted } = config

  const isVisible = shouldShowButton({ editor, hideWhenUnavailable })
  const canInsert = canInsertPageBreak(editor)

  const handleInsert = () => {
    if (insertPageBreak(editor)) {
      onInserted?.()
    }
  }

  return {
    isVisible,
    canInsert,
    handleInsert,
    label: "Insert Page Break",
    Icon: PageBreakIcon,
  }
}

export type { UsePageBreakConfig }

