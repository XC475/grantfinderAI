"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { GrantInfoCard } from "./GrantInfoCard";
import { DocumentsView } from "@/components/folders/DocumentsView";

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
  const [applicationFolderId, setApplicationFolderId] = useState<string | null>(
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

  const fetchApplicationFolder = useCallback(async () => {
    try {
      const response = await fetch(
        `/api/folders?applicationId=${applicationId}`
      );
      if (response.ok) {
        const data = await response.json();
        const appFolder = data.folders.find(
          (f: any) => f.applicationId === applicationId
        );
        if (appFolder) {
          setApplicationFolderId(appFolder.id);
        }
      }
    } catch (error) {
      console.error("Error fetching application folder:", error);
    }
  }, [applicationId]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const app = await fetchApplication();
        if (app) {
          await Promise.all([
            fetchGrant(app.opportunityId),
            fetchApplicationFolder(),
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
