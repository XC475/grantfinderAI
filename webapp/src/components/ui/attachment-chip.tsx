"use client";

import { motion } from "framer-motion";
import { FileText, X, File, Table } from "lucide-react";
import { cn } from "@/lib/utils";

export type AttachmentType = "text" | "file" | "source";

export interface AttachmentChipProps {
  type: AttachmentType;
  title: string;
  preview?: string;
  fileType?: string | null;
  onRemove?: () => void;
  className?: string;
}

// Helper function to get icon based on type and fileType
function getIcon(type: AttachmentType, fileType?: string | null) {
  if (type === "text") {
    return <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />;
  }

  if (type === "source" || type === "file") {
    if (!fileType) {
      return <FileText className="h-4 w-4 shrink-0 text-blue-500" />;
    }
    if (fileType === "application/pdf") {
      return <FileText className="h-4 w-4 shrink-0 text-red-500" />;
    }
    if (
      fileType ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      return <FileText className="h-4 w-4 shrink-0 text-blue-600" />;
    }
    if (fileType === "text/csv") {
      return <Table className="h-4 w-4 shrink-0 text-green-600" />;
    }
    if (fileType === "text/plain") {
      return <File className="h-4 w-4 shrink-0 text-gray-600" />;
    }
    return <File className="h-4 w-4 shrink-0 text-muted-foreground" />;
  }

  return <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />;
}

export function AttachmentChip({
  type,
  title,
  preview,
  fileType,
  onRemove,
  className,
}: AttachmentChipProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.15 }}
      className={cn(
        "relative flex items-center gap-2 px-3 py-2 rounded-lg border bg-muted max-w-[220px]",
        className
      )}
    >
      {getIcon(type, fileType)}
      <div className="flex-1 min-w-0 overflow-hidden">
        <div className="text-sm font-medium truncate">{title}</div>
        {preview && (
          <div className="text-xs text-muted-foreground truncate">
            {preview}
          </div>
        )}
      </div>
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full border bg-background hover:bg-muted transition-colors"
          aria-label="Remove attachment"
        >
          <X className="h-2.5 w-2.5" />
        </button>
      )}
    </motion.div>
  );
}

