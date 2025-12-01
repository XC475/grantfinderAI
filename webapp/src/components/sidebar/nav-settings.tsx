"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Settings, ChevronRight, type LucideIcon } from "lucide-react";
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarSeparator,
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
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface NavSettingsItem {
  title: string;
  url: string;
  icon: LucideIcon;
}

interface NavSettingsGroup {
  label?: string;
  items: NavSettingsItem[];
}

interface NavSettingsProps {
  items: NavSettingsItem[] | NavSettingsGroup[];
}

export function NavSettings({ items }: NavSettingsProps) {
  const pathname = usePathname();
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  if (!items || items.length === 0) return null;

  // Normalize items to groups format
  const groups: NavSettingsGroup[] =
    Array.isArray(items) && items.length > 0 && "title" in items[0]
      ? [{ items: items as NavSettingsItem[] }]
      : (items as NavSettingsGroup[]);

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
                {groups.map((group, groupIndex) => (
                  <div key={groupIndex}>
                    {group.label && (
                      <DropdownMenuLabel>{group.label}</DropdownMenuLabel>
                    )}
                    {group.items.map((item) => (
                      <DropdownMenuItem key={item.title} asChild>
                        <Link
                          href={item.url}
                          className="flex items-center gap-2"
                        >
                          <item.icon className="h-4 w-4" />
                          <span>{item.title}</span>
                        </Link>
                      </DropdownMenuItem>
                    ))}
                    {groupIndex < groups.length - 1 && (
                      <DropdownMenuSeparator />
                    )}
                  </div>
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
                <SidebarMenuSub className="gap-3">
                  {groups.map((group, groupIndex) => (
                    <div key={groupIndex} className="space-y-1">
                      {groupIndex > 0 && <SidebarSeparator />}
                      {group.label && (
                        <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                          {group.label}
                        </div>
                      )}
                      {group.items.map((item) => {
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
                    </div>
                  ))}
                </SidebarMenuSub>
              </CollapsibleContent>
            </SidebarMenuItem>
          </Collapsible>
        </SidebarMenu>
      </SidebarGroup>
    </>
  );
}
