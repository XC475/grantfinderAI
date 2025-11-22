"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle } from "lucide-react";

interface RenameDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  itemType: "document" | "folder" | "application";
  currentName: string;
  onRename: (newName: string) => Promise<void>;
  warningMessage?: string; // Optional warning to display
}

export function RenameDialog({
  open,
  onOpenChange,
  itemType,
  currentName,
  onRename,
  warningMessage,
}: RenameDialogProps) {
  const [newName, setNewName] = useState(currentName);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Update newName when currentName changes (when dialog opens with different item)
  useEffect(() => {
    if (open) {
      setNewName(currentName);
      setError(null);
    }
  }, [currentName, open]);

  const handleRename = async () => {
    if (!newName.trim()) {
      setError("Name cannot be empty");
      return;
    }

    if (newName === currentName) {
      onOpenChange(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await onRename(newName.trim());
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to rename");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!isLoading) {
      if (!newOpen) {
        // Reset state when closing
        setNewName(currentName);
        setError(null);
      }
      onOpenChange(newOpen);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Rename {itemType}</DialogTitle>
          <DialogDescription>
            Enter a new name for this {itemType}.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {warningMessage && (
            <div className="flex gap-2 rounded-lg border border-amber-500/50 bg-amber-500/10 p-3 text-sm">
              <AlertCircle className="h-5 w-5 shrink-0 text-amber-500" />
              <p className="text-amber-900 dark:text-amber-100">
                {warningMessage}
              </p>
            </div>
          )}
          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleRename();
                }
              }}
              disabled={isLoading}
              autoFocus
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button onClick={handleRename} disabled={isLoading}>
            {isLoading ? "Renaming..." : "Rename"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

