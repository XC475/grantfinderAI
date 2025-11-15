"use client";

import { useDraggable, useDroppable } from "@dnd-kit/core";
import { FileText, MoreHorizontal, Trash2, GripVertical, Edit, Copy, FolderInput, File, Table } from "lucide-react";
import { FolderIcon } from "./FolderIcon";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface Folder {
  id: string;
  name: string;
  applicationId: string | null;
  documentCount?: number;
  subfolderCount?: number;
  updatedAt: string;
}

interface Document {
  id: string;
  title: string;
  updatedAt: string;
  applicationId?: string | null;
  fileUrl?: string | null;
  fileType?: string | null;
}

// Helper function to get the appropriate icon for a document
function getDocumentIcon(document: Document) {
  if (!document.fileType) {
    // Regular editable document
    return <FileText className="h-4 w-4 text-blue-500 flex-shrink-0" />;
  }

  // File uploads - different icons based on type
  if (document.fileType === "application/pdf") {
    return <FileText className="h-4 w-4 text-red-500 flex-shrink-0" />;
  }
  if (
    document.fileType ===
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    return <FileText className="h-4 w-4 text-blue-600 flex-shrink-0" />;
  }
  if (document.fileType === "text/csv") {
    return <Table className="h-4 w-4 text-green-600 flex-shrink-0" />;
  }
  if (document.fileType === "text/plain") {
    return <File className="h-4 w-4 text-gray-600 flex-shrink-0" />;
  }

  // Default file icon
  return <File className="h-4 w-4 text-muted-foreground flex-shrink-0" />;
}

interface FolderListProps {
  folders: Folder[];
  documents: Document[];
  onFolderClick: (folderId: string) => void;
  onDocumentClick: (documentId: string) => void;
  onDeleteFolder?: (folderId: string) => void;
  onDeleteDocument?: (documentId: string) => void;
  onRenameFolder?: (folderId: string, newName: string) => void;
  onRenameDocument?: (documentId: string, newTitle: string) => void;
  onCopyFolder?: (folderId: string) => void;
  onCopyDocument?: (documentId: string) => void;
  onMoveFolder?: (folderId: string) => void;
  onMoveDocument?: (documentId: string) => void;
  organizationSlug: string;
}

function DraggableFolder({
  folder,
  onClick,
  onDelete,
  onRename,
  onCopy,
  onMove,
}: {
  folder: Folder;
  onClick: () => void;
  onDelete?: () => void;
  onRename?: () => void;
  onCopy?: () => void;
  onMove?: () => void;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: folder.id,
    data: { type: "folder", folder },
  });

  const { setNodeRef: setDropRef, isOver } = useDroppable({
    id: `folder-drop-${folder.id}`,
    data: { type: "folder", folderId: folder.id },
  });

  return (
    <tr
      ref={(node) => {
        setNodeRef(node);
        setDropRef(node);
      }}
      className={cn(
        "border-b hover:bg-accent/50 transition-colors group",
        isDragging && "opacity-50",
        isOver && "bg-accent/70"
      )}
    >
      <td className="py-3 px-4">
        <div className="flex items-center gap-3">
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <GripVertical className="h-4 w-4 text-muted-foreground" />
          </div>
          <div
            className="flex items-center gap-3 flex-1 cursor-pointer"
            onClick={onClick}
          >
            <FolderIcon isApplicationFolder={!!folder.applicationId} />
            <span className="font-medium">{folder.name}</span>
          </div>
        </div>
      </td>
      <td className="py-3 px-4 text-sm text-muted-foreground">
        {format(new Date(folder.updatedAt), "MMM d, yyyy")}
      </td>
      <td className="py-3 px-4 text-right">
        {(onRename || onCopy || onMove || onDelete) && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {!folder.applicationId && onRename && (
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    onRename();
                  }}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Rename
                </DropdownMenuItem>
              )}
              {onCopy && (
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    onCopy();
                  }}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Make a Copy
                </DropdownMenuItem>
              )}
              {onMove && (
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    onMove();
                  }}
                >
                  <FolderInput className="h-4 w-4 mr-2" />
                  Move
                </DropdownMenuItem>
              )}
              {!folder.applicationId && onDelete && (
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete();
                  }}
                  className="text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </td>
    </tr>
  );
}

