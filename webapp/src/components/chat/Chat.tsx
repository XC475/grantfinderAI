"use client";

import { useState, useCallback, useEffect, useRef } from "react";

import { cn } from "@/lib/utils";
import { Chat } from "@/components/ui/chat";
import { Message } from "@/components/ui/chat-message";

type ChatDemoProps = {
  initialMessages?: Message[];
  chatId?: string;
  onChatIdChange?: (chatId: string) => void;
  initialMessageToSend?: string | null;
  onMessageSent?: () => void;
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
  const hasAutoSent = useRef(false);

  // Update messages when initialMessages prop changes (e.g., when navigating between chats)
  useEffect(() => {
    setMessages(props.initialMessages || []);
  }, [props.initialMessages]);

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

      try {
        // Convert messages to the format expected by your API
        const apiMessages = [...messages, userMessage].map((msg) => ({
          role: msg.role,
          content: msg.content,
        }));

        const response = await fetch("/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messages: apiMessages,
            chatId: chatId,
          }),
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

        let assistantContent = "";
        const assistantMessage: Message = {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content: "",
          createdAt: new Date(),
        };

        // Add empty assistant message immediately
        setMessages((prev) => [...prev, assistantMessage]);

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = new TextDecoder().decode(value);
            assistantContent += chunk;

            // Update the assistant message with the new content
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === assistantMessage.id
                  ? { ...msg, content: assistantContent }
                  : msg
              )
            );
          }

          // After streaming is complete, notify sidebar to refresh (for message count and timestamp)
          window.dispatchEvent(
            new CustomEvent("chatUpdated", {
              detail: { chatId: chatId },
            })
          );
        } finally {
          reader.releaseLock();
        }
      } catch (error) {
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
      } finally {
        setIsLoading(false);
      }
    },
    [input, messages, isLoading, chatId, props]
  );

  const stop = useCallback(() => {
    setIsLoading(false);
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
        isEmpty
          ? "h-[50vh] w-full max-w-5xl mx-auto"
          : "h-[calc(100vh-80px)] w-full"
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
        suggestions={[
          "Find grants for improving student achievement in our district",
          "Help me find grants for teacher professional development",
          "Search for grants to support special education services",
        ]}
      />
    </div>
  );
}

// Export with the original name for backward compatibility
export const ChatComponent = ChatDemo;
