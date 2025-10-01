"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { Loading } from "@/components/ui/spinner";
import { GrantCard, GrantCardData } from "@/components/grants/GrantCard";

type Bookmark = {
  id: string;
  createdAt: string;
  opportunityId: number;
  opportunity: GrantCardData | null;
};

export default function BookmarksPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [loading, setLoading] = useState(true);

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
                workspaceSlug={slug}
                isSaved={true}
                onToggleBookmark={removeBookmark}
                fromBookmarks={true}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
