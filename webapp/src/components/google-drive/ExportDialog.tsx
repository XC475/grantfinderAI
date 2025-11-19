"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Share2 } from "lucide-react";

type ExportFormat = "google-doc" | "docx";

interface ExportToGoogleDriveDialogProps {
  documentId: string;
}

const formatOptions: { value: ExportFormat; label: string }[] = [
  { value: "google-doc", label: "Google Docs" },
  { value: "docx", label: "Word Document (DOCX)" },
];

export function ExportToGoogleDriveDialog({
  documentId,
}: ExportToGoogleDriveDialogProps) {
  const [open, setOpen] = useState(false);
  const [format, setFormat] = useState<ExportFormat>("google-doc");
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    try {
      const response = await fetch("/api/google-drive/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentId, format }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => null);
        throw new Error(error?.error || "Failed to export document");
      }

      const data = await response.json();
      toast.success("Document exported to Google Drive");
      if (data.webViewLink) {
        window.open(data.webViewLink, "_blank", "noopener,noreferrer");
      }
    } catch (error) {
      console.error("Export failed:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to export document"
      );
    } finally {
      setExporting(false);
      setOpen(false);
    }
  };

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setOpen(true)}
        className="flex items-center gap-2"
      >
        <Share2 className="h-4 w-4" />
        Export to Drive
      </Button>

      <Dialog
        open={open}
        onOpenChange={(value) => !exporting && setOpen(value)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Export to Google Drive</DialogTitle>
            <DialogDescription>
              Choose the format to export this document in. A copy will be saved
              to your Google Drive.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Format</label>
              <Select
                value={format}
                onValueChange={(value: ExportFormat) => setFormat(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent>
                  {formatOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={handleExport}
              disabled={exporting}
              className="w-full"
            >
              {exporting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Export
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
