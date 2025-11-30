"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileText, File, Table } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface Document {
  id: string;
  title: string;
  fileType: string | null;
  contentType: string;
  fileUrl: string | null;
  isKnowledgeBase: boolean;
  fileCategory: string;
  application?: {
    title: string;
    opportunityAgency: string | null;
  } | null;
}

interface AddDocumentsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (documentIds: string[]) => Promise<void>;
}

// Helper function to get the appropriate icon for a document
function getDocumentIcon(document: Document) {
  if (!document.fileType) {
    return <FileText className="h-4 w-4 text-blue-500 shrink-0" />;
  }

  if (document.fileType === "application/pdf") {
    return <FileText className="h-4 w-4 text-red-500 shrink-0" />;
  }
  if (
    document.fileType ===
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    return <FileText className="h-4 w-4 text-blue-600 shrink-0" />;
  }
  if (document.fileType === "text/csv") {
    return <Table className="h-4 w-4 text-green-600 shrink-0" />;
  }
  if (document.fileType === "text/plain") {
    return <File className="h-4 w-4 text-gray-600 shrink-0" />;
  }

  return <File className="h-4 w-4 text-muted-foreground shrink-0" />;
}

export function AddDocumentsModal({
  open,
  onOpenChange,
  onAdd,
}: AddDocumentsModalProps) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDocumentIds, setSelectedDocumentIds] = useState<Set<string>>(
    new Set()
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch all documents when modal opens
  useEffect(() => {
    if (open) {
      setIsFetching(true);
      fetch("/api/documents?limit=1000")
        .then((res) => res.json())
        .then((data) => {
          const allDocs = data.data || [];
          setDocuments(allDocs);
          setIsFetching(false);
        })
        .catch((err) => {
          console.error("Failed to fetch documents:", err);
          setError("Failed to load documents");
          setIsFetching(false);
        });
    } else {
      // Reset state when closing
      setSearchQuery("");
      setSelectedDocumentIds(new Set());
      setError(null);
    }
  }, [open]);

  // Filter documents based on search query
  const filteredDocuments = useMemo(() => {
    if (!searchQuery.trim()) return documents;

    const query = searchQuery.toLowerCase();
    return documents.filter((doc) =>
      doc.title.toLowerCase().includes(query)
    );
  }, [documents, searchQuery]);

  const toggleDocument = (documentId: string) => {
    setSelectedDocumentIds((prev) => {
      const next = new Set(prev);
      if (next.has(documentId)) {
        next.delete(documentId);
      } else {
        next.add(documentId);
      }
      return next;
    });
  };

  const handleAdd = async () => {
    if (selectedDocumentIds.size === 0) {
      toast.error("Please select at least one document");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await onAdd(Array.from(selectedDocumentIds));
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add documents");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Add Documents to Knowledge Base</DialogTitle>
          <DialogDescription>
            Search and select documents to add to your knowledge base.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="search">Search documents</Label>
            <Input
              id="search"
              placeholder="Type to search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              disabled={isLoading || isFetching}
            />
          </div>

          <div className="border rounded-md max-h-[400px] overflow-y-auto">
            {isFetching ? (
              <div className="p-4 text-center text-sm text-muted-foreground">
                Loading documents...
              </div>
            ) : filteredDocuments.length === 0 ? (
              <div className="p-4 text-center text-sm text-muted-foreground">
                {searchQuery ? "No documents found" : "No documents available"}
              </div>
            ) : (
              <div className="divide-y">
                {filteredDocuments.map((doc) => {
                  const isSelected = selectedDocumentIds.has(doc.id);
                  const isInKB = doc.isKnowledgeBase;

                  return (
                    <button
                      key={doc.id}
                      type="button"
                      className={cn(
                        "w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-accent transition-colors",
                        isSelected && "bg-accent"
                      )}
                      onClick={() => toggleDocument(doc.id)}
                      disabled={isLoading || isInKB}
                    >
                      {getDocumentIcon(doc)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm truncate">
                            {doc.title}
                          </span>
                          {isInKB && (
                            <span className="text-xs text-muted-foreground">
                              (already in KB)
                            </span>
                          )}
                        </div>
                        {doc.application && (
                          <div className="text-xs text-muted-foreground truncate">
                            From: {doc.application.title}
                            {doc.application.opportunityAgency &&
                              ` • ${doc.application.opportunityAgency}`}
                          </div>
                        )}
                      </div>
                      {isSelected && (
                        <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {selectedDocumentIds.size > 0 && (
            <div className="text-sm text-muted-foreground">
              {selectedDocumentIds.size} document(s) selected
            </div>
          )}

          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleAdd}
            disabled={isLoading || isFetching || selectedDocumentIds.size === 0}
          >
            {isLoading
              ? "Adding..."
              : `Add ${selectedDocumentIds.size > 0 ? `${selectedDocumentIds.size} ` : ""}Document(s)`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

