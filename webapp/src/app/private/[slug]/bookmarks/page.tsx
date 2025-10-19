"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { Loading } from "@/components/ui/spinner";
import { GrantCard, GrantCardData } from "@/components/grants/GrantCard";
import { createClient } from "@/utils/supabase/client";
import type { User } from "@supabase/supabase-js";

type Bookmark = {
  id: string;
  createdAt: string;
  opportunityId: number;
  opportunity: GrantCardData | null;
};

interface ApplicationData {
  opportunityId: string;
}

export default function BookmarksPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  // Application tracking
  const [grantApplications, setGrantApplications] = useState<number[]>([]);
  const [creatingApplication, setCreatingApplication] = useState<number | null>(
    null
  );

  const fetchBookmarks = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/bookmarks");
      if (!res.ok) throw new Error(`Failed: ${res.status}`);
      const data = await res.json();
      setBookmarks(data);
    } catch (e) {
      console.error(e);
      toast.error("Failed to load bookmarks");
    } finally {
      setLoading(false);
    }
  };

  // Get user session
  useEffect(() => {
    const getUser = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, []);

  // Fetch applications for this organization
  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const response = await fetch(
          `/api/applications?organizationSlug=${slug}`
        );
        if (response.ok) {
          const data = await response.json();
          const opportunityIds = data.applications.map(
            (app: ApplicationData) => app.opportunityId
          );
          setGrantApplications(opportunityIds);
        }
      } catch (error) {
        console.error("Error fetching applications:", error);
      }
    };
    if (slug) {
      fetchApplications();
    }
  }, [slug]);

  useEffect(() => {
    fetchBookmarks();
  }, []);

  const removeBookmark = async (opportunityId: number) => {
    try {
      const res = await fetch(`/api/grants/${opportunityId}/bookmark`, {
        method: "DELETE",
      });
      if (!res.ok && res.status !== 204) throw new Error("Failed to remove");
      setBookmarks((prev) =>
        prev.filter((b) => b.opportunityId !== opportunityId)
      );
      toast.success("Removed from bookmarks");
    } catch (e) {
      console.error(e);
      toast.error("Failed to remove bookmark");
    }
  };

  const handleCreateApplication = async (grantId: number) => {
    if (!user?.email) {
      toast.error("Please sign in to create applications");
      return;
    }

    setCreatingApplication(grantId);
    try {
      const bookmark = bookmarks.find((b) => b.opportunityId === grantId);
      const response = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          opportunityId: grantId,
          organizationSlug: slug,
          grantTitle: bookmark?.opportunity?.title,
          alsoBookmark: true, // Keep it bookmarked when creating application
        }),
      });

      const data = await response.json();

      if (response.status === 409) {
        toast.info("Application already exists for this grant");
        setGrantApplications((prev) => [...prev, grantId]);
        return;
      }

      if (!response.ok) {
        throw new Error(data.error || "Failed to create application");
      }

      // Update local state
      setGrantApplications((prev) => [...prev, grantId]);
      toast.success("Application created successfully!");
    } catch (error) {
      console.error("Error creating application:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to create application"
      );
    } finally {
      setCreatingApplication(null);
    }
  };

  return (
    <div className="p-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Saved Grants</h1>
        <p className="text-gray-600">Your bookmarked grant opportunities.</p>
      </div>

      {loading && bookmarks.length === 0 ? (
        <Loading message="Loading bookmarks..." />
      ) : bookmarks.length === 0 ? (
        <div className="py-16 text-gray-600">No bookmarks yet.</div>
      ) : (
        <div className="space-y-4">
          {bookmarks.map((b) => {
            const opp = b.opportunity;
            if (!opp) return null;

            return (
              <GrantCard
                key={b.id}
                grant={opp}
                organizationSlug={slug}
                isSaved={true}
                hasApplication={grantApplications.includes(opp.id)}
                isCreatingApplication={creatingApplication === opp.id}
                onToggleBookmark={removeBookmark}
                onCreateApplication={handleCreateApplication}
                fromBookmarks={true}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
