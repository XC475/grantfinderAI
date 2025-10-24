"use client";

import { DocumentCard } from "./DocumentCard";
import { CreateDocumentButton } from "./CreateDocumentButton";
import { useState } from "react";

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

      <div className="grid gap-4">
        {documents.map((document) => (
          <DocumentCard
            key={document.id}
            document={document}
            onEdit={onEdit}
            onDelete={onDelete}
            isDeleting={isDeleting}
          />
        ))}
      </div>
    </div>
  );
}
