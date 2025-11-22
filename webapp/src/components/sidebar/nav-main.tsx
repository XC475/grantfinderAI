"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, type LucideIcon } from "lucide-react";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
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

export function NavMain({
  items,
  iconSize = "1rem",
}: {
  items: {
    title: string;
    url: string;
    icon?: LucideIcon;
    isActive?: boolean;
    onClick?: () => void;
    items?: {
      title: string;
      url: string;
      onClick?: () => void;
    }[];
  }[];
  iconSize?: string;
}) {
  const pathname = usePathname();
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  const handleClick = (e: React.MouseEvent, url: string) => {
    // If clicking AI Assistant while already on chat, hard navigate to reset state
    if (url.includes("/chat")) {
      const normalizedUrl = url.endsWith("/") ? url.slice(0, -1) : url;
      const normalizedPath = pathname.endsWith("/")
        ? pathname.slice(0, -1)
        : pathname;
      if (normalizedPath.startsWith(normalizedUrl)) {
        e.preventDefault();
        window.location.href = url;
      }
    }
  };

  return (
    <SidebarGroup className="mt-2">
      <SidebarMenu>
        {items.map((item) => {
          // If item has sub-items, render as collapsible dropdown
          if (item.items && item.items.length > 0) {
            // Check if any sub-item is active
            const hasActiveSubItem = item.items.some(
              (subItem) => pathname === subItem.url
            );

            return (
              <Collapsible
                key={item.title}
                asChild
                defaultOpen={item.isActive || hasActiveSubItem}
                className="group/collapsible"
              >
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton tooltip={item.title}>
                      {item.icon && (
                        <item.icon
                          style={{ width: iconSize, height: iconSize }}
                        />
                      )}
                      {!isCollapsed && (
                        <>
                          <span>{item.title}</span>
                          <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                        </>
                      )}
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {item.items.map((subItem) => {
                        const isActive = pathname === subItem.url;
                        return (
                          <SidebarMenuSubItem key={subItem.title}>
                            <SidebarMenuSubButton asChild isActive={isActive}>
                              <Link href={subItem.url}>
                                <span>{subItem.title}</span>
                              </Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        );
                      })}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            );
          }

          // If item has no sub-items, render as simple button
          // Check if this item is active based on URL
          const isActive = pathname === item.url || pathname.startsWith(item.url + "/");
          
          return (
            <SidebarMenuItem key={item.title}>
              {item.onClick ? (
                // If item has onClick, render as button
                <SidebarMenuButton
                  tooltip={item.title}
                  onClick={item.onClick}
                  isActive={isActive}
                >
                  {item.icon && (
                    <item.icon style={{ width: iconSize, height: iconSize }} />
                  )}
                  {!isCollapsed && <span>{item.title}</span>}
                </SidebarMenuButton>
              ) : (
                // Otherwise render as link
                <SidebarMenuButton
                  asChild
                  tooltip={item.title}
                  isActive={isActive}
                >
                  <Link
                    href={item.url}
                    onClick={(e) => handleClick(e, item.url)}
                  >
                    {item.icon && (
                      <item.icon
                        style={{ width: iconSize, height: iconSize }}
                      />
                    )}
                    {!isCollapsed && <span>{item.title}</span>}
                  </Link>
                </SidebarMenuButton>
              )}
            </SidebarMenuItem>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
