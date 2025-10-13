"use client";

import * as React from "react";
import { Loader2, User, Building2 } from "lucide-react";

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

interface Organization {
  id: string;
  name: string;
  slug: string;
  type: string;
}

interface TeamSwitcherProps {
  organization: Organization | null;
  currentSlug: string | null;
  loading?: boolean;
}

export function TeamSwitcher({
  organization,
  currentSlug,
  loading = false,
}: TeamSwitcherProps) {
  const getOrganizationIcon = (type: string) => {
    return type === "PERSONAL" ? User : Building2;
  };

  const getOrganizationDisplayName = (org: Organization) => {
    return org.type === "PERSONAL" ? "Personal Organization" : org.name;
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
              <span className="truncate text-xs">Organization</span>
            </div>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  if (!organization) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size="lg" disabled>
            <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
              <User className="size-4" />
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">No Organization</span>
              <span className="truncate text-xs">Error</span>
            </div>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  const OrgIcon = getOrganizationIcon(organization.type);

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton size="lg">
          <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
            <OrgIcon className="size-4" />
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-medium">
              {getOrganizationDisplayName(organization)}
            </span>
            <span className="truncate text-xs">
              {organization.type === "PERSONAL" ? "Personal" : "Organization"}
            </span>
          </div>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
