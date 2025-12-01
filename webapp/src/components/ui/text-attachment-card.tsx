"use client";

import { motion } from "framer-motion";
import { FileText, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface TextSelectionAttachment {
  id: string;
  name: string;
  type: 'text/selection';
  content: string;
  preview: string;
}

interface TextAttachmentCardProps {
  attachment: TextSelectionAttachment;
  onRemove: () => void;
}

export function TextAttachmentCard({
  attachment,
  onRemove,
}: TextAttachmentCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.15 }}
      className="flex items-center gap-2 px-3 py-2 rounded-lg border bg-muted max-w-full"
    >
      <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium truncate">{attachment.name}</div>
        <div className="text-xs text-muted-foreground truncate">
          {attachment.preview}
        </div>
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={onRemove}
        className="h-5 w-5 shrink-0"
      >
        <X className="h-3 w-3" />
      </Button>
    </motion.div>
  );
}

