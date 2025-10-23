"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Edit, Trash2, Calendar } from "lucide-react";
import { useState } from "react";

interface DocumentCardProps {
  document: {
    id: string;
    title: string;
    content?: string;
    contentType: string;
    version: number;
    createdAt: string;
    updatedAt: string;
  };
  onEdit: (documentId: string) => void;
  onDelete: (documentId: string) => void;
  isDeleting?: boolean;
}

export function DocumentCard({
  document,
  onEdit,
  onDelete,
  isDeleting = false,
}: DocumentCardProps) {
  const [isDeletingDoc, setIsDeletingDoc] = useState(false);

  const handleDelete = async () => {
    setIsDeletingDoc(true);
    try {
      await onDelete(document.id);
    } finally {
      setIsDeletingDoc(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return "Unknown";
    }
  };

  const getContentPreview = (content: string | null | undefined) => {
    if (!content) return "No content yet";
    // Strip HTML tags for preview
    const textContent = content.replace(/<[^>]*>/g, "");
    return textContent.length > 100
      ? textContent.substring(0, 100) + "..."
      : textContent;
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-lg mb-2 flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {document.title}
            </CardTitle>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Badge variant="secondary" className="text-xs">
                v{document.version}
              </Badge>
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                Updated {formatDate(document.updatedAt)}
              </span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          <div className="text-sm text-gray-600 line-clamp-2">
            {getContentPreview(document.content)}
          </div>

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(document.id)}
              className="h-8 px-3"
            >
              <Edit className="h-4 w-4 mr-1" />
              Edit
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDelete}
              disabled={isDeleting || isDeletingDoc}
              className="h-8 px-3 text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              {isDeleting || isDeletingDoc ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
