"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import {
  getAllFileCategories,
  getFileCategoryLabel,
} from "@/lib/fileCategories";

interface DocumentSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  organizationSlug: string;
}

export function DocumentSelectorModal({
  isOpen,
  onClose,
  organizationSlug,
}: DocumentSelectorModalProps) {
  const [documents, setDocuments] = useState<any[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [fileCategory, setFileCategory] = useState<string>("GENERAL");
  const [successNotes, setSuccessNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchDocuments();
    }
  }, [isOpen]);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/documents`);
      const data = await response.json();
      // Filter out documents already in KB
      const nonKBDocs = (data.data || data.documents || []).filter(
        (doc: any) => !doc.isKnowledgeBase
      );
      setDocuments(nonKBDocs);
    } catch (error) {
      toast.error("Failed to load documents");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (selectedIds.length === 0) {
      toast.error("Please select at least one document");
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch("/api/documents/bulk-update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentIds: selectedIds,
          updates: {
            isKnowledgeBase: true,
            fileCategory,
            metadata: {
              successNotes: successNotes || undefined,
            },
          },
        }),
      });

      if (!response.ok) throw new Error("Failed to add documents");

      toast.success(
        `Added ${selectedIds.length} document(s) to knowledge base`
      );
      onClose();
      window.location.reload(); // Refresh to show new KB docs
    } catch (error) {
      toast.error("Failed to add documents to knowledge base");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Documents to Knowledge Base</DialogTitle>
          <DialogDescription>
            Select existing documents to add to your knowledge base
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Document Type Selector */}
          <div className="space-y-2">
            <Label>Document Type</Label>
            <Select value={fileCategory} onValueChange={setFileCategory}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {getAllFileCategories().map((type) => (
                  <SelectItem key={type} value={type}>
                    {getFileCategoryLabel(type)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Document List */}
          <div className="space-y-3">
            <Label>Select Documents ({selectedIds.length} selected)</Label>
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : documents.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No documents available to add
              </div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto border rounded-lg p-3">
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-start space-x-3 p-2 hover:bg-accent/50 rounded"
                  >
                    <Checkbox
                      checked={selectedIds.includes(doc.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedIds([...selectedIds, doc.id]);
                        } else {
                          setSelectedIds(
                            selectedIds.filter((id) => id !== doc.id)
                          );
                        }
                      }}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="font-medium">{doc.title}</div>
                      <div className="text-xs text-muted-foreground">
                        {doc.fileType || "Tiptap Document"} • Created{" "}
                        {new Date(doc.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Success Notes */}
          {selectedIds.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="success-notes">Notes (Optional)</Label>
              <Textarea
                id="success-notes"
                placeholder="Add notes about these documents..."
                value={successNotes}
                onChange={(e) => setSuccessNotes(e.target.value)}
                rows={3}
                className="resize-none"
              />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={selectedIds.length === 0 || submitting}
          >
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Adding...
              </>
            ) : (
              `Add ${selectedIds.length} Document${selectedIds.length !== 1 ? "s" : ""}`
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

