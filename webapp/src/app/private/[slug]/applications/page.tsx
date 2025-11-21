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
import { Loader2, FileText } from "lucide-react";
import { toast } from "sonner";
import { ApplicationsTable } from "@/components/applications/ApplicationsTable";
import { AddApplicationModal } from "@/components/applications/AddApplicationModal";
import { Application } from "@/components/applications/columns";

export default function ApplicationsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const router = useRouter();
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
        <div className="container max-w-6xl py-8 p-4">
          <Card>
            <CardHeader>
              <CardTitle>Applications</CardTitle>
              <CardDescription>Manage your grant applications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  No applications yet
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Create your first application from our grants database or add
                  an outside opportunity
                </p>
                <Button onClick={() => setAddModalOpen(true)}>
                  Create Application
                </Button>
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
    <div className="container max-w-full py-8 px-4 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Applications</h1>
        <p className="text-muted-foreground">
          {applications.length}{" "}
          {applications.length === 1 ? "application" : "applications"}
        </p>
      </div>

      <ApplicationsTable
        applications={applications}
        slug={slug}
        onRefresh={fetchApplications}
        variant="full"
      />
    </div>
  );
}
