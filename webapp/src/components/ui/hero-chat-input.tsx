"use client";

import React, { useCallback, useRef, useState, useEffect } from "react";
import { Paperclip, ArrowUp, X, Plus, Upload, FolderOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { FilePreview } from "@/components/ui/file-preview";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface HeroChatInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onSubmit: (files?: File[] | null) => void;
  placeholder?: string;
  className?: string;
}

export function HeroChatInput({
  value,
  onChange,
  onSubmit,
  placeholder = "Ask anything...",
  className,
}: HeroChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<File[] | null>(null);
  const [isDragging, setIsDragging] = useState(false);

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
    onSubmit(files);
    setFiles(null);
  }, [value, files, onSubmit]);

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

  return (
    <div className={cn("w-full max-w-3xl mx-auto", className)}>
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
          "relative flex flex-col rounded-3xl border-2 bg-background transition-all min-h-[120px]",
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
          style={{ maxHeight: '240px' }}
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
              <DropdownMenuItem onClick={handleAttachClick} className="cursor-pointer">
                <Paperclip className="mr-2 h-4 w-4" />
                <span>Attach files</span>
              </DropdownMenuItem>
              <DropdownMenuItem disabled className="cursor-not-allowed opacity-50">
                <FolderOpen className="mr-2 h-4 w-4" />
                <span>Google Drive (Coming Soon)</span>
              </DropdownMenuItem>
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
      </div>
    </div>
  );
}

