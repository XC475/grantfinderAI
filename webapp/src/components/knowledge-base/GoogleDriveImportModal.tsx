"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { GoogleDriveImportPicker } from "@/components/google-drive/ImportPicker";
import { getAllFileCategories, getFileCategoryLabel } from "@/lib/fileCategories";

interface GoogleDriveImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  organizationSlug: string;
  organizationId: string;
}

export function GoogleDriveImportModal({
  isOpen,
  onClose,
  organizationSlug,
  organizationId,
}: GoogleDriveImportModalProps) {
  const [fileCategory, setFileCategory] = useState<string>("GENERAL");

  const handleImported = async (documentId?: string) => {
    if (documentId) {
      // Update the document to set KB fields
      try {
        const response = await fetch(`/api/documents/${documentId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            isKnowledgeBase: true,
            fileCategory,
          }),
        });

        if (!response.ok) throw new Error("Failed to update document");

        toast.success("File imported to knowledge base");
        onClose();
        window.location.reload();
      } catch (error) {
        toast.error("Failed to add file to knowledge base");
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Import from Google Drive</DialogTitle>
          <DialogDescription>
            Import a file from Google Drive to your knowledge base
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
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

          <div className="flex justify-center py-4">
            <GoogleDriveImportPicker
              mode="import"
              onImported={handleImported}
              asButton
            >
              {({ onClick, loading }) => (
                <Button onClick={onClick} disabled={loading}>
                  {loading ? "Loading..." : "Select from Google Drive"}
                </Button>
              )}
            </GoogleDriveImportPicker>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

