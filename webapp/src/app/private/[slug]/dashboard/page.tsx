"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, ChevronRight, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { ApplicationsTable } from "@/components/applications/ApplicationsTable";
import { TypewriterText } from "@/components/ui/typewriter-text";
import { useHeaderContent } from "@/contexts/HeaderContentContext";
import {
  AIAssistantCard,
  GrantsCard,
  RecommendationsCard,
  OrgProfileCard,
} from "@/components/dashboard/FeatureCards";

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

interface RecentActivity {
  id: string;
  title: string;
  timestamp: string;
  type: string;
  link: string;
}

export default function DashboardPage() {
  const params = useParams();
  const router = useRouter();
  const organizationSlug = params.slug as string;
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState<string>("");
  const { setHeaderContent } = useHeaderContent();

  // Recent activities data (mock data for now)
  const recentActivities: RecentActivity[] = [
    {
      id: "1",
      title: "STEM Education Grant Draft",
      timestamp: "2 minutes ago",
      type: "draft",
      link: `/private/${organizationSlug}/applications`,
    },
    {
      id: "2",
      title: "Search: Special Education",
      timestamp: "1 hour ago",
      type: "search",
      link: `/private/${organizationSlug}/grants?search=special+education`,
    },
    {
      id: "3",
      title: "Technology Infrastructure Proposal",
      timestamp: "3 hours ago",
      type: "draft",
      link: `/private/${organizationSlug}/applications`,
    },
    {
      id: "4",
      title: "Chat: Grant Requirements",
      timestamp: "Yesterday",
      type: "chat",
      link: `/private/${organizationSlug}/chat`,
    },
  ];

  const handleActivityClick = (activity: RecentActivity) => {
    router.push(activity.link);
  };

  // Fetch user data
  const fetchUserData = async () => {
    try {
      const response = await fetch("/api/user/me");
      if (response.ok) {
        const data = await response.json();
        setUserName(data.name || "");
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  // Fetch applications
  const fetchApplications = async () => {
    try {
      const response = await fetch(
        `/api/applications?organizationSlug=${organizationSlug}`
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
    fetchUserData();
    fetchApplications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [organizationSlug]);

  // Set header content with welcome message
  useEffect(() => {
    setHeaderContent(
      <div className="text-sm text-muted-foreground font-medium">
        <TypewriterText 
          text={`Welcome back${userName ? `, ${userName}` : ""}`}
          speed={60}
        />
      </div>
    );
    
    // Cleanup: reset header content when component unmounts
    return () => setHeaderContent(null);
  }, [userName, setHeaderContent]);

  return (
    <div className="flex flex-col h-full overflow-hidden p-6 gap-4">
      {/* Feature Cards - 4 Columns */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 flex-shrink-0">
        <AIAssistantCard slug={organizationSlug} />
        <GrantsCard slug={organizationSlug} />
        <RecommendationsCard slug={organizationSlug} />
        <OrgProfileCard slug={organizationSlug} />
      </div>

      {/* Jump Back In (1/4) + Applications (3/4) */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-4 flex-1 min-h-0 overflow-hidden">
        {/* Jump Back In - Left Side (1 column) */}
        <Card className="md:col-span-1 flex flex-col overflow-hidden">
          <CardHeader className="flex-shrink-0">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Clock className="h-5 w-5" />
              Jump Back In
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-auto space-y-2">
            {recentActivities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start justify-between p-3 rounded-lg hover:bg-muted cursor-pointer transition-colors border border-transparent hover:border-border"
                onClick={() => handleActivityClick(activity)}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{activity.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {activity.timestamp}
                  </p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0 ml-2" />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Applications - Right Side (3 columns) - NO CARD WRAPPER */}
        <div className="md:col-span-3 flex flex-col overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold">Recent Applications</h3>
            <Button variant="outline" asChild>
              <Link href={`/private/${organizationSlug}/applications`}>
                View All
              </Link>
            </Button>
          </div>
          <div className="flex-1 overflow-auto">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : applications.length === 0 ? (
              <div className="text-center py-8 text-sm text-muted-foreground border rounded-lg">
                No applications yet
              </div>
            ) : (
              <ApplicationsTable
                applications={applications.slice(0, 5)}
                slug={organizationSlug}
                onRefresh={fetchApplications}
                variant="dashboard"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
