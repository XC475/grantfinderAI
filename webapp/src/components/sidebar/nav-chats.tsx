"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Trash2,
  MessageSquare,
  Plus,
  Loader2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  useSidebar,
} from "@/components/ui/sidebar";
import { Spinner } from "@/components/ui/spinner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Chat {
  id: string;
  title: string;
  context: string;
  updatedAt: string;
  _count: { messages: number };
}

export function NavChats({
  organizationSlug,
}: {
  organizationSlug: string | null;
}) {
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [chatToDelete, setChatToDelete] = useState<Chat | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();
  const { state } = useSidebar();

  useEffect(() => {
    fetchChats();

    // Listen for chat events (created or updated)
    const handleChatEvent = () => {
      fetchChats();
    };

    window.addEventListener("chatCreated", handleChatEvent);
    window.addEventListener("chatUpdated", handleChatEvent);

    return () => {
      window.removeEventListener("chatCreated", handleChatEvent);
      window.removeEventListener("chatUpdated", handleChatEvent);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const handleDeleteClick = (chat: Chat) => {
    setChatToDelete(chat);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!chatToDelete) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/chats/${chatToDelete.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setChats((prev) => prev.filter((chat) => chat.id !== chatToDelete.id));
        // If we're currently viewing this chat, redirect to new chat
        const chatUrl = organizationSlug
          ? `/private/${organizationSlug}/chat`
          : "/private/chat";
        if (pathname.includes(`chatId=${chatToDelete.id}`)) {
          window.location.href = chatUrl;
        }
      }
    } catch (error) {
      console.error("Error deleting chat:", error);
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setChatToDelete(null);
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
        <div className="group/header flex items-center justify-between">
          <div className="flex items-center gap-1">
            <SidebarGroupLabel>Chats</SidebarGroupLabel>
            <button
              className="opacity-0 group-hover/header:opacity-100 h-4 w-4 text-muted-foreground cursor-pointer"
              onClick={() => setIsCollapsed(!isCollapsed)}
            >
              {isCollapsed ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>
        {!isCollapsed && (
          <div className="flex items-center justify-center py-4">
            <Spinner size="sm" />
          </div>
        )}
      </SidebarGroup>
    );
  }

  // Don't show chats when sidebar is collapsed
  if (state === "collapsed") {
    return null;
  }

  return (
    <SidebarGroup>
      <div className="group/header flex items-center justify-between">
        <div className="flex items-center gap-1">
          <SidebarGroupLabel>Chats</SidebarGroupLabel>
          <button
            className="opacity-0 group-hover/header:opacity-100 h-4 w-4 text-muted-foreground cursor-pointer"
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            {isCollapsed ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0"
          onClick={() => {
            const chatUrl = organizationSlug
              ? `/private/${organizationSlug}/chat`
              : "/private/chat";
            // Always perform a hard navigation so the chat resets to initial state
            window.location.href = chatUrl;
          }}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {!isCollapsed && (
        <>
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
                      organizationSlug
                        ? `/private/${organizationSlug}/chat?chatId=${chat.id}`
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
                    onClick={() => handleDeleteClick(chat)}
                    className="opacity-0 group-hover:opacity-100 h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </SidebarMenu>
          )}
        </>
      )}

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete chat?</DialogTitle>
            <DialogDescription>
              This will delete <strong>{chatToDelete?.title}</strong>.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SidebarGroup>
  );
}

export default NavChats;
