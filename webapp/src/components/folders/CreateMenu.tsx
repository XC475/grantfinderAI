"use client";

import { useState, useRef } from "react";
import {
  Plus,
  Folder as FolderIcon,
  FileText,
  Upload,
  Loader2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { GoogleDriveImportPicker } from "@/components/google-drive/ImportPicker";
import Image from "next/image";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  getAllFileCategories,
  getFileCategoryLabel,
} from "@/lib/fileCategories";
import { toast } from "sonner";
import { FileCategory } from "@/generated/prisma";

interface CreateMenuProps {
  currentFolderId: string | null;
  applicationId?: string;
  organizationSlug?: string;
  organizationId?: string;
  onCreateFolder: (
    name: string,
    parentFolderId: string | null
  ) => Promise<void>;
  onCreateDocument: (
    title: string,
    folderId: string | null,
    fileCategory: FileCategory
  ) => Promise<void>;
  onFileUpload?: (file: File, fileCategory: FileCategory) => void;
  onGoogleDriveImported?: (fileCategory: FileCategory) => void;
  isKnowledgeBase?: boolean;
  onShowDocumentSelector?: () => void;
}

export function CreateMenu({
  currentFolderId,
  applicationId,
  organizationSlug,
  onCreateFolder,
  onCreateDocument,
  onFileUpload,
  onGoogleDriveImported,
  isKnowledgeBase = false,
  onShowDocumentSelector,
}: CreateMenuProps) {
  const [folderDialogOpen, setFolderDialogOpen] = useState(false);
  const [documentDialogOpen, setDocumentDialogOpen] = useState(false);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [googleDriveDialogOpen, setGoogleDriveDialogOpen] = useState(false);
  const [folderName, setFolderName] = useState("");
  const [documentTitle, setDocumentTitle] = useState("Untitled Document");
  const [documentFileCategory, setDocumentFileCategory] =
    useState<FileCategory>("GENERAL");
  const [uploadFileCategory, setUploadFileCategory] =
    useState<FileCategory>("GENERAL");
  const [googleDriveFileCategory, setGoogleDriveFileCategory] =
    useState<FileCategory>("GENERAL");
  const [isCreating, setIsCreating] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedGoogleDriveFile, setSelectedGoogleDriveFile] = useState<{
    id: string;
    name: string;
    mimeType: string;
  } | null>(null);
  const [importing, setImporting] = useState(false);
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
      await onCreateDocument(
        documentTitle,
        currentFolderId,
        documentFileCategory
      );
      setDocumentTitle("Untitled Document");
      setDocumentFileCategory("GENERAL");
      setDocumentDialogOpen(false);
    } catch (error) {
      console.error("Error creating document:", error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      // Dialog is already open, no need to open it again
    }
    // Reset input so the same file can be uploaded again
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleFileUpload = async () => {
    if (!selectedFile || !onFileUpload) return;

    setUploading(true);
    try {
      await onFileUpload(selectedFile, uploadFileCategory);
      setSelectedFile(null);
      setUploadFileCategory("GENERAL");
      setUploadDialogOpen(false);
    } catch (error) {
      console.error("Error uploading file:", error);
    } finally {
      setUploading(false);
    }
  };

  const handleGoogleDriveFileSelected = (
    fileId: string,
    fileName: string,
    mimeType: string
  ) => {
    // Ensure the modal stays open - the Google Picker might try to close it
    // so we explicitly keep it open
    setGoogleDriveDialogOpen(true);
    setSelectedGoogleDriveFile({ id: fileId, name: fileName, mimeType });
  };

  const handleGoogleDriveImport = async () => {
    if (!selectedGoogleDriveFile) return;

    setImporting(true);
    try {
      const response = await fetch("/api/google-drive/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileId: selectedGoogleDriveFile.id,
          fileName: selectedGoogleDriveFile.name,
          mimeType: selectedGoogleDriveFile.mimeType,
          folderId: currentFolderId,
          applicationId: applicationId,
          fileCategory: googleDriveFileCategory,
          // isKnowledgeBase defaults to true in the API
          // Only pass it if explicitly set to true (for knowledge base page)
          ...(isKnowledgeBase === true && { isKnowledgeBase: true }),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to import file");
      }

      await response.json();
      toast.success("File imported successfully");
      setSelectedGoogleDriveFile(null);
      setGoogleDriveFileCategory("GENERAL");
      setGoogleDriveDialogOpen(false);
      onGoogleDriveImported?.(googleDriveFileCategory);
    } catch (error) {
      console.error("Error importing from Google Drive:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to import file"
      );
    } finally {
      setImporting(false);
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
          {!isKnowledgeBase && (
            <DropdownMenuItem onClick={() => setFolderDialogOpen(true)}>
              <FolderIcon className="h-4 w-4 mr-2" />
              Folder
            </DropdownMenuItem>
          )}
          <DropdownMenuItem onClick={() => setDocumentDialogOpen(true)}>
            <FileText className="h-4 w-4 mr-2" />
            Document
          </DropdownMenuItem>
          {onShowDocumentSelector && (
            <DropdownMenuItem onClick={onShowDocumentSelector}>
              <FileText className="h-4 w-4 mr-2" />
              From Documents
            </DropdownMenuItem>
          )}
          {onFileUpload && (
            <DropdownMenuItem onClick={() => setUploadDialogOpen(true)}>
              <Upload className="h-4 w-4 mr-2" />
              Upload
            </DropdownMenuItem>
          )}
          {onGoogleDriveImported && organizationSlug && (
            <DropdownMenuItem onClick={() => setGoogleDriveDialogOpen(true)}>
              <Image
                src="/logos/google-drive.svg"
                alt="Google Drive"
                width={16}
                height={16}
                className="mr-2"
              />
              Google Drive
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.docx,.txt,.csv"
        multiple={false}
        onChange={handleFileSelect}
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
                Enter a title and select a category for your new document.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="document-title">Title</Label>
                <Input
                  id="document-title"
                  value={documentTitle}
                  onChange={(e) => setDocumentTitle(e.target.value)}
                  placeholder="Enter document title"
                  disabled={isCreating}
                  autoFocus
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="document-category">Document Type</Label>
                <Select
                  value={documentFileCategory}
                  onValueChange={(value) =>
                    setDocumentFileCategory(value as FileCategory)
                  }
                  disabled={isCreating}
                >
                  <SelectTrigger id="document-category">
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

      {/* Upload File Dialog */}
      {onFileUpload && (
        <Dialog
          open={uploadDialogOpen}
          onOpenChange={(open) => {
            setUploadDialogOpen(open);
            if (!open) {
              // Clear selected file when modal closes
              setSelectedFile(null);
              if (fileInputRef.current) {
                fileInputRef.current.value = "";
              }
            }
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Upload File</DialogTitle>
              <DialogDescription>
                Select a file and choose its document type.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Document Type</Label>
                <Select
                  value={uploadFileCategory}
                  onValueChange={(value) =>
                    setUploadFileCategory(value as FileCategory)
                  }
                  disabled={uploading}
                >
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
              <div className="space-y-2">
                <Label>File</Label>
                {!selectedFile ? (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Select File
                  </Button>
                ) : (
                  <div className="flex items-center gap-2 p-3 rounded-lg border bg-muted/50">
                    <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span className="text-sm font-medium flex-1">
                      {selectedFile.name.length > 45
                        ? `${selectedFile.name.substring(0, 45)}...`
                        : selectedFile.name}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 shrink-0 ml-auto"
                      onClick={() => {
                        setSelectedFile(null);
                        if (fileInputRef.current) {
                          fileInputRef.current.value = "";
                        }
                      }}
                      disabled={uploading}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setUploadDialogOpen(false);
                  setSelectedFile(null);
                }}
                disabled={uploading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleFileUpload}
                disabled={!selectedFile || uploading}
              >
                {uploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Google Drive Import Dialog */}
      {onGoogleDriveImported && organizationSlug && (
        <Dialog
          open={googleDriveDialogOpen}
          onOpenChange={(open) => {
            // Don't allow closing if we just selected a file (Google Picker might trigger this)
            if (!open && selectedGoogleDriveFile) {
              // Keep the dialog open - user needs to click Import or Cancel
              return;
            }
            // Normal close - clear state
            setGoogleDriveDialogOpen(open);
            if (!open) {
              setSelectedGoogleDriveFile(null);
            }
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Import from Google Drive</DialogTitle>
              <DialogDescription>
                Select a document type and import a file from Google Drive.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Document Type</Label>
                <Select
                  value={googleDriveFileCategory}
                  onValueChange={(value) =>
                    setGoogleDriveFileCategory(value as FileCategory)
                  }
                  disabled={importing}
                >
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
              <div className="space-y-2">
                <Label>File</Label>
                {!selectedGoogleDriveFile ? (
                  <GoogleDriveImportPicker
                    mode="import"
                    folderId={currentFolderId}
                    applicationId={applicationId}
                    fileCategory={googleDriveFileCategory}
                    isKnowledgeBase={isKnowledgeBase}
                    onFileSelected={handleGoogleDriveFileSelected}
                    asButton
                  >
                    {({ onClick, loading }) => (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={onClick}
                        disabled={loading || importing}
                      >
                        {loading ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Loading...
                          </>
                        ) : (
                          <>
                            <Image
                              src="/logos/google-drive.svg"
                              alt="Google Drive"
                              width={16}
                              height={16}
                              className="mr-2"
                            />
                            Select From Google Drive
                          </>
                        )}
                      </Button>
                    )}
                  </GoogleDriveImportPicker>
                ) : (
                  <div className="flex items-center gap-2 p-3 rounded-lg border bg-muted/50">
                    <Image
                      src="/logos/google-drive.svg"
                      alt="Google Drive"
                      width={16}
                      height={16}
                      className="shrink-0"
                    />
                    <span className="text-sm font-medium flex-1">
                      {selectedGoogleDriveFile.name.length > 45
                        ? `${selectedGoogleDriveFile.name.substring(0, 45)}...`
                        : selectedGoogleDriveFile.name}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 shrink-0 ml-auto"
                      onClick={() => {
                        setSelectedGoogleDriveFile(null);
                      }}
                      disabled={importing}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setGoogleDriveDialogOpen(false);
                  setSelectedGoogleDriveFile(null);
                }}
                disabled={importing}
              >
                Cancel
              </Button>
              <Button
                onClick={handleGoogleDriveImport}
                disabled={!selectedGoogleDriveFile || importing}
              >
                {importing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Importing...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Import
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
