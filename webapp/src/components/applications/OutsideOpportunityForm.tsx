"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DatePicker } from "@/components/ui/date-picker";
import { ChevronLeft, Loader2, Plus, X } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

interface OutsideOpportunityFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  organizationSlug: string;
  onSuccess: () => void;
  onBack: () => void;
}

export function OutsideOpportunityForm({
  open,
  onOpenChange,
  organizationSlug,
  onSuccess,
  onBack,
}: OutsideOpportunityFormProps) {
  const router = useRouter();
  const [creating, setCreating] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    opportunityTitle: "",
    opportunityAgency: "",
    opportunityDescription: "",
    opportunityEligibility: "",
    opportunityTotalFunding: "",
    opportunityAwardMin: "",
    opportunityAwardMax: "",
    opportunityUrl: "",
  });
  const [opportunityCloseDate, setOpportunityCloseDate] = useState<
    Date | undefined
  >(undefined);
  const [attachments, setAttachments] = useState<
    Array<{ url: string; title?: string; description?: string }>
  >([]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.opportunityTitle.trim()) {
      toast.error("Opportunity title is required");
      return;
    }

    try {
      setCreating(true);

      // Filter out empty attachments
      const validAttachments = attachments.filter(
        (att) => att.url && att.url.trim()
      );

      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          opportunityId: null, // Outside opportunity
          organizationSlug,
          title: formData.title || formData.opportunityTitle,
          opportunityTitle: formData.opportunityTitle,
          opportunityAgency: formData.opportunityAgency || null,
          opportunityDescription: formData.opportunityDescription || null,
          opportunityEligibility: formData.opportunityEligibility || null,
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
          alsoBookmark: false,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create application");
      }

      toast.success("Application created successfully!");
      router.push(
        `/private/${organizationSlug}/applications/${data.application.id}`
      );
      onSuccess();

      // Reset form
      setFormData({
        title: "",
        opportunityTitle: "",
        opportunityAgency: "",
        opportunityDescription: "",
        opportunityEligibility: "",
        opportunityTotalFunding: "",
        opportunityAwardMin: "",
        opportunityAwardMax: "",
        opportunityUrl: "",
      });
      setOpportunityCloseDate(undefined);
      setAttachments([]);
    } catch (error) {
      console.error("Error creating application:", error);
      toast.error("Failed to create application");
    } finally {
      setCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] flex flex-col">
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
              <DialogTitle>Outside Opportunity</DialogTitle>
              <DialogDescription>
                Enter details for a grant not in our database
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto pr-2">
          <div className="space-y-4">
            {/* Application Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Application Title (Optional)</Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g., My Application for XYZ Grant"
              />
              <p className="text-xs text-muted-foreground">
                Leave blank to use opportunity title
              </p>
            </div>

            {/* Opportunity Title */}
            <div className="space-y-2">
              <Label htmlFor="opportunityTitle">
                Opportunity Title <span className="text-red-500">*</span>
              </Label>
              <Input
                id="opportunityTitle"
                name="opportunityTitle"
                value={formData.opportunityTitle}
                onChange={handleChange}
                placeholder="Enter the grant/opportunity name"
                required
              />
            </div>

            {/* Agency */}
            <div className="space-y-2">
              <Label htmlFor="opportunityAgency">Agency/Organization</Label>
              <Input
                id="opportunityAgency"
                name="opportunityAgency"
                value={formData.opportunityAgency}
                onChange={handleChange}
                placeholder="e.g., Department of Education"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="opportunityDescription">Description</Label>
              <Textarea
                id="opportunityDescription"
                name="opportunityDescription"
                value={formData.opportunityDescription}
                onChange={handleChange}
                placeholder="Brief description of the opportunity"
                rows={3}
              />
            </div>

            {/* Eligibility */}
            <div className="space-y-2">
              <Label htmlFor="opportunityEligibility">
                Eligibility Requirements
              </Label>
              <Textarea
                id="opportunityEligibility"
                name="opportunityEligibility"
                value={formData.opportunityEligibility}
                onChange={handleChange}
                placeholder="Who is eligible to apply?"
                rows={2}
              />
            </div>

            {/* Close Date */}
            <div className="space-y-2">
              <Label htmlFor="opportunityCloseDate">Application Deadline</Label>
              <DatePicker
                date={opportunityCloseDate}
                onDateChange={setOpportunityCloseDate}
                placeholder="Select deadline"
              />
            </div>

            {/* Funding amounts */}
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="opportunityTotalFunding">Total Funding</Label>
                <Input
                  id="opportunityTotalFunding"
                  name="opportunityTotalFunding"
                  type="number"
                  value={formData.opportunityTotalFunding}
                  onChange={handleChange}
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="opportunityAwardMin">Award Min</Label>
                <Input
                  id="opportunityAwardMin"
                  name="opportunityAwardMin"
                  type="number"
                  value={formData.opportunityAwardMin}
                  onChange={handleChange}
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="opportunityAwardMax">Award Max</Label>
                <Input
                  id="opportunityAwardMax"
                  name="opportunityAwardMax"
                  type="number"
                  value={formData.opportunityAwardMax}
                  onChange={handleChange}
                  placeholder="0"
                />
              </div>
            </div>

            {/* URL */}
            <div className="space-y-2">
              <Label htmlFor="opportunityUrl">Opportunity URL</Label>
              <Input
                id="opportunityUrl"
                name="opportunityUrl"
                type="url"
                value={formData.opportunityUrl}
                onChange={handleChange}
                placeholder="https://example.com/opportunity"
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
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </form>

        <DialogFooter className="pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            disabled={creating}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={creating}>
            {creating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Creating...
              </>
            ) : (
              "Create Application"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
