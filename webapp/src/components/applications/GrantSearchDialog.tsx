"use client";

import { useState } from "react";
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
import { ChevronLeft, Search as SearchIcon, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Grant {
  id: number;
  title: string;
  agency: string | null;
  close_date: string | null;
  total_funding_amount: number | null;
  description_summary: string | null;
  description: string | null;
  eligibility_summary: string | null;
  award_min: number | null;
  award_max: number | null;
  url: string | null;
  attachments: any | null;
}

interface GrantSearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  organizationSlug: string;
  onSuccess: () => void;
  onBack: () => void;
}

export function GrantSearchDialog({
  open,
  onOpenChange,
  organizationSlug,
  onSuccess,
  onBack,
}: GrantSearchDialogProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [grants, setGrants] = useState<Grant[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState<number | null>(null);
  const [searched, setSearched] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast.error("Please enter a search query");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(
        `/api/grants/search?q=${encodeURIComponent(searchQuery)}`
      );
      if (!res.ok) throw new Error("Failed to search grants");

      const data = await res.json();
      setGrants(data.grants || data || []);
      setSearched(true);
    } catch (error) {
      console.error("Error searching grants:", error);
      toast.error("Failed to search grants");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateApplication = async (grant: Grant) => {
    try {
      setCreating(grant.id);

      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          opportunityId: grant.id,
          organizationSlug,
          title: grant.title,
          opportunityTitle: grant.title,
          opportunityDescription: grant.description,
          opportunityEligibility: grant.eligibility_summary,
          opportunityAgency: grant.agency,
          opportunityCloseDate: grant.close_date,
          opportunityTotalFunding: grant.total_funding_amount,
          opportunityAwardMin: grant.award_min,
          opportunityAwardMax: grant.award_max,
          opportunityUrl: grant.url,
          opportunityAttachments: grant.attachments,
          alsoBookmark: true,
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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

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
              <DialogTitle>Search for Grant</DialogTitle>
              <DialogDescription>
                Find a grant in our database to create an application
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Search */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search grants..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              className="pl-9"
            />
          </div>
          <Button onClick={handleSearch} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Search"}
          </Button>
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-2">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : !searched ? (
            <div className="text-center py-12 text-muted-foreground">
              Enter a search query to find grants
            </div>
          ) : grants.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No grants found. Try a different search term.
            </div>
          ) : (
            grants.map((grant) => (
              <div
                key={grant.id}
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
                    {grant.description_summary && (
                      <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                        {grant.description_summary}
                      </p>
                    )}
                    <div className="flex items-center gap-2 flex-wrap">
                      {grant.close_date && (
                        <Badge variant="outline" className="text-xs">
                          Due: {new Date(grant.close_date).toLocaleDateString()}
                        </Badge>
                      )}
                      {grant.total_funding_amount && (
                        <Badge variant="outline" className="text-xs">
                          $
                          {grant.total_funding_amount.toLocaleString("en-US", {
                            maximumFractionDigits: 0,
                          })}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <Button
                    onClick={() => handleCreateApplication(grant)}
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
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
