"use client";

import * as React from "react";
import { ChevronsUpDown, Plus, Loader2, User, Building2 } from "lucide-react";
import { useRouter } from "next/navigation";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

interface Workspace {
  id: string;
  name: string;
  slug: string;
  type: string;
}

interface TeamSwitcherProps {
  workspaces: Workspace[];
  currentSlug: string | null;
  loading?: boolean;
}

export function TeamSwitcher({
  workspaces,
  currentSlug,
  loading = false,
}: TeamSwitcherProps) {
  const { isMobile } = useSidebar();
  const router = useRouter();

  // Find current workspace based on slug
  const currentWorkspace = React.useMemo(() => {
    return workspaces.find((w) => w.slug === currentSlug) || workspaces[0];
  }, [workspaces, currentSlug]);

  const getWorkspaceIcon = (type: string) => {
    return type === "PERSONAL" ? User : Building2;
  };

  const getWorkspaceDisplayName = (workspace: Workspace) => {
    return workspace.type === "PERSONAL"
      ? "Personal Workspace"
      : workspace.name;
  };

  const handleSwitchWorkspace = (workspace: Workspace) => {
    router.push(`/private/${workspace.slug}/chat`);
  };

  const handleAddOrganization = () => {
    router.push("/settings/organizations");
  };

  if (loading) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size="lg" disabled>
            <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
              <Loader2 className="size-4 animate-spin" />
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">Loading...</span>
              <span className="truncate text-xs">Organizations</span>
            </div>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  if (!currentWorkspace) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size="lg" onClick={handleAddOrganization}>
            <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
              <Plus className="size-4" />
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">No Workspaces</span>
              <span className="truncate text-xs">Click to add</span>
            </div>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  const WorkspaceIcon = getWorkspaceIcon(currentWorkspace.type);

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                <WorkspaceIcon className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">
                  {getWorkspaceDisplayName(currentWorkspace)}
                </span>
                <span className="truncate text-xs">
                  {currentWorkspace.type === "PERSONAL"
                    ? "Personal"
                    : "Organization"}
                </span>
              </div>
              <ChevronsUpDown className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-muted-foreground text-xs">
              Workspaces
            </DropdownMenuLabel>
            {workspaces.map((workspace) => {
              const Icon = getWorkspaceIcon(workspace.type);
              const isActive = workspace.slug === currentSlug;
              return (
                <DropdownMenuItem
                  key={workspace.id}
                  onClick={() => handleSwitchWorkspace(workspace)}
                  className="gap-2 p-2"
                  disabled={isActive}
                >
                  <div className="flex size-6 items-center justify-center rounded-md border">
                    <Icon className="size-3.5 shrink-0" />
                  </div>
                  {getWorkspaceDisplayName(workspace)}
                  {isActive && (
                    <span className="ml-auto text-xs text-muted-foreground">
                      Active
                    </span>
                  )}
                </DropdownMenuItem>
              );
            })}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="gap-2 p-2"
              onClick={handleAddOrganization}
            >
              <div className="flex size-6 items-center justify-center rounded-md border bg-transparent">
                <Plus className="size-4" />
              </div>
              <div className="text-muted-foreground font-medium">
                Add Organization
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
