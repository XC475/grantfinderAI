"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { DragEndEvent } from "@dnd-kit/core";
import { DragDropProvider } from "./DragDropProvider";
import { FolderBreadcrumb } from "./FolderBreadcrumb";
import { CreateMenu } from "./CreateMenu";
import { FolderList } from "./FolderList";

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

interface FolderPathItem {
  id: string;
  name: string;
  applicationId: string | null;
}

interface DocumentsViewProps {
  organizationSlug: string;
  rootFolderId?: string | null; // If provided, use this as root; otherwise use null (global root)
  rootLabel?: string; // Label for the root (e.g., "Documents" or application name)
  applicationId?: string; // If viewing an application's documents
}

export function DocumentsView({
  organizationSlug,
  rootFolderId = null,
  rootLabel = "Documents",
  applicationId,
}: DocumentsViewProps) {
  const router = useRouter();
  const [folders, setFolders] = useState<Folder[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [folderPath, setFolderPath] = useState<FolderPathItem[]>([]);
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(
    rootFolderId
  );
  const [loading, setLoading] = useState(true);

  const fetchFolderContents = useCallback(
    async (folderId: string | null) => {
      try {
        const targetFolderId = folderId === null ? rootFolderId : folderId;

        if (targetFolderId) {
          // Fetch specific folder contents
          const response = await fetch(`/api/folders/${targetFolderId}`);
          if (!response.ok) throw new Error("Failed to fetch folder");

          const data = await response.json();
          setFolders(data.folder.children || []);
          setDocuments(data.folder.documents || []);

          // Filter out the rootFolderId from the path if we're viewing from a custom root
          const path = data.folder.path || [];
          const filteredPath = rootFolderId
            ? path.filter((item: FolderPathItem) => item.id !== rootFolderId)
            : path;
          setFolderPath(filteredPath);
        } else {
          // Fetch root level folders and documents
          const [foldersRes, documentsRes] = await Promise.all([
            fetch("/api/folders?parentFolderId=null"),
            fetch("/api/documents?limit=100"),
          ]);

          if (!foldersRes.ok || !documentsRes.ok) {
            throw new Error("Failed to fetch contents");
          }

          const foldersData = await foldersRes.json();
          const documentsData = await documentsRes.json();

          // Filter documents that don't have a folderId (root level only)
          const rootDocuments = (documentsData.data || []).filter(
            (doc: any) => !doc.folderId
          );

          setFolders(foldersData.folders || []);
          setDocuments(rootDocuments);
          setFolderPath([]);
        }
      } catch (error) {
        console.error("Error fetching folder contents:", error);
        toast.error("Failed to load folder contents");
      } finally {
        setLoading(false);
      }
    },
    [rootFolderId]
  );

  useEffect(() => {
    fetchFolderContents(currentFolderId);
  }, [currentFolderId, fetchFolderContents]);

  const handleNavigate = (folderId: string | null) => {
    setCurrentFolderId(folderId);
  };

  const handleFolderClick = (folderId: string) => {
    setCurrentFolderId(folderId);
  };

  const handleDocumentClick = (documentId: string) => {
    router.push(`/private/${organizationSlug}/editor/${documentId}`);
  };

  const handleCreateFolder = async (
    name: string,
    parentFolderId: string | null
  ) => {
    try {
      const response = await fetch("/api/folders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          parentFolderId: parentFolderId || currentFolderId || rootFolderId,
        }),
      });

      if (!response.ok) throw new Error("Failed to create folder");

      toast.success("Folder created successfully");
      fetchFolderContents(currentFolderId);
    } catch (error) {
      console.error("Error creating folder:", error);
      toast.error("Failed to create folder");
      throw error;
    }
  };

  const handleCreateDocument = async (
    title: string,
    folderId: string | null
  ) => {
    try {
      const endpoint = applicationId
        ? `/api/applications/${applicationId}/documents`
        : "/api/documents";

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          folderId: folderId || currentFolderId || rootFolderId,
        }),
      });

      if (!response.ok) throw new Error("Failed to create document");

      const data = await response.json();
      toast.success("Document created successfully");
      router.push(`/${organizationSlug}/editor/${data.document.id}`);
    } catch (error) {
      console.error("Error creating document:", error);
      toast.error("Failed to create document");
      throw error;
    }
  };

  const handleDeleteFolder = async (folderId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this folder? All contents will be deleted."
      )
    ) {
      return;
    }

    try {
      const response = await fetch(`/api/folders/${folderId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete folder");

      toast.success("Folder deleted successfully");
      fetchFolderContents(currentFolderId);
    } catch (error) {
      console.error("Error deleting folder:", error);
      toast.error("Failed to delete folder");
    }
  };

  const handleDeleteDocument = async (documentId: string) => {
    if (!confirm("Are you sure you want to delete this document?")) {
      return;
    }

    try {
      const response = await fetch(`/api/documents/${documentId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete document");

      toast.success("Document deleted successfully");
      fetchFolderContents(currentFolderId);
    } catch (error) {
      console.error("Error deleting document:", error);
      toast.error("Failed to delete document");
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) return;

    const draggedType = active.data.current?.type;
    const draggedId = active.id as string;
    const dropTarget = over.data.current;

    let targetFolderId: string | null = null;

    if (dropTarget?.type === "folder") {
      targetFolderId = dropTarget.folderId;
    } else if (dropTarget?.type === "root") {
      targetFolderId = rootFolderId || null;
    } else {
      return; // Invalid drop target
    }

    // Optimistically update UI immediately
    if (draggedType === "document") {
      setDocuments((prev) => prev.filter((doc) => doc.id !== draggedId));
    } else if (draggedType === "folder") {
      setFolders((prev) => prev.filter((folder) => folder.id !== draggedId));
    }

    try {
      if (draggedType === "document") {
        const response = await fetch(`/api/documents/${draggedId}/move`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ folderId: targetFolderId }),
        });

        if (!response.ok) throw new Error("Failed to move document");
        toast.success("Document moved successfully");
      } else if (draggedType === "folder") {
        const response = await fetch(`/api/folders/${draggedId}/move`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ newParentFolderId: targetFolderId }),
        });

        if (!response.ok) throw new Error("Failed to move folder");
        toast.success("Folder moved successfully");
      }

      // Refresh to get the accurate state from server
      fetchFolderContents(currentFolderId);
    } catch (error) {
      console.error("Error moving item:", error);
      toast.error("Failed to move item");
      // Revert optimistic update on error
      fetchFolderContents(currentFolderId);
    }
  };

  if (loading) {
    return null; // Parent component can handle loading state
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <FolderBreadcrumb
          folderPath={folderPath}
          rootLabel={rootLabel}
          onNavigate={handleNavigate}
        />
        <CreateMenu
          currentFolderId={currentFolderId}
          applicationId={applicationId}
          onCreateFolder={handleCreateFolder}
          onCreateDocument={handleCreateDocument}
        />
      </div>

      <DragDropProvider onDragEnd={handleDragEnd}>
        <FolderList
          folders={folders}
          documents={documents}
          onFolderClick={handleFolderClick}
          onDocumentClick={handleDocumentClick}
          onDeleteFolder={handleDeleteFolder}
          onDeleteDocument={handleDeleteDocument}
          organizationSlug={organizationSlug}
        />
      </DragDropProvider>
    </div>
  );
}
