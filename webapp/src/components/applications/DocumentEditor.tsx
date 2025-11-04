"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Save, Loader2, PanelLeft } from "lucide-react";
import { SimpleEditor } from "@/components/tiptap-templates/simple/simple-editor";
import { DocumentChatSidebar } from "./DocumentChatSidebar";
import { CollaborationHeader } from "./CollaborationHeader";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import { cn } from "@/lib/utils";
import { generateUserColor } from "@/lib/user-colors";
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

interface User {
  id: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
}

interface DocumentEditorProps {
  document: Document;
  applicationId: string;
  organizationSlug: string;
  onSave: (content: string) => Promise<void>;
  isSaving: boolean;
  currentUser?: User;
  enableCollaboration?: boolean;
}

export function DocumentEditor({
  document,
  applicationId,
  organizationSlug,
  onSave,
  isSaving,
  currentUser,
  enableCollaboration = true,
}: DocumentEditorProps) {
  const [title, setTitle] = useState(document.title);
  const [content, setContent] = useState(document.content || "");
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(true);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [isCollaborationReady, setIsCollaborationReady] = useState(false);
  const [activeUsers, setActiveUsers] = useState<any[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  // Get Supabase auth token for WebSocket connection
  useEffect(() => {
    async function getAuthToken() {
      console.log("🔑 [Collaboration] Fetching auth token...");
      try {
        // Get token from cookie
        const response = await fetch("/api/auth/token");
        if (response.ok) {
          const { token } = await response.json();
          console.log("✅ [Collaboration] Auth token received");
          setAuthToken(token);
          setIsCollaborationReady(true);
        } else {
          console.error(
            "❌ [Collaboration] Failed to fetch token:",
            response.status
          );
        }
      } catch (error) {
        console.error("❌ [Collaboration] Failed to get auth token:", error);
        // Collaboration will be disabled if token fetch fails
      }
    }

    if (enableCollaboration && currentUser) {
      console.log(
        "🚀 [Collaboration] Initializing collaboration for user:",
        currentUser.email
      );
      getAuthToken();
    } else {
      console.log("⚠️ [Collaboration] Not initializing:", {
        enableCollaboration,
        hasCurrentUser: !!currentUser,
      });
    }
  }, [enableCollaboration, currentUser]);

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

  // Prepare collaboration config if enabled and ready
  const collaborationConfig =
    enableCollaboration && isCollaborationReady && currentUser && authToken
      ? {
          documentId: document.id,
          user: {
            id: currentUser.id,
            name: currentUser.name || currentUser.email,
            color: generateUserColor(currentUser.id),
            avatar: currentUser.avatarUrl,
          },
          websocketUrl: process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:4000",
          authToken,
          onConnectionStatusChange: (connected: boolean) => {
            console.log(
              `🔗 [DocumentEditor] Connection status changed: ${connected}`
            );
            setIsConnected(connected);
          },
          onActiveUsersChange: (users: any[]) => {
            console.log(
              `👥 [DocumentEditor] Active users updated:`,
              users.length
            );
            setActiveUsers(users);
          },
        }
      : undefined;

  // Debug log
  useEffect(() => {
    console.log("📋 [Collaboration] Config status:", {
      enableCollaboration,
      isCollaborationReady,
      hasCurrentUser: !!currentUser,
      hasAuthToken: !!authToken,
      hasConfig: !!collaborationConfig,
      documentId: document.id,
      websocketUrl: process.env.NEXT_PUBLIC_WS_URL,
    });
    if (collaborationConfig) {
      console.log("📋 [Collaboration] Full config:", collaborationConfig);
    }
  }, [
    enableCollaboration,
    isCollaborationReady,
    currentUser,
    authToken,
    collaborationConfig,
  ]);

  return (
    <div className="h-full bg-background relative">
      {/* Floating action buttons - top right */}
      <div className="fixed top-20 right-6 z-40 flex items-center gap-2">
        {!enableCollaboration && hasUnsavedChanges && (
          <span className="text-sm text-muted-foreground whitespace-nowrap bg-background/95 backdrop-blur-sm px-3 py-1.5 rounded-md border shadow-sm">
            • Unsaved
          </span>
        )}
        {!enableCollaboration && hasUnsavedChanges && (
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
            {/* Collaboration Header */}
            {enableCollaboration && currentUser && (
              <CollaborationHeader
                users={activeUsers}
                currentUserId={currentUser.id}
                isConnected={isConnected}
              />
            )}

            <div className="flex-1 overflow-y-auto">
              <div className="container max-w-4xl mx-auto px-8 pb-8">
                <div className="prose prose-lg max-w-none">
                  <SimpleEditor
                    initialContent={content}
                    onContentChange={handleContentChange}
                    collaborationConfig={collaborationConfig}
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
            <div className="relative h-full">
              {/* Toggle sidebar button - sticky to left edge of sidebar */}
              <div className="absolute top-2 ml-2 mt-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsChatOpen(!isChatOpen)}
                  className="size-7 bg-background/95"
                >
                  <PanelLeft className="h-4 w-4 transition-transform rotate-180" />
                  <span className="sr-only">Toggle Assistant Sidebar</span>
                </Button>
              </div>
              <DocumentChatSidebar
                documentId={document.id}
                documentTitle={title}
                documentContent={content}
                onToggle={() => setIsChatOpen(!isChatOpen)}
              />
            </div>
          </ResizablePanel>
        )}

        {/* Toggle button when sidebar is closed */}
        {!isChatOpen && (
          <div className="fixed top-20 right-4 z-40">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsChatOpen(!isChatOpen)}
              className="size-7 bg-background/95 backdrop-blur-sm border shadow-sm"
            >
              <PanelLeft className="h-4 w-4 transition-transform" />
              <span className="sr-only">Toggle Assistant Sidebar</span>
            </Button>
          </div>
        )}
      </ResizablePanelGroup>
    </div>
  );
}
