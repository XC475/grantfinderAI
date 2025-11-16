"use client";

import { useState, useEffect, use, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { DocumentEditor } from "@/components/applications/DocumentEditor";

interface Document {
  id: string;
  title: string;
  content?: string;
  contentType: string;
  version: number;
  applicationId: string | null;
  folderId?: string | null;
  createdAt: string;
  updatedAt: string;
}

interface DocumentPageProps {
  params: Promise<{ slug: string; documentId: string }>;
}

export default function EditorPage({ params }: DocumentPageProps) {
  const [document, setDocument] = useState<Document | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  const { slug: organizationSlug, documentId } = use(params);

  const fetchDocument = useCallback(async () => {
    try {
      // Fetch document without needing applicationId in the URL
      const response = await fetch(`/api/documents/${documentId}`);

      if (response.ok) {
        const data = await response.json();
        setDocument(data.document);
      } else if (response.status === 404) {
        toast.error("Document not found");
        router.push(`/private/${organizationSlug}/documents`);
      } else {
        throw new Error("Failed to fetch document");
      }
    } catch (error) {
      console.error("Error fetching document:", error);
      toast.error("Failed to load document");
      router.push(`/private/${organizationSlug}/documents`);
    } finally {
      setLoading(false);
    }
  }, [documentId, organizationSlug, router]);

  const handleSave = async (content: string) => {
    if (!document) return;

    setSaving(true);
    try {
      const endpoint = document.applicationId
        ? `/api/applications/${document.applicationId}/documents/${documentId}`
        : `/api/documents/${documentId}`;

      const response = await fetch(endpoint, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content,
          contentType: "json",
        }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => null);
        throw new Error(error?.error || "Failed to save document");
      }

      const { document: updatedDocument } = await response.json();
      setDocument(updatedDocument);
    } catch (error) {
      console.error("Error saving document:", error);
      throw error;
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    fetchDocument();
  }, [documentId, fetchDocument]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!document) {
    return (
      <div className="container max-w-6xl py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Document Not Found</h1>
          <p className="text-muted-foreground">
            The document you&apos;re looking for doesn&apos;t exist or you
            don&apos;t have access to it.
          </p>
        </div>
      </div>
    );
  }

  return (
    <DocumentEditor
      document={document}
      onSave={handleSave}
      isSaving={saving}
      organizationSlug={organizationSlug}
    />
  );
}
