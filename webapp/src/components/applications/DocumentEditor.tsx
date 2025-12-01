"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { SimpleEditor } from "@/components/tiptap-templates/simple/simple-editor";
import { DocumentOutline } from "@/components/tiptap-ui/document-outline";
import { useDocument } from "@/contexts/DocumentContext";
import { useEditorInstance } from "@/contexts/EditorInstanceContext";
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
  const { setEditor } = useEditorInstance();
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

  const handleSelectionAddToChat = useCallback((text: string) => {
    console.log("📤 [DocumentEditor] handleSelectionAddToChat called with text:", text);
    window.dispatchEvent(
      new CustomEvent("editor-selection-add-to-chat", {
        detail: { text },
      })
    );
    console.log("📤 [DocumentEditor] Event dispatched: editor-selection-add-to-chat");
  }, []);

  const handleSelectionAskAI = useCallback((text: string) => {
    window.dispatchEvent(
      new CustomEvent("editor-selection-ask-ai", {
        detail: { text, prompt: `Tell me about this section: ${text}` },
      })
    );
  }, []);

  const handleSelectionImproveWriting = useCallback((text: string) => {
    window.dispatchEvent(
      new CustomEvent("editor-selection-improve-writing", {
        detail: { text, prompt: text },
      })
    );
  }, []);

  return (
    <div className="h-full bg-white flex overflow-hidden">
      {/* Main editor */}
      <div className="flex-1 h-full flex flex-col overflow-hidden min-w-0">
        <div className="flex-1 overflow-y-auto scroll-smooth">
          <div className="container max-w-4xl mx-auto px-8 pb-8">
            <div className="prose prose-lg max-w-none">
              <SimpleEditor
                initialContent={content}
                onContentChange={handleContentChange}
                onSelectionAddToChat={handleSelectionAddToChat}
                onSelectionAskAI={handleSelectionAskAI}
                onSelectionImproveWriting={handleSelectionImproveWriting}
                onEditorReady={setEditor}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Document Outline Sidebar */}
      <DocumentOutline />
    </div>
  );
}
