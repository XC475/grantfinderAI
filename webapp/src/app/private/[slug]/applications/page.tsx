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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, FileText, ExternalLink } from "lucide-react";
import { toast } from "sonner";

interface Application {
  id: string;
  opportunityId: number;
  status: string;
  title: string | null;
  createdAt: string;
  updatedAt: string;
  submittedAt: string | null;
  lastEditedAt: string;
  workspace: {
    slug: string;
    name: string;
  };
}

function getStatusColor(status: string): string {
  switch (status) {
    case "DRAFT":
      return "bg-gray-100 text-gray-800";
    case "IN_PROGRESS":
      return "bg-blue-100 text-blue-800";
    case "READY_TO_SUBMIT":
      return "bg-purple-100 text-purple-800";
    case "SUBMITTED":
      return "bg-green-100 text-green-800";
    case "UNDER_REVIEW":
      return "bg-yellow-100 text-yellow-800";
    case "AWARDED":
      return "bg-emerald-100 text-emerald-800";
    case "REJECTED":
      return "bg-red-100 text-red-800";
    case "WITHDRAWN":
      return "bg-orange-100 text-orange-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

function formatStatus(status: string): string {
  return status.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
}

export default function ApplicationsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const router = useRouter();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApplications();
  }, [slug]);

  const fetchApplications = async () => {
    try {
      const response = await fetch(`/api/applications?workspaceSlug=${slug}`);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (applications.length === 0) {
    return (
      <div className="container max-w-6xl py-8">
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
                Start by browsing grants and clicking "Apply" to create your
                first application
              </p>
              <Button onClick={() => router.push(`/private/${slug}/grants`)}>
                Browse Grants
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-6xl py-8">
      <Card>
        <CardHeader>
          <CardTitle>Applications</CardTitle>
          <CardDescription>
            {applications.length}{" "}
            {applications.length === 1 ? "application" : "applications"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="p-4 text-left font-medium">Grant</th>
                  <th className="p-4 text-left font-medium">Status</th>
                  <th className="p-4 text-left font-medium">Last Edited</th>
                  <th className="p-4 text-left font-medium">Created</th>
                  <th className="p-4 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((application) => (
                  <tr
                    key={application.id}
                    className="border-b hover:bg-muted/50 transition-colors"
                  >
                    <td className="p-4">
                      <div>
                        <div className="font-medium">
                          {application.title ||
                            `Grant #${application.opportunityId}`}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Opportunity ID: {application.opportunityId}
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <Badge className={getStatusColor(application.status)}>
                        {formatStatus(application.status)}
                      </Badge>
                    </td>
                    <td className="p-4 text-sm text-muted-foreground">
                      {new Date(application.lastEditedAt).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-sm text-muted-foreground">
                      {new Date(application.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          router.push(
                            `/private/${slug}/grants/${application.opportunityId}`
                          )
                        }
                      >
                        <ExternalLink className="h-4 w-4 mr-1" />
                        View Grant
                      </Button>
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() =>
                          router.push(
                            `/private/${slug}/applications/${application.id}`
                          )
                        }
                      >
                        <FileText className="h-4 w-4 mr-1" />
                        Edit Application
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
