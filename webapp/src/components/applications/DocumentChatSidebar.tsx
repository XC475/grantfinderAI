"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { DocumentSidebarChat } from "./DocumentSidebarChat";
import { Message } from "@/components/chat/chat-message";
import { useDocument } from "@/contexts/DocumentContext";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { History, Plus, ChevronDown, FileText, PanelRight } from "lucide-react";
import { SourcesModal, type SourceDocument } from "@/components/chat/SourcesModal";
import { AISettingsDropdown } from "@/components/chat/ai-settings-dropdown";
import { ModelSelector } from "@/components/chat/model-selector";
import { validateMultipleFiles } from "@/lib/clientUploadValidation";
import { useAISettings } from "@/hooks/use-ai-settings";
import { useSubscription } from "@/hooks/use-subscription";

interface FileAttachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  extractedText?: string;
}

interface TextSelectionAttachment {
  id: string;
  name: string;  // e.g., "Selected text from [Doc Name]"
  type: 'text/selection';
  content: string;  // The actual selected text
  preview: string;  // First 40 chars for display
}

interface DocumentChatSidebarProps {
  documentId: string;
  onToggleSidebar?: () => void;
}

interface ChatSession {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messageCount: number;
}

interface ChatMessageResponse {
  id: string;
  role: string;
  content: string;
  createdAt: string;
  metadata?: {
    attachments?: FileAttachment[] | null;
  } | null;
}

