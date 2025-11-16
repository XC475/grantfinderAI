"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ExternalLink,
  Calendar,
  DollarSign,
  Building,
  Paperclip,
} from "lucide-react";
import Link from "next/link";
import { StatusSelect } from "./StatusSelect";

interface GrantInfoCardProps {
  grant: {
    id: number;
    title: string;
    description?: string;
    status: string;
    close_date?: string;
    total_funding_amount?: number;
    award_min?: number;
    award_max?: number;
    agency?: string;
    url?: string;
    attachments?: Array<{ url?: string; title?: string; name?: string }>;
  };
  application?: {
    id: string;
    status: string;
  };
  organizationSlug: string;
  onStatusUpdate?: (newStatus: string) => void;
}

function formatCurrency(amount: number | null | undefined) {
  if (!amount) return "Not specified";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  }).format(amount);
}

function formatDate(dateString: string | null | undefined) {
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
      return "bg-green-100 text-green-800";
    case "forecasted":
      return "bg-blue-100 text-blue-800";
    case "closed":
      return "bg-gray-100 text-gray-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

export function GrantInfoCard({
  grant,
  application,
  organizationSlug,
  onStatusUpdate,
}: GrantInfoCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-xl mb-2">{grant.title}</CardTitle>
            <div className="flex items-center gap-2 mb-2">
              <Badge className={getStatusColor(grant.status)}>
                {grant.status}
              </Badge>
              {grant.agency && (
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Building className="h-4 w-4" />
                  {grant.agency}
                </div>
              )}
            </div>
            {application && (
              <div className="mt-4 pt-4 border-t">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-muted-foreground">
                    Application Status:
                  </span>
                  <StatusSelect
                    currentStatus={application.status}
                    applicationId={application.id}
                    onStatusChange={(_, newStatus) => {
                      if (onStatusUpdate) {
                        onStatusUpdate(newStatus);
                      }
                    }}
                  />
                </div>
              </div>
            )}
          </div>
          {grant.status !== "Not specified" && (
            <Button asChild variant="outline" size="sm">
              <Link href={`/private/${organizationSlug}/grants/${grant.id}`}>
                <ExternalLink className="h-4 w-4 mr-1" />
                View Grant
              </Link>
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {grant.description && (
            <div
              className="text-sm text-gray-700 line-clamp-3"
              dangerouslySetInnerHTML={{ __html: grant.description }}
            />
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <div>
                <div className="font-medium">Total Funding</div>
                <div>{formatCurrency(grant.total_funding_amount)}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <div>
                <div className="font-medium">Award Range</div>
                <div>
                  {grant.award_min && grant.award_max
                    ? `${formatCurrency(grant.award_min)} - ${formatCurrency(grant.award_max)}`
                    : grant.award_max
                      ? `Up to ${formatCurrency(grant.award_max)}`
                      : grant.award_min
                        ? `From ${formatCurrency(grant.award_min)}`
                        : "Not specified"}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <div className="font-medium">Deadline</div>
                <div>{formatDate(grant.close_date)}</div>
              </div>
            </div>
          </div>

          {grant.attachments &&
            Array.isArray(grant.attachments) &&
            grant.attachments.length > 0 && (
              <div className="pt-2 border-t">
                <div className="flex items-center gap-2 mb-3 mt-2">
                  <Paperclip className="h-4 w-4 text-muted-foreground" />
                  <div className="font-medium text-sm">Attachments</div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {grant.attachments.map(
                    (
                      attachment: {
                        url?: string;
                        title?: string;
                        name?: string;
                      },
                      index: number
                    ) => {
                      // Priority: title > filename from URL > full URL
                      const getAttachmentName = () => {
                        if (attachment.title) return attachment.title;
                        if (!attachment.url) return "Untitled Attachment";
                        try {
                          const url = new URL(attachment.url);
                          const pathname = url.pathname;
                          const filename = pathname.split("/").pop();
                          return filename || attachment.url;
                        } catch {
                          return attachment.url;
                        }
                      };

                      return attachment.url ? (
                        <a
                          key={index}
                          href={attachment.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-3 py-1.5 bg-muted/50 rounded-md hover:bg-muted transition-colors cursor-pointer"
                        >
                          <span className="text-sm">
                            {getAttachmentName()}
                          </span>
                          <ExternalLink className="h-3 w-3 text-muted-foreground" />
                        </a>
                      ) : (
                        <div
                          key={index}
                          className="inline-flex items-center gap-2 px-3 py-1.5 bg-muted/50 rounded-md"
                        >
                          <span className="text-sm">
                            {getAttachmentName()}
                          </span>
                        </div>
                      );
                    }
                  )}
                </div>
              </div>
            )}
        </div>
      </CardContent>
    </Card>
  );
}
