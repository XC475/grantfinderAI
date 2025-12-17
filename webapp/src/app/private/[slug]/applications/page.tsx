"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, FileText, Plus } from "lucide-react";
import { toast } from "sonner";
import { ApplicationsTable } from "@/components/applications/ApplicationsTable";
import { AddApplicationModal } from "@/components/applications/AddApplicationModal";
import { Application } from "@/components/applications/columns";
import { useHeaderActions } from "@/contexts/HeaderActionsContext";

export default function ApplicationsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const router = useRouter();
  const { setHeaderActions } = useHeaderActions();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [addModalOpen, setAddModalOpen] = useState(false);

  const fetchApplications = async () => {
    try {
      const response = await fetch(
        `/api/applications?organizationSlug=${slug}`
      );
      if (response.ok) {
        const data = await response.json();
        setApplications(data.applications);
      } else {
        toast.error("Failed to load applications");
      }
    } catch (error) {
      console.error("Error fetching applications:", error);
      toast.error("Failed to load applications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  // Set header actions
  useEffect(() => {
    setHeaderActions(
      <Button onClick={() => setAddModalOpen(true)}>
        <Plus className="h-4 w-4 mr-1" />
        New
      </Button>
    );

    // Cleanup on unmount
    return () => setHeaderActions(null);
  }, [setHeaderActions]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (applications.length === 0) {
    return (
      <>
        <div className="max-w-6xl">
          <Card>
            <CardHeader>
              <CardDescription>Manage your grant applications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  No applications yet
                </h3>
                <p className="text-sm text-muted-foreground">
                  Create your first application from our grants database or add
                  an outside opportunity using the Add button above
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
        <AddApplicationModal
          open={addModalOpen}
          onOpenChange={setAddModalOpen}
          organizationSlug={slug}
          onSuccess={() => {
            setAddModalOpen(false);
            fetchApplications();
          }}
        />
      </>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <ApplicationsTable
          applications={applications}
          slug={slug}
          onRefresh={fetchApplications}
          variant="full"
        />
      </div>

      <AddApplicationModal
        open={addModalOpen}
        onOpenChange={setAddModalOpen}
        organizationSlug={slug}
        onSuccess={() => {
          setAddModalOpen(false);
          fetchApplications();
        }}
      />
    </>
  );
}
