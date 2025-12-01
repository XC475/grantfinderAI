"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useMemo, useEffect, useState, useRef } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { FileText, ChevronRight, Edit, Copy, FolderInput, Download, Trash2 } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";
import { useDocumentOperationsOptional } from "@/contexts/DocumentOperationsContext";

interface DynamicBreadcrumbProps {
  organizationSlug: string;
  documentId?: string;
}

interface BreadcrumbItemData {
  label: string;
  href: string;
  isLast: boolean;
  isBase: boolean;
  isCollapsed?: boolean;
}

// Helper function to truncate text - very short for mobile
function truncateText(text: string, maxLength: number = 15): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
}

// Helper function to collapse breadcrumbs when there are too many
function getCollapsedBreadcrumbs(
  items: BreadcrumbItemData[],
  maxVisible: number
): BreadcrumbItemData[] {
  // If we have fewer items than or equal to the max, just return everything
  if (items.length <= maxVisible) return items;

  // If maxVisible = 1, just show the last item
  if (maxVisible === 1) {
    return [items[items.length - 1]];
  }

  // Always show at least 2 (first and last)
  const minVisible = Math.max(maxVisible, 2);

  // If maxVisible = 2 → show first, "…", last
  if (minVisible === 2) {
    return [
      items[0],
      {
        label: "…",
        href: "#",
        isLast: false,
        isBase: false,
        isCollapsed: true,
      },
      items[items.length - 1],
    ];
  }

  // With 3 visible slots → show first, "…", last
  if (minVisible === 3) {
    return [
      items[0],
      {
        label: "…",
        href: "#",
        isLast: false,
        isBase: false,
        isCollapsed: true,
      },
      items[items.length - 1],
    ];
  }

  // For 4+ visible slots:
  // Example: maxVisible = 4 → show first, "…", second-last, last
  const output: BreadcrumbItemData[] = [];

  output.push(items[0]); // First

  output.push({
    label: "…",
    href: "#",
    isLast: false,
    isBase: false,
    isCollapsed: true,
  });

  // Calculate how many tail items we can show
  // We already took 2 (first + ellipsis)
  const remainingSlots = minVisible - 2;

  const tail = items.slice(-remainingSlots);

  output.push(...tail);

  return output;
}

