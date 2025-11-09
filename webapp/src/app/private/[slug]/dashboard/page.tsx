"use client";

import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  BotMessageSquare,
  FileText,
  Sparkles,
  Clock,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { ApplicationsTable } from "@/components/applications/ApplicationsTable";

interface Application {
  id: string;
  opportunityId: number;
  status: string;
  title: string | null;
  createdAt: string;
  updatedAt: string;
  submittedAt: string | null;
  lastEditedAt: string;
  organization: {
    slug: string;
    name: string;
  };
  opportunity?: {
    total_funding_amount: number | null;
    close_date: string | null;
  };
}

interface CachedAction {
  id: string;
  name: string;
  lastAccessed: string;
}

export default function DashboardPage() {
  const params = useParams();
  const organizationSlug = params.slug as string;
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  // Dummy data for "Jump back in"
  const cachedActions: CachedAction[] = [
    {
      id: "1",
      name: "STEM Education Grant Draft",
      lastAccessed: "2 minutes ago",
    },
    {
      id: "2",
      name: "Search: Special Education",
      lastAccessed: "1 hour ago",
    },
    {
      id: "3",
      name: "Technology Infrastructure Proposal",
      lastAccessed: "3 hours ago",
    },
    {
      id: "4",
      name: "Chat: Grant Requirements",
      lastAccessed: "Yesterday",
    },
  ];

  // Fetch applications
  const fetchApplications = async () => {
    try {
      const response = await fetch(
        `/api/applications?organizationSlug=${organizationSlug}`
      );
      if (response.ok) {
        const data = await response.json();
        setApplications(data.applications.slice(0, 5)); // Show only first 5
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
  }, [organizationSlug]);

  return (
    <div className="space-y-6 p-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
      </div>

      {/* Top 3 Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Link href={`/private/${organizationSlug}/chat`}>
          <Card className="hover:shadow-md transition-all hover:border-primary/50 cursor-pointer h-full">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-50">
                  <BotMessageSquare className="h-6 w-6 text-blue-500" />
                </div>
                <CardTitle className="text-lg">AI Assistant</CardTitle>
              </div>
              <CardDescription className="pt-2">
                Get help with the entire grants lifecycle—from discovery and
                eligibility analysis to writing and submission support
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>

        <Link href={`/private/${organizationSlug}/grants?tab=search`}>
          <Card className="hover:shadow-md transition-all hover:border-primary/50 cursor-pointer h-full">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-50">
                  <FileText className="h-6 w-6 text-green-500" />
                </div>
                <CardTitle className="text-lg">Grants</CardTitle>
              </div>
              <CardDescription className="pt-2">
                Search, discover, and bookmark funding opportunities from
                federal, state, and private sources with advanced filters
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>

        <Link href={`/private/${organizationSlug}/grants?tab=recommendations`}>
          <Card className="hover:shadow-md transition-all hover:border-primary/50 cursor-pointer h-full">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-50">
                  <Sparkles className="h-6 w-6 text-purple-500" />
                </div>
                <CardTitle className="text-lg">Recommendations</CardTitle>
              </div>
              <CardDescription className="pt-2">
                AI-powered grant matches tailored to your district&apos;s
                profile, priorities, and strategic goals
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>
      </div>

      {/* Two Column Layout */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left: Jump Back In */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Jump Back In
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {cachedActions.map((action) => (
                <div
                  key={action.id}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-muted cursor-pointer transition-colors"
                >
                  <div className="font-medium text-sm">{action.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {action.lastAccessed}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Right: Applications Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Applications</CardTitle>
              <Link
                href={`/private/${organizationSlug}/applications`}
                className="text-sm text-primary hover:underline"
              >
                View all
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : applications.length === 0 ? (
              <div className="text-center py-8 text-sm text-muted-foreground">
                No applications yet
              </div>
            ) : (
              <ApplicationsTable
                applications={applications}
                slug={organizationSlug}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
