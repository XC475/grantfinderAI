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
import { Card, CardContent } from "@/components/ui/card";
import { Bookmark, Search, FileText } from "lucide-react";
import { BookmarkSelectionDialog } from "./BookmarkSelectionDialog";
import { OutsideOpportunityForm } from "./OutsideOpportunityForm";

interface AddApplicationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  organizationSlug: string;
  onSuccess?: () => void;
}

type DialogState = "main" | "bookmarks" | "outside";

export function AddApplicationModal({
  open,
  onOpenChange,
  organizationSlug,
  onSuccess,
}: AddApplicationModalProps) {
  const router = useRouter();
  const [dialogState, setDialogState] = useState<DialogState>("main");

  const handleClose = () => {
    setDialogState("main");
    onOpenChange(false);
  };

  const handleSuccess = () => {
    setDialogState("main");
    onSuccess?.();
  };

  const handleSearchClick = () => {
    // Close the modal and navigate to grants page
    handleClose();
    router.push(`/private/${organizationSlug}/grants`);
  };

  return (
    <>
      {/* Main selection modal */}
      <Dialog
        open={open && dialogState === "main"}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            handleClose();
          }
        }}
      >
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Create New Application</DialogTitle>
            <DialogDescription>
              Choose how you'd like to create your application
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {/* From Bookmarks */}
            <Card
              className="cursor-pointer hover:bg-accent hover:border-primary transition-colors"
              onClick={() => setDialogState("bookmarks")}
            >
              <CardContent className="flex items-start gap-4 p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                  <Bookmark className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-1">From Bookmarks</h3>
                  <p className="text-sm text-muted-foreground">
                    Create an application from one of your saved grants
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* From Grant Search */}
            <Card
              className="cursor-pointer hover:bg-accent hover:border-primary transition-colors"
              onClick={handleSearchClick}
            >
              <CardContent className="flex items-start gap-4 p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100 text-green-600">
                  <Search className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-1">
                    Search for Grant
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Browse and search our grants database
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Outside Opportunity */}
            <Card
              className="cursor-pointer hover:bg-accent hover:border-primary transition-colors"
              onClick={() => setDialogState("outside")}
            >
              <CardContent className="flex items-start gap-4 p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100 text-purple-600">
                  <FileText className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-1">
                    Outside Opportunity
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Manually enter details for a grant not in our database
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </DialogContent>
      </Dialog>

      {/* Sub-dialogs */}
      <BookmarkSelectionDialog
        open={open && dialogState === "bookmarks"}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            setDialogState("main");
          }
        }}
        organizationSlug={organizationSlug}
        onSuccess={handleSuccess}
        onBack={() => setDialogState("main")}
      />

      <OutsideOpportunityForm
        open={open && dialogState === "outside"}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            setDialogState("main");
          }
        }}
        organizationSlug={organizationSlug}
        onSuccess={handleSuccess}
        onBack={() => setDialogState("main")}
      />
    </>
  );
}

