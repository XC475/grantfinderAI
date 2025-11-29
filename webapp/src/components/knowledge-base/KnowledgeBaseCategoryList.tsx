"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import {
  getFileCategoryLabel,
  getFileCategoryIcon,
  getFileCategoryDescription,
} from "@/lib/fileCategories";

interface DocumentsByTypeData {
  type: string;
  documents: any[];
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

export function KnowledgeBaseCategoryList({
  documentsByType,
  organizationSlug,
  organizationId,
}: KnowledgeBaseCategoryListProps) {
  const [expandedTypes, setExpandedTypes] = useState<Set<string>>(new Set());
  const [togglingType, setTogglingType] = useState<string | null>(null);

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

  const handleToggleType = async (type: string, currentState: boolean) => {
    setTogglingType(type);
    try {
      const response = await fetch("/api/documents/toggle-category", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileCategory: type,
          isKnowledgeBase: !currentState,
        }),
      });

      if (!response.ok) throw new Error("Failed to toggle");

      const data = await response.json();
      toast.success(
        `${data.isKnowledgeBase ? "Added" : "Removed"} ${data.updated} document(s) ${data.isKnowledgeBase ? "to" : "from"} knowledge base`
      );

      // Refresh page to show updated state
      window.location.reload();
    } catch (error) {
      toast.error("Failed to update knowledge base");
    } finally {
      setTogglingType(null);
    }
  };

  return (
    <div className="space-y-3">
      {documentsByType.map(
        ({ type, documents, hasKBDocs, totalCount, kbCount }) => {
          const Icon = getFileCategoryIcon(type as any);
          const isExpanded = expandedTypes.has(type);
          const isToggling = togglingType === type;

          return (
            <Card key={type} className="overflow-hidden">
              <div className="p-4">
                <div className="flex items-center justify-between gap-4">
                  {/* Left side - Category info */}
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <Icon className="h-6 w-6 text-primary flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-base">
                          {getFileCategoryLabel(type as any)}
                        </h3>
                        <Badge variant="outline" className="text-xs">
                          {kbCount}/{totalCount}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {getFileCategoryDescription(type as any)}
                      </p>
                    </div>
                  </div>

                  {/* Right side - Toggle and expand */}
                  <div className="flex items-center gap-3">
                    {totalCount > 0 && (
                      <>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">
                            {hasKBDocs
                              ? "In Knowledge Base"
                              : "Not in Knowledge Base"}
                          </span>
                          <Switch
                            checked={hasKBDocs}
                            onCheckedChange={() =>
                              handleToggleType(type, hasKBDocs)
                            }
                            disabled={totalCount === 0 || isToggling}
                            className="data-[state=checked]:bg-green-600"
                          />
                        </div>

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
                      </>
                    )}
                  </div>
                </div>

                {/* Collapsible document list */}
                {totalCount > 0 && isExpanded && (
                  <div className="mt-4 pt-4 border-t space-y-2">
                    {documents.map((doc) => (
                      <div
                        key={doc.id}
                        className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm truncate">
                              {doc.title}
                            </span>
                            {doc.isKnowledgeBase && (
                              <Badge
                                variant="outline"
                                className="text-xs bg-green-50 text-green-700 border-green-200"
                              >
                                In KB
                              </Badge>
                            )}
                          </div>
                          {doc.application && (
                            <p className="text-xs text-muted-foreground mt-1">
                              From: {doc.application.title}
                              {doc.application.opportunityAgency &&
                                ` • ${doc.application.opportunityAgency}`}
                            </p>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            if (doc.contentType === "json") {
                              window.open(
                                `/private/${organizationSlug}/editor/${doc.id}`,
                                "_blank"
                              );
                            } else {
                              window.open(doc.fileUrl, "_blank");
                            }
                          }}
                        >
                          View
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Card>
          );
        }
      )}
    </div>
  );
}

