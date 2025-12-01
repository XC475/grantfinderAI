"use client"

import * as React from "react"

// --- Icons ---
import { FileTextIcon } from "@/components/tiptap-icons/file-text-icon"
import { EditIcon } from "@/components/tiptap-icons/edit-icon"
import { DownloadIcon } from "@/components/tiptap-icons/download-icon"
import { FolderIcon } from "@/components/tiptap-icons/folder-icon"
import { TrashIcon } from "@/components/tiptap-icons/trash-icon"
import { ChevronRightIcon } from "@/components/tiptap-icons/chevron-right-icon"

// --- UI Primitives ---
import { Button } from "@/components/tiptap-ui-primitive/button"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/tiptap-ui-primitive/dropdown-menu"
import { Card, CardBody } from "@/components/tiptap-ui-primitive/card"

// Simple separator component
const MenuSeparator = () => (
  <div className="h-px bg-border my-1" />
)

export interface DocumentMenuProps {
  /**
   * Document ID for actions
   */
  documentId?: string
  /**
   * Callback for rename action (not implemented yet)
   */
  onRename?: () => void
  /**
   * Callback for export action (not implemented yet)
   */
  onExport?: (format: string) => void
  /**
   * Callback for move action (not implemented yet)
   */
  onMove?: () => void
  /**
   * Callback for delete action (not implemented yet)
   */
  onDelete?: () => void
}

/**
 * Document menu component for document management actions.
 * Contains: Rename, Export, Move to folder, Delete
 */
export const DocumentMenu = React.forwardRef<
  HTMLButtonElement,
  DocumentMenuProps
>(({ documentId, onRename, onExport, onMove, onDelete }, ref) => {
  const [isOpen, setIsOpen] = React.useState(false)

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          data-style="ghost"
          role="button"
          tabIndex={-1}
          aria-label="Document options"
          tooltip="Document options"
          ref={ref}
          className="h-8 w-8"
        >
          <FileTextIcon className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start" className="min-w-[220px]">
        <Card>
          <CardBody className="p-1">
            {/* Rename */}
            <DropdownMenuItem asChild>
              <button
                className="w-full flex items-center gap-3 px-3 py-2 text-sm rounded hover:bg-accent cursor-pointer"
                onClick={(e) => {
                  e.preventDefault()
                  console.log("Rename clicked (not implemented yet)")
                  setIsOpen(false)
                }}
              >
                <EditIcon className="h-4 w-4" />
                <div className="flex flex-col items-start">
                  <span className="font-medium">Rename</span>
                  <span className="text-xs text-muted-foreground">
                    Double-click title
                  </span>
                </div>
              </button>
            </DropdownMenuItem>

            <MenuSeparator />

            {/* Export with submenu */}
            <DropdownMenuSub>
              <DropdownMenuSubTrigger asChild>
                <button className="w-full flex items-center justify-between gap-3 px-3 py-2 text-sm rounded hover:bg-accent cursor-pointer">
                  <div className="flex items-center gap-3">
                    <DownloadIcon className="h-4 w-4" />
                    <span className="font-medium">Export as...</span>
                  </div>
                  <ChevronRightIcon className="h-3 w-3 opacity-50" />
                </button>
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent className="min-w-[160px]">
                <Card>
                  <CardBody className="p-1">
                    <DropdownMenuItem asChild>
                      <button
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded hover:bg-accent cursor-pointer"
                        onClick={(e) => {
                          e.preventDefault()
                          console.log("Export as PDF (not implemented yet)")
                          setIsOpen(false)
                        }}
                      >
                        <span className="text-sm">📄</span>
                        <span>PDF</span>
                      </button>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <button
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded hover:bg-accent cursor-pointer"
                        onClick={(e) => {
                          e.preventDefault()
                          console.log("Export as DOCX (not implemented yet)")
                          setIsOpen(false)
                        }}
                      >
                        <span className="text-sm">📝</span>
                        <span>Word (.docx)</span>
                      </button>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <button
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded hover:bg-accent cursor-pointer"
                        onClick={(e) => {
                          e.preventDefault()
                          console.log("Export as TXT (not implemented yet)")
                          setIsOpen(false)
                        }}
                      >
                        <span className="text-sm">📋</span>
                        <span>Plain Text</span>
                      </button>
                    </DropdownMenuItem>
                  </CardBody>
                </Card>
              </DropdownMenuSubContent>
            </DropdownMenuSub>

            {/* Move to folder */}
            <DropdownMenuItem asChild>
              <button
                className="w-full flex items-center gap-3 px-3 py-2 text-sm rounded hover:bg-accent cursor-pointer"
                onClick={(e) => {
                  e.preventDefault()
                  console.log("Move to folder clicked (not implemented yet)")
                  setIsOpen(false)
                }}
              >
                <FolderIcon className="h-4 w-4" />
                <span className="font-medium">Move to folder...</span>
              </button>
            </DropdownMenuItem>

            <MenuSeparator />

            {/* Delete */}
            <DropdownMenuItem asChild>
              <button
                className="w-full flex items-center gap-3 px-3 py-2 text-sm rounded hover:bg-destructive/10 cursor-pointer text-destructive"
                onClick={(e) => {
                  e.preventDefault()
                  console.log("Delete clicked (not implemented yet)")
                  setIsOpen(false)
                }}
              >
                <TrashIcon className="h-4 w-4" />
                <span className="font-medium">Delete</span>
              </button>
            </DropdownMenuItem>
          </CardBody>
        </Card>
      </DropdownMenuContent>
    </DropdownMenu>
  )
})

DocumentMenu.displayName = "DocumentMenu"

export default DocumentMenu

