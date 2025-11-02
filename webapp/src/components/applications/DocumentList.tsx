"use client";

import { CreateDocumentButton } from "./CreateDocumentButton";
import { useState } from "react";
import { FileText, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

interface Document {
  id: string;
  title: string;
  content?: string;
  contentType: string;
  version: number;
  createdAt: string;
  updatedAt: string;
}

interface DocumentListProps {
  documents: Document[];
  applicationId: string;
  organizationSlug: string;
  onEdit: (documentId: string) => void;
  onDelete: (documentId: string) => void;
  onRefresh: () => void;
  isDeleting?: boolean;
}

export function DocumentList({
  documents,
  applicationId,
  organizationSlug,
  onEdit,
  onDelete,
  onRefresh,
  isDeleting = false,
}: DocumentListProps) {
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateSuccess = () => {
    setIsCreating(false);
    onRefresh();
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - date.getTime());
      const diffMinutes = Math.floor(diffTime / (1000 * 60));
      const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      const diffMonths = Math.floor(diffDays / 30);

      if (diffMinutes < 60) {
        return diffMinutes === 0
          ? "just now"
          : `${diffMinutes} minute${diffMinutes !== 1 ? "s" : ""} ago`;
      } else if (diffHours < 24) {
        return `${diffHours} hour${diffHours !== 1 ? "s" : ""} ago`;
      } else if (diffDays < 30) {
        return `${diffDays} day${diffDays !== 1 ? "s" : ""} ago`;
      } else if (diffMonths < 12) {
        return `about ${diffMonths} month${diffMonths !== 1 ? "s" : ""} ago`;
      } else {
        return date.toLocaleDateString();
      }
    } catch {
      return "Unknown";
    }
  };

  if (documents.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Documents</h3>
          <CreateDocumentButton
            applicationId={applicationId}
            organizationSlug={organizationSlug}
            onSuccess={handleCreateSuccess}
            isCreating={isCreating}
            setIsCreating={setIsCreating}
          />
        </div>
        <div className="text-center py-8 text-muted-foreground">
          <p>No documents yet. Create your first document to get started.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">
          Documents ({documents.length})
        </h3>
        <CreateDocumentButton
          applicationId={applicationId}
          organizationSlug={organizationSlug}
          onSuccess={handleCreateSuccess}
          isCreating={isCreating}
          setIsCreating={setIsCreating}
        />
      </div>

      <div className="space-y-0">
        {/* Header Row */}
        <div className="flex items-center justify-between px-4 py-3 text-sm font-medium text-muted-foreground border-b">
          <span>Name</span>
          <span>Updated at</span>
        </div>

        {/* Document Rows */}
        {documents.map((document) => (
          <div
            key={document.id}
            className="flex items-center justify-between px-4 py-3 border-b hover:bg-muted/30 transition-colors group"
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <span
                className="font-medium hover:underline cursor-pointer truncate"
                onClick={() => onEdit(document.id)}
              >
                {document.title}
              </span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity ml-2"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => onDelete(document.id)}
                    className="text-destructive focus:text-destructive cursor-pointer"
                    disabled={isDeleting}
                  >
                    {isDeleting ? "Deleting..." : "Delete"}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0 ml-4">
              <span className="text-sm text-muted-foreground">
                {formatDate(document.updatedAt)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
