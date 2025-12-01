"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CopyDialog } from "@/components/folders/CopyDialog";
import { MoveModal } from "@/components/folders/MoveModal";

interface Folder {
  id: string;
  name: string;
  parentFolderId: string | null;
  applicationId: string | null;
}

interface DocumentOperationsContextValue {
  copyDocument: (
    documentId: string,
    currentTitle: string,
    currentFolderId: string | null
  ) => void;
  moveDocument: (
    documentId: string,
    currentTitle: string,
    currentFolderId: string | null
  ) => void;
  exportDocument: (
    documentId: string,
    format: "google-drive" | "pdf" | "docx"
  ) => Promise<void>;
}

const DocumentOperationsContext =
  React.createContext<DocumentOperationsContextValue | null>(null);

export function DocumentOperationsProvider({
  children,
  organizationSlug,
}: {
  children: React.ReactNode;
  organizationSlug: string;
}) {
  const router = useRouter();
  
  // Copy dialog state
  const [copyDialog, setCopyDialog] = React.useState<{
    open: boolean;
    documentId: string;
    title: string;
    folderId: string | null;
  }>({
    open: false,
    documentId: "",
    title: "",
    folderId: null,
  });

  // Move modal state
  const [moveModal, setMoveModal] = React.useState<{
    open: boolean;
    documentId: string;
    title: string;
    folderId: string | null;
  }>({
    open: false,
    documentId: "",
    title: "",
    folderId: null,
  });

  // All folders for dialogs
  const [allFolders, setAllFolders] = React.useState<Folder[]>([]);

  // Fetch all folders when copy dialog opens
  React.useEffect(() => {
    if (copyDialog.open) {
      fetch("/api/folders?all=true")
        .then((res) => res.json())
        .then((data) => {
          setAllFolders(data.folders || []);
        })
        .catch((err) => {
          console.error("Failed to fetch folders:", err);
          toast.error("Failed to load folders");
        });
    }
  }, [copyDialog.open]);

  // Copy document handler
  const copyDocument = React.useCallback(
    (documentId: string, currentTitle: string, currentFolderId: string | null) => {
      setCopyDialog({
        open: true,
        documentId,
        title: currentTitle,
        folderId: currentFolderId,
      });
    },
    []
  );

  // Handle copy submission
  const handleCopySubmit = React.useCallback(
    async (newName: string, targetFolderId: string | null) => {
      try {
        const response = await fetch(`/api/documents/${copyDialog.documentId}/copy`, {
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
        setCopyDialog({ open: false, documentId: "", title: "", folderId: null });
      } catch (error) {
        console.error("Error copying document:", error);
        toast.error(error instanceof Error ? error.message : "Failed to copy document");
        throw error;
      }
    },
    [copyDialog.documentId]
  );

  // Move document handler
  const moveDocument = React.useCallback(
    (documentId: string, currentTitle: string, currentFolderId: string | null) => {
      setMoveModal({
        open: true,
        documentId,
        title: currentTitle,
        folderId: currentFolderId,
      });
    },
    []
  );

  // Handle move submission
  const handleMoveSubmit = React.useCallback(
    async (targetFolderId: string | null) => {
      try {
        const response = await fetch(`/api/documents/${moveModal.documentId}/move`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ folderId: targetFolderId }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Failed to move document");
        }

        toast.success("Document moved successfully");
        setMoveModal({ open: false, documentId: "", title: "", folderId: null });
      } catch (error) {
        console.error("Error moving document:", error);
        toast.error(error instanceof Error ? error.message : "Failed to move document");
        throw error;
      }
    },
    [moveModal.documentId]
  );

  // Export document handler
  const exportDocument = React.useCallback(
    async (documentId: string, format: "google-drive" | "pdf" | "docx") => {
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
    },
    []
  );

  const value = React.useMemo(
    () => ({
      copyDocument,
      moveDocument,
      exportDocument,
    }),
    [copyDocument, moveDocument, exportDocument]
  );

  return (
    <DocumentOperationsContext.Provider value={value}>
      {children}
      
      {/* Copy Dialog */}
      <CopyDialog
        open={copyDialog.open}
        onOpenChange={(open) =>
          setCopyDialog((prev) => ({ ...prev, open }))
        }
        itemType="document"
        originalName={copyDialog.title}
        currentFolderId={copyDialog.folderId}
        allFolders={allFolders}
        onCopy={handleCopySubmit}
      />

      {/* Move Modal */}
      <MoveModal
        open={moveModal.open}
        onOpenChange={(open) =>
          setMoveModal((prev) => ({ ...prev, open }))
        }
        itemType="document"
        itemName={moveModal.title}
        currentFolderId={moveModal.folderId}
        onMove={handleMoveSubmit}
      />
    </DocumentOperationsContext.Provider>
  );
}

export function useDocumentOperations() {
  const context = React.useContext(DocumentOperationsContext);
  if (!context) {
    throw new Error(
      "useDocumentOperations must be used within DocumentOperationsProvider"
    );
  }
  return context;
}

// Optional version that doesn't throw - useful for components used in multiple contexts
export function useDocumentOperationsOptional() {
  return React.useContext(DocumentOperationsContext);
}

