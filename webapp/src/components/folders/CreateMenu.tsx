"use client";

import { useState } from "react";
import { Plus, Folder, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface CreateMenuProps {
  currentFolderId: string | null;
  applicationId?: string;
  onCreateFolder: (name: string, parentFolderId: string | null) => Promise<void>;
  onCreateDocument: (title: string, folderId: string | null) => Promise<void>;
}

export function CreateMenu({
  currentFolderId,
  applicationId,
  onCreateFolder,
  onCreateDocument,
}: CreateMenuProps) {
  const [folderDialogOpen, setFolderDialogOpen] = useState(false);
  const [documentDialogOpen, setDocumentDialogOpen] = useState(false);
  const [folderName, setFolderName] = useState("");
  const [documentTitle, setDocumentTitle] = useState("Untitled Document");
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!folderName.trim()) return;

    setIsCreating(true);
    try {
      await onCreateFolder(folderName, currentFolderId);
      setFolderName("");
      setFolderDialogOpen(false);
    } catch (error) {
      console.error("Error creating folder:", error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleCreateDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!documentTitle.trim()) return;

    setIsCreating(true);
    try {
      await onCreateDocument(documentTitle, currentFolderId);
      setDocumentTitle("Untitled Document");
      setDocumentDialogOpen(false);
    } catch (error) {
      console.error("Error creating document:", error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button>
            <Plus className="h-4 w-4 mr-1" />
            New
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setFolderDialogOpen(true)}>
            <Folder className="h-4 w-4 mr-2" />
            Folder
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setDocumentDialogOpen(true)}>
            <FileText className="h-4 w-4 mr-2" />
            Document
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Create Folder Dialog */}
      <Dialog open={folderDialogOpen} onOpenChange={setFolderDialogOpen}>
        <DialogContent>
          <form onSubmit={handleCreateFolder}>
            <DialogHeader>
              <DialogTitle>Create New Folder</DialogTitle>
              <DialogDescription>
                Enter a name for your new folder.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Label htmlFor="folder-name">Folder Name</Label>
              <Input
                id="folder-name"
                value={folderName}
                onChange={(e) => setFolderName(e.target.value)}
                placeholder="Enter folder name"
                className="mt-2"
                disabled={isCreating}
                autoFocus
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setFolderDialogOpen(false)}
                disabled={isCreating}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isCreating || !folderName.trim()}>
                {isCreating ? "Creating..." : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Create Document Dialog */}
      <Dialog open={documentDialogOpen} onOpenChange={setDocumentDialogOpen}>
        <DialogContent>
          <form onSubmit={handleCreateDocument}>
            <DialogHeader>
              <DialogTitle>Create New Document</DialogTitle>
              <DialogDescription>
                Enter a title for your new document.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Label htmlFor="document-title">Title</Label>
              <Input
                id="document-title"
                value={documentTitle}
                onChange={(e) => setDocumentTitle(e.target.value)}
                placeholder="Enter document title"
                className="mt-2"
                disabled={isCreating}
                autoFocus
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setDocumentDialogOpen(false)}
                disabled={isCreating}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isCreating || !documentTitle.trim()}
              >
                {isCreating ? "Creating..." : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

