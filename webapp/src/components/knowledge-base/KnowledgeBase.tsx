"use client";

import { useEffect, useState } from "react";
import { Loader2, FileText, Brain } from "lucide-react";
import { KnowledgeBaseCategoryList } from "./KnowledgeBaseCategoryList";
import { getAllFileCategories } from "@/lib/fileCategories";
import { Button } from "@/components/ui/button";
import { AddDocumentsModal } from "./AddDocumentsModal";
import { toast } from "sonner";

interface KBDocument {
  id: string;
  title: string;
  isKnowledgeBase?: boolean;
  contentType?: string;
  fileUrl?: string | null;
  application?: {
    title: string;
    opportunityAgency?: string | null;
  } | null;
}

interface DocumentsByTypeData {
  type: string;
  documents: KBDocument[];
  hasKBDocs: boolean;
  allInKB: boolean;
  totalCount: number;
  kbCount: number;
}

interface KnowledgeBaseProps {
  organizationSlug: string;
  organizationId: string;
  onAddClick?: () => void;
}

export function KnowledgeBase({
  organizationSlug,
  organizationId,
  onAddClick,
}: KnowledgeBaseProps) {
  const [documentsByType, setDocumentsByType] = useState<DocumentsByTypeData[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    fetchDocuments();
  }, [organizationId, refreshKey]);

  // Expose refresh function to child components via a custom event
  useEffect(() => {
    const handleRefresh = () => {
      setRefreshKey((prev) => prev + 1);
    };

    window.addEventListener("knowledge-base-refresh", handleRefresh);
    return () => {
      window.removeEventListener("knowledge-base-refresh", handleRefresh);
    };
  }, []);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      // Fetch documents for all categories
      const allFileCategories = getAllFileCategories();
      const documentsData = await Promise.all(
        allFileCategories.map(async (type) => {
          const response = await fetch(
            `/api/documents?fileCategory=${type}&limit=1000`
          );
          if (!response.ok) {
            return {
              type,
              documents: [],
              hasKBDocs: false,
              allInKB: false,
              totalCount: 0,
              kbCount: 0,
            };
          }
          const result = await response.json();
          const allDocuments = result.data || [];

          // Filter to only show documents in knowledge base
          const kbDocuments = allDocuments.filter(
            (doc: KBDocument) => doc.isKnowledgeBase
          );

          // Determine toggle state: true if ANY document is in KB
          const hasKBDocs = allDocuments.some(
            (doc: KBDocument) => doc.isKnowledgeBase
          );
          const allInKB =
            allDocuments.length > 0 &&
            allDocuments.every((doc: KBDocument) => doc.isKnowledgeBase);

          return {
            type,
            documents: kbDocuments, // Only return KB documents
            hasKBDocs,
            allInKB,
            totalCount: allDocuments.length,
            kbCount: kbDocuments.length,
          };
        })
      );

      // Filter out categories with 0 KB documents
      const filteredData = documentsData.filter((data) => data.kbCount > 0);

      setDocumentsByType(filteredData);
    } catch (error) {
      console.error("Error fetching documents:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddDocuments = async (documentIds: string[]) => {
    try {
      // Update each document to set isKnowledgeBase to true
      const updatePromises = documentIds.map((docId) =>
        fetch(`/api/documents/${docId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isKnowledgeBase: true }),
        })
      );

      const results = await Promise.all(updatePromises);
      const failed = results.filter((res) => !res.ok);

      if (failed.length > 0) {
        throw new Error(
          `Failed to add ${failed.length} document(s) to knowledge base`
        );
      }

      toast.success(
        `Added ${documentIds.length} document(s) to knowledge base`
      );

      // Trigger refresh
      setRefreshKey((prev) => prev + 1);
    } catch (error) {
      console.error("Error adding documents to KB:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to add documents to knowledge base"
      );
      throw error;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const handleAddClick = () => {
    if (onAddClick) {
      onAddClick();
    } else {
      setShowAddModal(true);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 pb-2 border-b">
          <Brain className="h-5 w-5 text-muted-foreground" />
          <h3 className="font-semibold">Knowledge Base</h3>
        </div>
        <div className="mt-4">
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">Documents </span>
            you create, upload, or import are{" "}
            <span className="font-semibold text-foreground">
              automatically added to your knowledge base by default
            </span>
            . This allows{" "}
            <span className="font-semibold text-foreground">
              AI assistants to use them as context
            </span>{" "}
            when helping you with grant applications and other tasks.
          </p>
        </div>
      </div>

      {documentsByType.length > 0 ? (
        <KnowledgeBaseCategoryList
          documentsByType={documentsByType}
          organizationSlug={organizationSlug}
          organizationId={organizationId}
        />
      ) : (
        <div className="text-center py-12 border-2 border-dashed rounded-lg">
          <p className="text-muted-foreground mb-4">
            No documents in knowledge base. Click &quot;Add&quot; to add
            documents.
          </p>
          <Button onClick={handleAddClick} variant="outline" className="gap-2">
            <FileText className="h-4 w-4" />
            Add Documents
          </Button>
        </div>
      )}

      <AddDocumentsModal
        open={showAddModal}
        onOpenChange={setShowAddModal}
        onAdd={handleAddDocuments}
      />
    </div>
  );
}
