"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { GrantInfoCard } from "./GrantInfoCard";
import { DocumentsView } from "@/components/folders/DocumentsView";

interface Application {
  id: string;
  opportunityId: number | null;
  status: string;
  title: string | null;
  createdAt: string;
  updatedAt: string;
  opportunityTitle: string | null;
  opportunityDescription: string | null;
  opportunityEligibility: string | null;
  opportunityAgency: string | null;
  opportunityCloseDate: string | null;
  opportunityTotalFunding: bigint | null;
  opportunityAwardMin: bigint | null;
  opportunityAwardMax: bigint | null;
  opportunityUrl: string | null;
  opportunityAttachments: Array<{ url?: string; title?: string; description?: string }> | null;
  organization: {
    slug: string;
    name: string;
  };
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
  const [applicationFolderId, setApplicationFolderId] = useState<string | null>(
    null
  );
  const [applicationStatus, setApplicationStatus] = useState<string | null>(
    null
  );
  const [loading, setLoading] = useState(true);

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
          setApplicationStatus(app.status);
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

  const fetchApplicationFolder = useCallback(async () => {
    try {
      const response = await fetch(
        `/api/folders?applicationId=${applicationId}`
      );
      if (response.ok) {
        const data = await response.json();
        const appFolder = data.folders.find(
          (f: { id: string; applicationId: string | null }) =>
            f.applicationId === applicationId
        );
        if (appFolder) {
          setApplicationFolderId(appFolder.id);
        }
      }
    } catch (error) {
      console.error("Error fetching application folder:", error);
    }
  }, [applicationId]);

  const handleStatusUpdate = async (newStatus: string) => {
    if (!application) return;

    const previousStatus = applicationStatus;

    // Optimistic update
    setApplicationStatus(newStatus);
    toast.success("Status updated successfully");

    try {
      const response = await fetch(`/api/applications/${application.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) throw new Error("Failed to update status");

      // Refresh application data
      await fetchApplication();
    } catch (error) {
      console.error("Error updating status:", error);

      // Revert on error
      setApplicationStatus(previousStatus);

      toast.error("Failed to update status");
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const app = await fetchApplication();
        if (app) {
          await fetchApplicationFolder();
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
    fetchApplicationFolder,
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
        grant={{
          id: application.opportunityId || 0,
          title:
            application.opportunityTitle ||
            application.title ||
            "Untitled Opportunity",
          status: application.opportunityId ? "Referenced" : "Outside Opportunity",
          description: application.opportunityDescription || undefined,
          close_date: application.opportunityCloseDate || undefined,
          total_funding_amount: application.opportunityTotalFunding
            ? Number(application.opportunityTotalFunding)
            : undefined,
          award_min: application.opportunityAwardMin
            ? Number(application.opportunityAwardMin)
            : undefined,
          award_max: application.opportunityAwardMax
            ? Number(application.opportunityAwardMax)
            : undefined,
          agency: application.opportunityAgency || undefined,
          url: application.opportunityUrl || undefined,
          attachments: application.opportunityAttachments || undefined,
        }}
        application={{
          id: applicationId,
          status: applicationStatus || application.status,
        }}
        onStatusUpdate={handleStatusUpdate}
        organizationSlug={organizationSlug}
        isEditable={true}
        onUpdate={fetchApplication}
      />

      {/* Documents Section */}
      {applicationFolderId && (
        <DocumentsView
          organizationSlug={organizationSlug}
          rootFolderId={applicationFolderId}
          rootLabel={application.title || "Documents"}
          applicationId={applicationId}
        />
      )}
    </div>
  );
}
