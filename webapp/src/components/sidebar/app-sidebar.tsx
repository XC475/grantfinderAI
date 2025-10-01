"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import {
  AudioWaveform,
  Command,
  Frame,
  GalleryVerticalEnd,
  Home,
  Map,
  PieChart,
  Settings2,
  FileText,
  Bookmark,
  Building2,
  ClipboardList,
  FolderOpen,
} from "lucide-react";

import { NavMain } from "@/components/sidebar/nav-main";
import { NavChats } from "@/components/sidebar/nav-chats";
import { NavUser } from "@/components/sidebar/nav-user";
import { TeamSwitcher } from "@/components/sidebar/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";

// This is sample data.
const data = {
  teams: [
    {
      name: "GrantFinder Pro",
      logo: GalleryVerticalEnd,
      plan: "Enterprise",
    },
    {
      name: "Innovation Hub",
      logo: AudioWaveform,
      plan: "Startup",
    },
    {
      name: "Research Foundation",
      logo: Command,
      plan: "Free",
    },
  ],
  user: {
    name: "John Smith",
    email: "john.smith@grantfinder.com",
    avatar:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face",
  },
  navMain: [
    {
      title: "Home",
      url: "/private/chat",
      icon: Home,
    },
    {
      title: "Grants",
      url: "/private/grants",
      icon: FileText,
    },
    {
      title: "Bookmarks",
      url: "/private/bookmarks",
      icon: Bookmark,
    },
    // {
    //   title: "Org Profile",
    //   url: "/org-profile",
    //   icon: Building2,
    // },
    // {
    //   title: "Applications",
    //   url: "/applications",
    //   icon: ClipboardList,
    // },
    // {
    //   title: "Projects",
    //   url: "/projects",
    //   icon: FolderOpen,
    // },
    // {
    //   title: "Settings",
    //   url: "#",
    //   icon: Settings2,
    //   items: [
    //     {
    //       title: "Account",
    //       url: "/settings/account",
    //     },
    //     {
    //       title: "Billing",
    //       url: "/settings/billing",
    //     },
    //     {
    //       title: "Organizations",
    //       url: "/settings/organizations",
    //     },
    //   ],
    // },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();

  // Extract workspace slug from pathname: /private/[slug]/...
  const workspaceSlug = React.useMemo(() => {
    const match = pathname.match(/^\/private\/([^\/]+)/);
    return match ? match[1] : null;
  }, [pathname]);

  // Build navigation items with workspace slug
  const navItems = React.useMemo(() => {
    if (!workspaceSlug) return data.navMain;

    return data.navMain.map((item) => ({
      ...item,
      url: `/private/${workspaceSlug}${item.url.replace("/private", "")}`,
    }));
  }, [workspaceSlug]);

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navItems} />
        <NavChats workspaceSlug={workspaceSlug} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
