"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ChatDemo } from "@/components/chat/Chat";
import { Message } from "@/components/ui/chat-message";
import { Loading } from "@/components/ui/spinner";

interface ChatData {
  id: string;
  title: string;
  messages: {
    id: string;
    role: "USER" | "ASSISTANT";
    content: string;
    createdAt: string;
  }[];
}

export default function ChatPage() {
  const searchParams = useSearchParams();
  const chatId = searchParams.get("chatId");
  const initialMessage = searchParams.get("message");

  const [initialMessages, setInitialMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentChatId, setCurrentChatId] = useState<string | undefined>(
    chatId || undefined
  );
  const [messageToSend, setMessageToSend] = useState<string | null>(
    initialMessage
  );

  useEffect(() => {
    let pollInterval: NodeJS.Timeout | null = null;

    if (chatId) {
      setLoading(true);

      fetch(`/api/chats/${chatId}`)
        .then((res) => {
          if (!res.ok) {
            throw new Error("Chat not found");
          }
          return res.json();
        })
        .then((chat: ChatData) => {
          const messages: Message[] = chat.messages.map((msg) => ({
            id: msg.id,
            role: msg.role.toLowerCase() as "user" | "assistant",
            content: msg.content,
            createdAt: new Date(msg.createdAt),
          }));
          setInitialMessages(messages);
          setCurrentChatId(chat.id);

          // Check if last message is from user (pending response)
          const lastMessage = messages[messages.length - 1];
          if (lastMessage && lastMessage.role === "user") {
            // Poll for new messages every 2 seconds for up to 60 seconds
            let pollCount = 0;
            const maxPolls = 30; // 60 seconds

            pollInterval = setInterval(() => {
              pollCount++;

              fetch(`/api/chats/${chatId}`)
                .then((res) => res.json())
                .then((updatedChat: ChatData) => {
                  const updatedMessages: Message[] = updatedChat.messages.map(
                    (msg) => ({
                      id: msg.id,
                      role: msg.role.toLowerCase() as "user" | "assistant",
                      content: msg.content,
                      createdAt: new Date(msg.createdAt),
                    })
                  );

                  // Check if we got a new assistant message
                  const lastUpdatedMessage =
                    updatedMessages[updatedMessages.length - 1];
                  if (
                    lastUpdatedMessage &&
                    lastUpdatedMessage.role === "assistant"
                  ) {
                    setInitialMessages(updatedMessages);
                    if (pollInterval) clearInterval(pollInterval);
                  } else if (pollCount >= maxPolls) {
                    // Stop polling after max attempts
                    if (pollInterval) clearInterval(pollInterval);
                  }
                })
                .catch(() => {
                  if (pollInterval) clearInterval(pollInterval);
                });
            }, 2000);
          }
        })
        .catch((error) => {
          console.error("Error loading chat:", error);
          // If chat not found, start a new one
          setInitialMessages([]);
          setCurrentChatId(undefined);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      // No chatId means we're starting a new chat
      setInitialMessages([]);
      setCurrentChatId(undefined);
    }

    // Cleanup interval on unmount
    return () => {
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [chatId]);

  const handleChatIdChange = (newChatId: string) => {
    setCurrentChatId(newChatId);
    // Update URL without page refresh
    const url = new URL(window.location.href);
    url.searchParams.set("chatId", newChatId);
    window.history.replaceState({}, "", url.toString());
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <Loading message="Loading chat..." />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <ChatDemo
        initialMessages={initialMessages}
        chatId={currentChatId}
        onChatIdChange={handleChatIdChange}
        initialMessageToSend={messageToSend}
        onMessageSent={() => setMessageToSend(null)}
      />
    </div>
  );
}
