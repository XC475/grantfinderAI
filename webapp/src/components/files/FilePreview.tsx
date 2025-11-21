"use client";

import { FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Document {
  id: string;
  title: string;
  fileUrl?: string | null;
  fileType?: string | null;
  fileSize?: number | null;
  metadata?: {
    extractedText?: string;
    originalFileName?: string;
    pageCount?: number;
  } | null;
}

interface FilePreviewProps {
  document: Document;
}

export function FilePreview({ document }: FilePreviewProps) {
  if (!document.fileUrl || !document.fileType) {
    return (
      <div className="text-center p-8 border rounded-md bg-muted">
        <p className="text-sm text-muted-foreground">
          No file preview available
        </p>
      </div>
    );
  }

  // PDF Preview - use iframe for native browser rendering
  if (document.fileType === "application/pdf") {
    return (
      <div className="border rounded-md overflow-hidden bg-white">
        <iframe
          src={document.fileUrl}
          className="w-full h-[800px]"
          title={`PDF Preview - ${document.title}`}
        />
      </div>
    );
  }

  // Text and CSV files - show extracted text
  if (document.fileType === "text/plain" || document.fileType === "text/csv") {
    const extractedText =
      document.metadata?.extractedText || "No text content available";

    return (
      <div className="border rounded-md bg-muted p-6">
        <pre className="whitespace-pre-wrap text-sm font-mono overflow-auto max-h-[800px]">
          {extractedText}
        </pre>
      </div>
    );
  }

  // Word documents - no native preview, show download option
  if (
    document.fileType ===
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    return (
      <div className="text-center p-12 border rounded-md bg-muted">
        <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-lg font-semibold mb-2">Word Document</h3>
        <p className="text-sm text-muted-foreground mb-6">
          Preview not available for Word documents
        </p>
        <Button onClick={() => window.open(document.fileUrl!, "_blank")}>
          Download to View
        </Button>
      </div>
    );
  }

  // Fallback for unknown file types
  return (
    <div className="text-center p-8 border rounded-md bg-muted">
      <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
      <p className="text-sm text-muted-foreground mb-4">
        Preview not available for this file type
      </p>
      <Button
        variant="outline"
        onClick={() => window.open(document.fileUrl!, "_blank")}
      >
        Download File
      </Button>
    </div>
  );
}
