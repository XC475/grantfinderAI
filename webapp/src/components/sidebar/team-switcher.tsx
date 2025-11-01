"use client";

import * as React from "react";
import { Loader2, Building2 } from "lucide-react";
import Image from "next/image";

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
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
  logoSize?: string;
}

export function TeamSwitcher({
  organization,
  currentSlug: _currentSlug,
  loading = false,
  logoSize = "2rem",
}: TeamSwitcherProps) {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  if (loading) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton
            size="lg"
            disabled
            style={{
              minWidth: logoSize,
              minHeight: logoSize,
            }}
          >
            <div
              className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square items-center justify-center rounded-lg shrink-0"
              style={{ width: logoSize, height: logoSize }}
            >
              <Loader2
                style={{
                  width: `calc(${logoSize} / 2)`,
                  height: `calc(${logoSize} / 2)`,
                }}
                className="animate-spin"
              />
            </div>
            {!isCollapsed && (
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">Loading...</span>
                <span className="truncate text-xs">Organization</span>
              </div>
            )}
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  if (!organization) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton
            size="lg"
            disabled
            style={{
              minWidth: logoSize,
              minHeight: logoSize,
            }}
          >
            <div
              className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square items-center justify-center rounded-lg shrink-0"
              style={{ width: logoSize, height: logoSize }}
            >
              <Building2
                style={{
                  width: `calc(${logoSize} / 2)`,
                  height: `calc(${logoSize} / 2)`,
                }}
              />
            </div>
            {!isCollapsed && (
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">No Organization</span>
                <span className="truncate text-xs">Error</span>
              </div>
            )}
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  const logoSizeNum = parseInt(logoSize);

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          size="lg"
          style={{
            // Prevent the logo from being resized when sidebar collapses
            minWidth: logoSize,
            minHeight: logoSize,
          }}
        >
          {organization.logoUrl ? (
            <div
              className="flex aspect-square items-center justify-center rounded-lg overflow-hidden shrink-0"
              style={{ width: logoSize, height: logoSize }}
            >
              <Image
                src={organization.logoUrl}
                alt={organization.name}
                width={logoSizeNum}
                height={logoSizeNum}
                className="w-full h-full object-cover"
                unoptimized
              />
            </div>
          ) : (
            <div
              className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square items-center justify-center rounded-lg shrink-0"
              style={{ width: logoSize, height: logoSize }}
            >
              <Building2
                style={{
                  width: `calc(${logoSize} / 2)`,
                  height: `calc(${logoSize} / 2)`,
                }}
              />
            </div>
          )}
          {!isCollapsed && (
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">{organization.name}</span>
              <span className="truncate text-xs">Organization</span>
            </div>
          )}
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
