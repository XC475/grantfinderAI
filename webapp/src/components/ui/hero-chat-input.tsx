"use client";

import React, { useCallback, useRef, useState, useEffect } from "react";
import {
  Paperclip,
  ArrowUp,
  X,
  Plus,
  Upload,
  FileText,
  File,
  Table,
} from "lucide-react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { FilePreview } from "@/components/ui/file-preview";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SourcesModal,
  type SourceDocument,
} from "@/components/chat/SourcesModal";
import { GoogleDriveImportPicker } from "@/components/google-drive/ImportPicker";

// Helper function to get document icon based on file type
function getDocumentIcon(doc: SourceDocument) {
  if (!doc.fileType) {
    return <FileText className="h-4 w-4 text-blue-500 flex-shrink-0" />;
  }
  if (doc.fileType === "application/pdf") {
    return <FileText className="h-4 w-4 text-red-500 flex-shrink-0" />;
  }
  if (
    doc.fileType ===
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    return <FileText className="h-4 w-4 text-blue-600 flex-shrink-0" />;
  }
  if (doc.fileType === "text/csv") {
    return <Table className="h-4 w-4 text-green-600 flex-shrink-0" />;
  }
  if (doc.fileType === "text/plain") {
    return <File className="h-4 w-4 text-gray-600 flex-shrink-0" />;
  }
  return <File className="h-4 w-4 text-muted-foreground flex-shrink-0" />;
}

interface HeroChatInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onSubmit: (files?: File[] | null, sources?: SourceDocument[]) => void;
  placeholder?: string;
  className?: string;
  sourceDocuments?: SourceDocument[];
  onSourceDocumentsChange?: (docs: SourceDocument[]) => void;
}

export function HeroChatInput({
  value,
  onChange,
  onSubmit,
  placeholder = "Ask anything...",
  className,
  sourceDocuments,
  onSourceDocumentsChange,
}: HeroChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<File[] | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [sourcesModalOpen, setSourcesModalOpen] = useState(false);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      const newHeight = Math.min(textarea.scrollHeight, 150); // Max 5-6 lines
      textarea.style.height = `${newHeight}px`;
    }
  }, [value]);

  const handleSubmit = useCallback(() => {
    if (!value.trim() && (!files || files.length === 0)) return;
    onSubmit(files, sourceDocuments);
    setFiles(null);
  }, [value, files, sourceDocuments, onSubmit]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleAttachClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleRemoveFile = (index: number) => {
    if (files) {
      const newFiles = files.filter((_, i) => i !== index);
      setFiles(newFiles.length > 0 ? newFiles : null);
    }
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleDriveFilesSelected = (driveFiles: File[]) => {
    setFiles((prev) => (prev ? [...prev, ...driveFiles] : driveFiles));
  };

  return (
    <div className={cn("w-full max-w-3xl mx-auto", className)}>
      {/* Source Documents Preview */}
      {sourceDocuments && sourceDocuments.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          <AnimatePresence mode="popLayout">
            {sourceDocuments.map((doc) => (
              <motion.div
                key={doc.id}
                className="relative flex max-w-[200px] rounded-md border border-primary/30 bg-primary/5 p-1.5 pr-2 text-xs"
                layout
                initial={{ opacity: 0, y: "100%" }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: "100%" }}
              >
                <div className="flex w-full items-center space-x-2">
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-sm border bg-muted">
                    {getDocumentIcon(doc)}
                  </div>
                  <span className="w-full truncate text-muted-foreground">
                    {doc.title}
                  </span>
                </div>
                {onSourceDocumentsChange && (
                  <button
                    className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full border bg-background"
                    type="button"
                    onClick={() => {
                      onSourceDocumentsChange(
                        sourceDocuments.filter((d) => d.id !== doc.id)
                      );
                    }}
                    aria-label="Remove source"
                  >
                    <X className="h-2.5 w-2.5" />
                  </button>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* File Attachments Preview */}
      {files && files.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {files.map((file, index) => (
            <div
              key={index}
              className="relative flex items-center gap-2 rounded-lg border-2 border-border bg-background px-3 py-2"
            >
              <FilePreview file={file} />
              <button
                onClick={() => handleRemoveFile(index)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Main Input Container */}
      <div
        className={cn(
          "relative flex flex-col rounded-3xl border-2 bg-white dark:bg-zinc-900 transition-all min-h-[120px]",
          isDragging
            ? "border-primary bg-primary/5"
            : "border-border focus-within:border-primary/50"
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={handleFileChange}
        />

        {/* Textarea - Top section */}
        <textarea
          ref={textareaRef}
          value={value}
          onChange={onChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="flex-1 resize-none border-0 bg-transparent px-4 pt-4 pb-2 text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-0 min-h-[80px]"
          rows={1}
          style={{ maxHeight: "240px" }}
        />

        {/* Buttons Row - Bottom section */}
        <div className="flex items-center justify-between px-4 pb-3 pt-1">
          {/* Plus Button - Bottom left */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              >
                <Plus className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              <DropdownMenuItem
                onClick={handleAttachClick}
                className="cursor-pointer"
              >
                <Paperclip className="mr-2 h-4 w-4" />
                <span>Attach files</span>
              </DropdownMenuItem>
              {onSourceDocumentsChange && (
                <DropdownMenuItem
                  onClick={() => setSourcesModalOpen(true)}
                  className="cursor-pointer"
                >
                  <FileText className="mr-2 h-4 w-4" />
                  <span>Add sources</span>
                </DropdownMenuItem>
              )}
              <GoogleDriveImportPicker
                mode="attach"
                onFilesSelected={handleDriveFilesSelected}
              >
                {({ onClick }) => (
                  <DropdownMenuItem
                    onClick={onClick}
                    className="cursor-pointer"
                  >
                    <Image
                      src="/logos/google-drive.svg"
                      alt="Google Drive"
                      width={16}
                      height={16}
                      className="mr-2"
                    />
                    <span>Google Drive</span>
                  </DropdownMenuItem>
                )}
              </GoogleDriveImportPicker>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Send Button - Bottom right (Claude-style) */}
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={!value.trim() && (!files || files.length === 0)}
            className={cn(
              "h-9 w-9 rounded-lg bg-[#5a8bf2] hover:bg-[#4a7bd9] disabled:opacity-50 disabled:cursor-not-allowed transition-colors shrink-0 flex items-center justify-center",
              "dark:bg-[#d4917c] dark:hover:bg-[#c27d68]"
            )}
          >
            <ArrowUp className="h-5 w-5 text-white" />
          </Button>
        </div>

        {/* Drag & Drop Overlay */}
        {isDragging && (
          <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center space-x-2 rounded-3xl border border-dashed border-primary bg-primary/5 text-sm text-muted-foreground">
            <Paperclip className="h-4 w-4" />
            <span>Drop your files here to attach them.</span>
          </div>
        )}
      </div>

      {/* Sources Modal */}
      {onSourceDocumentsChange && (
        <SourcesModal
          open={sourcesModalOpen}
          onOpenChange={setSourcesModalOpen}
          onSelectDocuments={(docs) => {
            onSourceDocumentsChange(docs);
          }}
          selectedDocumentIds={sourceDocuments?.map((d) => d.id) || []}
        />
      )}
    </div>
  );
}
