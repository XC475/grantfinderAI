"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { DocumentSidebarChat } from "./DocumentSidebarChat";
import { Message } from "@/components/ui/chat-message";
import { useDocument } from "@/contexts/DocumentContext";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { History, Plus, X } from "lucide-react";

interface DocumentChatSidebarProps {
  documentId: string;
  onToggle: () => void;
}

interface ChatSession {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messageCount: number;
}

export function DocumentChatSidebar({
  documentId,
  onToggle,
}: DocumentChatSidebarProps) {
  const { documentTitle, documentContent } = useDocument();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [chatId, setChatId] = useState<string | null>(null);
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [openTabs, setOpenTabs] = useState<string[]>([]); // Track which chats are open in tabs
  const [loadingSessions, setLoadingSessions] = useState(false);
  const hasAutoSent = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const hasAutoLoaded = useRef(false);

  // Load chat sessions on mount and auto-load most recent
  useEffect(() => {
    const loadAndRestoreSession = async () => {
      try {
        setLoadingSessions(true);
        const response = await fetch(
          `/api/chats/editor?documentId=${documentId}`
        );
        if (response.ok) {
          const data = await response.json();
          const sessions = data.chats || [];
          setChatSessions(sessions);

          // Restore open tabs from localStorage
          const openTabsKey = `openEditorTabs_${documentId}`;
          const savedOpenTabs = localStorage.getItem(openTabsKey);
          const restoredTabs = savedOpenTabs ? JSON.parse(savedOpenTabs) : [];

          // Filter to only include tabs that still exist
          const validTabs = restoredTabs.filter((tabId: string) =>
            sessions.some((s: ChatSession) => s.id === tabId)
          );
          setOpenTabs(validTabs);

          // Try to restore the last active chat from localStorage
          const lastChatKey = `lastEditorChat_${documentId}`;
          const lastChatId = localStorage.getItem(lastChatKey);

          // Auto-load the saved chat or most recent session
          if (!hasAutoLoaded.current && sessions.length > 0) {
            hasAutoLoaded.current = true;

            // Find the saved chat in sessions
            const savedChat = lastChatId
              ? sessions.find((s: ChatSession) => s.id === lastChatId)
              : null;

            // Load saved chat if it exists, otherwise load most recent
            const chatToLoad = savedChat ? savedChat.id : sessions[0].id;
            console.log("💬 [DocumentChat] Auto-loading session:", chatToLoad);

            // Skip adding to tabs since we already restored them
            await loadChatSession(chatToLoad, true);
          }
        }
      } catch (error) {
        console.error("Error loading chat sessions:", error);
      } finally {
        setLoadingSessions(false);
      }
    };

    loadAndRestoreSession();
  }, [documentId]);

  const loadChatSessions = async () => {
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
  };

  const loadChatSession = async (
    sessionId: string,
    skipAddingToTabs = false
  ) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/chats/editor/${sessionId}`);
      if (response.ok) {
        const data = await response.json();
        const loadedMessages: Message[] = data.chat.messages.map(
          (msg: {
            id: string;
            role: string;
            content: string;
            createdAt: string;
          }) => ({
            id: msg.id,
            role: msg.role.toLowerCase() as "user" | "assistant",
            content: msg.content,
            createdAt: new Date(msg.createdAt),
          })
        );
        setMessages(loadedMessages);
        setChatId(sessionId);

        // Add to open tabs if not already there (and not in restore mode)
        if (!skipAddingToTabs) {
          setOpenTabs((currentTabs) => {
            if (!currentTabs.includes(sessionId)) {
              const newOpenTabs = [...currentTabs, sessionId];

              // Save to localStorage
              const openTabsKey = `openEditorTabs_${documentId}`;
              localStorage.setItem(openTabsKey, JSON.stringify(newOpenTabs));

              return newOpenTabs;
            }
            return currentTabs;
          });
        }

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
  };

  const closeTab = (tabId: string) => {
    // Remove from open tabs
    const newOpenTabs = openTabs.filter((id) => id !== tabId);
    setOpenTabs(newOpenTabs);

    // Save to localStorage
    const openTabsKey = `openEditorTabs_${documentId}`;
    localStorage.setItem(openTabsKey, JSON.stringify(newOpenTabs));

    // If closing the active tab, switch to another tab
    if (tabId === chatId) {
      if (newOpenTabs.length > 0) {
        // Find the index of the closed tab
        const closedIndex = openTabs.indexOf(tabId);
        // Switch to the previous tab, or the next one if it was the first
        const nextTabId = newOpenTabs[Math.max(0, closedIndex - 1)];
        loadChatSession(nextTabId);
      } else {
        // No more tabs, start fresh
        startNewChat();
      }
    }

    console.log("💬 [DocumentChat] Closed tab:", tabId);
  };

  const startNewChat = () => {
    setMessages([]);
    setChatId(null);

    // Don't clear open tabs, just clear the active chat
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
            chatId,
          }),
          signal: abortController.signal,
        });

        // Extract chatId from response header if this is a new chat
        if (!chatId) {
          const newChatId = response.headers.get("X-Chat-Id");
          if (newChatId) {
            setChatId(newChatId);

            // Add to open tabs
            const newOpenTabs = [...openTabs, newChatId];
            setOpenTabs(newOpenTabs);

            // Save both to localStorage
            const lastChatKey = `lastEditorChat_${documentId}`;
            localStorage.setItem(lastChatKey, newChatId);

            const openTabsKey = `openEditorTabs_${documentId}`;
            localStorage.setItem(openTabsKey, JSON.stringify(newOpenTabs));

            console.log(
              "💬 [DocumentChat] New chat created with ID:",
              newChatId
            );
            // Reload sessions to include new chat
            loadChatSessions();
          }
        }

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
      {/* Header with tabs and icon buttons */}
      <div className="flex items-center border-b bg-background">
        {/* Tabs section - scrollable */}
        <div className="flex-1 flex items-center overflow-x-auto scrollbar-thin scrollbar-thumb-muted">
          {openTabs.length === 0 ? (
            <div className="px-4 py-2 text-sm text-muted-foreground">
              No active chats
            </div>
          ) : (
            openTabs.map((tabId) => {
              const session = chatSessions.find((s) => s.id === tabId);
              if (!session) return null;

              return (
                <button
                  key={session.id}
                  onClick={() => loadChatSession(session.id)}
                  className={`
                    group flex items-center gap-2 px-3 py-2 border-r hover:bg-muted/50 transition-colors
                    min-w-[120px] max-w-[200px] flex-shrink-0
                    ${chatId === session.id ? "bg-muted" : ""}
                  `}
                >
                  <span className="text-sm truncate flex-1 text-left">
                    {session.title}
                  </span>
                  <X
                    className={`h-3 w-3 transition-opacity ${
                      chatId === session.id
                        ? "opacity-0 group-hover:opacity-100"
                        : "opacity-0"
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      closeTab(session.id);
                    }}
                  />
                </button>
              );
            })
          )}
        </div>

        {/* Icon buttons on the right */}
        <div className="flex items-center gap-1 px-2 border-l">
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

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={startNewChat}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

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
        <p className="text-xs text-muted-foreground">
          GrantWare can make mistakes. Please check responses.
        </p>
      </div>
    </div>
  );
}
