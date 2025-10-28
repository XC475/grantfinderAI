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
  organizationSlug: string;
}

// Helper function to truncate text at 50 characters
function truncateText(text: string, maxLength: number = 50): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
}

export function DynamicBreadcrumb({
  organizationSlug,
}: DynamicBreadcrumbProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [grantTitle, setGrantTitle] = useState<string | null>(null);
  const [documentTitle, setDocumentTitle] = useState<string | null>(null);

  const fromBookmarks = searchParams.get("from") === "bookmarks";

  const breadcrumbs = useMemo(() => {
    // Remove the /private/[slug] prefix
    const path = pathname.replace(`/private/${organizationSlug}`, "");
    const segments = path.split("/").filter(Boolean);

    // If we're on the dashboard page (home), don't show breadcrumbs
    if (segments.length === 0 || segments[0] === "dashboard") {
      return null;
    }

    // Build breadcrumb items
    const items = [];

    // Always start with Dashboard
    items.push({
      label: "Dashboard",
      href: `/private/${organizationSlug}/dashboard`,
      isLast: false,
    });

    // Handle different pages
    if (segments[0] === "chat") {
      items.push({
        label: "AI Chat",
        href: `/private/${organizationSlug}/chat`,
        isLast: true,
      });
    } else if (segments[0] === "grants") {
      // Check if we came from bookmarks
      if (segments.length > 1 && segments[1] && fromBookmarks) {
        // Viewing grant from bookmarks
        items.push({
          label: "Saved Grants",
          href: `/private/${organizationSlug}/bookmarks`,
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
          href: `/private/${organizationSlug}/grants`,
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
    } else if (segments[0] === "dashboard") {
      items.push({
        label: "Dashboard",
        href: `/private/${organizationSlug}/dashboard`,
        isLast: true,
      });
    } else if (segments[0] === "bookmarks") {
      items.push({
        label: "Saved Grants",
        href: `/private/${organizationSlug}/bookmarks`,
        isLast: true,
      });
    } else if (segments[0] === "settings") {
      items.push({
        label: "Settings",
        href: `/private/${organizationSlug}/settings`,
        isLast: true,
      });
    } else if (segments[0] === "applications") {
      items.push({
        label: "Applications",
        href: `/private/${organizationSlug}/applications`,
        isLast: segments.length === 1,
      });

      // If we're viewing a specific application
      if (segments.length > 1 && segments[1]) {
        items.push({
          label: "Application Details",
          href: `/private/${organizationSlug}/applications/${segments[1]}`,
          isLast: segments.length === 2,
        });

        // If we're viewing a document within an application
        if (segments.length > 3 && segments[2] === "documents" && segments[3]) {
          items.push({
            label: documentTitle || "Document",
            href: `/private/${organizationSlug}/applications/${segments[1]}/documents/${segments[3]}`,
            isLast: true,
          });
        }
      }
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
  }, [pathname, organizationSlug, grantTitle, documentTitle, fromBookmarks]);

  // Fetch grant title if we're on a grant detail page
  useEffect(() => {
    const path = pathname.replace(`/private/${organizationSlug}`, "");
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
  }, [pathname, organizationSlug]);

  // Fetch document title if we're on a document page
  useEffect(() => {
    const path = pathname.replace(`/private/${organizationSlug}`, "");
    const segments = path.split("/").filter(Boolean);

    if (
      segments[0] === "applications" &&
      segments[1] &&
      segments[2] === "documents" &&
      segments[3]
    ) {
      const applicationId = segments[1];
      const documentId = segments[3];
      fetch(`/api/applications/${applicationId}/documents/${documentId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.document && data.document.title) {
            setDocumentTitle(data.document.title);
          }
        })
        .catch((error) => {
          console.error("Error fetching document title:", error);
        });
    } else {
      setDocumentTitle(null);
    }
  }, [pathname, organizationSlug]);

  // Don't render anything if we're on the home page
  if (!breadcrumbs) {
    return null;
  }

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {breadcrumbs.map((item, index) => {
          const truncatedLabel = truncateText(item.label);
          return (
            <div key={item.href + index} className="flex items-center gap-2">
              {index > 0 && <BreadcrumbSeparator />}
              <BreadcrumbItem>
                {item.isLast ? (
                  <BreadcrumbPage title={item.label}>
                    {truncatedLabel}
                  </BreadcrumbPage>
                ) : (
                  <BreadcrumbLink href={item.href} title={item.label}>
                    {truncatedLabel}
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </div>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
