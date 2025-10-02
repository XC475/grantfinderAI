"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bookmark, BookmarkCheck, FileText, CheckCircle2 } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";

export type GrantCardData = {
  id: number;
  title: string;
  description: string | null;
  source_grant_id: string;
  status: string;
  category: string | null;
  total_funding_amount: number | null;
  award_min: number | null;
  award_max: number | null;
  close_date: string | null;
  agency: string | null;
  source: string;
  url: string | null;
};

interface GrantCardProps {
  grant: GrantCardData;
  workspaceSlug: string;
  isSaved: boolean;
  hasApplication?: boolean;
  isLoading?: boolean;
  isCreatingApplication?: boolean;
  onToggleBookmark: (grantId: number) => void;
  onCreateApplication?: (grantId: number) => void;
  fromBookmarks?: boolean;
}

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

function getStatusColor(status: string): string {
  switch (status?.toLowerCase()) {
    case "posted":
      return "bg-green-100 text-green-800 hover:bg-green-200";
    case "forecasted":
      return "bg-blue-100 text-blue-800 hover:bg-blue-200";
    case "closed":
      return "bg-gray-100 text-gray-800 hover:bg-gray-200";
    default:
      return "bg-gray-100 text-gray-800 hover:bg-gray-200";
  }
}

export function GrantCard({
  grant,
  workspaceSlug,
  isSaved,
  hasApplication = false,
  isLoading = false,
  isCreatingApplication = false,
  onToggleBookmark,
  onCreateApplication,
  fromBookmarks = false,
}: GrantCardProps) {
  const grantUrl = fromBookmarks
    ? `/private/${workspaceSlug}/grants/${grant.id}?from=bookmarks`
    : `/private/${workspaceSlug}/grants/${grant.id}`;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start">
          <Link href={grantUrl} className="flex-1 cursor-pointer">
            <CardTitle className="text-lg mb-2 hover:text-primary transition-colors">
              {grant.title}
            </CardTitle>
            <CardDescription className="text-sm text-gray-600 mb-3">
              {grant.agency || grant.source} • {grant.source_grant_id}
            </CardDescription>
          </Link>
          <div className="flex items-center gap-2">
            <Badge className={getStatusColor(grant.status)}>
              {grant.status}
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.preventDefault();
                onToggleBookmark(grant.id);
              }}
              disabled={isLoading}
              className="h-8 w-8 p-0"
              aria-label={isSaved ? "Remove bookmark" : "Add bookmark"}
            >
              {isLoading ? (
                <Spinner size="sm" />
              ) : isSaved ? (
                <BookmarkCheck className="h-4 w-4 text-primary" />
              ) : (
                <Bookmark className="h-4 w-4" />
              )}
            </Button>
            {onCreateApplication && (
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.preventDefault();
                  if (!hasApplication) {
                    onCreateApplication(grant.id);
                  }
                }}
                disabled={isCreatingApplication || hasApplication}
                className="h-8 px-3"
                aria-label={
                  hasApplication ? "Application exists" : "Create application"
                }
              >
                {isCreatingApplication ? (
                  <Spinner size="sm" />
                ) : hasApplication ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-1" />
                    Added
                  </>
                ) : (
                  <>
                    <FileText className="h-4 w-4 mr-1" />
                    Apply
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {grant.description && (
            <div
              className="text-sm text-gray-700 line-clamp-3"
              dangerouslySetInnerHTML={{ __html: grant.description }}
            />
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="font-medium">Total Funding:</span>
              <p>{formatCurrency(grant.total_funding_amount)}</p>
            </div>
            <div>
              <span className="font-medium">Award Range:</span>
              <p>
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
              <span className="font-medium">Deadline:</span>
              <p>{formatDate(grant.close_date)}</p>
            </div>
          </div>

          {grant.category && (
            <div className="text-sm">
              <span className="font-medium">Category:</span> {grant.category}
            </div>
          )}

          {grant.url && (
            <div>
              <Button asChild variant="outline" size="sm">
                <a
                  href={grant.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
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
}
