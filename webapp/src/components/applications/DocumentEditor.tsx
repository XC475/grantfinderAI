"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Save, Loader2, PanelLeft } from "lucide-react";
import { SimpleEditor } from "@/components/tiptap-templates/simple/simple-editor";
import { DocumentChatSidebar } from "./DocumentChatSidebar";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import { cn } from "@/lib/utils";
import "./editor-overrides.css";

interface Document {
  id: string;
  title: string;
  content?: string;
  contentType: string;
  version: number;
  createdAt: string;
  updatedAt: string;
}

interface DocumentEditorProps {
  document: Document;
  applicationId: string;
  organizationSlug: string;
  onSave: (content: string) => Promise<void>;
  isSaving: boolean;
}

export function DocumentEditor({
  document,
  applicationId,
  organizationSlug,
  onSave,
  isSaving,
}: DocumentEditorProps) {
  const [title, setTitle] = useState(document.title);
  const [content, setContent] = useState(document.content || "");
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(true);

  // Auto-save every 30 seconds
  useEffect(() => {
    if (!hasUnsavedChanges || !content) return;

    const autoSaveInterval = setInterval(() => {
      if (hasUnsavedChanges) {
        handleSave();
      }
    }, 30000); // 30 seconds

    return () => clearInterval(autoSaveInterval);
  }, [hasUnsavedChanges, content]);

  const handleSave = useCallback(async () => {
    if (!hasUnsavedChanges) return;

    try {
      await onSave(content);
      setHasUnsavedChanges(false);
      toast.success("Document saved");
    } catch (error) {
      console.error("Error saving document:", error);
      toast.error("Failed to save document");
    }
  }, [content, hasUnsavedChanges, onSave]);

  const handleContentChange = (newContent: string) => {
    setContent(newContent);
    setHasUnsavedChanges(newContent !== (document.content || ""));
  };

  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    setHasUnsavedChanges(true);
  };

  return (
    <div className="h-full bg-background relative">
      {/* Floating action buttons - top right */}
      <div className="fixed top-20 right-6 z-40 flex items-center gap-2">
        {/* Toggle sidebar button (only when closed) */}
        {!isChatOpen && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsChatOpen(true)}
            className="shadow-sm bg-background/95 backdrop-blur-sm"
          >
            <PanelLeft className="h-4 w-4 mr-2" />
            Assistant
          </Button>
        )}
        {hasUnsavedChanges && (
          <span className="text-sm text-muted-foreground whitespace-nowrap bg-background/95 backdrop-blur-sm px-3 py-1.5 rounded-md border shadow-sm">
            • Unsaved
          </span>
        )}
        {hasUnsavedChanges && (
          <Button
            variant="outline"
            onClick={handleSave}
            disabled={isSaving}
            size="sm"
            className="shadow-sm bg-background/95 backdrop-blur-sm"
          >
            {isSaving ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            {isSaving ? "Saving..." : "Save"}
          </Button>
        )}
      </div>

      {/* Resizable layout with editor and sidebar */}
      <ResizablePanelGroup direction="horizontal" className="h-full">
        {/* Main editor panel */}
        <ResizablePanel defaultSize={isChatOpen ? 60 : 100} minSize={30}>
          <div className="h-full flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto">
              <div className="container max-w-4xl mx-auto px-8 pb-8">
                <div className="prose prose-lg max-w-none">
                  <SimpleEditor
                    initialContent={content}
                    onContentChange={handleContentChange}
                  />
                </div>
              </div>
            </div>
          </div>
        </ResizablePanel>

        {/* Resizable handle (only shown when sidebar is open) */}
        {isChatOpen && <ResizableHandle withHandle />}

        {/* Chat sidebar panel */}
        {isChatOpen && (
          <ResizablePanel defaultSize={40} minSize={25} maxSize={60}>
            <DocumentChatSidebar
              documentId={document.id}
              documentTitle={title}
              documentContent={content}
              onToggle={() => setIsChatOpen(!isChatOpen)}
            />
          </ResizablePanel>
        )}
      </ResizablePanelGroup>
    </div>
  );
}
