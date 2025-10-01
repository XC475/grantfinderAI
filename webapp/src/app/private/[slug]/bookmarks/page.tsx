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
import { Loading } from "@/components/ui/spinner";

type Opportunity = {
  id: number; // opportunity id from public.opportunities
  title: string;
  description: string | null;
  agency: string | null;
  source: string;
  total_funding_amount: number | null;
  award_min: number | null;
  award_max: number | null;
  close_date: string | null;
  url: string | null;
  category: string | null;
  status: string;
  source_grant_id: string;
};

type Bookmark = {
  id: string;
  createdAt: string;
  opportunityId: number;
  opportunity: Opportunity | null;
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
    <div className="p-6">
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
              <Card key={b.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-2">
                        {opp.title}
                      </CardTitle>
                      <CardDescription className="text-sm text-gray-600 mb-3">
                        {opp.agency || opp.source} • {opp.source_grant_id}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{opp.status}</Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeBookmark(b.opportunityId)}
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
                    {opp.description && (
                      <div
                        className="text-sm text-gray-700 line-clamp-3"
                        dangerouslySetInnerHTML={{ __html: opp.description }}
                      />
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Total Funding:</span>
                        <p>{formatCurrency(opp.total_funding_amount)}</p>
                      </div>
                      <div>
                        <span className="font-medium">Award Range:</span>
                        <p>
                          {opp.award_min && opp.award_max
                            ? `${formatCurrency(
                                opp.award_min
                              )} - ${formatCurrency(opp.award_max)}`
                            : opp.award_max
                            ? `Up to ${formatCurrency(opp.award_max)}`
                            : opp.award_min
                            ? `From ${formatCurrency(opp.award_min)}`
                            : "Not specified"}
                        </p>
                      </div>
                      <div>
                        <span className="font-medium">Deadline:</span>
                        <p>{formatDate(opp.close_date)}</p>
                      </div>
                    </div>

                    {opp.category && (
                      <div className="text-sm">
                        <span className="font-medium">Category:</span>{" "}
                        {opp.category}
                      </div>
                    )}

                    {opp.url && (
                      <div>
                        <Button asChild variant="outline" size="sm">
                          <a
                            href={opp.url}
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
            );
          })}
        </div>
      )}
    </div>
  );
}
