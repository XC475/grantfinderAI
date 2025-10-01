"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Trash2, MessageSquare, Plus } from "lucide-react";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
} from "@/components/ui/sidebar";

interface Chat {
  id: string;
  title: string;
  context: string;
  updatedAt: string;
  _count: { messages: number };
}

export function NavChats({ workspaceSlug }: { workspaceSlug: string | null }) {
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    fetchChats();
  }, []);

  const fetchChats = async () => {
    try {
      const response = await fetch("/api/chats");
      if (response.ok) {
        const data = await response.json();
        setChats(data);
      } else if (response.status === 500) {
        // Handle prepared statement errors gracefully
        console.warn("Database connection issue, retrying...");
        setTimeout(() => fetchChats(), 1000); // Retry after 1 second
        return;
      }
    } catch (error) {
      console.error("Error fetching chats:", error);
      // On connection errors, just show empty state instead of crashing
      setChats([]);
    } finally {
      setLoading(false);
    }
  };

  const deleteChat = async (chatId: string) => {
    if (!confirm("Are you sure you want to delete this chat?")) return;

    try {
      const response = await fetch(`/api/chats/${chatId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setChats((prev) => prev.filter((chat) => chat.id !== chatId));
        // If we're currently viewing this chat, redirect to new chat
        const chatUrl = workspaceSlug
          ? `/private/${workspaceSlug}/chat`
          : "/private/chat";
        if (pathname.includes(`chatId=${chatId}`)) {
          window.location.href = chatUrl;
        }
      }
    } catch (error) {
      console.error("Error deleting chat:", error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else if (diffInHours < 168) {
      // 7 days
      return date.toLocaleDateString("en-US", { weekday: "short" });
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    }
  };

  if (loading) {
    return (
      <SidebarGroup>
        <div className="flex items-center justify-between">
          <SidebarGroupLabel>Chats</SidebarGroupLabel>
        </div>
        <div className="text-sm text-muted-foreground px-2">Loading...</div>
      </SidebarGroup>
    );
  }

  return (
    <SidebarGroup>
      <div className="flex items-center justify-between">
        <SidebarGroupLabel>Chats</SidebarGroupLabel>
        <Button variant="ghost" size="sm" asChild className="h-6 w-6 p-0">
          <Link
            href={
              workspaceSlug ? `/private/${workspaceSlug}/chat` : "/private/chat"
            }
          >
            <Plus className="h-4 w-4" />
          </Link>
        </Button>
      </div>

      {chats.length === 0 ? (
        <div className="text-sm text-muted-foreground py-4 px-2">
          No chats yet. Start a new conversation!
        </div>
      ) : (
        <SidebarMenu>
          {chats.map((chat) => (
            <div
              key={chat.id}
              className="group flex items-center gap-2 p-2 text-sm hover:bg-muted rounded-md"
            >
              <MessageSquare className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
              <Link
                href={
                  workspaceSlug
                    ? `/private/${workspaceSlug}/chat?chatId=${chat.id}`
                    : `/private/chat?chatId=${chat.id}`
                }
                className="flex-1 min-w-0"
              >
                <div className="font-medium truncate">{chat.title}</div>
                <div className="text-xs text-muted-foreground flex items-center gap-2">
                  <span>{chat._count.messages} messages</span>
                  <span>•</span>
                  <span>{formatDate(chat.updatedAt)}</span>
                </div>
              </Link>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => deleteChat(chat.id)}
                className="opacity-0 group-hover:opacity-100 h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </SidebarMenu>
      )}
    </SidebarGroup>
  );
}

export default NavChats;
