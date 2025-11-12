"use client";

import { useDraggable, useDroppable } from "@dnd-kit/core";
import { FileText, MoreHorizontal, Trash2, GripVertical } from "lucide-react";
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
}

interface FolderListProps {
  folders: Folder[];
  documents: Document[];
  onFolderClick: (folderId: string) => void;
  onDocumentClick: (documentId: string) => void;
  onDeleteFolder?: (folderId: string) => void;
  onDeleteDocument?: (documentId: string) => void;
  organizationSlug: string;
}

function DraggableFolder({
  folder,
  onClick,
  onDelete,
}: {
  folder: Folder;
  onClick: () => void;
  onDelete?: () => void;
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
      <td className="py-3 px-4 text-sm text-muted-foreground">—</td>
      <td className="py-3 px-4 text-sm text-muted-foreground">
        {format(new Date(folder.updatedAt), "MMM d, yyyy")}
      </td>
      <td className="py-3 px-4 text-right">
        {!folder.applicationId && onDelete && (
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
  organizationSlug,
}: {
  document: Document;
  onClick: () => void;
  onDelete?: () => void;
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
            <FileText className="h-4 w-4 text-blue-500 flex-shrink-0" />
            <span className="font-medium">{document.title}</span>
          </div>
        </div>
      </td>
      <td className="py-3 px-4 text-sm text-muted-foreground">me</td>
      <td className="py-3 px-4 text-sm text-muted-foreground">
        {format(new Date(document.updatedAt), "MMM d, yyyy")}
      </td>
      <td className="py-3 px-4 text-right">
        {onDelete && (
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
        "border rounded-lg overflow-hidden",
        isRootOver && "ring-2 ring-primary ring-offset-2"
      )}
    >
      <table className="w-full">
        <thead className="bg-muted/50 border-b">
          <tr>
            <th className="py-3 px-4 text-left text-sm font-medium text-muted-foreground">
              Name
            </th>
            <th className="py-3 px-4 text-left text-sm font-medium text-muted-foreground">
              Owner
            </th>
            <th className="py-3 px-4 text-left text-sm font-medium text-muted-foreground">
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
              organizationSlug={organizationSlug}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
