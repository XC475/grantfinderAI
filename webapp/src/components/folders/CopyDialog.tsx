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
import { FolderIcon } from "./FolderIcon";
import { FolderOpen } from "lucide-react";
import { MoveModal } from "./MoveModal";

interface Folder {
  id: string;
  name: string;
  applicationId: string | null;
}

interface CopyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  itemType: "document" | "folder";
  originalName: string;
  currentFolderId: string | null;
  allFolders?: Folder[];
  onCopy: (newName: string, targetFolderId: string | null) => Promise<void>;
}

export function CopyDialog({
  open,
  onOpenChange,
  itemType,
  originalName,
  currentFolderId,
  allFolders = [],
  onCopy,
}: CopyDialogProps) {
  const [newName, setNewName] = useState(`Copy of ${originalName}`);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(
    currentFolderId
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showMoveModal, setShowMoveModal] = useState(false);

  // Update name when dialog opens with different item
  useEffect(() => {
    if (open) {
      setNewName(`Copy of ${originalName}`);
      setSelectedFolderId(currentFolderId);
      setError(null);
    }
  }, [originalName, currentFolderId, open]);

  const handleCopy = async () => {
    if (!newName.trim()) {
      setError("Name cannot be empty");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await onCopy(newName.trim(), selectedFolderId);
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to copy");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!isLoading && !showMoveModal) {
      if (!newOpen) {
        // Reset state when closing
        setNewName(`Copy of ${originalName}`);
        setSelectedFolderId(currentFolderId);
        setError(null);
      }
      onOpenChange(newOpen);
    }
  };

  const handleSelectFolder = async (folderId: string | null) => {
    setSelectedFolderId(folderId);
  };

  // Get the name of the selected folder
  const getSelectedFolderName = () => {
    if (selectedFolderId === null) {
      return "Root";
    }
    const folder = allFolders.find((f) => f.id === selectedFolderId);
    return folder?.name || "Unknown folder";
  };

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Copy {itemType}</DialogTitle>
            <DialogDescription>
              Set a name and destination for the {itemType} copy.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleCopy();
                  }
                }}
                disabled={isLoading}
                autoFocus
              />
            </div>

            <div className="grid gap-2">
              <Label>Destination folder</Label>
              <div className="flex items-center gap-2">
                <div className="flex-1 flex items-center gap-2 px-3 py-2 border rounded-md bg-muted/50">
                  {selectedFolderId === null ? (
                    <FolderOpen className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  ) : (
                    <FolderIcon
                      isApplicationFolder={
                        !!allFolders.find((f) => f.id === selectedFolderId)
                          ?.applicationId
                      }
                    />
                  )}
                  <span className="text-sm truncate">
                    {getSelectedFolderName()}
                  </span>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowMoveModal(true)}
                  disabled={isLoading}
                >
                  Select folder
                </Button>
              </div>
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button onClick={handleCopy} disabled={isLoading}>
              {isLoading ? "Copying..." : "Copy"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Folder selection modal */}
      <MoveModal
        open={showMoveModal}
        onOpenChange={setShowMoveModal}
        itemType={itemType}
        itemName={newName}
        currentFolderId={selectedFolderId}
        onMove={handleSelectFolder}
      />
    </>
  );
}

