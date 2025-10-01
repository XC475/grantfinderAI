"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useMemo, useEffect, useState } from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

interface DynamicBreadcrumbProps {
  workspaceSlug: string;
}

export function DynamicBreadcrumb({ workspaceSlug }: DynamicBreadcrumbProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [grantTitle, setGrantTitle] = useState<string | null>(null);

  const fromBookmarks = searchParams.get("from") === "bookmarks";

  const breadcrumbs = useMemo(() => {
    // Remove the /private/[slug] prefix
    const path = pathname.replace(`/private/${workspaceSlug}`, "");
    const segments = path.split("/").filter(Boolean);

    // If we're on the chat page (home), don't show breadcrumbs
    if (segments.length === 0 || segments[0] === "chat") {
      return null;
    }

    // Build breadcrumb items
    const items = [];

    // Always start with Home
    items.push({
      label: "Home",
      href: `/private/${workspaceSlug}/chat`,
      isLast: false,
    });

    // Handle different pages
    if (segments[0] === "grants") {
      // Check if we came from bookmarks
      if (segments.length > 1 && segments[1] && fromBookmarks) {
        // Viewing grant from bookmarks
        items.push({
          label: "Saved Grants",
          href: `/private/${workspaceSlug}/bookmarks`,
          isLast: false,
        });
        items.push({
          label: grantTitle || "Grant Details",
          href: `#`,
          isLast: true,
        });
      } else {
        // Regular grants flow
        items.push({
          label: "Grants",
          href: `/private/${workspaceSlug}/grants`,
          isLast: segments.length === 1,
        });

        // If we're viewing a specific grant
        if (segments.length > 1 && segments[1]) {
          items.push({
            label: grantTitle || "Grant Details",
            href: `#`,
            isLast: true,
          });
        }
      }
    } else if (segments[0] === "bookmarks") {
      items.push({
        label: "Saved Grants",
        href: `/private/${workspaceSlug}/bookmarks`,
        isLast: true,
      });
    } else if (segments[0] === "settings") {
      items.push({
        label: "Settings",
        href: `/private/${workspaceSlug}/settings`,
        isLast: true,
      });
    } else {
      // For other pages, show the path
      segments.forEach((segment, index) => {
        const label = segment
          .split("-")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ");
        items.push({
          label,
          href: `#`,
          isLast: index === segments.length - 1,
        });
      });
    }

    return items;
  }, [pathname, workspaceSlug, grantTitle, fromBookmarks]);

  // Fetch grant title if we're on a grant detail page
  useEffect(() => {
    const path = pathname.replace(`/private/${workspaceSlug}`, "");
    const segments = path.split("/").filter(Boolean);

    if (segments[0] === "grants" && segments[1]) {
      const grantId = segments[1];
      fetch(`/api/grants/${grantId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.title) {
            setGrantTitle(data.title);
          }
        })
        .catch((error) => {
          console.error("Error fetching grant title:", error);
        });
    } else {
      setGrantTitle(null);
    }
  }, [pathname, workspaceSlug]);

  // Don't render anything if we're on the home page
  if (!breadcrumbs) {
    return null;
  }

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {breadcrumbs.map((item, index) => (
          <div key={item.href + index} className="flex items-center gap-2">
            {index > 0 && <BreadcrumbSeparator />}
            <BreadcrumbItem>
              {item.isLast ? (
                <BreadcrumbPage>{item.label}</BreadcrumbPage>
              ) : (
                <BreadcrumbLink href={item.href}>{item.label}</BreadcrumbLink>
              )}
            </BreadcrumbItem>
          </div>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
