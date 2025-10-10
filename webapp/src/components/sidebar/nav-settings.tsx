"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BadgeCheck, CreditCard, Bell } from "lucide-react";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

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
      title: "Billing",
      url: `/private/${organizationSlug}/settings/billing`,
      icon: CreditCard,
    },
    {
      title: "Notifications",
      url: `/private/${organizationSlug}/settings/notifications`,
      icon: Bell,
    },
  ];

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Settings</SidebarGroupLabel>
      <SidebarMenu>
        {settingsItems.map((item) => {
          const isActive = pathname === item.url;
          return (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild isActive={isActive}>
                <Link href={item.url}>
                  <item.icon />
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}

