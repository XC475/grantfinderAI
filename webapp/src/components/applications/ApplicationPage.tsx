"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { GrantInfoCard } from "./GrantInfoCard";
import { DocumentList } from "./DocumentList";

interface Application {
  id: string;
  opportunityId: number;
  status: string;
  title: string | null;
  createdAt: string;
  updatedAt: string;
  organization: {
    slug: string;
    name: string;
  };
}

interface Grant {
  id: number;
  title: string;
  description?: string;
  status: string;
  close_date?: string;
  total_funding_amount?: number;
  award_min?: number;
  award_max?: number;
  agency?: string;
  url?: string;
  attachments?: Array<{ url?: string; title?: string; name?: string }>;
}

interface Document {
  id: string;
  title: string;
  content?: string;
  contentType: string;
  version: number;
  createdAt: string;
  updatedAt: string;
}

interface ApplicationPageProps {
  applicationId: string;
  organizationSlug: string;
}

export function ApplicationPage({
  applicationId,
  organizationSlug,
}: ApplicationPageProps) {
  const [application, setApplication] = useState<Application | null>(null);
  const [grant, setGrant] = useState<Grant | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const fetchApplication = useCallback(async () => {
    try {
      const response = await fetch(
        `/api/applications?organizationSlug=${organizationSlug}`
      );
      if (response.ok) {
        const data = await response.json();
        const app = data.applications.find(
          (app: Application) => app.id === applicationId
        );
        if (app) {
          setApplication(app);
          return app;
        }
      }
      throw new Error("Application not found");
    } catch (error) {
      console.error("Error fetching application:", error);
      toast.error("Failed to load application");
      return null;
    }
  }, [organizationSlug, applicationId]);

  const fetchGrant = async (opportunityId: number) => {
    try {
      const response = await fetch(`/api/grants/${opportunityId}`);
      if (response.ok) {
        const grantData = await response.json();
        setGrant(grantData);
      }
    } catch (error) {
      console.error("Error fetching grant:", error);
    }
  };

  const fetchDocuments = useCallback(async () => {
    try {
      const response = await fetch(
        `/api/applications/${applicationId}/documents`
      );
      if (response.ok) {
        const data = await response.json();
        setDocuments(data.documents);
      }
    } catch (error) {
      console.error("Error fetching documents:", error);
      toast.error("Failed to load documents");
    }
  }, [applicationId]);

  const handleEditDocument = (documentId: string) => {
    router.push(`/private/${organizationSlug}/editor/${documentId}`);
  };

  const handleDeleteDocument = async (documentId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this document? This action cannot be undone."
      )
    ) {
      return;
    }

    setIsDeleting(true);
    try {
      const response = await fetch(
        `/api/applications/${applicationId}/documents/${documentId}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        toast.success("Document deleted successfully");
        fetchDocuments(); // Refresh the list
      } else {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete document");
      }
    } catch (error) {
      console.error("Error deleting document:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to delete document"
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const handleRefreshDocuments = () => {
    fetchDocuments();
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const app = await fetchApplication();
        if (app) {
          await Promise.all([
            fetchGrant(app.opportunityId),
            fetchDocuments(),
          ]);
        }
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [
    applicationId,
    organizationSlug,
    fetchApplication,
    fetchDocuments,
  ]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!application) {
    return (
      <div className="container max-w-6xl py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Application Not Found</h1>
          <p className="text-muted-foreground mb-4">
            The application you&apos;re looking for doesn&apos;t exist or you
            don&apos;t have access to it.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-6xl space-y-8 p-4">
      {/* Grant Information */}
      <GrantInfoCard
        grant={
          grant || {
            id: application.opportunityId,
            title:
              application.title || `Application #${application.opportunityId}`,
            status: "Not specified",
            description: undefined,
            close_date: undefined,
            total_funding_amount: undefined,
            award_min: undefined,
            award_max: undefined,
            agency: undefined,
            url: undefined,
            attachments: undefined,
          }
        }
        organizationSlug={organizationSlug}
      />

      {/* Documents */}
      <DocumentList
        documents={documents}
        applicationId={applicationId}
        organizationSlug={organizationSlug}
        onEdit={handleEditDocument}
        onDelete={handleDeleteDocument}
        onRefresh={handleRefreshDocuments}
        isDeleting={isDeleting}
      />
    </div>
  );
}
