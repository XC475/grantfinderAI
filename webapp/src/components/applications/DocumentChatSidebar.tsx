"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DocumentSidebarChat } from "./DocumentSidebarChat";
import { Message } from "@/components/ui/chat-message";
import { useDocument } from "@/contexts/DocumentContext";

interface DocumentChatSidebarProps {
  documentId: string;
  onToggle: () => void;
}

export function DocumentChatSidebar({
  documentId,
  onToggle,
}: DocumentChatSidebarProps) {
  const { documentTitle, documentContent } = useDocument();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const hasAutoSent = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const handleInputChange = useCallback(
    (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      setInput(event.target.value);
    },
    []
  );

  const handleSubmit = useCallback(
    async (event?: { preventDefault?: () => void }) => {
      event?.preventDefault?.();

      if (!input.trim() || isLoading) return;

      const userMessage: Message = {
        id: `user-${Date.now()}`,
        role: "user",
        content: input.trim(),
        createdAt: new Date(),
      };

      // Add user message immediately
      setMessages((prev) => [...prev, userMessage]);
      setInput("");
      setIsLoading(true);
      console.log(
        "🔄 [DocumentChat] isLoading set to TRUE - stop button should appear"
      );

      // Create abort controller for this request
      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      try {
        // Convert messages to the format expected by the API
        const apiMessages = [...messages, userMessage].map((msg) => ({
          role: msg.role,
          content: msg.content,
        }));

        const response = await fetch("/api/chat/editor", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messages: apiMessages,
            documentId,
            documentTitle,
            documentContent,
          }),
          signal: abortController.signal,
        });

        if (!response.ok) {
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
    [input, messages, isLoading, documentId, documentTitle, documentContent]
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

  const handleSuggestedAction = (action: string) => {
    setInput(action);
    // Small delay to ensure the input is set before submitting
    setTimeout(() => {
      const fakeEvent = { preventDefault: () => {} };
      handleSubmit(fakeEvent);
    }, 100);
  };

  const isEmpty = messages.length === 0;

  const suggestedActions = [
    "Summarize this document for me",
    "Suggest sources for me to use with this document",
    "Create a list of action items in this document",
    "Summarize my sources",
  ];

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden min-h-0 p-1 pt-2">
        {isEmpty && (
          <div className="flex-shrink-0 p-4 overflow-y-auto">
            {/* Suggested actions when empty */}
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium mb-2">Suggested actions</h3>
                <div className="space-y-2">
                  {suggestedActions.map((action, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestedAction(action)}
                      className="w-full text-left text-sm p-3 rounded-md border hover:bg-muted/50 transition-colors"
                    >
                      {action}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sources section (placeholder) */}
              <div className="pt-4 border-t">
                <div className="flex items-center gap-2 p-3 rounded-md border">
                  <span className="text-sm font-medium">📄 Sources</span>
                </div>
              </div>
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
          />
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t text-center flex-shrink-0">
        <p className="text-xs text-muted-foreground mb-2">
          GrantWare can make mistakes. Please check responses.
        </p>
        <Button variant="ghost" size="sm" className="h-8">
          <Settings className="h-3 w-3 mr-1" />
          Settings
        </Button>
      </div>
    </div>
  );
}
