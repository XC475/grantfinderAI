"use client";

import * as React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Users } from "lucide-react";

interface CollaborationUser {
  id: string;
  name: string;
  color: string;
  avatar?: string | null;
}

interface CollaborationHeaderProps {
  users: CollaborationUser[];
  currentUserId: string;
  isConnected: boolean;
}

/**
 * CollaborationHeader Component
 *
 * Displays active users collaborating on the document in real-time.
 * Shows avatars, connection status, and user presence information.
 */
export function CollaborationHeader({
  users,
  currentUserId,
  isConnected,
}: CollaborationHeaderProps) {
  const MAX_VISIBLE_AVATARS = 5;
  const visibleUsers = users.slice(0, MAX_VISIBLE_AVATARS);
  const remainingCount = users.length - MAX_VISIBLE_AVATARS;

  // Get initials from name
  const getInitials = (name: string): string => {
    const parts = name.split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div className="flex items-center gap-3 px-4 py-2 border-b bg-background">
      {/* Connection Status Indicator */}
      <div className="flex items-center gap-2">
        <div
          className={`h-2 w-2 rounded-full ${
            isConnected ? "bg-green-500" : "bg-gray-300"
          }`}
          title={isConnected ? "Connected" : "Disconnected"}
        />
        <span className="text-sm text-muted-foreground">
          {isConnected ? "Live" : "Offline"}
        </span>
      </div>

      {/* Active Users */}
      {users.length > 0 && (
        <>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {users.length} {users.length === 1 ? "person" : "people"} editing
            </span>
          </div>

          {/* Avatar Stack */}
          <TooltipProvider>
            <div className="flex -space-x-2">
              {visibleUsers.map((user) => {
                const isCurrentUser = user.id === currentUserId;
                return (
                  <Tooltip key={user.id}>
                    <TooltipTrigger asChild>
                      <div
                        className="relative"
                        style={{
                          zIndex: isCurrentUser ? 10 : "auto",
                        }}
                      >
                        <Avatar
                          className={`h-8 w-8 border-2 ${
                            isCurrentUser
                              ? "border-primary ring-2 ring-primary/20"
                              : "border-background"
                          }`}
                          style={{
                            borderColor: isCurrentUser ? undefined : user.color,
                          }}
                        >
                          {user.avatar && (
                            <AvatarImage src={user.avatar} alt={user.name} />
                          )}
                          <AvatarFallback
                            style={{
                              backgroundColor: user.color,
                              color: "white",
                              fontSize: "0.75rem",
                              fontWeight: 600,
                            }}
                          >
                            {getInitials(user.name)}
                          </AvatarFallback>
                        </Avatar>
                        {isCurrentUser && (
                          <div className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full bg-green-500 border-2 border-background" />
                        )}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>
                        {user.name}
                        {isCurrentUser ? " (You)" : ""}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                );
              })}

              {/* Remaining users count */}
              {remainingCount > 0 && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted border-2 border-background text-xs font-medium text-muted-foreground">
                      +{remainingCount}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className="space-y-1">
                      {users.slice(MAX_VISIBLE_AVATARS).map((user) => (
                        <p key={user.id}>
                          {user.name}
                          {user.id === currentUserId ? " (You)" : ""}
                        </p>
                      ))}
                    </div>
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
          </TooltipProvider>
        </>
      )}
    </div>
  );
}
