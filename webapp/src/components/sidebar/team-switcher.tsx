"use client";

import * as React from "react";
import { Loader2, Building2 } from "lucide-react";
import Image from "next/image";

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

interface Organization {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
}

interface TeamSwitcherProps {
  organization: Organization | null;
  currentSlug: string | null;
  loading?: boolean;
}

export function TeamSwitcher({
  organization,
  currentSlug: _currentSlug,
  loading = false,
}: TeamSwitcherProps) {
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
              <Building2 className="size-4" />
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

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton size="lg">
          {organization.logoUrl ? (
            <div className="flex aspect-square size-8 items-center justify-center rounded-lg overflow-hidden">
              <Image
                src={organization.logoUrl}
                alt={organization.name}
                width={32}
                height={32}
                className="w-full h-full object-cover"
                unoptimized
              />
            </div>
          ) : (
            <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
              <Building2 className="size-4" />
            </div>
          )}
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-medium">{organization.name}</span>
            <span className="truncate text-xs">Organization</span>
          </div>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
