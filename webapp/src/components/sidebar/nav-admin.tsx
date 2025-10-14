"use client";

import { ShieldCheck } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

interface NavAdminProps {
  items: {
    title: string;
    url: string;
    icon: React.ComponentType<{ className?: string }>;
  }[];
}

export function NavAdmin({ items }: NavAdminProps) {
  const pathname = usePathname();

  return (
    <SidebarGroup>
      <SidebarGroupLabel>
        <ShieldCheck className="mr-2 h-4 w-4" />
        Admin
      </SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.url;

          return (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild isActive={isActive}>
                <Link href={item.url}>
                  <Icon className="h-4 w-4" />
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
