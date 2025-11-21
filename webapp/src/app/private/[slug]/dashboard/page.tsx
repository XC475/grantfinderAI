"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Clock, ChevronRight, Loader2, Plus, Search } from "lucide-react";
import { toast } from "sonner";
import { ApplicationsTable } from "@/components/applications/ApplicationsTable";
import { AddApplicationModal } from "@/components/applications/AddApplicationModal";
import { type Application } from "@/components/applications/columns";
import { TextAnimate } from "@/components/ui/text-animate";
import { useHeaderContent } from "@/contexts/HeaderContentContext";
import {
  AIAssistantCard,
  GrantsCard,
  RecommendationsCard,
  OrgProfileCard,
} from "@/components/dashboard/FeatureCards";

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
  const [searchFilter, setSearchFilter] = useState("");
  const [addModalOpen, setAddModalOpen] = useState(false);
  const { setHeaderContent } = useHeaderContent();
  const hasSetHeaderRef = useRef(false);

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
        // Extract first name from full name
        const firstName = data.name ? data.name.split(" ")[0] : "";
        setUserName(firstName);
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

  // Filter applications based on search
  const filteredApplications = applications.filter((app) => {
    if (!searchFilter) return true;
    const searchLower = searchFilter.toLowerCase();
    return (
      app.title?.toLowerCase().includes(searchLower) ||
      app.opportunityId?.toString().includes(searchLower) ||
      app.status.toLowerCase().includes(searchLower)
    );
  });

  // Set header content with welcome message
  useEffect(() => {
    // Only set header content once when userName is available and hasn't been set before
    if (userName && !hasSetHeaderRef.current) {
      hasSetHeaderRef.current = true;
      setHeaderContent(
        <div className="text-base text-muted-foreground font-medium">
          <TextAnimate animation="blurInUp" by="character" once>
            {`Welcome back, ${userName}`}
          </TextAnimate>
        </div>
      );
    }

    // Cleanup: reset header content when component unmounts
    return () => setHeaderContent(null);
  }, [userName, setHeaderContent]);

  return (
    <div className="flex flex-col h-full overflow-hidden py-2 gap-6">
      {/* Feature Cards - 4 Columns */}
      <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 flex-shrink-0">
        <AIAssistantCard slug={organizationSlug} />
        <GrantsCard slug={organizationSlug} />
        <RecommendationsCard slug={organizationSlug} />
        <OrgProfileCard slug={organizationSlug} />
      </div>

      {/* Jump Back In (1/4) + Applications (3/4) */}
      <div className="grid gap-5 grid-cols-1 md:grid-cols-4 flex-1 min-h-0 overflow-hidden">
        {/* Jump Back In - Left Side (1 column) - Claude-inspired styling */}
        <Card className="md:col-span-1 flex flex-col overflow-hidden bg-card/60 border-muted-foreground/20 backdrop-blur-sm">
          <CardHeader className="flex-shrink-0 pb-4">
            <CardTitle className="flex items-center gap-3 text-lg font-normal text-foreground/90">
              <div className="w-8 h-8 rounded-lg bg-foreground/5 flex items-center justify-center">
                <Clock
                  className="h-4 w-4 text-foreground/70"
                  strokeWidth={1.5}
                />
              </div>
              Jump Back In
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-auto space-y-1.5 px-4">
            {recentActivities.map((activity) => (
              <div
                key={activity.id}
                className="group flex items-start justify-between p-3 rounded-xl hover:bg-foreground/5 cursor-pointer transition-all duration-300 border border-transparent hover:border-foreground/10"
                onClick={() => handleActivityClick(activity)}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-normal text-foreground/80 truncate group-hover:text-foreground transition-colors">
                    {activity.title}
                  </p>
                  <p className="text-xs text-foreground/50 mt-1 font-light">
                    {activity.timestamp}
                  </p>
                </div>
                <ChevronRight
                  className="h-4 w-4 text-muted-foreground flex-shrink-0 ml-2 opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-0.5"
                  strokeWidth={1.5}
                />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Applications - Right Side (3 columns) - NO CARD WRAPPER */}
        <div className="md:col-span-3 flex flex-col overflow-hidden">
          <div className="flex items-center justify-between mb-5 gap-2">
            <h3 className="text-2xl font-normal text-foreground/90">
              Recent Applications
            </h3>

            <div className="flex items-center gap-2">
              {/* Search Input */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search..."
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  className="w-[200px] pl-9 bg-card/60 border-muted-foreground/20 focus-visible:border-foreground/40 transition-colors"
                />
              </div>

              {/* Add Application Button */}
              <Button
                size="sm"
                onClick={() => setAddModalOpen(true)}
                className="font-medium"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add
              </Button>

              {/* View All Button */}
              <Button
                variant="outline"
                size="sm"
                asChild
                className="border-muted-foreground/20 hover:border-foreground/30 font-medium"
              >
                <Link href={`/private/${organizationSlug}/applications`}>
                  View All
                </Link>
              </Button>
            </div>
          </div>
          <div className="flex-1 overflow-auto">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-foreground/40" />
              </div>
            ) : filteredApplications.length === 0 ? (
              <div className="text-center py-12 text-sm text-foreground/60 border border-muted-foreground/20 rounded-xl bg-card/40 font-light">
                {searchFilter
                  ? "No applications match your search"
                  : "No applications yet"}
              </div>
            ) : (
              <ApplicationsTable
                applications={filteredApplications.slice(0, 5)}
                slug={organizationSlug}
                onRefresh={fetchApplications}
                variant="dashboard"
              />
            )}
          </div>
        </div>
      </div>

      {/* Add Application Modal */}
      <AddApplicationModal
        open={addModalOpen}
        onOpenChange={setAddModalOpen}
        organizationSlug={organizationSlug}
        onSuccess={() => {
          setAddModalOpen(false);
          fetchApplications();
        }}
      />
    </div>
  );
}
