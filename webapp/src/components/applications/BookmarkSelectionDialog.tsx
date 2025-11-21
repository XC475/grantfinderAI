"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, Search, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Bookmark {
  id: string;
  opportunityId: number;
  notes: string | null;
  createdAt: string;
}

interface Grant {
  id: number;
  title: string;
  agency: string | null;
  close_date: string | null;
  total_funding_amount: number | null;
  description_summary: string | null;
}

interface BookmarkSelectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  organizationSlug: string;
  onSuccess: () => void;
  onBack: () => void;
}

export function BookmarkSelectionDialog({
  open,
  onOpenChange,
  organizationSlug,
  onSuccess,
  onBack,
}: BookmarkSelectionDialogProps) {
  const router = useRouter();
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [grants, setGrants] = useState<Map<number, Grant>>(new Map());
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (open) {
      fetchBookmarks();
    }
  }, [open]);

  const fetchBookmarks = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/bookmarks?limit=100");
      if (!res.ok) throw new Error("Failed to fetch bookmarks");

      const response = await res.json();
      const bookmarksData = response.data || [];
      setBookmarks(bookmarksData);

      // Extract opportunity data from bookmarks (they already include opportunity data)
      if (bookmarksData.length > 0) {
        const grantsMap = new Map<number, Grant>();
        bookmarksData.forEach((bookmark: any) => {
          if (bookmark.opportunity) {
            grantsMap.set(bookmark.opportunityId, bookmark.opportunity);
          }
        });
        setGrants(grantsMap);
      }
    } catch (error) {
      console.error("Error fetching bookmarks:", error);
      toast.error("Failed to load bookmarks");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateApplication = async (opportunityId: number) => {
    try {
      setCreating(opportunityId);
      const grant = grants.get(opportunityId);

      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          opportunityId,
          organizationSlug,
          title: grant?.title,
          opportunityTitle: grant?.title,
          opportunityDescription: grant?.description_summary,
          opportunityAgency: grant?.agency,
          opportunityCloseDate: grant?.close_date,
          opportunityTotalFunding: grant?.total_funding_amount,
          alsoBookmark: false, // Already bookmarked
        }),
      });

      const data = await res.json();

      if (res.status === 409) {
        toast.info("Application already exists for this grant");
        if (data.application?.id) {
          router.push(
            `/private/${organizationSlug}/applications/${data.application.id}`
          );
          onSuccess();
        }
        return;
      }

      if (!res.ok) {
        throw new Error(data.error || "Failed to create application");
      }

      toast.success("Application created successfully!");
      router.push(
        `/private/${organizationSlug}/applications/${data.application.id}`
      );
      onSuccess();
    } catch (error) {
      console.error("Error creating application:", error);
      toast.error("Failed to create application");
    } finally {
      setCreating(null);
    }
  };

  const filteredBookmarks = bookmarks.filter((bookmark) => {
    if (!searchQuery) return true;
    const grant = grants.get(bookmark.opportunityId);
    if (!grant) return false;

    const query = searchQuery.toLowerCase();
    return (
      grant.title.toLowerCase().includes(query) ||
      grant.agency?.toLowerCase().includes(query)
    );
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] flex flex-col">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={onBack}
              className="h-8 w-8"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="flex-1">
              <DialogTitle>Select from Bookmarks</DialogTitle>
              <DialogDescription>
                Choose a saved grant to create an application
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search bookmarks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Bookmarks list */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-2">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredBookmarks.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              {searchQuery
                ? "No bookmarks match your search"
                : "No bookmarks yet. Save grants to see them here."}
            </div>
          ) : (
            filteredBookmarks.map((bookmark) => {
              const grant = grants.get(bookmark.opportunityId);
              if (!grant) return null;

              return (
                <div
                  key={bookmark.id}
                  className="border rounded-lg p-4 hover:bg-accent transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold mb-1 truncate">
                        {grant.title}
                      </h3>
                      {grant.agency && (
                        <p className="text-sm text-muted-foreground mb-2">
                          {grant.agency}
                        </p>
                      )}
                      <div className="flex items-center gap-2 flex-wrap">
                        {grant.close_date && (
                          <Badge variant="outline" className="text-xs">
                            Due:{" "}
                            {new Date(grant.close_date).toLocaleDateString()}
                          </Badge>
                        )}
                        {grant.total_funding_amount && (
                          <Badge variant="outline" className="text-xs">
                            $
                            {grant.total_funding_amount.toLocaleString(
                              "en-US",
                              { maximumFractionDigits: 0 }
                            )}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <Button
                      onClick={() => handleCreateApplication(grant.id)}
                      disabled={creating === grant.id}
                      size="sm"
                    >
                      {creating === grant.id ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Creating...
                        </>
                      ) : (
                        "Create Application"
                      )}
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
