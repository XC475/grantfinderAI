"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DocumentsView } from "@/components/folders/DocumentsView";
import { useHeaderActions } from "@/contexts/HeaderActionsContext";
import { CreateMenu } from "@/components/folders/CreateMenu";
import { toast } from "sonner";
import { FileCategory } from "@/generated/prisma";

interface DocumentsPageProps {
  params: Promise<{ slug: string; folderPath?: string[] }>;
}

export default function DocumentsPage({ params }: DocumentsPageProps) {
  const { slug, folderPath } = use(params);
  const router = useRouter();
  const { setHeaderActions } = useHeaderActions();
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [organizationId, setOrganizationId] = useState<string | undefined>();

  // Fetch organization ID on mount
  useEffect(() => {
    fetch("/api/user")
      .then((res) => res.json())
      .then((data) => {
        if (data.organizationId) {
          setOrganizationId(data.organizationId);
        }
      })
      .catch(console.error);
  }, []);

  // Calculate current folder ID from path
  useEffect(() => {
    if (folderPath && folderPath.length > 0) {
      setCurrentFolderId(folderPath[folderPath.length - 1]);
    } else {
      setCurrentFolderId(null);
    }
  }, [folderPath]);

  // Handlers for creating folders and documents
  const handleCreateFolder = async (
    name: string,
    parentFolderId: string | null
  ) => {
    try {
      const response = await fetch("/api/folders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, parentFolderId }),
      });

      if (!response.ok) throw new Error("Failed to create folder");

      toast.success("Folder created successfully");
      setRefreshTrigger((prev) => prev + 1);
    } catch (error) {
      console.error("Error creating folder:", error);
      toast.error("Failed to create folder");
    }
  };

  const handleCreateDocument = async (
    title: string,
    folderId: string | null,
    fileCategory: FileCategory
  ) => {
    try {
      const response = await fetch("/api/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, folderId, content: "", fileCategory }),
      });

      if (!response.ok) throw new Error("Failed to create document");

      const data = await response.json();
      toast.success("Document created successfully");

      // Navigate to the new document
      router.push(`/private/${slug}/editor/${data.document.id}`);
    } catch (error) {
      console.error("Error creating document:", error);
      toast.error("Failed to create document");
    }
  };

  const handleFileUpload = async (file: File, fileCategory: FileCategory) => {
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("folderId", currentFolderId || "null");
    formData.append("fileCategory", fileCategory);
    // isKnowledgeBase defaults to true in the API unless explicitly set to "false"

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
        setRefreshTrigger((prev) => prev + 1);
        router.push(`/private/${slug}/file-viewer/${data.document.id}`);
        return "File uploaded successfully!";
      },
      error: (err) => err.message || "Failed to upload file",
    });
  };

  const handleGoogleDriveImported = async (fileCategory: FileCategory) => {
    setRefreshTrigger((prev) => prev + 1);
  };

  // Set header actions on mount
  useEffect(() => {
    setHeaderActions(
      <CreateMenu
        currentFolderId={currentFolderId}
        organizationSlug={slug}
        organizationId={organizationId}
        onCreateFolder={handleCreateFolder}
        onCreateDocument={handleCreateDocument}
        onFileUpload={handleFileUpload}
        onGoogleDriveImported={handleGoogleDriveImported}
        isKnowledgeBase={false}
      />
    );

    // Cleanup on unmount
    return () => setHeaderActions(null);
  }, [setHeaderActions, currentFolderId, slug, organizationId]);

  // Build path to a folder by fetching its full path
  const buildFolderPath = async (
    folderId: string
  ): Promise<string[] | null> => {
    try {
      const response = await fetch(`/api/folders/path/${folderId}`);
      if (!response.ok) return null;

      const data = await response.json();
      return data.path.map((folder: { id: string }) => folder.id);
    } catch (error) {
      console.error("Error building folder path:", error);
      return null;
    }
  };

  // Handle folder navigation
  const handleNavigate = async (folderId: string | null) => {
    if (!folderId) {
      // Navigate to root
      router.push(`/private/${slug}/documents`);
      return;
    }

    // Build complete path from root to target folder
    const path = await buildFolderPath(folderId);
    if (!path) {
      toast.error("Failed to navigate to folder");
      return;
    }

    router.push(`/private/${slug}/documents/${path.join("/")}`);
  };

  return (
    <DocumentsView
      key={`${currentFolderId}-${refreshTrigger}`}
      organizationSlug={slug}
      currentFolderId={currentFolderId}
      onNavigate={handleNavigate}
    />
  );
}
