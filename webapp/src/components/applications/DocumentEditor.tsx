"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Save, Loader2 } from "lucide-react";
import { SimpleEditor } from "@/components/tiptap-templates/simple/simple-editor";
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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b">
        <div className="container max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Input
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  className="text-lg font-semibold border-none shadow-none px-0"
                  placeholder="Document title..."
                />
                {hasUnsavedChanges && (
                  <span className="text-sm text-muted-foreground">
                    • Unsaved
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {hasUnsavedChanges && (
                <Button
                  variant="outline"
                  onClick={handleSave}
                  disabled={isSaving}
                  className="h-8"
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
          </div>
        </div>
      </div>

      {/* Editor */}
      <div className="container max-w-6xl mx-auto px-4 py-8">
        <div className="prose max-w-none">
          <SimpleEditor
            initialContent={content}
            onContentChange={handleContentChange}
          />
        </div>
      </div>
    </div>
  );
}
