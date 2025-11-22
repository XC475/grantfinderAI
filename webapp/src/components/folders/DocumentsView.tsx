"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { DragEndEvent } from "@dnd-kit/core";
import { DragDropProvider } from "./DragDropProvider";
import { FolderBreadcrumb } from "./FolderBreadcrumb";
import { CreateMenu } from "./CreateMenu";
import { FolderList } from "./FolderList";
import { RenameDialog } from "./RenameDialog";
import { MoveModal } from "./MoveModal";
import { CopyDialog } from "./CopyDialog";
import { Filter } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
  folderId?: string | null;
  fileUrl?: string | null;
  fileType?: string | null;
  content?: string | null;
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
  currentFolderId?: string | null; // Optional: controlled folder ID (for URL-based navigation)
  onNavigate?: (folderId: string | null) => void; // Optional: callback when navigating (for URL-based navigation)
}

export function DocumentsView({
  organizationSlug,
  rootFolderId = null,
  rootLabel = "Documents",
  applicationId,
  currentFolderId: externalCurrentFolderId,
  onNavigate: externalOnNavigate,
}: DocumentsViewProps) {
  const router = useRouter();
  const [folders, setFolders] = useState<Folder[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [folderPath, setFolderPath] = useState<FolderPathItem[]>([]);

  // Use controlled currentFolderId if provided, otherwise internal state
  const [internalCurrentFolderId, setInternalCurrentFolderId] = useState<
    string | null
  >(rootFolderId);
  const currentFolderId =
    externalCurrentFolderId !== undefined
      ? externalCurrentFolderId
      : internalCurrentFolderId;

  const [loading, setLoading] = useState(true);

  // Dialog/Modal states
  const [renameDialog, setRenameDialog] = useState<{
    open: boolean;
    type: "document" | "folder";
    id: string;
    currentName: string;
    isApplicationFolder?: boolean;
  }>({ open: false, type: "document", id: "", currentName: "" });

  const [moveModal, setMoveModal] = useState<{
    open: boolean;
    type: "document" | "folder";
    id: string;
    name: string;
    currentFolderId: string | null;
  }>({
    open: false,
    type: "document",
    id: "",
    name: "",
    currentFolderId: null,
  });

  const [copyDialog, setCopyDialog] = useState<{
    open: boolean;
    type: "document" | "folder";
    id: string;
    originalName: string;
    currentFolderId: string | null;
  }>({
    open: false,
    type: "document",
    id: "",
    originalName: "",
    currentFolderId: null,
  });

  const [allFolders, setAllFolders] = useState<Folder[]>([]);

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilters, setActiveFilters] = useState<string[]>([]); // 'folder', 'document', 'file'

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
            (doc: Document) => !doc.folderId
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

  // Filtered folders based on search and filters
  const filteredFolders = useMemo(() => {
    return folders.filter((folder) => {
      // If filters are active, check if "folder" filter is selected
      if (activeFilters.length > 0 && !activeFilters.includes("folder")) {
        return false; // Hide folders if filters are active but "folder" isn't selected
      }

      // Search term filter
      if (
        searchTerm &&
        !folder.name.toLowerCase().includes(searchTerm.toLowerCase())
      ) {
        return false;
      }

      return true;
    });
  }, [folders, searchTerm, activeFilters]);

  // Filtered documents based on search and filters
  const filteredDocuments = useMemo(() => {
    return documents.filter((doc) => {
      // If filters are active, check if document matches any selected filter
      if (activeFilters.length > 0) {
        const isDocument = !doc.fileUrl;
        const isFile = !!doc.fileUrl;

        const matchesDocumentFilter =
          activeFilters.includes("document") && isDocument;
        const matchesFileFilter = activeFilters.includes("file") && isFile;

        // Must match at least one filter (OR logic)
        if (!matchesDocumentFilter && !matchesFileFilter) {
          return false;
        }
      }

      // Search term filter
      if (
        searchTerm &&
        !doc.title.toLowerCase().includes(searchTerm.toLowerCase())
      ) {
        return false;
      }

      return true;
    });
  }, [documents, searchTerm, activeFilters]);

  const handleNavigate = (folderId: string | null) => {
    if (externalOnNavigate) {
      externalOnNavigate(folderId);
    } else {
      setInternalCurrentFolderId(folderId);
    }
  };

  const handleFolderClick = (folderId: string) => {
    if (externalOnNavigate) {
      externalOnNavigate(folderId);
    } else {
      setInternalCurrentFolderId(folderId);
    }
  };

  const handleDocumentClick = (documentId: string) => {
    // Find the document to check if it has content or is a file upload
    const document = documents.find((doc) => doc.id === documentId);

    // If document has content, show the editor (even if it also has a fileUrl)
    if (document?.content) {
      router.push(`/private/${organizationSlug}/editor/${documentId}`);
    } else if (document?.fileUrl) {
      // Only route to file viewer if it has a fileUrl but no content
      router.push(`/private/${organizationSlug}/file-viewer/${documentId}`);
    } else {
      // Default to editor for regular documents
      router.push(`/private/${organizationSlug}/editor/${documentId}`);
    }
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
      router.push(`/private/${organizationSlug}/editor/${data.document.id}`);
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

  // Rename handlers
  const handleRenameFolder = (folderId: string, currentName: string) => {
    const folder = folders.find((f) => f.id === folderId);
    const isApplicationFolder = folder?.applicationId != null;

    setRenameDialog({
      open: true,
      type: "folder",
      id: folderId,
      currentName,
      isApplicationFolder,
    });
  };

  const handleRenameDocument = (documentId: string, currentTitle: string) => {
    setRenameDialog({
      open: true,
      type: "document",
      id: documentId,
      currentName: currentTitle,
    });
  };

  const handleRenameSubmit = async (newName: string) => {
    try {
      if (renameDialog.type === "folder") {
        const response = await fetch(`/api/folders/${renameDialog.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: newName }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Failed to rename folder");
        }

        toast.success("Folder renamed successfully");
      } else {
        const response = await fetch(`/api/documents/${renameDialog.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: newName }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Failed to rename document");
        }

        toast.success("Document renamed successfully");
      }

      fetchFolderContents(currentFolderId);
    } catch (error) {
      console.error("Error renaming:", error);
      toast.error(error instanceof Error ? error.message : "Failed to rename");
      throw error;
    }
  };

  // Fetch all folders for copy/move modals
  const fetchAllFolders = async () => {
    try {
      const response = await fetch("/api/folders?all=true");
      if (response.ok) {
        const data = await response.json();
        setAllFolders(data.folders || []);
      }
    } catch (error) {
      console.error("Error fetching folders:", error);
    }
  };

  // Copy handlers - open dialog instead of direct copy
  const handleCopyFolder = (folderId: string) => {
    const folder = folders.find((f) => f.id === folderId);
    if (!folder) return;

    // Fetch all folders for selection
    fetchAllFolders();

    setCopyDialog({
      open: true,
      type: "folder",
      id: folderId,
      originalName: folder.name,
      currentFolderId: currentFolderId,
    });
  };

  const handleCopyDocument = (documentId: string) => {
    const document = documents.find((d) => d.id === documentId);
    if (!document) return;

    // Fetch all folders for selection
    fetchAllFolders();

    setCopyDialog({
      open: true,
      type: "document",
      id: documentId,
      originalName: document.title,
      currentFolderId: currentFolderId,
    });
  };

  // Handle actual copy submission from dialog
  const handleCopySubmit = async (
    newName: string,
    targetFolderId: string | null
  ) => {
    try {
      if (copyDialog.type === "folder") {
        const response = await fetch(`/api/folders/${copyDialog.id}/copy`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: newName,
            parentFolderId: targetFolderId,
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Failed to copy folder");
        }

        toast.success("Folder copied successfully");
      } else {
        const response = await fetch(`/api/documents/${copyDialog.id}/copy`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: newName,
            folderId: targetFolderId,
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Failed to copy document");
        }

        toast.success("Document copied successfully");
      }

      fetchFolderContents(currentFolderId);
    } catch (error) {
      console.error("Error copying:", error);
      toast.error(error instanceof Error ? error.message : "Failed to copy");
      throw error;
    }
  };

  // Move handlers (modal-based)
  const handleMoveFolder = (folderId: string) => {
    const folder = folders.find((f) => f.id === folderId);
    if (!folder) return;

    setMoveModal({
      open: true,
      type: "folder",
      id: folderId,
      name: folder.name,
      currentFolderId: currentFolderId,
    });
  };

  const handleMoveDocument = (documentId: string) => {
    const document = documents.find((d) => d.id === documentId);
    if (!document) return;

    setMoveModal({
      open: true,
      type: "document",
      id: documentId,
      name: document.title,
      currentFolderId: currentFolderId,
    });
  };

  const handleMoveSubmit = async (targetFolderId: string | null) => {
    try {
      if (moveModal.type === "folder") {
        const response = await fetch(`/api/folders/${moveModal.id}/move`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ newParentFolderId: targetFolderId }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Failed to move folder");
        }

        toast.success("Folder moved successfully");
      } else {
        const response = await fetch(`/api/documents/${moveModal.id}/move`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ folderId: targetFolderId }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Failed to move document");
        }

        toast.success("Document moved successfully");
      }

      fetchFolderContents(currentFolderId);
    } catch (error) {
      console.error("Error moving:", error);
      toast.error(error instanceof Error ? error.message : "Failed to move");
      throw error;
    }
  };

  // Export handler
  const handleExportDocument = async (
    documentId: string,
    format: "google-drive" | "pdf" | "docx"
  ) => {
    try {
      if (format === "google-drive") {
        // For Google Drive, use the existing API that opens dialog
        const response = await fetch("/api/google-drive/export", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ documentId, format: "google-doc" }),
        });

        if (!response.ok) {
          const error = await response.json().catch(() => null);
          throw new Error(error?.error || "Failed to export to Google Drive");
        }

        const data = await response.json();
        toast.success("Document exported to Google Drive");
        if (data.webViewLink) {
          window.open(data.webViewLink, "_blank", "noopener,noreferrer");
        }
      } else if (format === "pdf") {
        // For PDF, open styled HTML in new window and trigger print
        const response = await fetch(`/api/documents/${documentId}/export`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ format: "pdf" }),
        });

        if (!response.ok) {
          const error = await response.json().catch(() => null);
          throw new Error(error?.error || "Failed to export as PDF");
        }

        // Open HTML in new window
        const html = await response.text();
        const printWindow = window.open("", "_blank");
        if (printWindow) {
          printWindow.document.write(html);
          printWindow.document.close();

          // Wait for content to load, then trigger print dialog
          printWindow.onload = () => {
            setTimeout(() => {
              printWindow.print();
            }, 250);
          };

          toast.success("Opening print dialog for PDF export");
        } else {
          throw new Error("Please allow popups to export as PDF");
        }
      } else {
        // For DOCX, download directly
        const response = await fetch(`/api/documents/${documentId}/export`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ format }),
        });

        if (!response.ok) {
          const error = await response.json().catch(() => null);
          throw new Error(
            error?.error || `Failed to export as ${format.toUpperCase()}`
          );
        }

        // Download the file
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `document.${format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        toast.success(`Document exported as ${format.toUpperCase()}`);
      }
    } catch (error) {
      console.error("Error exporting document:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to export document"
      );
    }
  };

  // File upload handler
  const handleFileUpload = async (file: File) => {
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("folderId", currentFolderId || "null");
    if (applicationId) formData.append("applicationId", applicationId);

    const uploadPromise = fetch("/api/documents/upload", {
      method: "POST",
      body: formData,
    }).then(async (response) => {
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to upload file");
      }
      return response.json();
    });

    toast.promise(uploadPromise, {
      loading: "Uploading file...",
      success: (data) => {
        fetchFolderContents(currentFolderId); // Refresh list
        router.push(
          `/private/${organizationSlug}/file-viewer/${data.document.id}`
        );
        return "File uploaded successfully!";
      },
      error: (err) => err.message || "Failed to upload file",
    });
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
      {/* Breadcrumb - only for internal navigation */}
      {!externalOnNavigate && (
        <div className="flex items-center">
          <FolderBreadcrumb
            folderPath={folderPath}
            rootLabel={rootLabel}
            onNavigate={handleNavigate}
          />
        </div>
      )}

      {/* Search and Filters - Always visible */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Input
            placeholder="Search documents and folders..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-[300px]"
          />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="border-dashed">
                <Filter className="mr-2 h-4 w-4" />
                Filters
                {activeFilters.length > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {activeFilters.length}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-[200px]">
              <DropdownMenuCheckboxItem
                checked={activeFilters.includes("folder")}
                onCheckedChange={(checked) => {
                  setActiveFilters((prev) =>
                    checked
                      ? [...prev, "folder"]
                      : prev.filter((t) => t !== "folder")
                  );
                }}
              >
                Folder
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={activeFilters.includes("document")}
                onCheckedChange={(checked) => {
                  setActiveFilters((prev) =>
                    checked
                      ? [...prev, "document"]
                      : prev.filter((t) => t !== "document")
                  );
                }}
              >
                Document
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={activeFilters.includes("file")}
                onCheckedChange={(checked) => {
                  setActiveFilters((prev) =>
                    checked
                      ? [...prev, "file"]
                      : prev.filter((t) => t !== "file")
                  );
                }}
              >
                File
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {!externalOnNavigate && (
          <CreateMenu
            currentFolderId={currentFolderId}
            applicationId={applicationId}
            onCreateFolder={handleCreateFolder}
            onCreateDocument={handleCreateDocument}
            onFileUpload={handleFileUpload}
            onGoogleDriveImported={() => fetchFolderContents(currentFolderId)}
          />
        )}
      </div>

      <DragDropProvider onDragEnd={handleDragEnd}>
        <FolderList
          folders={filteredFolders}
          documents={filteredDocuments}
          onFolderClick={handleFolderClick}
          onDocumentClick={handleDocumentClick}
          onDeleteFolder={handleDeleteFolder}
          onDeleteDocument={handleDeleteDocument}
          onRenameFolder={handleRenameFolder}
          onRenameDocument={handleRenameDocument}
          onCopyFolder={handleCopyFolder}
          onCopyDocument={handleCopyDocument}
          onMoveFolder={handleMoveFolder}
          onMoveDocument={handleMoveDocument}
          onExportDocument={handleExportDocument}
          organizationSlug={organizationSlug}
        />
      </DragDropProvider>

      {/* Rename Dialog */}
      <RenameDialog
        open={renameDialog.open}
        onOpenChange={(open) => setRenameDialog({ ...renameDialog, open })}
        itemType={renameDialog.type}
        currentName={renameDialog.currentName}
        onRename={handleRenameSubmit}
        warningMessage={
          renameDialog.isApplicationFolder
            ? "Renaming this folder will also rename its linked application."
            : undefined
        }
      />

      {/* Move Modal */}
      <MoveModal
        open={moveModal.open}
        onOpenChange={(open) => setMoveModal({ ...moveModal, open })}
        itemType={moveModal.type}
        itemName={moveModal.name}
        currentFolderId={moveModal.currentFolderId}
        onMove={handleMoveSubmit}
      />

      {/* Copy Dialog */}
      <CopyDialog
        open={copyDialog.open}
        onOpenChange={(open) => setCopyDialog({ ...copyDialog, open })}
        itemType={copyDialog.type}
        originalName={copyDialog.originalName}
        currentFolderId={copyDialog.currentFolderId}
        allFolders={allFolders}
        onCopy={handleCopySubmit}
      />
    </div>
  );
}
