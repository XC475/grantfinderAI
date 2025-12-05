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
import { Checkbox } from "@/components/ui/checkbox";
import { FolderIcon } from "@/components/folders/FolderIcon";
import { FileText, File, Table, ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface Folder {
  id: string;
  name: string;
  parentFolderId: string | null;
  applicationId: string | null;
}

interface Document {
  id: string;
  title: string;
  folderId: string | null;
  fileUrl: string | null;
  fileType: string | null;
  contentType: string;
}

export interface SourceDocument {
  id: string;
  title: string;
  contentType: string;
  fileUrl: string | null;
  fileType: string | null;
}

interface SourcesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectDocuments: (documents: SourceDocument[]) => void;
  selectedDocumentIds: string[];
}

// Helper function to get the appropriate icon for a document
function getDocumentIcon(document: Document) {
  if (!document.fileType) {
    // Regular editable document
    return <FileText className="h-4 w-4 text-blue-500 shrink-0" />;
  }

  // File uploads - different icons based on type
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

  // Default file icon
  return <File className="h-4 w-4 text-muted-foreground shrink-0" />;
}

export function SourcesModal({
  open,
  onOpenChange,
  onSelectDocuments,
  selectedDocumentIds,
}: SourcesModalProps) {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    new Set(selectedDocumentIds)
  );
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(
    new Set()
  );
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const MAX_SELECTIONS = 10;

  // Fetch folders and documents when modal opens
  useEffect(() => {
    if (open) {
      setIsFetching(true);
      Promise.all([
        fetch("/api/folders?all=true").then((res) => res.json()),
        fetch("/api/documents?withFolders=true").then((res) => res.json()),
      ])
        .then(([foldersData, documentsData]) => {
          setFolders(foldersData.folders || []);
          setDocuments(documentsData.data || []);
          setIsFetching(false);
        })
        .catch((err) => {
          console.error("Failed to fetch data:", err);
          setError("Failed to load documents");
          setIsFetching(false);
        });
    }
  }, [open]);

  // Build folder hierarchy
  const folderChildren = useMemo(() => {
    const childMap = new Map<string | null, Folder[]>();
    folders.forEach((folder) => {
      const parentId = folder.parentFolderId;
      if (!childMap.has(parentId)) {
        childMap.set(parentId, []);
      }
      childMap.get(parentId)!.push(folder);
    });
    return childMap;
  }, [folders]);

  // Get documents for a folder
  const getFolderDocuments = (folderId: string | null) => {
    return documents.filter((doc) => doc.folderId === folderId);
  };

  // Filter documents based on search query
  const filteredDocuments = useMemo(() => {
    if (!searchQuery.trim()) return documents;
    const query = searchQuery.toLowerCase();
    return documents.filter((doc) => doc.title.toLowerCase().includes(query));
  }, [documents, searchQuery]);

  const toggleFolder = (folderId: string) => {
    setExpandedFolders((prev) => {
      const next = new Set(prev);
      if (next.has(folderId)) {
        next.delete(folderId);
      } else {
        next.add(folderId);
      }
      return next;
    });
  };

  const toggleDocument = (docId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(docId)) {
        next.delete(docId);
      } else {
        if (next.size >= MAX_SELECTIONS) {
          setError(`Maximum ${MAX_SELECTIONS} sources allowed`);
          setTimeout(() => setError(null), 3000);
          return prev;
        }
        next.add(docId);
      }
      return next;
    });
  };

  const handleSelect = () => {
    const selectedDocs = documents.filter((doc) => selectedIds.has(doc.id));
    const sourceDocs: SourceDocument[] = selectedDocs.map((doc) => ({
      id: doc.id,
      title: doc.title,
      contentType: doc.contentType,
      fileUrl: doc.fileUrl,
      fileType: doc.fileType,
    }));
    onSelectDocuments(sourceDocs);
    onOpenChange(false);
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      // Reset state when closing
      setSearchQuery("");
      setError(null);
      setSelectedIds(new Set(selectedDocumentIds));
    }
    onOpenChange(newOpen);
  };

  // Recursive folder rendering
  const renderFolder = (folder: Folder, depth: number = 0) => {
    const isExpanded = expandedFolders.has(folder.id);
    const children = folderChildren.get(folder.id) || [];
    const folderDocs = getFolderDocuments(folder.id);

    return (
      <div key={folder.id}>
        <button
          type="button"
          className="w-full flex items-center gap-2 px-4 py-2 text-left hover:bg-accent transition-colors"
          style={{ paddingLeft: `${1 + depth * 1.5}rem` }}
          onClick={() => toggleFolder(folder.id)}
        >
          {children.length > 0 || folderDocs.length > 0 ? (
            isExpanded ? (
              <ChevronDown className="h-4 w-4 shrink-0" />
            ) : (
              <ChevronRight className="h-4 w-4 shrink-0" />
            )
          ) : (
            <div className="h-4 w-4 shrink-0" />
          )}
          <FolderIcon isApplicationFolder={!!folder.applicationId} />
          <span className="font-medium truncate">{folder.name}</span>
          <span className="ml-auto text-xs text-muted-foreground">
            {folderDocs.length}
          </span>
        </button>

        {isExpanded && (
          <>
            {folderDocs.map((doc) => renderDocument(doc, depth + 1))}
            {children.map((child) => renderFolder(child, depth + 1))}
          </>
        )}
      </div>
    );
  };

  // Document rendering
  const renderDocument = (doc: Document, depth: number = 0) => {
    const isSelected = selectedIds.has(doc.id);

    return (
      <div
        key={doc.id}
        className={cn(
          "w-full flex items-center gap-2 px-4 py-2 text-left hover:bg-accent transition-colors cursor-pointer",
          isSelected && "bg-accent/50"
        )}
        style={{ paddingLeft: `${1.5 + depth * 1.5}rem` }}
        onClick={() => toggleDocument(doc.id)}
      >
        <Checkbox
          checked={isSelected}
          onCheckedChange={() => toggleDocument(doc.id)}
          onClick={(e) => e.stopPropagation()}
        />
        {getDocumentIcon(doc)}
        <span className="flex-1 truncate text-sm">{doc.title}</span>
      </div>
    );
  };

  // Render root level folders and documents
  const renderContent = () => {
    if (searchQuery.trim()) {
      // Show filtered documents when searching
      return (
        <>
          {filteredDocuments.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              No documents found
            </div>
          ) : (
            filteredDocuments.map((doc) => renderDocument(doc, 0))
          )}
        </>
      );
    }

    // Show folder hierarchy when not searching
    const rootFolders = folderChildren.get(null) || [];
    const rootDocs = getFolderDocuments(null);

    return (
      <>
        {rootDocs.map((doc) => renderDocument(doc, 0))}
        {rootFolders.map((folder) => renderFolder(folder, 0))}
        {rootDocs.length === 0 && rootFolders.length === 0 && (
          <div className="p-4 text-center text-sm text-muted-foreground">
            No documents available
          </div>
        )}
      </>
    );
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Source Documents</DialogTitle>
          <DialogDescription>
            Select up to {MAX_SELECTIONS} documents to add as context (
            {selectedIds.size}/{MAX_SELECTIONS} selected)
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
              disabled={isFetching}
            />
          </div>

          <div className="border rounded-md max-h-[400px] overflow-y-auto">
            {isFetching ? (
              <div className="p-4 text-center text-sm text-muted-foreground">
                Loading documents...
              </div>
            ) : (
              renderContent()
            )}
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSelect}
            disabled={isFetching || selectedIds.size === 0}
          >
            Add {selectedIds.size} Source{selectedIds.size !== 1 ? "s" : ""}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
