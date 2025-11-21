"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

interface ExistingApplication {
  id: string;
  title: string | null;
  status: string;
  createdAt: string;
}

interface DuplicateApplicationWarningProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  existingApplication: ExistingApplication | null;
  grantTitle?: string;
  onViewExisting: () => void;
  onCancel: () => void;
}

export function DuplicateApplicationWarning({
  open,
  onOpenChange,
  existingApplication,
  grantTitle,
  onViewExisting,
  onCancel,
}: DuplicateApplicationWarningProps) {
  if (!existingApplication) return null;

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100">
              <AlertCircle className="h-5 w-5 text-amber-600" />
            </div>
            <DialogTitle>Application Already Exists</DialogTitle>
          </div>
          <DialogDescription>
            An application for this grant already exists in your organization.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="bg-muted p-4 rounded-lg space-y-2">
            <div>
              <span className="font-semibold">Application: </span>
              {existingApplication.title || grantTitle || "Untitled"}
            </div>
            <div>
              <span className="font-semibold">Status: </span>
              <span className="capitalize">
                {existingApplication.status.replace("_", " ").toLowerCase()}
              </span>
            </div>
            <div>
              <span className="font-semibold">Created: </span>
              {formatDate(existingApplication.createdAt)}
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Would you like to view the existing application instead?
          </p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={onViewExisting}>
            View Existing Application
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

