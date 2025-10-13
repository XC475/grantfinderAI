"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import {
  AudioWaveform,
  Command,
  GalleryVerticalEnd,
  Home,
  FileText,
  Bookmark,
  ClipboardList,
} from "lucide-react";

import { NavMain } from "@/components/sidebar/nav-main";
import { NavChats } from "@/components/sidebar/nav-chats";
import { NavUser } from "@/components/sidebar/nav-user";
import { NavSettings } from "@/components/sidebar/nav-settings";
import { TeamSwitcher } from "@/components/sidebar/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { createClient } from "@/utils/supabase/client";

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
    {
      title: "Applications",
      url: "/private/applications",
      icon: ClipboardList,
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
  const [user, setUser] = React.useState<{
    name: string;
    email: string;
    avatar: string;
  } | null>(null);
  const [organization, setOrganization] = React.useState<{
    id: string;
    name: string;
    slug: string;
    type: string;
  } | null>(null);
  const [loadingOrganization, setLoadingOrganization] = React.useState(true);

  // Extract organization slug from pathname: /private/[slug]/...
  const organizationSlug = React.useMemo(() => {
    const match = pathname.match(/^\/private\/([^\/]+)/);
    return match ? match[1] : null;
  }, [pathname]);

  // Fetch actual user data and organization
  React.useEffect(() => {
    const fetchUserAndOrganization = async () => {
      const supabase = createClient();
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();

      if (authUser) {
        setUser({
          name:
            authUser.user_metadata?.name ||
            authUser.email?.split("@")[0] ||
            "User",
          email: authUser.email || "",
          avatar: authUser.user_metadata?.avatar_url || "",
        });

        // Fetch user's organization
        try {
          const response = await fetch("/api/organizations");
          if (response.ok) {
            const data = await response.json();
            setOrganization(data);
          }
        } catch (error) {
          console.error("Error fetching organization:", error);
        } finally {
          setLoadingOrganization(false);
        }
      }
    };
    fetchUserAndOrganization();
  }, []);

  // Build navigation items with organization slug
  const navItems = React.useMemo(() => {
    if (!organizationSlug) return data.navMain;

    return data.navMain.map((item) => ({
      ...item,
      url: `/private/${organizationSlug}${item.url.replace("/private", "")}`,
    }));
  }, [organizationSlug]);

  // Check if we're on a settings page
  const isOnSettingsPage = pathname.includes("/settings");

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher
          organization={organization}
          currentSlug={organizationSlug}
          loading={loadingOrganization}
        />
      </SidebarHeader>
      <SidebarContent>
        {isOnSettingsPage ? (
          <NavSettings organizationSlug={organizationSlug} />
        ) : (
          <>
            <NavMain items={navItems} />
            <NavChats organizationSlug={organizationSlug} />
          </>
        )}
      </SidebarContent>
      <SidebarFooter>{user && <NavUser user={user} />}</SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
