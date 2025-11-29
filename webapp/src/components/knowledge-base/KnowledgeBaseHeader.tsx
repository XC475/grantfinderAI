"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, ChevronDown, FileText, Upload } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DocumentSelectorModal } from "./DocumentSelectorModal";
import { FileUploadModal } from "./FileUploadModal";
import { GoogleDriveImportModal } from "./GoogleDriveImportModal";

interface KnowledgeBaseHeaderProps {
  organizationSlug: string;
  organizationId: string;
}

export function KnowledgeBaseHeader({
  organizationSlug,
  organizationId,
}: KnowledgeBaseHeaderProps) {
  const [showDocumentSelector, setShowDocumentSelector] = useState(false);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [showGoogleDrive, setShowGoogleDrive] = useState(false);

  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Knowledge Base</h1>
          <p className="text-muted-foreground mt-1">
            Manage documents that provide context to AI assistants
          </p>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="lg">
              <Plus className="mr-2 h-4 w-4" />
              Add
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem onClick={() => setShowDocumentSelector(true)}>
              <FileText className="mr-2 h-4 w-4" />
              From Documents
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setShowFileUpload(true)}>
              <Upload className="mr-2 h-4 w-4" />
              Upload File
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setShowGoogleDrive(true)}>
              <img
                src="/logos/google-drive.png"
                alt="Google Drive"
                className="mr-2 h-4 w-4"
              />
              From Google Drive
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Modals */}
      <DocumentSelectorModal
        isOpen={showDocumentSelector}
        onClose={() => setShowDocumentSelector(false)}
        organizationSlug={organizationSlug}
      />

      <FileUploadModal
        isOpen={showFileUpload}
        onClose={() => setShowFileUpload(false)}
        organizationSlug={organizationSlug}
        organizationId={organizationId}
      />

      <GoogleDriveImportModal
        isOpen={showGoogleDrive}
        onClose={() => setShowGoogleDrive(false)}
        organizationSlug={organizationSlug}
        organizationId={organizationId}
      />
    </>
  );
}

