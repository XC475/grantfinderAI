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
import { Home, ChevronRight, ChevronDown } from "lucide-react";
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
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(
    new Set()
  );

  // Fetch all folders when modal opens
  useEffect(() => {
    if (open) {
      setIsFetching(true);
      fetch("/api/folders?all=true")
        .then((res) => res.json())
        .then((data) => {
          const fetchedFolders = data.folders || [];
          setFolders(fetchedFolders);
          setIsFetching(false);
          
          // Auto-expand folders to show current folder
          if (currentFolderId) {
            const expanded = new Set<string>();
            let currentId: string | null = currentFolderId;
            while (currentId) {
              expanded.add(currentId);
              const folder = fetchedFolders.find((f: Folder) => f.id === currentId);
              currentId = folder?.parentFolderId || null;
            }
            setExpandedFolders(expanded);
          }
        })
        .catch((err) => {
          console.error("Failed to fetch folders:", err);
          setError("Failed to load folders");
          setIsFetching(false);
        });
    }
  }, [open, currentFolderId]);

  // Build folder hierarchy
  const folderChildren = useMemo(() => {
    const childMap = new Map<string | null, Folder[]>();
    folders.forEach((folder) => {
      const parentId = folder.parentFolderId;
      if (!childMap.has(parentId)) {
        childMap.set(parentId, []);
      }
      childMap.get(parentId)!.push(folder);
    });
    return childMap;
  }, [folders]);

  // Build folder paths for search display
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

  // Get folders that match search query and their ancestors
  const matchingFolders = useMemo(() => {
    if (!searchQuery.trim()) {
      return new Set<string>();
    }

    const query = searchQuery.toLowerCase();
    const matchingIds = new Set<string>();
    const ancestorIds = new Set<string>();

    // Find all matching folders
    folders.forEach((folder) => {
      const path = folderPaths.get(folder.id) || "";
      if (
        folder.name.toLowerCase().includes(query) ||
        path.toLowerCase().includes(query)
      ) {
        matchingIds.add(folder.id);
        // Add all ancestors
        let currentId: string | null = folder.parentFolderId;
        while (currentId) {
          ancestorIds.add(currentId);
          const parent = folders.find((f) => f.id === currentId);
          currentId = parent?.parentFolderId || null;
        }
      }
    });

    // Combine matching folders and their ancestors
    const result = new Set<string>();
    matchingIds.forEach((id) => result.add(id));
    ancestorIds.forEach((id) => result.add(id));
    return result;
  }, [folders, searchQuery, folderPaths]);

  // Auto-expand matching folders when searching
  useEffect(() => {
    if (searchQuery.trim() && matchingFolders.size > 0) {
      setExpandedFolders((prev) => {
        const next = new Set(prev);
        matchingFolders.forEach((id) => next.add(id));
        return next;
      });
    }
  }, [searchQuery, matchingFolders]);

  const toggleFolder = (folderId: string) => {
    setExpandedFolders((prev) => {
      const next = new Set(prev);
      if (next.has(folderId)) {
        next.delete(folderId);
      } else {
        next.add(folderId);
      }
      return next;
    });
  };

  // Recursive folder rendering
  const renderFolder = (folder: Folder, depth: number = 0): JSX.Element | null => {
    const isExpanded = expandedFolders.has(folder.id);
    const children = folderChildren.get(folder.id) || [];
    const isSelected = selectedFolderId === folder.id;
    const isCurrent = currentFolderId === folder.id;

    // If searching, only show matching folders and their ancestors/descendants
    if (searchQuery.trim()) {
      const isMatching = matchingFolders.has(folder.id);
      const hasMatchingDescendant = children.some((child) =>
        matchingFolders.has(child.id)
      );

      if (!isMatching && !hasMatchingDescendant) {
        return null;
      }
    }

    return (
      <div key={folder.id}>
        <button
          type="button"
          className={cn(
            "w-full flex items-center gap-2 px-4 py-2 text-left hover:bg-accent transition-colors",
            isSelected && "bg-accent"
          )}
          style={{ paddingLeft: `${1 + depth * 1.5}rem` }}
          onClick={() => setSelectedFolderId(folder.id)}
          disabled={isLoading}
        >
          {children.length > 0 ? (
            <button
              type="button"
              className="flex-shrink-0"
              onClick={(e) => {
                e.stopPropagation();
                toggleFolder(folder.id);
              }}
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>
          ) : (
            <div className="h-4 w-4 flex-shrink-0" />
          )}
          <FolderIcon isApplicationFolder={!!folder.applicationId} />
          <div className="flex-1 min-w-0">
            <div className="font-medium truncate">{folder.name}</div>
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

        {isExpanded && children.length > 0 && (
          <>
            {children.map((child) => renderFolder(child, depth + 1))}
          </>
        )}
      </div>
    );
  };

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
        setExpandedFolders(new Set());
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
                {(() => {
                  const rootFolders = folderChildren.get(null) || [];
                  const renderedFolders = rootFolders
                    .map((folder) => renderFolder(folder, 0))
                    .filter((item) => item !== null);

                  if (renderedFolders.length === 0) {
                    return (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    {searchQuery ? "No folders found" : "No folders available"}
                  </div>
                    );
                  }

                  return renderedFolders;
                })()}
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

