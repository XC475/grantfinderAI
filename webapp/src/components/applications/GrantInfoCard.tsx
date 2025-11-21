"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { DatePicker } from "@/components/ui/date-picker";
import { format } from "date-fns";
import {
  ExternalLink,
  Calendar,
  DollarSign,
  Building,
  Paperclip,
  Edit2,
  Save,
  X,
  Plus,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { StatusSelect } from "./StatusSelect";
import { toast } from "sonner";

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
  isEditable?: boolean;
  onUpdate?: () => void;
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
  isEditable = false,
  onUpdate,
}: GrantInfoCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    opportunityTitle: grant.title,
    opportunityDescription: grant.description || "",
    opportunityAgency: grant.agency || "",
    opportunityTotalFunding: grant.total_funding_amount?.toString() || "",
    opportunityAwardMin: grant.award_min?.toString() || "",
    opportunityAwardMax: grant.award_max?.toString() || "",
    opportunityUrl: grant.url || "",
  });
  const [opportunityCloseDate, setOpportunityCloseDate] = useState<
    Date | undefined
  >(grant.close_date ? new Date(grant.close_date) : undefined);
  const [attachments, setAttachments] = useState<
    Array<{ url: string; title?: string; description?: string }>
  >(
    grant.attachments && Array.isArray(grant.attachments)
      ? grant.attachments.map((att) => ({
          url: att.url || "",
          title: att.title || att.name || "",
          description: "",
        }))
      : []
  );

  const addAttachment = () => {
    setAttachments([...attachments, { url: "", title: "", description: "" }]);
  };

  const removeAttachment = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  const updateAttachment = (
    index: number,
    field: "url" | "title" | "description",
    value: string
  ) => {
    const updated = [...attachments];
    updated[index] = { ...updated[index], [field]: value };
    setAttachments(updated);
  };

  const handleSave = async () => {
    if (!application) return;

    try {
      setSaving(true);
      // Filter out empty attachments
      const validAttachments = attachments.filter(
        (att) => att.url && att.url.trim()
      );

      const res = await fetch(`/api/applications/${application.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          opportunityTitle: formData.opportunityTitle,
          opportunityDescription: formData.opportunityDescription || null,
          opportunityAgency: formData.opportunityAgency || null,
          opportunityCloseDate: opportunityCloseDate
            ? format(opportunityCloseDate, "yyyy-MM-dd")
            : null,
          opportunityTotalFunding: formData.opportunityTotalFunding
            ? Number(formData.opportunityTotalFunding)
            : null,
          opportunityAwardMin: formData.opportunityAwardMin
            ? Number(formData.opportunityAwardMin)
            : null,
          opportunityAwardMax: formData.opportunityAwardMax
            ? Number(formData.opportunityAwardMax)
            : null,
          opportunityUrl: formData.opportunityUrl || null,
          opportunityAttachments:
            validAttachments.length > 0 ? validAttachments : null,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to update opportunity details");
      }

      toast.success("Opportunity details updated successfully");
      setIsEditing(false);
      if (onUpdate) {
        onUpdate();
      }
    } catch (error) {
      console.error("Error updating opportunity details:", error);
      toast.error("Failed to update opportunity details");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      opportunityTitle: grant.title,
      opportunityDescription: grant.description || "",
      opportunityAgency: grant.agency || "",
      opportunityTotalFunding: grant.total_funding_amount?.toString() || "",
      opportunityAwardMin: grant.award_min?.toString() || "",
      opportunityAwardMax: grant.award_max?.toString() || "",
      opportunityUrl: grant.url || "",
    });
    setOpportunityCloseDate(
      grant.close_date ? new Date(grant.close_date) : undefined
    );
    setAttachments(
      grant.attachments && Array.isArray(grant.attachments)
        ? grant.attachments.map((att) => ({
            url: att.url || "",
            title: att.title || att.name || "",
            description: "",
          }))
        : []
    );
    setIsEditing(false);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1 min-w-0">
            {isEditing ? (
              <div className="space-y-4">
                <div className="max-w-2xl">
                  <Label htmlFor="opportunityTitle">Opportunity Title</Label>
                  <Input
                    id="opportunityTitle"
                    value={formData.opportunityTitle}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        opportunityTitle: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
            ) : (
              <>
                <CardTitle className="text-xl mb-2">{grant.title}</CardTitle>
              </>
            )}
            {!isEditing && (
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
            )}
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
          <div className="flex gap-2 shrink-0">
            {isEditable && !isEditing && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(true)}
              >
                <Edit2 className="h-4 w-4 mr-1" />
                Edit Details
              </Button>
            )}
            {isEditing && (
              <>
                <Button
                  variant="default"
                  size="sm"
                  onClick={handleSave}
                  disabled={saving}
                >
                  <Save className="h-4 w-4 mr-1" />
                  {saving ? "Saving..." : "Save"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCancel}
                  disabled={saving}
                >
                  <X className="h-4 w-4 mr-1" />
                  Cancel
                </Button>
              </>
            )}
            {grant.status !== "Not specified" && grant.id > 0 && !isEditing && (
              <Button asChild variant="outline" size="sm">
                <Link href={`/private/${organizationSlug}/grants/${grant.id}`}>
                  <ExternalLink className="h-4 w-4 mr-1" />
                  View Grant
                </Link>
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isEditing ? (
          <div className="space-y-4">
            {/* Agency */}
            <div>
              <Label htmlFor="opportunityAgency">Agency/Organization</Label>
              <Input
                id="opportunityAgency"
                value={formData.opportunityAgency}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    opportunityAgency: e.target.value,
                  })
                }
              />
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="opportunityDescription">Description</Label>
              <Textarea
                id="opportunityDescription"
                value={formData.opportunityDescription}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    opportunityDescription: e.target.value,
                  })
                }
                rows={4}
              />
            </div>

            {/* Close Date */}
            <div>
              <Label htmlFor="opportunityCloseDate">Deadline</Label>
              <DatePicker
                date={opportunityCloseDate}
                onDateChange={setOpportunityCloseDate}
                placeholder="Select deadline"
              />
            </div>

            {/* Funding amounts */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="opportunityTotalFunding">Total Funding</Label>
                <Input
                  id="opportunityTotalFunding"
                  type="number"
                  value={formData.opportunityTotalFunding}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      opportunityTotalFunding: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <Label htmlFor="opportunityAwardMin">Award Min</Label>
                <Input
                  id="opportunityAwardMin"
                  type="number"
                  value={formData.opportunityAwardMin}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      opportunityAwardMin: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <Label htmlFor="opportunityAwardMax">Award Max</Label>
                <Input
                  id="opportunityAwardMax"
                  type="number"
                  value={formData.opportunityAwardMax}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      opportunityAwardMax: e.target.value,
                    })
                  }
                />
              </div>
            </div>

            {/* URL */}
            <div>
              <Label htmlFor="opportunityUrl">Grant URL</Label>
              <Input
                id="opportunityUrl"
                type="url"
                value={formData.opportunityUrl}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    opportunityUrl: e.target.value,
                  })
                }
              />
            </div>

            {/* Attachments */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Opportunity Attachments (URLs)</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addAttachment}
                  className="h-8"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Add Attachment
                </Button>
              </div>
              {attachments.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No attachments added yet
                </p>
              ) : (
                <div className="space-y-3">
                  {attachments.map((attachment, index) => (
                    <div
                      key={index}
                      className="p-3 border rounded-md space-y-2 bg-muted/50"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 space-y-2">
                          <Input
                            placeholder="Attachment URL *"
                            type="url"
                            value={attachment.url}
                            onChange={(e) =>
                              updateAttachment(index, "url", e.target.value)
                            }
                            className="bg-background"
                          />
                          <Input
                            placeholder="Title (optional)"
                            value={attachment.title || ""}
                            onChange={(e) =>
                              updateAttachment(index, "title", e.target.value)
                            }
                            className="bg-background"
                          />
                          <Input
                            placeholder="Description (optional)"
                            value={attachment.description || ""}
                            onChange={(e) =>
                              updateAttachment(
                                index,
                                "description",
                                e.target.value
                              )
                            }
                            className="bg-background"
                          />
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeAttachment(index)}
                          className="shrink-0"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
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
        )}
      </CardContent>
    </Card>
  );
}
