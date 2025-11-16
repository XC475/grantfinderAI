"use client";

import { useState, useEffect, useMemo } from "react";
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
import { Home } from "lucide-react";
import { cn } from "@/lib/utils";

interface Folder {
  id: string;
  name: string;
  parentFolderId: string | null;
  applicationId: string | null;
}

interface MoveModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  itemType: "document" | "folder";
  itemName: string;
  currentFolderId: string | null;
  onMove: (targetFolderId: string | null) => Promise<void>;
}

export function MoveModal({
  open,
  onOpenChange,
  itemType,
  itemName,
  currentFolderId,
  onMove,
}: MoveModalProps) {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(
    currentFolderId
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch all folders when modal opens
  useEffect(() => {
    if (open) {
      setIsFetching(true);
      fetch("/api/folders?all=true")
        .then((res) => res.json())
        .then((data) => {
          setFolders(data.folders || []);
          setIsFetching(false);
        })
        .catch((err) => {
          console.error("Failed to fetch folders:", err);
          setError("Failed to load folders");
          setIsFetching(false);
        });
    }
  }, [open]);

  // Build folder hierarchy for display
  const folderPaths = useMemo(() => {
    const pathMap = new Map<string, string>();

    const buildPath = (folderId: string): string => {
      if (pathMap.has(folderId)) {
        return pathMap.get(folderId)!;
      }

      const folder = folders.find((f) => f.id === folderId);
      if (!folder) return "";

      if (!folder.parentFolderId) {
        pathMap.set(folderId, folder.name);
        return folder.name;
      }

      const parentPath = buildPath(folder.parentFolderId);
      const fullPath = parentPath ? `${parentPath} / ${folder.name}` : folder.name;
      pathMap.set(folderId, fullPath);
      return fullPath;
    };

    folders.forEach((folder) => buildPath(folder.id));
    return pathMap;
  }, [folders]);

  // Filter folders based on search query
  const filteredFolders = useMemo(() => {
    if (!searchQuery.trim()) return folders;

    const query = searchQuery.toLowerCase();
    return folders.filter((folder) => {
      const path = folderPaths.get(folder.id) || "";
      return (
        folder.name.toLowerCase().includes(query) ||
        path.toLowerCase().includes(query)
      );
    });
  }, [folders, searchQuery, folderPaths]);

  const handleMove = async () => {
    if (selectedFolderId === currentFolderId) {
      onOpenChange(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await onMove(selectedFolderId);
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to move");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!isLoading) {
      if (!newOpen) {
        // Reset state when closing
        setSearchQuery("");
        setSelectedFolderId(currentFolderId);
        setError(null);
      }
      onOpenChange(newOpen);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Move {itemType}</DialogTitle>
          <DialogDescription>
            Select a destination folder for &quot;{itemName}&quot;
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="search">Search folders</Label>
            <Input
              id="search"
              placeholder="Type to search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              disabled={isLoading || isFetching}
            />
          </div>

          <div className="border rounded-md max-h-[300px] overflow-y-auto">
            {isFetching ? (
              <div className="p-4 text-center text-sm text-muted-foreground">
                Loading folders...
              </div>
            ) : (
              <>
                {/* Root option */}
                <button
                  type="button"
                  className={cn(
                    "w-full flex items-center gap-2 px-4 py-2 text-left hover:bg-accent transition-colors",
                    selectedFolderId === null && "bg-accent"
                  )}
                  onClick={() => setSelectedFolderId(null)}
                  disabled={isLoading}
                >
                  <Home className="h-4 w-4 flex-shrink-0" />
                  <span className="font-medium">Root</span>
                  {currentFolderId === null && (
                    <span className="ml-auto text-xs text-muted-foreground">
                      (current)
                    </span>
                  )}
                </button>

                {/* Folder list */}
                {filteredFolders.length === 0 ? (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    {searchQuery ? "No folders found" : "No folders available"}
                  </div>
                ) : (
                  filteredFolders.map((folder) => {
                    const depth = (folderPaths.get(folder.id) || "").split(" / ").length - 1;
                    const isSelected = selectedFolderId === folder.id;
                    const isCurrent = currentFolderId === folder.id;

                    return (
                      <button
                        key={folder.id}
                        type="button"
                        className={cn(
                          "w-full flex items-center gap-2 px-4 py-2 text-left hover:bg-accent transition-colors",
                          isSelected && "bg-accent"
                        )}
                        style={{ paddingLeft: `${1 + depth * 1.5}rem` }}
                        onClick={() => setSelectedFolderId(folder.id)}
                        disabled={isLoading}
                      >
                        <FolderIcon
                          isApplicationFolder={!!folder.applicationId}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate">
                            {folder.name}
                          </div>
                          {searchQuery && (
                            <div className="text-xs text-muted-foreground truncate">
                              {folderPaths.get(folder.id)}
                            </div>
                          )}
                        </div>
                        {isCurrent && (
                          <span className="ml-2 text-xs text-muted-foreground flex-shrink-0">
                            (current)
                          </span>
                        )}
                      </button>
                    );
                  })
                )}
              </>
            )}
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
          <Button onClick={handleMove} disabled={isLoading || isFetching}>
            {isLoading ? "Moving..." : "Move"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