function DraggableDocument({
  document,
  onClick,
  onDelete,
  onRename,
  onCopy,
  onMove,
  organizationSlug,
}: {
  document: Document;
  onClick: () => void;
  onDelete?: () => void;
  onRename?: () => void;
  onCopy?: () => void;
  onMove?: () => void;
  organizationSlug: string;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: document.id,
    data: { type: "document", document },
  });

  return (
    <tr
      ref={setNodeRef}
      className={cn(
        "border-b hover:bg-accent/50 transition-colors group",
        isDragging && "opacity-50"
      )}
    >
      <td className="py-3 px-4">
        <div className="flex items-center gap-3">
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <GripVertical className="h-4 w-4 text-muted-foreground" />
          </div>
          <div
            className="flex items-center gap-3 flex-1 cursor-pointer"
            onClick={onClick}
          >
            {getDocumentIcon(document)}
            <span className="font-medium">{document.title}</span>
          </div>
        </div>
      </td>
      <td className="py-3 px-4 text-sm text-muted-foreground">
        {format(new Date(document.updatedAt), "MMM d, yyyy")}
      </td>
      <td className="py-3 px-4 text-right">
        {(onRename || onCopy || onMove || onDelete) && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {onRename && (
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    onRename();
                  }}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Rename
                </DropdownMenuItem>
              )}
              {onCopy && (
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    onCopy();
                  }}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Make a Copy
                </DropdownMenuItem>
              )}
              {onMove && (
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    onMove();
                  }}
                >
                  <FolderInput className="h-4 w-4 mr-2" />
                  Move
                </DropdownMenuItem>
              )}
              {onDelete && (
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete();
                  }}
                  className="text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </td>
    </tr>
  );
}

export function FolderList({
  folders,
  documents,
  onFolderClick,
  onDocumentClick,
  onDeleteFolder,
  onDeleteDocument,
  onRenameFolder,
  onRenameDocument,
  onCopyFolder,
  onCopyDocument,
  onMoveFolder,
  onMoveDocument,
  organizationSlug,
}: FolderListProps) {
  // Root level droppable zone
  const { setNodeRef: setRootDropRef, isOver: isRootOver } = useDroppable({
    id: "root-drop",
    data: { type: "root" },
  });

  if (folders.length === 0 && documents.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>This folder is empty.</p>
        <p className="text-sm mt-1">
          Create a document or subfolder to get started.
        </p>
      </div>
    );
  }

  return (
    <div
      ref={setRootDropRef}
      className={cn(
        "overflow-hidden",
        isRootOver && "ring-2 ring-primary ring-offset-2"
      )}
    >
      <table className="w-full">
        <thead className="border-b">
          <tr>
            <th className="py-3 px-4 text-left text-sm font-medium text-muted-foreground hover:bg-muted/30 cursor-pointer transition-colors">
              Name
            </th>
            <th className="py-3 px-4 text-left text-sm font-medium text-muted-foreground hover:bg-muted/30 cursor-pointer transition-colors">
              Date modified
            </th>
            <th className="py-3 px-4 text-right w-12"></th>
          </tr>
        </thead>
        <tbody>
          {folders.map((folder) => (
            <DraggableFolder
              key={folder.id}
              folder={folder}
              onClick={() => onFolderClick(folder.id)}
              onDelete={
                onDeleteFolder ? () => onDeleteFolder(folder.id) : undefined
              }
              onRename={
                onRenameFolder
                  ? () => onRenameFolder(folder.id, folder.name)
                  : undefined
              }
              onCopy={
                onCopyFolder ? () => onCopyFolder(folder.id) : undefined
              }
              onMove={
                onMoveFolder ? () => onMoveFolder(folder.id) : undefined
              }
            />
          ))}

          {documents.map((document) => (
            <DraggableDocument
              key={document.id}
              document={document}
              onClick={() => onDocumentClick(document.id)}
              onDelete={
                onDeleteDocument
                  ? () => onDeleteDocument(document.id)
                  : undefined
              }
              onRename={
                onRenameDocument
                  ? () => onRenameDocument(document.id, document.title)
                  : undefined
              }
              onCopy={
                onCopyDocument ? () => onCopyDocument(document.id) : undefined
              }
              onMove={
                onMoveDocument ? () => onMoveDocument(document.id) : undefined
              }
              organizationSlug={organizationSlug}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
