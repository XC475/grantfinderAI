"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Download, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FilePreview } from "@/components/files/FilePreview";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";
import { useDocumentOptional } from "@/contexts/DocumentContext";

interface Document {
  id: string;
  title: string;
  fileUrl?: string | null;
  fileType?: string | null;
  fileSize?: number | null;
  createdAt: string;
  updatedAt: string;
  metadata?: {
    extractedText?: string;
    originalFileName?: string;
    pageCount?: number;
    uploadedAt?: string;
  } | null;
}

interface FileViewerPageProps {
  params: Promise<{ slug: string; documentId: string }>;
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
}

function getFileTypeLabel(mimeType: string): string {
  const typeMap: Record<string, string> = {
    "application/pdf": "PDF Document",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
      "Word Document",
    "text/plain": "Text File",
    "text/csv": "CSV File",
  };
  return typeMap[mimeType] || "File";
}

export default function FileViewerPage({ params }: FileViewerPageProps) {
  const [document, setDocument] = useState<Document | null>(null);
  const [loading, setLoading] = useState(true);
  const [extractedTextOpen, setExtractedTextOpen] = useState(false);
  const router = useRouter();
  
  const { slug: organizationSlug, documentId } = use(params);
  
  // Get document context if available - will be provided by ConditionalLayout for /file-viewer/ routes
  const documentContext = useDocumentOptional();

  useEffect(() => {
    const fetchDocument = async () => {
      try {
        const response = await fetch(`/api/documents/${documentId}`);

        if (response.ok) {
          const data = await response.json();
          setDocument(data.document);
        } else if (response.status === 404) {
          toast.error("Document not found");
          router.push(`/private/${organizationSlug}/documents`);
        } else {
          throw new Error("Failed to fetch document");
        }
      } catch (error) {
        console.error("Error fetching document:", error);
        toast.error("Failed to load document");
        router.push(`/private/${organizationSlug}/documents`);
      } finally {
        setLoading(false);
      }
    };

    fetchDocument();
  }, [documentId, organizationSlug, router]);

  // Populate document context for AI assistant (if provider is available)
  useEffect(() => {
    if (document && documentContext) {
      documentContext.setDocumentTitle(document.title);
      // Pass extracted text as content for AI context
      const extractedText = document.metadata?.extractedText || "";
      documentContext.setDocumentContent(extractedText);
    }
  }, [document, documentContext]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!document) {
    return (
      <div className="container max-w-6xl py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Document Not Found</h1>
          <p className="text-muted-foreground">
            The document you&apos;re looking for doesn&apos;t exist or you
            don&apos;t have access to it.
          </p>
        </div>
      </div>
    );
  }

  if (!document.fileUrl) {
    return (
      <div className="container max-w-6xl py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Not a File Document</h1>
          <p className="text-muted-foreground mb-4">
            This document doesn&apos;t contain an uploaded file.
          </p>
          <Button
            onClick={() =>
              router.push(`/private/${organizationSlug}/editor/${documentId}`)
            }
          >
            Open in Editor
          </Button>
        </div>
      </div>
    );
  }

  const extractedText = document.metadata?.extractedText;
  const pageCount = document.metadata?.pageCount;

  // Remove outer container - ConditionalLayout handles everything
  return (
    <>
      {/* Header with download button */}
      <div className="flex items-start justify-between gap-4 mb-6 px-8 pt-8">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="h-5 w-5 text-muted-foreground flex-shrink-0" />
            <h1 className="text-2xl font-bold truncate">{document.title}</h1>
          </div>
          <div className="flex items-center gap-3 text-sm text-muted-foreground flex-wrap">
            {document.fileSize && (
              <span>{formatFileSize(document.fileSize)}</span>
            )}
            {document.fileType && (
              <>
                <span>•</span>
                <span>{getFileTypeLabel(document.fileType)}</span>
              </>
            )}
            {pageCount && (
              <>
                <span>•</span>
                <span>{pageCount} pages</span>
              </>
            )}
          </div>
        </div>
        <Button
          onClick={() => window.open(document.fileUrl!, "_blank")}
          className="flex-shrink-0"
        >
          <Download className="h-4 w-4 mr-2" />
          Download
        </Button>
      </div>

      {/* File Preview - fills available space */}
      <div className="px-8 mb-6">
        <FilePreview document={document} />
      </div>

      {/* Extracted Text Section */}
      {extractedText && (
        <div className="px-8 pb-8">
          <Collapsible
            open={extractedTextOpen}
            onOpenChange={setExtractedTextOpen}
            className="border rounded-lg"
          >
            <CollapsibleTrigger className="flex items-center justify-between w-full p-4 hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                <span className="font-semibold">Extracted Text</span>
              </div>
              <ChevronDown
                className={`h-4 w-4 transition-transform ${
                  extractedTextOpen ? "transform rotate-180" : ""
                }`}
              />
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="p-4 pt-0">
                <div className="bg-muted p-4 rounded-md max-h-96 overflow-y-auto">
                  <pre className="whitespace-pre-wrap text-sm font-mono">
                    {extractedText}
                  </pre>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>
      )}
    </>
  );
}

