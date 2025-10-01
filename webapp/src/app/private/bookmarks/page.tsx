"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookmarkMinus } from "lucide-react";
import { toast } from "sonner";

type BookmarkGrant = {
  id: string; // grant id (app.grants)
  title: string;
  description: string | null;
  funder: string;
  funderType: string;
  amount: string | number | null;
  deadline: string | null;
  url: string | null;
  categories: string[];
  keywords: string[];
};

type Bookmark = {
  id: string;
  createdAt: string;
  grantId: string;
  grant: BookmarkGrant;
};

function formatCurrency(amount: number | string | null) {
  if (amount === null || amount === undefined || amount === "")
    return "Not specified";
  const n = typeof amount === "string" ? parseFloat(amount) : amount;
  if (Number.isNaN(n)) return "Not specified";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  }).format(n);
}

function formatDate(dateString: string | null) {
  if (!dateString) return "Not specified";
  try {
    return new Date(dateString).toLocaleDateString();
  } catch {
    return "Not specified";
  }
}

export default function BookmarksPage() {
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

  const removeBookmark = async (grantId: string) => {
    try {
      const res = await fetch(`/api/grants/${grantId}/bookmark`, {
        method: "DELETE",
      });
      if (!res.ok && res.status !== 204) throw new Error("Failed to remove");
      setBookmarks((prev) => prev.filter((b) => b.grantId !== grantId));
      toast.success("Removed from bookmarks");
    } catch (e) {
      console.error(e);
      toast.error("Failed to remove bookmark");
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Saved Grants</h1>
        <p className="text-gray-600">Your bookmarked grant opportunities.</p>
      </div>

      {loading && bookmarks.length === 0 ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading bookmarks...</p>
        </div>
      ) : bookmarks.length === 0 ? (
        <div className="text-center py-16 text-gray-600">No bookmarks yet.</div>
      ) : (
        <div className="space-y-4">
          {bookmarks.map((b) => (
            <Card key={b.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-2">
                      {b.grant.title}
                    </CardTitle>
                    <CardDescription className="text-sm text-gray-600 mb-3">
                      {b.grant.funder} • {b.grant.funderType}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">Bookmarked</Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeBookmark(b.grantId)}
                      className="h-8 w-8 p-0"
                      aria-label="Remove bookmark"
                    >
                      <BookmarkMinus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {b.grant.description && (
                    <div
                      className="text-sm text-gray-700 line-clamp-3"
                      dangerouslySetInnerHTML={{ __html: b.grant.description }}
                    />
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Funding Amount:</span>
                      <p>{formatCurrency(b.grant.amount)}</p>
                    </div>
                    <div>
                      <span className="font-medium">Deadline:</span>
                      <p>{formatDate(b.grant.deadline)}</p>
                    </div>
                    <div>
                      <span className="font-medium">Categories:</span>
                      <p>{b.grant.categories?.join(", ") || "—"}</p>
                    </div>
                  </div>

                  {b.grant.url && (
                    <div>
                      <Button asChild variant="outline" size="sm">
                        <a
                          href={b.grant.url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          View Full Details
                        </a>
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
