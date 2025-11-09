"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { MessageSquare, SquarePen, Search } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

interface Chat {
  id: string;
  title: string;
  context: string;
  updatedAt: string;
  _count: { messages: number };
}

interface GroupedChats {
  today: Chat[];
  yesterday: Chat[];
  previous7Days: Chat[];
  older: Chat[];
}

interface SearchChatsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  organizationSlug: string | null;
}

export function SearchChatsModal({
  open,
  onOpenChange,
  organizationSlug,
}: SearchChatsModalProps) {
  const [chats, setChats] = useState<Chat[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      fetchChats();
      setSearchQuery("");
    }
  }, [open]);

  const fetchChats = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/chats");
      if (response.ok) {
        const data = await response.json();
        setChats(data);
      }
    } catch (error) {
      console.error("Error fetching chats:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredChats = useMemo(() => {
    if (!searchQuery.trim()) return chats;
    const query = searchQuery.toLowerCase();
    return chats.filter((chat) => chat.title.toLowerCase().includes(query));
  }, [chats, searchQuery]);

  const groupedChats = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const grouped: GroupedChats = {
      today: [],
      yesterday: [],
      previous7Days: [],
      older: [],
    };

    filteredChats.forEach((chat) => {
      const chatDate = new Date(chat.updatedAt);
      if (chatDate >= today) {
        grouped.today.push(chat);
      } else if (chatDate >= yesterday) {
        grouped.yesterday.push(chat);
      } else if (chatDate >= sevenDaysAgo) {
        grouped.previous7Days.push(chat);
      } else {
        grouped.older.push(chat);
      }
    });

    return grouped;
  }, [filteredChats]);

  const handleNewChat = () => {
    const chatUrl = organizationSlug
      ? `/private/${organizationSlug}/chat`
      : "/private/chat";
    window.location.href = chatUrl;
  };

  const handleChatClick = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] p-0 gap-0">
        <VisuallyHidden>
          <DialogTitle>Search Chats</DialogTitle>
        </VisuallyHidden>
        {/* Search Input */}
        <div className="relative border-b">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Search chats..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border-0 bg-transparent pl-12 pr-4 py-6 text-base focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground"
            autoFocus
          />
        </div>

        {/* New Chat Button */}
        <div className="px-4 py-3 border-b">
          <Button
            variant="secondary"
            className="w-full justify-start gap-3 h-12"
            onClick={handleNewChat}
          >
            <SquarePen className="h-5 w-5" />
            <span className="text-base font-medium">New chat</span>
          </Button>
        </div>

        {/* Chat List */}
        <div className="max-h-[500px] overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Spinner size="sm" />
            </div>
          ) : filteredChats.length === 0 ? (
            <div className="text-center py-12 px-4 text-muted-foreground">
              {searchQuery
                ? "No chats found matching your search"
                : "No chats yet. Start a new conversation!"}
            </div>
          ) : (
            <div className="py-2">
              {/* Today */}
              {groupedChats.today.length > 0 && (
                <div className="mb-4">
                  <div className="px-4 py-2 text-xs font-medium text-muted-foreground">
                    Today
                  </div>
                  {groupedChats.today.map((chat) => (
                    <Link
                      key={chat.id}
                      href={
                        organizationSlug
                          ? `/private/${organizationSlug}/chat?chatId=${chat.id}`
                          : `/private/chat?chatId=${chat.id}`
                      }
                      onClick={handleChatClick}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-accent transition-colors"
                    >
                      <MessageSquare className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                      <span className="text-sm font-medium truncate flex-1">
                        {chat.title}
                      </span>
                    </Link>
                  ))}
                </div>
              )}

              {/* Yesterday */}
              {groupedChats.yesterday.length > 0 && (
                <div className="mb-4">
                  <div className="px-4 py-2 text-xs font-medium text-muted-foreground">
                    Yesterday
                  </div>
                  {groupedChats.yesterday.map((chat) => (
                    <Link
                      key={chat.id}
                      href={
                        organizationSlug
                          ? `/private/${organizationSlug}/chat?chatId=${chat.id}`
                          : `/private/chat?chatId=${chat.id}`
                      }
                      onClick={handleChatClick}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-accent transition-colors"
                    >
                      <MessageSquare className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                      <span className="text-sm font-medium truncate flex-1">
                        {chat.title}
                      </span>
                    </Link>
                  ))}
                </div>
              )}

              {/* Previous 7 Days */}
              {groupedChats.previous7Days.length > 0 && (
                <div className="mb-4">
                  <div className="px-4 py-2 text-xs font-medium text-muted-foreground">
                    Previous 7 Days
                  </div>
                  {groupedChats.previous7Days.map((chat) => (
                    <Link
                      key={chat.id}
                      href={
                        organizationSlug
                          ? `/private/${organizationSlug}/chat?chatId=${chat.id}`
                          : `/private/chat?chatId=${chat.id}`
                      }
                      onClick={handleChatClick}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-accent transition-colors"
                    >
                      <MessageSquare className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                      <span className="text-sm font-medium truncate flex-1">
                        {chat.title}
                      </span>
                    </Link>
                  ))}
                </div>
              )}

              {/* Older */}
              {groupedChats.older.length > 0 && (
                <div className="mb-4">
                  <div className="px-4 py-2 text-xs font-medium text-muted-foreground">
                    Older
                  </div>
                  {groupedChats.older.map((chat) => (
                    <Link
                      key={chat.id}
                      href={
                        organizationSlug
                          ? `/private/${organizationSlug}/chat?chatId=${chat.id}`
                          : `/private/chat?chatId=${chat.id}`
                      }
                      onClick={handleChatClick}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-accent transition-colors"
                    >
                      <MessageSquare className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                      <span className="text-sm font-medium truncate flex-1">
                        {chat.title}
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
