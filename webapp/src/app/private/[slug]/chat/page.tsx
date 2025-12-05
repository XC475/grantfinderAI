"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ChatDemo } from "@/components/chat/Chat";
import { Message } from "@/components/chat/chat-message";
import { Loading } from "@/components/ui/spinner";
import { type SourceDocument } from "@/components/chat/SourcesModal";

interface ChatData {
  id: string;
  title: string;
  messages: {
    id: string;
    role: "USER" | "ASSISTANT";
    content: string;
    createdAt: string;
    metadata?: {
      attachments?: {
        id?: string;
        name?: string;
        type?: string;
        size?: number;
        url: string;
        extractedText?: string;
        contentType?: string;
      }[];
      sourceDocuments?: string[];
    } | null;
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
  const [userName, setUserName] = useState<string>("");
  const [initialSourceDocuments, setInitialSourceDocuments] = useState<
    SourceDocument[]
  >([]);

  // Fetch user data for personalized greeting
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch("/api/user/me");
        if (response.ok) {
          const data = await response.json();
          // Extract first name from full name
          const firstName = data.name ? data.name.split(" ")[0] : "";
          setUserName(firstName);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, []);

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
            experimental_attachments:
              msg.metadata?.attachments && msg.metadata.attachments.length > 0
                ? msg.metadata.attachments.map((attachment) => ({
                    id: attachment.id,
                    name: attachment.name,
                    type: attachment.type,
                    size: attachment.size,
                    url: attachment.url,
                    extractedText: attachment.extractedText,
                    contentType: attachment.contentType,
                  }))
                : undefined,
          }));
          setInitialMessages(messages);
          setCurrentChatId(chat.id);

          // Extract source documents from the latest user message
          const lastUserMessage = [...chat.messages]
            .reverse()
            .find((msg) => msg.role === "USER");

          if (
            lastUserMessage?.metadata?.sourceDocuments &&
            lastUserMessage.metadata.sourceDocuments.length > 0
          ) {
            const sourceDocIds = lastUserMessage.metadata.sourceDocuments;
            // Fetch full source document details
            Promise.all(
              sourceDocIds.map(async (docId: string) => {
                try {
                  const response = await fetch(`/api/documents/${docId}`);
                  if (response.ok) {
                    const doc = await response.json();
                    return {
                      id: doc.id,
                      title: doc.title,
                      contentType: doc.contentType,
                      fileUrl: doc.fileUrl,
                      fileType: doc.fileType,
                    } as SourceDocument;
                  }
                  return null;
                } catch (error) {
                  console.error(
                    `Failed to fetch source document ${docId}:`,
                    error
                  );
                  return null;
                }
              })
            ).then((sourceDocs) => {
              const validSourceDocs = sourceDocs.filter(
                (doc): doc is SourceDocument => doc !== null
              );
              setInitialSourceDocuments(validSourceDocs);
            });
          }

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
                      experimental_attachments:
                        msg.metadata?.attachments &&
                        msg.metadata.attachments.length > 0
                          ? msg.metadata.attachments.map((attachment) => ({
                              id: attachment.id,
                              name: attachment.name,
                              type: attachment.type,
                              size: attachment.size,
                              url: attachment.url,
                              extractedText: attachment.extractedText,
                              contentType: attachment.contentType,
                            }))
                          : undefined,
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
        userName={userName}
        initialSourceDocuments={initialSourceDocuments}
      />
    </div>
  );
}