export function DynamicBreadcrumb({
  organizationSlug,
  documentId,
}: DynamicBreadcrumbProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [grantTitle, setGrantTitle] = useState<string | null>(null);
  const [documentTitle, setDocumentTitle] = useState<string | null>(null);
  const [documentData, setDocumentData] = useState<{ folderId: string | null } | null>(null);
  const [applicationTitle, setApplicationTitle] = useState<string | null>(null);
  const [folderNames, setFolderNames] = useState<Record<string, string>>({});
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const [maxVisibleItems, setMaxVisibleItems] = useState(4);
  
  // Get document operations from context (optional - only available in editor layout)
  const documentOperations = useDocumentOperationsOptional();
  const { copyDocument, moveDocument, exportDocument } = documentOperations || {};

  const fromBookmarks = searchParams.get("from") === "bookmarks";

  // Simple window width based collapsing
  useEffect(() => {
    const updateMaxItems = () => {
      const width = window.innerWidth;

      // Very aggressive mobile collapsing
      if (width < 1024) {
        setMaxVisibleItems(1); // Mobile: ONLY current folder
      } else if (width < 1200) {
        setMaxVisibleItems(2); // Tablet: first ... last
      } else {
        setMaxVisibleItems(4); // Desktop: first ... secondLast last
      }
    };

    // Initial check
    updateMaxItems();

    // Update on resize
    window.addEventListener("resize", updateMaxItems);

    return () => window.removeEventListener("resize", updateMaxItems);
  }, []);

  // Handler for clicking document title to edit (changed from double-click)
  const handleClickTitle = () => {
    if (documentTitle) {
      setEditedTitle(documentTitle);
      setIsEditingTitle(true);
    }
  };

  // Handler for saving the edited title
  const handleSaveTitle = async () => {
    if (!editedTitle.trim()) {
      toast.error("Document title cannot be empty");
      return;
    }

    // Check if title actually changed
    if (editedTitle.trim() === documentTitle) {
      setIsEditingTitle(false);
      return;
    }

    // Get document ID from URL
    const path = pathname.replace(`/private/${organizationSlug}`, "");
    const segments = path.split("/").filter(Boolean);
    const documentId = segments[1];

    try {
      const response = await fetch(`/api/documents/${documentId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: editedTitle.trim() }),
      });

      if (!response.ok) throw new Error("Failed to update document title");

      setDocumentTitle(editedTitle.trim());
      setIsEditingTitle(false);
      toast.success("Document title updated");
    } catch (error) {
      console.error("Error updating document title:", error);
      toast.error("Failed to update document title");
    }
  };

  // Handler for canceling edit
  const handleCancelEdit = () => {
    setIsEditingTitle(false);
    setEditedTitle("");
  };

  // Focus input when editing starts
  useEffect(() => {
    if (isEditingTitle && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditingTitle]);

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
      // Document editor breadcrumb - just show document title
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
            setDocumentData({ folderId: data.document.folderId || null });
          }
        })
        .catch((error) => {
          console.error("Error fetching document title:", error);
        });
    } else {
      setDocumentTitle(null);
      setDocumentData(null);
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

  // Check if first item is a base item (should be rendered as heading)
  const hasBaseHeading = breadcrumbs.length > 0 && breadcrumbs[0].isBase;

  // Check if we're on editor page for special handling
  const path = pathname.replace(`/private/${organizationSlug}`, "");
  const segments = path.split("/").filter(Boolean);
  const isEditorPage = segments[0] === "editor";

  // If no base heading (like editor page), render all as normal breadcrumbs
  if (!hasBaseHeading) {
    const collapsedBreadcrumbs = getCollapsedBreadcrumbs(
      breadcrumbs,
      maxVisibleItems
    );

    return (
      <Breadcrumb>
        <BreadcrumbList>
          {collapsedBreadcrumbs.map((item, index) => {
            const truncatedLabel = truncateText(item.label);
            return (
              <div key={item.href + index} className="flex items-center gap-2">
                {index > 0 && <BreadcrumbSeparator />}
                <BreadcrumbItem>
                  {item.isCollapsed ? (
                    // Collapsed indicator
                    <span
                      className="text-muted-foreground cursor-default px-1"
                      title="Some breadcrumbs are hidden"
                    >
                      {item.label}
                    </span>
                  ) : item.isLast && isEditorPage ? (
                    // Editable document title on editor page with dropdown icon
                    <div className="flex items-center gap-2.5">
                      {/* Document Icon with Dropdown Menu */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button
                            className="flex items-center justify-center hover:bg-accent rounded p-1 transition-colors cursor-pointer"
                            aria-label="Document options"
                          >
                            <FileText className="h-4 w-4 text-blue-500 shrink-0" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" side="bottom">
                          <DropdownMenuItem onClick={handleClickTitle}>
                            <Edit className="h-4 w-4 mr-2" />
                            Rename
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => documentId && copyDocument && copyDocument(documentId, documentTitle || "", documentData?.folderId || null)}
                            disabled={!copyDocument}
                          >
                            <Copy className="h-4 w-4 mr-2" />
                            Make a Copy
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => documentId && moveDocument && moveDocument(documentId, documentTitle || "", documentData?.folderId || null)}
                            disabled={!moveDocument}
                          >
                            <FolderInput className="h-4 w-4 mr-2" />
                            Move
                          </DropdownMenuItem>
                          <DropdownMenuSub>
                            <DropdownMenuSubTrigger disabled={!exportDocument}>
                              <Download className="h-4 w-4 mr-2" />
                              Export
                            </DropdownMenuSubTrigger>
                            <DropdownMenuSubContent>
                              <DropdownMenuItem onClick={() => documentId && exportDocument && exportDocument(documentId, "google-drive")}>
                                Google Drive
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => documentId && exportDocument && exportDocument(documentId, "pdf")}>
                                PDF
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => documentId && exportDocument && exportDocument(documentId, "docx")}>
                                Word Doc
                              </DropdownMenuItem>
                            </DropdownMenuSubContent>
                          </DropdownMenuSub>
                          <DropdownMenuItem 
                            onClick={() => console.log("Delete")}
                            className="text-destructive focus:text-destructive cursor-pointer"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                      
                      {isEditingTitle ? (
                        <Input
                          ref={inputRef}
                          value={editedTitle}
                          onChange={(e) => setEditedTitle(e.target.value)}
                          onBlur={handleSaveTitle}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              handleSaveTitle();
                            } else if (e.key === "Escape") {
                              handleCancelEdit();
                            }
                          }}
                          className="h-auto px-2 py-1.5 text-[17px] font-semibold border-2 border-gray-300 rounded-md [&::selection]:bg-[rgba(90,139,242,0.4)] [&::selection]:text-black"
                          style={{
                            width: `${Math.max(editedTitle.length * 10 + 30, 150)}px`,
                          }}
                        />
                      ) : (
                        <button
                          onClick={handleClickTitle}
                          title="Click to rename"
                          className="text-[17px] font-semibold cursor-pointer rounded-md px-2 py-1.5 transition-all duration-200 hover:border-2 hover:border-gray-300 border-2 border-transparent"
                        >
                          {truncatedLabel}
                        </button>
                      )}
                    </div>
                  ) : item.isLast ? (
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

  // Render heading + breadcrumbs pattern for routes with base heading
  // First item (base) is the heading, remaining items are breadcrumbs
  const baseItem = breadcrumbs[0];
  const nestedBreadcrumbs = breadcrumbs.slice(1);

  // Apply aggressive collapsing to nested breadcrumbs
  const collapsedNestedBreadcrumbs = getCollapsedBreadcrumbs(
    nestedBreadcrumbs,
    maxVisibleItems
  );

  return (
    <div className="flex items-center gap-3">
      <Link href={baseItem.href} className="shrink-0">
        <h1 className="text-2xl font-semibold hover:text-foreground/80 transition-colors cursor-pointer">
          {baseItem.label}
        </h1>
      </Link>
      {collapsedNestedBreadcrumbs.length > 0 && (
        <>
          <span className="text-muted-foreground/40 shrink-0">/</span>
          <Breadcrumb className="min-w-0 flex-1">
            <BreadcrumbList>
              {collapsedNestedBreadcrumbs.map((item, index) => {
                const truncatedLabel = truncateText(item.label);
                return (
                  <div
                    key={item.href + index}
                    className="flex items-center gap-2"
                  >
                    {index > 0 && <BreadcrumbSeparator />}
                    <BreadcrumbItem>
                      {item.isCollapsed ? (
                        // Collapsed indicator
                        <span
                          className="text-muted-foreground cursor-default px-1"
                          title="Some breadcrumbs are hidden"
                        >
                          {item.label}
                        </span>
                      ) : item.isLast ? (
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
