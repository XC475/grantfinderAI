"use client";

import { useState, useCallback, useEffect, useRef } from "react";

import { cn } from "@/lib/utils";
import { Chat } from "@/components/chat/chat-container";
import { Message } from "@/components/chat/chat-message";
import { type SourceDocument } from "@/components/chat/SourcesModal";
import { validateMultipleFiles } from "@/lib/clientUploadValidation";
import { useAISettings } from "@/hooks/use-ai-settings";
import { useSubscription } from "@/hooks/use-subscription";
import { useParams } from "next/navigation";

interface FileAttachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  extractedText?: string;
}

type ChatDemoProps = {
  initialMessages?: Message[];
  chatId?: string;
  onChatIdChange?: (chatId: string) => void;
  initialMessageToSend?: string | null;
  onMessageSent?: () => void;
  userName?: string;
  initialSourceDocuments?: SourceDocument[];
};

export function ChatDemo(props: ChatDemoProps) {
  const [messages, setMessages] = useState<Message[]>(
    props.initialMessages || []
  );
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [chatId, setChatId] = useState(
    () => props.chatId || `chat_${Date.now()}`
  );
  const [sourceDocuments, setSourceDocuments] = useState<SourceDocument[]>(
    props.initialSourceDocuments || []
  );
  const hasAutoSent = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Get organization ID and subscription info
  const { slug: organizationSlug } = useParams<{ slug: string }>();
  const [organizationId, setOrganizationId] = useState<string | undefined>(undefined);
  const { settings, loading: loadingAISettings, changeModel } = useAISettings();
  const { tier, loading: loadingSubscription } = useSubscription(organizationId);

  // Fetch organization ID from slug
  useEffect(() => {
    const fetchOrgId = async () => {
      try {
        const response = await fetch(`/api/organizations?slug=${organizationSlug}`);
        if (response.ok) {
          const data = await response.json();
          if (data.id) {
            setOrganizationId(data.id);
          }
        }
      } catch (error) {
        console.error("Error fetching organization ID:", error);
      }
    };
    if (organizationSlug) {
      fetchOrgId();
    }
  }, [organizationSlug]);

  // Update messages when initialMessages prop changes (e.g., when navigating between chats)
  useEffect(() => {
    setMessages(props.initialMessages || []);
  }, [props.initialMessages]);

  // Update source documents when initialSourceDocuments prop changes
  useEffect(() => {
    setSourceDocuments(props.initialSourceDocuments || []);
  }, [props.initialSourceDocuments]);

  // Update chatId when prop changes
  useEffect(() => {
    if (props.chatId) {
      setChatId(props.chatId);
    } else {
      // Generate new chat ID when switching to a new chat
      setChatId(`chat_${Date.now()}`);
    }
  }, [props.chatId]);

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

      // Set loading state immediately to prevent double submission
      setIsLoading(true);
      console.log("🔄 [Chat] Upload started - loading state enabled");

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
            "📤 [Chat] Uploading files...",
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
            "✅ [Chat] Files uploaded successfully:",
            attachments?.length || 0
          );
        } catch (error) {
          console.error("Error uploading files:", error);
          setIsLoading(false);
          // Show error message
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

      const userMessage: Message = {
        id: `user-${Date.now()}`,
        role: "user",
        content: input.trim() || "(Sent files)", // Use placeholder if no text
        createdAt: new Date(),
        experimental_attachments: attachments,
      };

      // Add user message immediately (after upload completes)
      setMessages((prev) => [...prev, userMessage]);
      setInput("");
      console.log("💬 [Chat] Message added to chat - sending to AI");

      // Create abort controller for this request
      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      try {
        // Convert messages to the format expected by your API
        const apiMessages = [...messages, userMessage].map((msg) => ({
          role: msg.role,
          content: msg.content,
          attachments: msg.experimental_attachments,
        }));

        const response = await fetch("/api/ai/chat-assistant", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messages: apiMessages,
            chatId: chatId,
            sourceDocumentIds: sourceDocuments.map((doc) => doc.id),
            selectedModel: settings?.selectedModelChat || "gpt-4o-mini",
          }),
          signal: abortController.signal,
        });

        if (!response.ok) {
          throw new Error(`API responded with status: ${response.status}`);
        }

        // Get chat ID from response headers (for new chats)
        const responseChatId = response.headers.get("X-Chat-Id");
        if (responseChatId && responseChatId !== chatId) {
          setChatId(responseChatId);
          props.onChatIdChange?.(responseChatId);

          // Dispatch event to notify sidebar that a new chat was created
          window.dispatchEvent(
            new CustomEvent("chatCreated", {
              detail: { chatId: responseChatId },
            })
          );
        }

        // Handle streaming response
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

          // After streaming is complete, notify sidebar to refresh (for message count and timestamp)
          // Only notify if not cancelled
          if (!isCancelled) {
            window.dispatchEvent(
              new CustomEvent("chatUpdated", {
                detail: { chatId: chatId },
              })
            );
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
          console.error("Error calling chat API:", error);
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
    [input, messages, isLoading, chatId, props]
  );

  const stop = useCallback(() => {
    console.log("🛑 [Chat] Stop button clicked");
    // Abort the ongoing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsLoading(false);
    console.log("🔄 [Chat] isLoading set to FALSE - stop button should hide");
  }, []);

  const append = useCallback(
    (message: { role: "user"; content: string }) => {
      setInput(message.content);
      handleSubmit();
    },
    [handleSubmit]
  );

  // Auto-send initial message if provided (placed after handleSubmit is defined)
  useEffect(() => {
    if (props.initialMessageToSend && !isLoading && !hasAutoSent.current) {
      hasAutoSent.current = true;
      setInput(props.initialMessageToSend);
      // Small delay to ensure the input is set before submitting
      setTimeout(() => {
        const fakeEvent = { preventDefault: () => {} };
        handleSubmit(fakeEvent);
        props.onMessageSent?.();
      }, 100);
    }
  }, [props.initialMessageToSend, isLoading, handleSubmit, props]);

  const isEmpty = messages.length === 0;

  return (
    <div
      className={cn(
        "flex",
        "flex-col",
        isEmpty ? "min-h-[90vh] w-full" : "h-[calc(100vh-24px)] w-full"
      )}
    >
      <Chat
        className="grow"
        messages={messages}
        handleSubmit={handleSubmit}
        input={input}
        handleInputChange={handleInputChange}
        isGenerating={isLoading}
        stop={stop}
        append={append}
        setMessages={setMessages}
        isEmpty={isEmpty}
        userName={props.userName}
        sourceDocuments={sourceDocuments}
        onSourceDocumentsChange={setSourceDocuments}
        selectedModel={settings?.selectedModelChat || "gpt-4o-mini"}
        onModelChange={settings ? (modelId) => changeModel("chat", modelId) : undefined}
        userTier={tier}
        enabledModelIds={settings?.enabledModelsChat || null}
        loadingModelSettings={loadingAISettings || loadingSubscription}
        suggestions={[
          "Find grants for improving community programs in our organization",
          "Help me find grants for teacher professional development",
          "Search for grants to support special education services",
        ]}
      />
    </div>
  );
}

// Export with the original name for backward compatibility
export const ChatComponent = ChatDemo;
