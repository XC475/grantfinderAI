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
  SidebarSeparator,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface NavSettingsProps {
  organizationSlug: string | null;
}

export function NavSettings({ organizationSlug }: NavSettingsProps) {
  const pathname = usePathname();

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