export function DocumentChatSidebar({ documentId, onToggleSidebar }: DocumentChatSidebarProps) {
  const { documentTitle, documentContent } = useDocument();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [chatId, setChatId] = useState<string | null>(null);
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [sourceDocuments, setSourceDocuments] = useState<SourceDocument[]>([]);
  const [textAttachments, setTextAttachments] = useState<TextSelectionAttachment[]>([]);
  const [sourcesModalOpen, setSourcesModalOpen] = useState(false);
  const [organizationId, setOrganizationId] = useState<string | undefined>(undefined);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Get AI settings and subscription
  const { settings, changeModel, loading: loadingAISettings } = useAISettings();
  const { tier, loading: loadingSubscription } = useSubscription(organizationId);

  // Fetch organization ID from document
  useEffect(() => {
    const fetchOrgId = async () => {
      try {
        const response = await fetch(`/api/documents/${documentId}`);
        if (response.ok) {
          const data = await response.json();
          // Get organizationId from document (via application or direct)
          const orgId = data.organizationId || data.application?.organizationId;
          if (orgId) {
            setOrganizationId(orgId);
          }
        }
      } catch (error) {
        console.error("Error fetching organization ID:", error);
      }
    };
    if (documentId) {
      fetchOrgId();
    }
  }, [documentId]);

  const loadChatSessions = useCallback(async () => {
    try {
      setLoadingSessions(true);
      const response = await fetch(
        `/api/chats/editor?documentId=${documentId}`
      );
      if (response.ok) {
        const data = await response.json();
        setChatSessions(data.chats || []);
      }
    } catch (error) {
      console.error("Error loading chat sessions:", error);
    } finally {
      setLoadingSessions(false);
    }
  }, [documentId]);

  const loadChatSession = useCallback(
    async (sessionId: string) => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/chats/editor/${sessionId}`);
        if (response.ok) {
          const data = await response.json();
          const loadedMessages: Message[] = data.chat.messages.map(
            (msg: ChatMessageResponse) => ({
              id: msg.id,
              role: msg.role.toLowerCase() as "user" | "assistant",
              content: msg.content,
              createdAt: new Date(msg.createdAt),
              experimental_attachments: msg.metadata?.attachments ?? undefined,
            })
          );
          setMessages(loadedMessages);
          setChatId(sessionId);

          // Save to localStorage for persistence across refreshes
          const lastChatKey = `lastEditorChat_${documentId}`;
          localStorage.setItem(lastChatKey, sessionId);

          console.log("💬 [DocumentChat] Loaded chat session:", sessionId);
        }
      } catch (error) {
        console.error("Error loading chat session:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [documentId]
  );

  // Load chat sessions on mount (do not auto-restore — user can select from history)
  useEffect(() => {
    const loadSessions = async () => {
      try {
        setLoadingSessions(true);
        const response = await fetch(
          `/api/chats/editor?documentId=${documentId}`
        );
        if (response.ok) {
          const data = await response.json();
          const sessions = data.chats || [];
          setChatSessions(sessions);
          // Start on default screen (empty messages, no chatId)
          // User can load prior sessions from the history dropdown
        }
      } catch (error) {
        console.error("Error loading chat sessions:", error);
      } finally {
        setLoadingSessions(false);
      }
    };

    loadSessions();
  }, [documentId]);

  const startNewChat = () => {
    setMessages([]);
    setChatId(null);

    // Clear the last active chat from localStorage
    const lastChatKey = `lastEditorChat_${documentId}`;
    localStorage.removeItem(lastChatKey);

    console.log("💬 [DocumentChat] Starting new chat session");
  };

  const handleInputChange = useCallback(
    (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      setInput(event.target.value);
    },
    []
  );

  const handleSubmit = useCallback(
    async (
      event?: { preventDefault?: () => void },
      options?: { experimental_attachments?: FileList }
    ) => {
      event?.preventDefault?.();

      // Allow sending if there's text OR attachments
      const hasText = input.trim().length > 0;
      const hasAttachments =
        options?.experimental_attachments &&
        options.experimental_attachments.length > 0;

      if (!hasText && !hasAttachments) return;
      if (isLoading) return;

      setIsLoading(true);
      console.log("🔄 [DocumentChat] Upload started - loading state enabled");

      // Handle file attachments if present
      let attachments: FileAttachment[] | undefined;
      if (
        options?.experimental_attachments &&
        options.experimental_attachments.length > 0
      ) {
        // Validate files before upload
        const files = Array.from(options.experimental_attachments);
        const validation = validateMultipleFiles(files, "document");

        if (!validation.allValid) {
          setIsLoading(false);
          const errorMessage: Message = {
            id: `error-${Date.now()}`,
            role: "assistant",
            content: `Unable to upload files:\n${validation.errors.join("\n")}`,
            createdAt: new Date(),
          };
          setMessages((prev) => [...prev, errorMessage]);
          return;
        }

        try {
          console.log(
            "📤 [DocumentChat] Uploading files...",
            options.experimental_attachments.length
          );
          const formData = new FormData();
          files.forEach((file) => {
            formData.append("files", file);
          });

          const uploadResponse = await fetch("/api/chat/upload", {
            method: "POST",
            body: formData,
          });

          if (!uploadResponse.ok) {
            const errorText = await uploadResponse.text();
            console.error("Upload failed:", errorText);
            throw new Error("Failed to upload files");
          }

          const uploadResult = await uploadResponse.json();
          attachments = uploadResult.files;
          console.log(
            "✅ [DocumentChat] Files uploaded successfully:",
            attachments?.length || 0
          );
        } catch (error) {
          console.error("Error uploading files:", error);
          setIsLoading(false);
          const errorMessage: Message = {
            id: `error-${Date.now()}`,
            role: "assistant",
            content:
              "Sorry, there was an error uploading your files. Please try again.",
            createdAt: new Date(),
          };
          setMessages((prev) => [...prev, errorMessage]);
          return;
        }
      }

      // Convert text attachments to file attachment format for the API
      const textAsAttachments: FileAttachment[] = textAttachments.map((att) => ({
        id: att.id,
        name: att.name,
        type: att.type,
        size: att.content.length,
        url: "",
        extractedText: att.content,
      }));

      // Combine file attachments with text selection attachments
      const allAttachments = [
        ...(attachments || []),
        ...textAsAttachments,
      ];

      const userMessage: Message = {
        id: `user-${Date.now()}`,
        role: "user",
        content: input.trim() || (allAttachments.length > 0 ? "(Sent attachments)" : ""),
        createdAt: new Date(),
        experimental_attachments: allAttachments.length > 0 ? allAttachments : undefined,
      };

      // Add user message immediately (after upload completes)
      setMessages((prev) => [...prev, userMessage]);
      setInput("");
      setTextAttachments([]); // Clear text attachments after sending
      setSourceDocuments([]); // Clear source documents after sending
      console.log("💬 [DocumentChat] Message added to chat - sending to AI");

      // Create abort controller for this request
      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      try {
        // Convert messages to the format expected by the API
        const apiMessages = [...messages, userMessage].map((msg) => ({
          role: msg.role,
          content: msg.content,
          attachments: msg.experimental_attachments,
        }));

        const response = await fetch("/api/ai/editor-assistant", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messages: apiMessages,
            documentId,
            documentTitle,
            documentContent,
            chatId,
            sourceDocumentIds: sourceDocuments.map((doc) => doc.id),
            selectedModel: settings?.selectedModelEditor || "gpt-4o-mini",
          }),
          signal: abortController.signal,
        });

        // Extract chatId from response header if this is a new chat
        if (!chatId) {
          const newChatId = response.headers.get("X-Chat-Id");
          if (newChatId) {
            setChatId(newChatId);

            // Save to localStorage for persistence
            const lastChatKey = `lastEditorChat_${documentId}`;
            localStorage.setItem(lastChatKey, newChatId);

            console.log(
              "💬 [DocumentChat] New chat created with ID:",
              newChatId
            );
            // Reload sessions to include new chat
            loadChatSessions();
          }
        }

        if (!response.ok) {
          // Handle model access errors
          if (response.status === 403) {
            const errorData = await response.json().catch(() => ({}));
            const errorMessage: Message = {
              id: `error-${Date.now()}`,
              role: "assistant",
              content: `This model requires a ${errorData.requiredTier || "higher"} subscription. Your current plan is ${errorData.currentTier || "free"}. Please upgrade or select a different model.`,
              createdAt: new Date(),
            };
            setMessages((prev) => [...prev, errorMessage]);
            setIsLoading(false);
            return;
          }

          if (response.status === 429) {
            const errorData = await response.json().catch(() => ({}));
            const errorMessage: Message = {
              id: `error-${Date.now()}`,
              role: "assistant",
              content: `Monthly usage limit reached (${errorData.usageCount || 0}/${errorData.monthlyLimit || "?"} requests). Please wait until next month or upgrade your plan.`,
              createdAt: new Date(),
            };
            setMessages((prev) => [...prev, errorMessage]);
            setIsLoading(false);
            return;
          }

          throw new Error(`API responded with status: ${response.status}`);
        }

        // Handle streaming responses
        const reader = response.body?.getReader();
        if (!reader) {
          throw new Error("No response body");
        }

        let fullContent = "";
        let displayedContent = "";
        let isStreamComplete = false;
        let isCancelled = false;

        const assistantMessage: Message = {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content: "",
          createdAt: new Date(),
        };

        // Add empty assistant message immediately
        setMessages((prev) => [...prev, assistantMessage]);

        // Listen for abort event to immediately cancel reader
        abortController.signal.addEventListener("abort", () => {
          console.log("Abort signal received");
          isCancelled = true;
          reader.cancel().catch(console.error);
        });

        // Smooth character-by-character display
        const smoothDisplay = async () => {
          while (
            (!isStreamComplete && !isCancelled) ||
            (displayedContent.length < fullContent.length && !isCancelled)
          ) {
            if (displayedContent.length < fullContent.length) {
              // Display next few characters for smoother feel
              const charsToAdd = Math.min(
                2,
                fullContent.length - displayedContent.length
              );
              displayedContent = fullContent.slice(
                0,
                displayedContent.length + charsToAdd
              );

              setMessages((prev) =>
                prev.map((msg) =>
                  msg.id === assistantMessage.id
                    ? { ...msg, content: displayedContent }
                    : msg
                )
              );

              // Adjust this delay for speed (lower = faster)
              await new Promise((resolve) => setTimeout(resolve, 15));
            } else {
              await new Promise((resolve) => setTimeout(resolve, 50));
            }
          }
        };

        // Start smooth display
        smoothDisplay();

        try {
          while (true && !isCancelled) {
            const { done, value } = await reader.read();
            if (done) {
              isStreamComplete = true;
              break;
            }

            const chunk = new TextDecoder().decode(value);
            fullContent += chunk;
          }
        } finally {
          reader.releaseLock();
        }
      } catch (error) {
        // Check if the error is from abort
        if (error instanceof Error && error.name === "AbortError") {
          console.log("Stream aborted by user");
          // Don't show error message for user-initiated stops
        } else {
          console.error("Error calling editor chat API:", error);
          // Add error message
          const errorMessage: Message = {
            id: `error-${Date.now()}`,
            role: "assistant",
            content:
              "Sorry, there was an error processing your request. Please try again.",
            createdAt: new Date(),
          };
          setMessages((prev) => [...prev, errorMessage]);
        }
      } finally {
        setIsLoading(false);
        abortControllerRef.current = null;
      }
    },
    [
      input,
      messages,
      isLoading,
      documentId,
      documentTitle,
      documentContent,
      chatId,
      loadChatSessions,
      textAttachments,
      sourceDocuments,
    ]
  );

  const stop = useCallback(() => {
    console.log("🛑 [DocumentChat] Stop button clicked");
    // Abort the ongoing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsLoading(false);
    console.log(
      "🔄 [DocumentChat] isLoading set to FALSE - stop button should hide"
    );
  }, []);

  // Listen for editor selection events (must be after handleSubmit is defined)
  useEffect(() => {
    console.log("🎧 [DocumentChatSidebar] Setting up event listeners, documentTitle:", documentTitle);
    
    const handleAddToChat = (event: CustomEvent<{ text: string }>) => {
      console.log("📥 [DocumentChatSidebar] handleAddToChat event received:", event.detail);
      const { text } = event.detail;
      
      // Create text selection attachment
      const attachment: TextSelectionAttachment = {
        id: `text-${Date.now()}`,
        name: `Selected text from ${documentTitle}`,
        type: 'text/selection',
        content: text,
        preview: text.slice(0, 40) + (text.length > 40 ? '...' : ''),
      };
      
      console.log("📎 [DocumentChatSidebar] Created text attachment:", attachment);
      setTextAttachments(prev => {
        const newAttachments = [...prev, attachment];
        console.log("📎 [DocumentChatSidebar] Updated textAttachments:", newAttachments);
        return newAttachments;
      });
      // Don't modify input - let user type their question
    };

    const handleAskAI = (event: CustomEvent<{ text: string; prompt: string }>) => {
      const { prompt } = event.detail;
      setInput(prompt);
      // Auto-submit after a short delay to ensure input is set
      setTimeout(() => {
        const fakeEvent = { preventDefault: () => {} };
        handleSubmit(fakeEvent);
      }, 100);
    };

    const handleImproveWriting = (event: CustomEvent<{ text: string; prompt: string }>) => {
      const { prompt } = event.detail;
      setInput(prompt);
      // Auto-submit after a short delay to ensure input is set
      setTimeout(() => {
        const fakeEvent = { preventDefault: () => {} };
        handleSubmit(fakeEvent);
      }, 100);
    };

    window.addEventListener("editor-selection-add-to-chat", handleAddToChat as EventListener);
    window.addEventListener("editor-selection-ask-ai", handleAskAI as EventListener);
    window.addEventListener("editor-selection-improve-writing", handleImproveWriting as EventListener);

    return () => {
      window.removeEventListener("editor-selection-add-to-chat", handleAddToChat as EventListener);
      window.removeEventListener("editor-selection-ask-ai", handleAskAI as EventListener);
      window.removeEventListener("editor-selection-improve-writing", handleImproveWriting as EventListener);
    };
  }, [handleSubmit, documentTitle]);

  const handleSuggestedAction = (action: string) => {
    setInput(action);
    // Fill only - user can edit before sending
  };

  const isEmpty = messages.length === 0;

  const suggestedActions = [
    "Summarize this document",
    "Create an outline for this section",
    "Strengthen the case for support",
    "Identify missing requirements",
    "Tighten and reduce word count",
    "Improve clarity and flow",
    "Extract key action items",
    "Check for consistency issues",
  ];

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header with chat title and icon buttons */}
      <div className="flex h-16 shrink-0 items-center gap-2 px-3 border-b bg-background">
        {/* Left: Current chat title */}
        <div className="flex-1 min-w-0">
          {chatId ? (
            <span className="text-sm font-medium text-foreground truncate block">
              {chatSessions.find((s) => s.id === chatId)?.title || "Chat"}
            </span>
          ) : (
            <span className="text-sm text-muted-foreground">New chat</span>
          )}
        </div>

        {/* Right: Icon buttons */}
        {/* History dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              disabled={loadingSessions}
            >
              <History className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64">
            {chatSessions.length === 0 ? (
              <div className="px-2 py-4 text-sm text-muted-foreground text-center">
                No previous sessions
              </div>
            ) : (
              chatSessions.map((session) => (
                <DropdownMenuItem
                  key={session.id}
                  onClick={() => loadChatSession(session.id)}
                  className="flex flex-col items-start py-2"
                >
                  <div className="font-medium text-sm truncate w-full">
                    {session.title}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(session.createdAt).toLocaleDateString()} •{" "}
                    {session.messageCount} messages
                  </div>
                </DropdownMenuItem>
              ))
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* New chat button */}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={startNewChat}
        >
          <Plus className="h-4 w-4" />
        </Button>

        {/* Panel toggle button */}
        {onToggleSidebar && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={onToggleSidebar}
          >
            <PanelRight className="h-4 w-4 rotate-180" />
            <span className="sr-only">Close Assistant Sidebar</span>
          </Button>
        )}
      </div>

      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden min-h-0 p-1 pt-2">
        {isEmpty && (
          <div className="flex-shrink-0 p-4 overflow-y-auto">
            {/* Quick actions: Add sources, AI capabilities, Suggested prompts */}
            <div className="space-y-3">
              {/* Add sources button */}
              <Button
                variant="outline"
                className="w-full justify-start gap-2 text-sm font-normal"
                onClick={() => setSourcesModalOpen(true)}
              >
                <FileText className="h-4 w-4" />
                <span>Add sources</span>
              </Button>

              {/* AI capabilities dropdown */}
              <AISettingsDropdown
                assistantType="editor"
                size="small"
                align="start"
                triggerVariant="button"
                triggerLabel="AI capabilities"
              />

              {/* Suggested prompts dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-between text-sm font-normal"
                  >
                    <span>Suggested prompts</span>
                    <ChevronDown className="h-4 w-4 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-[var(--radix-dropdown-menu-trigger-width)]">
                  {suggestedActions.map((action, index) => (
                    <DropdownMenuItem
                      key={index}
                      onClick={() => handleSuggestedAction(action)}
                      className="cursor-pointer"
                    >
                      {action}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        )}

        <div className="flex-1 flex flex-col min-w-0 min-h-0">
          <DocumentSidebarChat
            className="flex-1 min-w-0"
            messages={messages}
            handleSubmit={handleSubmit}
            input={input}
            handleInputChange={handleInputChange}
            isGenerating={isLoading}
            stop={stop}
            setMessages={setMessages}
            isEmpty={isEmpty}
            placeholder="How can I help you with this document?"
            sourceDocuments={sourceDocuments}
            onSourceDocumentsChange={setSourceDocuments}
            textAttachments={textAttachments}
            onRemoveTextAttachment={(index) => {
              console.log("🗑️ [DocumentChatSidebar] Removing text attachment at index:", index);
              setTextAttachments(prev => prev.filter((_, i) => i !== index));
            }}
            sourcesModalOpen={sourcesModalOpen}
            setSourcesModalOpen={setSourcesModalOpen}
            showEmptyHero
            selectedModel={settings?.selectedModelEditor || "gpt-4o-mini"}
            onModelChange={settings ? (modelId) => changeModel("editor", modelId) : undefined}
            userTier={tier}
            enabledModelIds={settings?.enabledModelsEditor || null}
            loadingModelSettings={loadingAISettings || loadingSubscription}
          />
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t text-center flex-shrink-0">
        <p className="text-xs text-muted-foreground">
          GrantWare can make mistakes. Please check responses.
        </p>
      </div>
    </div>
  );
}
