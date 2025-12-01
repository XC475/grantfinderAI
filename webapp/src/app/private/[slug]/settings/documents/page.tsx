"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Loader2, Plus, Brain, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { KnowledgeBase } from "@/components/knowledge-base/KnowledgeBase";
import { AddDocumentsModal } from "@/components/knowledge-base/AddDocumentsModal";
import { DocumentTagsManager } from "@/components/documents/DocumentTagsManager";
import { toast } from "sonner";

export default function DocumentsPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [organizationId, setOrganizationId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [showAddDocumentsModal, setShowAddDocumentsModal] = useState(false);

  useEffect(() => {
    fetchOrganization();
  }, [slug]);

  const fetchOrganization = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/organizations`);
      if (!response.ok) throw new Error("Failed to fetch organization");

      const data = await response.json();
      setOrganizationId(data.id);
    } catch (error) {
      console.error("Error fetching organization:", error);
      toast.error("Failed to load organization");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-8 p-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Documents</h1>
        <p className="text-muted-foreground">
          Manage document tags and knowledge base settings
        </p>
      </div>

      {organizationId && (
        <>
          {/* Document Tags Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b">
              <div className="flex items-center gap-2">
                <Tag className="h-5 w-5 text-muted-foreground" />
                <h2 className="text-xl font-semibold">Document Tags</h2>
              </div>
              <Button
                onClick={() => {
                  // Trigger the add dialog in DocumentTagsManager
                  const event = new CustomEvent("open-add-tag-dialog");
                  window.dispatchEvent(event);
                }}
                size="sm"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add
              </Button>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                Manage tags to organize your documents. Tags can be assigned to
                documents to help categorize and filter them.
              </p>
            </div>
            <DocumentTagsManager />
          </div>

          {/* Knowledge Base Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b">
              <div className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-muted-foreground" />
                <h2 className="text-xl font-semibold">Knowledge Base</h2>
              </div>
              <Button onClick={() => setShowAddDocumentsModal(true)} size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Add
              </Button>
            </div>
            <KnowledgeBase
              organizationSlug={slug}
              organizationId={organizationId}
              onAddClick={() => setShowAddDocumentsModal(true)}
            />
          </div>

          <AddDocumentsModal
            open={showAddDocumentsModal}
            onOpenChange={setShowAddDocumentsModal}
            onAdd={async (documentIds: string[]) => {
              try {
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

                // Trigger refresh via custom event
                window.dispatchEvent(new Event("knowledge-base-refresh"));
              } catch (error) {
                console.error("Error adding documents to KB:", error);
                toast.error(
                  error instanceof Error
                    ? error.message
                    : "Failed to add documents to knowledge base"
                );
                throw error;
              }
            }}
          />
        </>
      )}
    </div>
  );
}

