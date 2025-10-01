"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bookmark, BookmarkCheck, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { Loading } from "@/components/ui/spinner";

type Grant = {
  id: number;
  title: string;
  description: string | null;
  description_summary: string | null;
  eligibility_summary: string | null;
  agency: string | null;
  source: string;
  source_grant_id: string;
  total_funding_amount: number | null;
  award_min: number | null;
  award_max: number | null;
  close_date: string | null;
  post_date: string | null;
  url: string | null;
  category: string | null;
  status: string;
  state_code: string | null;
  funding_instrument: string | null;
  cost_sharing: boolean | null;
  fiscal_year: number | null;
  cfda_numbers: string | null;
  eligible_applicants: string | null;
  additional_info: string | null;
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
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return "Not specified";
  }
}

export default function GrantDetailPage() {
  const params = useParams();
  const grantId = params.grantId as string;
  const slug = params.slug as string;

  const [grant, setGrant] = useState<Grant | null>(null);
  const [loading, setLoading] = useState(true);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [bookmarking, setBookmarking] = useState(false);

  useEffect(() => {
    fetchGrant();
    checkBookmarkStatus();
  }, [grantId]);

  const fetchGrant = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/grants/${grantId}`);
      if (!res.ok) throw new Error("Grant not found");
      const data = await res.json();
      setGrant(data);
    } catch (error) {
      console.error("Error fetching grant:", error);
      toast.error("Failed to load grant details");
    } finally {
      setLoading(false);
    }
  };

  const checkBookmarkStatus = async () => {
    try {
      const res = await fetch(`/api/grants/${grantId}/bookmark`);
      if (res.ok) {
        const data = await res.json();
        setIsBookmarked(data.bookmarked);
      }
    } catch (error) {
      console.error("Error checking bookmark status:", error);
    }
  };

  const toggleBookmark = async () => {
    try {
      setBookmarking(true);
      const method = isBookmarked ? "DELETE" : "POST";
      const res = await fetch(`/api/grants/${grantId}/bookmark`, { method });

      if (!res.ok && res.status !== 204) {
        throw new Error("Failed to update bookmark");
      }

      setIsBookmarked(!isBookmarked);
      toast.success(
        isBookmarked ? "Removed from bookmarks" : "Added to bookmarks"
      );
    } catch (error) {
      console.error("Error toggling bookmark:", error);
      toast.error("Failed to update bookmark");
    } finally {
      setBookmarking(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <Loading message="Loading grant details..." />
      </div>
    );
  }

  if (!grant) {
    return (
      <div className="p-6">
        <div className="text-center py-16">
          <h2 className="text-2xl font-bold mb-4">Grant Not Found</h2>
          <p className="text-gray-600 mb-6">
            The grant you're looking for doesn't exist or has been removed.
          </p>
          <Button asChild>
            <a href={`/private/${slug}/grants`}>Back to Grants</a>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-2">{grant.title}</h1>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline">{grant.status}</Badge>
              {grant.category && (
                <Badge variant="secondary">{grant.category}</Badge>
              )}
              {grant.funding_instrument && (
                <Badge variant="secondary">{grant.funding_instrument}</Badge>
              )}
            </div>
          </div>
          <Button
            onClick={toggleBookmark}
            disabled={bookmarking}
            variant={isBookmarked ? "default" : "outline"}
            className="flex-shrink-0"
          >
            {isBookmarked ? (
              <>
                <BookmarkCheck className="h-4 w-4 mr-2" />
                Saved
              </>
            ) : (
              <>
                <Bookmark className="h-4 w-4 mr-2" />
                Save
              </>
            )}
          </Button>
        </div>

        <div className="text-sm text-gray-600">
          {grant.agency || grant.source} • {grant.source_grant_id}
        </div>
      </div>

      {/* Key Information */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Key Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <h3 className="font-semibold text-sm text-gray-600 mb-1">
                Total Funding
              </h3>
              <p className="text-lg">
                {formatCurrency(grant.total_funding_amount)}
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-sm text-gray-600 mb-1">
                Award Range
              </h3>
              <p className="text-lg">
                {grant.award_min && grant.award_max
                  ? `${formatCurrency(grant.award_min)} - ${formatCurrency(
                      grant.award_max
                    )}`
                  : grant.award_max
                  ? `Up to ${formatCurrency(grant.award_max)}`
                  : grant.award_min
                  ? `From ${formatCurrency(grant.award_min)}`
                  : "Not specified"}
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-sm text-gray-600 mb-1">
                Close Date
              </h3>
              <p className="text-lg">{formatDate(grant.close_date)}</p>
            </div>
            <div>
              <h3 className="font-semibold text-sm text-gray-600 mb-1">
                Post Date
              </h3>
              <p className="text-lg">{formatDate(grant.post_date)}</p>
            </div>
            {grant.state_code && (
              <div>
                <h3 className="font-semibold text-sm text-gray-600 mb-1">
                  State
                </h3>
                <p className="text-lg">{grant.state_code}</p>
              </div>
            )}
            {grant.cost_sharing !== null && (
              <div>
                <h3 className="font-semibold text-sm text-gray-600 mb-1">
                  Cost Sharing
                </h3>
                <p className="text-lg">
                  {grant.cost_sharing ? "Required" : "Not Required"}
                </p>
              </div>
            )}
            {grant.fiscal_year && (
              <div>
                <h3 className="font-semibold text-sm text-gray-600 mb-1">
                  Fiscal Year
                </h3>
                <p className="text-lg">{grant.fiscal_year}</p>
              </div>
            )}
            {grant.cfda_numbers && (
              <div>
                <h3 className="font-semibold text-sm text-gray-600 mb-1">
                  CFDA Number(s)
                </h3>
                <p className="text-lg">{grant.cfda_numbers}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Description */}
      {(grant.description_summary || grant.description) && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Description</CardTitle>
          </CardHeader>
          <CardContent>
            {grant.description_summary && (
              <div className="mb-4">
                <h3 className="font-semibold text-sm text-gray-600 mb-2">
                  Summary
                </h3>
                <p className="text-sm">{grant.description_summary}</p>
              </div>
            )}
            {grant.description && (
              <div>
                <h3 className="font-semibold text-sm text-gray-600 mb-2">
                  Full Description
                </h3>
                <div
                  className="prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: grant.description }}
                />
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Eligibility */}
      {(grant.eligibility_summary || grant.eligible_applicants) && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Eligibility</CardTitle>
          </CardHeader>
          <CardContent>
            {grant.eligibility_summary && (
              <div className="mb-4">
                <h3 className="font-semibold text-sm text-gray-600 mb-2">
                  Summary
                </h3>
                <p className="text-sm">{grant.eligibility_summary}</p>
              </div>
            )}
            {grant.eligible_applicants && (
              <div>
                <h3 className="font-semibold text-sm text-gray-600 mb-2">
                  Eligible Applicants
                </h3>
                <p className="text-sm">{grant.eligible_applicants}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Additional Information */}
      {grant.additional_info && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Additional Information</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap">
              {grant.additional_info}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      {grant.url && (
        <Card>
          <CardContent className="pt-6">
            <Button asChild size="lg" className="w-full">
              <a href={grant.url} target="_blank" rel="noopener noreferrer">
                View Full Opportunity
                <ExternalLink className="h-4 w-4 ml-2" />
              </a>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
