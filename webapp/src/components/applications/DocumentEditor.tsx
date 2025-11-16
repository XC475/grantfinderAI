"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { SimpleEditor } from "@/components/tiptap-templates/simple/simple-editor";
import { useDocument } from "@/contexts/DocumentContext";
import "./editor-overrides.css";

interface Document {
  id: string;
  title: string;
  content?: string;
  contentType: string;
  version: number;
  createdAt: string;
  updatedAt: string;
  folderId?: string | null;
  applicationId?: string | null;
}

interface DocumentEditorProps {
  document: Document;
  onSave: (content: string) => Promise<void>;
  isSaving: boolean;
  organizationSlug: string;
}

export function DocumentEditor({
  document,
  onSave,
  isSaving,
  organizationSlug,
}: DocumentEditorProps) {
  const { setDocumentTitle, setDocumentContent, setSaveStatus } = useDocument();
  const router = useRouter();
  const [title, setTitle] = useState(document.title);
  const [content, setContent] = useState(() => {
    if (!document.content) return "";
    // Content is already in JSON format from database
    return document.content;
  });
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedContentRef = useRef(document.content || "");

  // Update context when title or content changes
  useEffect(() => {
    setDocumentTitle(title);
    setDocumentContent(content);
  }, [title, content, setDocumentTitle, setDocumentContent]);

  // Debounced auto-save (Google Docs style)
  useEffect(() => {
    // Clear any existing timeout
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }

    // Don't auto-save if there are no changes
    if (content === lastSavedContentRef.current) {
      return;
    }

    // Set status to unsaved
    setSaveStatus("unsaved");

    // Set up new timeout to save after 2 seconds of inactivity
    autoSaveTimeoutRef.current = setTimeout(() => {
      handleSave();
    }, 2000); // 2 seconds - Google Docs-style delay

    // Cleanup
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [content]); // Only trigger on content changes

  const handleSave = useCallback(async () => {
    if (content === lastSavedContentRef.current) return;

    setSaveStatus("saving");
    
    try {
      await onSave(content);
      lastSavedContentRef.current = content;
      setSaveStatus("saved");
      
      // Hide "saved" status after 2 seconds
      setTimeout(() => {
        if (content === lastSavedContentRef.current) {
          setSaveStatus("saved");
        }
      }, 2000);
    } catch (error) {
      console.error("Error saving document:", error);
      setSaveStatus("unsaved");
      toast.error("Failed to save document");
    }
  }, [content, onSave, setSaveStatus]);

  const handleContentChange = (newContent: string) => {
    setContent(newContent);
    // Auto-save logic is handled by useEffect with debouncing
  };

  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    // Title changes are handled separately if needed
  };

  return (
    <div className="h-full bg-white">
      {/* Main editor */}
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
    </div>
  );
}
