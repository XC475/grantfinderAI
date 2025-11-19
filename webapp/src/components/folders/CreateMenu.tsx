"use client";

import { useState, useRef } from "react";
import { Plus, Folder as FolderIcon, FileText, Upload, FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GoogleDriveImportPicker } from "@/components/google-drive/ImportPicker";
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
  onFileUpload?: (file: File) => void;
  onGoogleDriveImported?: () => void;
}

export function CreateMenu({
  currentFolderId,
  applicationId,
  onCreateFolder,
  onCreateDocument,
  onFileUpload,
  onGoogleDriveImported,
}: CreateMenuProps) {
  const [folderDialogOpen, setFolderDialogOpen] = useState(false);
  const [documentDialogOpen, setDocumentDialogOpen] = useState(false);
  const [folderName, setFolderName] = useState("");
  const [documentTitle, setDocumentTitle] = useState("Untitled Document");
  const [isCreating, setIsCreating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onFileUpload) {
      onFileUpload(file);
    }
    // Reset input so the same file can be uploaded again
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
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
            <FolderIcon className="h-4 w-4 mr-2" />
            Folder
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setDocumentDialogOpen(true)}>
            <FileText className="h-4 w-4 mr-2" />
            Document
          </DropdownMenuItem>
          {onFileUpload && (
            <DropdownMenuItem onClick={() => fileInputRef.current?.click()}>
              <Upload className="h-4 w-4 mr-2" />
              Upload
            </DropdownMenuItem>
          )}
          {onGoogleDriveImported && (
            <GoogleDriveImportPicker
              mode="import"
              folderId={currentFolderId}
              applicationId={applicationId}
              onImported={() => onGoogleDriveImported()}
            >
              {({ onClick, loading }) => (
                <DropdownMenuItem onSelect={(e) => { e.preventDefault(); onClick(); }} disabled={loading}>
                  <FolderOpen className="h-4 w-4 mr-2" />
                  Google Drive
                </DropdownMenuItem>
              )}
            </GoogleDriveImportPicker>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.docx,.txt,.csv"
        onChange={handleFileChange}
        className="hidden"
      />

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

