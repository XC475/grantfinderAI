"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ChevronDown,
  ChevronRight,
  FileText,
  File,
  Table,
  X,
} from "lucide-react";
import { toast } from "sonner";
import {
  getFileCategoryLabel,
  getFileCategoryIcon,
  getFileCategoryDescription,
} from "@/lib/fileCategories";
import { FileCategory } from "@/generated/prisma";

interface Document {
  id: string;
  title: string;
  contentType?: string;
  fileUrl?: string | null;
  fileType?: string | null;
  application?: {
    title: string;
    opportunityAgency?: string | null;
  } | null;
}

interface DocumentsByTypeData {
  type: string;
  documents: Document[];
  hasKBDocs: boolean;
  allInKB: boolean;
  totalCount: number;
  kbCount: number;
}

interface KnowledgeBaseCategoryListProps {
  documentsByType: DocumentsByTypeData[];
  organizationSlug: string;
  organizationId: string;
}

// Helper function to get the appropriate icon for a document
function getDocumentIcon(document: Document) {
  if (!document.fileType) {
    // Regular editable document
    return <FileText className="h-4 w-4 text-blue-500 shrink-0" />;
  }

  // File uploads - different icons based on type
  if (document.fileType === "application/pdf") {
    return <FileText className="h-4 w-4 text-red-500 shrink-0" />;
  }
  if (
    document.fileType ===
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    return <FileText className="h-4 w-4 text-blue-600 shrink-0" />;
  }
  if (document.fileType === "text/csv") {
    return <Table className="h-4 w-4 text-green-600 shrink-0" />;
  }
  if (document.fileType === "text/plain") {
    return <File className="h-4 w-4 text-gray-600 shrink-0" />;
  }

  // Default file icon
  return <File className="h-4 w-4 text-muted-foreground shrink-0" />;
}

export function KnowledgeBaseCategoryList({
  documentsByType,
  organizationSlug,
}: KnowledgeBaseCategoryListProps) {
  const [expandedTypes, setExpandedTypes] = useState<Set<string>>(new Set());
  const [removingDocIds, setRemovingDocIds] = useState<Set<string>>(new Set());

  const toggleExpand = (type: string) => {
    setExpandedTypes((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(type)) {
        newSet.delete(type);
      } else {
        newSet.add(type);
      }
      return newSet;
    });
  };

  const handleRemoveFromKB = async (documentId: string) => {
    setRemovingDocIds((prev) => new Set(prev).add(documentId));
    try {
      const response = await fetch(`/api/documents/${documentId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isKnowledgeBase: false }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to remove from knowledge base");
      }

      toast.success("Document removed from knowledge base");

      // Trigger refresh event for KnowledgeBase component
      window.dispatchEvent(new Event("knowledge-base-refresh"));
    } catch (error) {
      console.error("Error removing from knowledge base:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to remove from knowledge base";
      toast.error(errorMessage);
    } finally {
      setRemovingDocIds((prev) => {
        const next = new Set(prev);
        next.delete(documentId);
        return next;
      });
    }
  };

  return (
    <div className="space-y-3">
      {documentsByType.map(({ type, documents, kbCount }) => {
        const Icon = getFileCategoryIcon(type as FileCategory);
        const isExpanded = expandedTypes.has(type);

        return (
          <Card key={type} className="overflow-hidden">
            <div className="px-4">
              <div className="flex items-center justify-between gap-4">
                {/* Left side - Category info */}
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <Icon className="h-6 w-6 text-primary shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-base">
                        {getFileCategoryLabel(type as FileCategory)}
                      </h3>
                      <Badge variant="outline" className="text-xs">
                        {kbCount}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {getFileCategoryDescription(type as FileCategory)}
                    </p>
                  </div>
                </div>

                {/* Right side - Toggle and expand */}
                <div className="flex items-center gap-3">
                  {kbCount > 0 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => toggleExpand(type)}
                      className="h-8 w-8"
                    >
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </Button>
                  )}
                </div>
              </div>

              {/* Collapsible document list */}
              {kbCount > 0 && isExpanded && (
                <div className="mt-4 pt-4 border-t space-y-2">
                  {documents.map((doc) => {
                    const isRemoving = removingDocIds.has(doc.id);
                    return (
                      <div
                        key={doc.id}
                        className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          {getDocumentIcon(doc)}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-sm truncate">
                                {doc.title}
                              </span>
                            </div>
                            {doc.application && (
                              <p className="text-xs text-muted-foreground mt-1">
                                From: {doc.application.title}
                                {doc.application.opportunityAgency &&
                                  ` • ${doc.application.opportunityAgency}`}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              if (doc.contentType === "json") {
                                window.open(
                                  `/private/${organizationSlug}/editor/${doc.id}`,
                                  "_blank"
                                );
                              } else if (doc.fileUrl) {
                                window.open(doc.fileUrl, "_blank");
                              }
                            }}
                          >
                            View
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveFromKB(doc.id)}
                            disabled={isRemoving}
                            className="text-destructive hover:text-destructive"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </Card>
        );
      })}
    </div>
  );
}
