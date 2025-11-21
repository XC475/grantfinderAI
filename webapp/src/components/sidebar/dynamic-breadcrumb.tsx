"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useMemo, useEffect, useState } from "react";
import Link from "next/link";
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

interface BreadcrumbItemData {
  label: string;
  href: string;
  isLast: boolean;
  isBase: boolean;
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
  const [applicationTitle, setApplicationTitle] = useState<string | null>(null);
  const [folderNames, setFolderNames] = useState<Record<string, string>>({});

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
    const items: BreadcrumbItemData[] = [];

    // Handle different pages
    if (segments[0] === "chat") {
      // Chat page has no nested content - no breadcrumbs
      return null;
    } else if (segments[0] === "grants") {
      // Check if we came from bookmarks
      if (segments.length > 1 && segments[1] && fromBookmarks) {
        // Viewing grant from bookmarks
        items.push({
          label: "Bookmarks",
          href: `/private/${organizationSlug}/grants?tab=bookmarks`,
          isLast: false,
          isBase: true,
        });
        items.push({
          label: grantTitle || "Grant Details",
          href: `#`,
          isLast: true,
          isBase: false,
        });
      } else {
        // Regular grants flow
        items.push({
          label: "Grants",
          href: `/private/${organizationSlug}/grants`,
          isLast: segments.length === 1,
          isBase: true,
        });

        // If we're viewing a specific grant
        if (segments.length > 1 && segments[1]) {
          items.push({
            label: grantTitle || "Grant Details",
            href: `#`,
            isLast: true,
            isBase: false,
          });
        }
      }
    } else if (segments[0] === "settings") {
      // Settings and its sub-pages don't have nested content - no breadcrumbs
      return null;
    } else if (segments[0] === "applications") {
      items.push({
        label: "Applications",
        href: `/private/${organizationSlug}/applications`,
        isLast: segments.length === 1,
        isBase: true,
      });

      // If we're viewing a specific application
      if (segments.length > 1 && segments[1]) {
        items.push({
          label: applicationTitle || "Application Details",
          href: `#`,
          isLast: true,
          isBase: false,
        });
      }
    } else if (segments[0] === "editor") {
      // Document editor breadcrumb
      items.push({
        label: "Documents",
        href: `/private/${organizationSlug}/documents`,
        isLast: false,
        isBase: true,
      });

      if (segments.length > 1 && segments[1]) {
        items.push({
          label: documentTitle || "Document",
          href: `#`,
          isLast: true,
          isBase: false,
        });
      }
    } else if (segments[0] === "profile") {
      // Profile page has no nested content - no breadcrumbs
      return null;
    } else if (segments[0] === "admin") {
      items.push({
        label: "Admin",
        href: `/private/${organizationSlug}/admin`,
        isLast: segments.length === 1,
        isBase: true,
      });

      // Handle admin sub-routes
      if (segments.length > 1 && segments[1]) {
        const subRoute = segments[1];
        let subLabel = "Admin";

        if (subRoute === "users") {
          subLabel = "Users";
        } else {
          // Capitalize first letter for other sub-routes
          subLabel = subRoute.charAt(0).toUpperCase() + subRoute.slice(1);
        }

        items.push({
          label: subLabel,
          href: `#`,
          isLast: true,
          isBase: false,
        });
      }
    } else if (segments[0] === "documents") {
      // Documents page with folder navigation
      items.push({
        label: "Documents",
        href: `/private/${organizationSlug}/documents`,
        isLast: segments.length === 1,
        isBase: true,
      });

      // Add folder path breadcrumbs
      if (segments.length > 1) {
        // Build path up to each folder
        for (let i = 1; i < segments.length; i++) {
          const folderId = segments[i];
          const folderName = folderNames[folderId] || "Loading...";
          const pathToFolder = segments.slice(1, i + 1).join("/");

          items.push({
            label: folderName,
            href: `/private/${organizationSlug}/documents/${pathToFolder}`,
            isLast: i === segments.length - 1,
            isBase: false,
          });
        }
      }
    } else {
      // For other pages, show the path with first item as base
      segments.forEach((segment, index) => {
        const label = segment
          .split("-")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ");
        items.push({
          label,
          href: `#`,
          isLast: index === segments.length - 1,
          isBase: index === 0,
        });
      });
    }

    return items;
  }, [
    pathname,
    organizationSlug,
    grantTitle,
    documentTitle,
    applicationTitle,
    fromBookmarks,
    folderNames,
  ]);

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

    if (segments[0] === "editor" && segments[1]) {
      const documentId = segments[1];
      fetch(`/api/documents/${documentId}`)
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

  // Fetch application title if we're on an application detail page
  useEffect(() => {
    const path = pathname.replace(`/private/${organizationSlug}`, "");
    const segments = path.split("/").filter(Boolean);

    if (segments[0] === "applications" && segments[1]) {
      const applicationId = segments[1];
      fetch(`/api/applications/${applicationId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.application && data.application.title) {
            setApplicationTitle(data.application.title);
          }
        })
        .catch((error) => {
          console.error("Error fetching application title:", error);
        });
    } else {
      setApplicationTitle(null);
    }
  }, [pathname, organizationSlug]);

  // Fetch folder names for documents route
  useEffect(() => {
    const path = pathname.replace(`/private/${organizationSlug}`, "");
    const segments = path.split("/").filter(Boolean);

    if (segments[0] === "documents" && segments.length > 1) {
      // Fetch names for all folders in the path
      const folderIds = segments.slice(1);
      const names: Record<string, string> = {};

      Promise.all(
        folderIds.map((folderId) =>
          fetch(`/api/folders/${folderId}`)
            .then((res) => res.json())
            .then((data) => {
              if (data.folder && data.folder.name) {
                names[folderId] = data.folder.name;
              }
            })
            .catch((error) => {
              console.error(`Error fetching folder ${folderId}:`, error);
            })
        )
      ).then(() => {
        setFolderNames(names);
      });
    } else {
      setFolderNames({});
    }
  }, [pathname, organizationSlug]);

  // Don't render anything if we're on the home page
  if (!breadcrumbs) {
    return null;
  }

  // Render heading + breadcrumbs pattern for all routes
  // First item (base) is the heading, remaining items are breadcrumbs
  const baseItem = breadcrumbs[0];
  const nestedBreadcrumbs = breadcrumbs.slice(1);

  return (
    <div className="flex items-center gap-3">
      <Link href={baseItem.href}>
        <h1 className="text-2xl font-semibold hover:text-foreground/80 transition-colors cursor-pointer">
          {baseItem.label}
        </h1>
      </Link>
      {nestedBreadcrumbs.length > 0 && (
        <>
          <span className="text-muted-foreground/40">/</span>
          <Breadcrumb>
            <BreadcrumbList>
              {nestedBreadcrumbs.map((item, index) => {
                const truncatedLabel = truncateText(item.label);
                return (
                  <div
                    key={item.href + index}
                    className="flex items-center gap-2"
                  >
                    {index > 0 && <BreadcrumbSeparator />}
                    <BreadcrumbItem>
                      {item.isLast ? (
                        <BreadcrumbPage title={item.label} isBase={item.isBase}>
                          {truncatedLabel}
                        </BreadcrumbPage>
                      ) : (
                        <BreadcrumbLink
                          href={item.href}
                          title={item.label}
                          isBase={item.isBase}
                        >
                          {truncatedLabel}
                        </BreadcrumbLink>
                      )}
                    </BreadcrumbItem>
                  </div>
                );
              })}
            </BreadcrumbList>
          </Breadcrumb>
        </>
      )}
    </div>
  );
}
