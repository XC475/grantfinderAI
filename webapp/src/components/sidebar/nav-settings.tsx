"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BadgeCheck, Users, Settings, ChevronRight } from "lucide-react";
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface NavSettingsProps {
  organizationSlug: string | null;
}

export function NavSettings({ organizationSlug }: NavSettingsProps) {
  const pathname = usePathname();
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  if (!organizationSlug) return null;

  const settingsItems = [
    {
      title: "Account",
      url: `/private/${organizationSlug}/settings/account`,
      icon: BadgeCheck,
    },
    {
      title: "Team",
      url: `/private/${organizationSlug}/settings/team`,
      icon: Users,
    },
  ];

  // Check if any settings page is active
  const isSettingsActive = pathname.includes("/settings");

  // When collapsed, show dropdown menu on hover
  if (isCollapsed) {
    return (
      <SidebarGroup>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton tooltip="Settings">
                  <Settings />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="right" align="start" className="w-48">
                {settingsItems.map((item) => (
                  <DropdownMenuItem key={item.title} asChild>
                    <Link href={item.url} className="flex items-center gap-2">
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroup>
    );
  }

  // When expanded, show collapsible as normal
  return (
    <>
      <SidebarGroup>
        <SidebarMenu>
          <Collapsible
            defaultOpen={isSettingsActive}
            className="group/collapsible"
          >
            <SidebarMenuItem>
              <CollapsibleTrigger asChild>
                <SidebarMenuButton tooltip="Settings">
                  <Settings />
                  <span>Settings</span>
                  <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                </SidebarMenuButton>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <SidebarMenuSub>
                  {settingsItems.map((item) => {
                    const isActive = pathname === item.url;
                    return (
                      <SidebarMenuSubItem key={item.title}>
                        <SidebarMenuSubButton asChild isActive={isActive}>
                          <Link href={item.url}>
                            <item.icon />
                            <span>{item.title}</span>
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    );
                  })}
                </SidebarMenuSub>
              </CollapsibleContent>
            </SidebarMenuItem>
          </Collapsible>
        </SidebarMenu>
      </SidebarGroup>
    </>
  );
}
