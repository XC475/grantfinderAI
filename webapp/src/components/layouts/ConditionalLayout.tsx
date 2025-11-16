"use client";

import { useState, useMemo, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { PanelRight, Loader2, Check } from "lucide-react";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { Separator } from "@/components/ui/separator";
import { DynamicBreadcrumb } from "@/components/sidebar/dynamic-breadcrumb";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import { DocumentChatSidebar } from "@/components/applications/DocumentChatSidebar";
import { DocumentProvider, useDocument } from "@/contexts/DocumentContext";
import { HeaderContentProvider, useHeaderContent } from "@/contexts/HeaderContentContext";

interface ConditionalLayoutProps {
  children: React.ReactNode;
  organizationSlug: string;
}

function SaveStatusIndicator() {
  const { saveStatus } = useDocument();

  if (saveStatus === "saving") {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-3 w-3 animate-spin" />
        <span>Saving...</span>
      </div>
    );
  }

  if (saveStatus === "saved") {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Check className="h-3 w-3 text-green-600" />
        <span>Saved</span>
      </div>
    );
  }

  return null;
}

function DocumentEditorLayoutContent({
  children,
  organizationSlug,
  documentId,
}: {
  children: React.ReactNode;
  organizationSlug: string;
  documentId: string;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  // Only render ResizablePanelGroup on client to avoid hydration mismatches
  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    // Return a placeholder during SSR that matches the structure
    return (
      <div className="flex-1 w-full flex">
        <div className="flex-1 flex flex-col h-full bg-white">
          <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b bg-white">
            <div className="flex items-center gap-2 px-4">
              <Separator orientation="vertical" className="mr-2 h-4" />
              <DynamicBreadcrumb organizationSlug={organizationSlug} />
            </div>
            <div className="flex items-center gap-3 px-4">
              <SaveStatusIndicator />
              <Separator orientation="vertical" className="h-4" />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="size-7"
              >
                <PanelRight className="h-4 w-4" />
                <span className="sr-only">
                  {isSidebarOpen ? "Close" : "Open"} Assistant Sidebar
                </span>
              </Button>
            </div>
          </header>
          <div className="flex-1 flex flex-col overflow-hidden bg-white">{children}</div>
        </div>
      </div>
    );
  }

  return (
    <ResizablePanelGroup direction="horizontal" className="flex-1 w-full">
      {/* Main content panel with breadcrumbs */}
      <ResizablePanel defaultSize={isSidebarOpen ? 60 : 100} minSize={30}>
        <SidebarInset className="flex flex-col h-full bg-white">
          <header className="flex h-16 shrink-0 items-center justify-between gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 border-b bg-white">
            <div className="flex items-center gap-2 px-4">
              <Separator orientation="vertical" className="mr-2 h-4" />
              <DynamicBreadcrumb organizationSlug={organizationSlug} />
            </div>
            <div className="flex items-center gap-3 px-4">
              <SaveStatusIndicator />
              <Separator orientation="vertical" className="h-4" />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="size-7"
              >
                <PanelRight
                  className={`h-4 w-4 transition-transform ${isSidebarOpen ? "rotate-180" : ""}`}
                />
                <span className="sr-only">
                  {isSidebarOpen ? "Close" : "Open"} Assistant Sidebar
                </span>
              </Button>
            </div>
          </header>
          <div className="flex-1 flex flex-col overflow-hidden bg-white">{children}</div>
        </SidebarInset>
      </ResizablePanel>

      {/* Resizable handle (only shown when sidebar is open) */}
      {isSidebarOpen && <ResizableHandle withHandle />}

      {/* Document chat sidebar panel - at same level as main content */}
      {isSidebarOpen && (
        <ResizablePanel defaultSize={40} minSize={25} maxSize={60}>
          <div className="h-full flex flex-col border-l bg-background">
            {/* Header aligned with breadcrumbs */}
            <div className="flex h-16 shrink-0 items-center gap-2 px-4 border-b">
              <h2 className="text-lg font-semibold">Assistant</h2>
            </div>
            <div className="flex-1 overflow-hidden">
              <DocumentChatSidebar documentId={documentId} />
            </div>
          </div>
        </ResizablePanel>
      )}
    </ResizablePanelGroup>
  );
}

function NormalLayoutContent({
  children,
  organizationSlug,
}: {
  children: React.ReactNode;
  organizationSlug: string;
}) {
  const { headerContent } = useHeaderContent();

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <Separator orientation="vertical" className="mr-2 h-4" />
            {headerContent || <DynamicBreadcrumb organizationSlug={organizationSlug} />}
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0 overflow-hidden h-full">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}

export function ConditionalLayout({
  children,
  organizationSlug,
}: ConditionalLayoutProps) {
  const pathname = usePathname();

  // Detect if we're on an editor page and extract documentId
  const { isEditorPage, documentId } = useMemo(() => {
    const isEditor = pathname.includes("/editor/");
    const docId = isEditor
      ? pathname.split("/editor/")[1]?.split("/")[0]
      : undefined;
    return { isEditorPage: isEditor, documentId: docId };
  }, [pathname]);

  if (isEditorPage && documentId) {
    // Document editor layout with assistant sidebar
    return (
      <DocumentProvider>
        <SidebarProvider className="h-screen">
          <AppSidebar />
          <DocumentEditorLayoutContent
            organizationSlug={organizationSlug}
            documentId={documentId}
          >
            {children}
          </DocumentEditorLayoutContent>
        </SidebarProvider>
      </DocumentProvider>
    );
  }

  // Normal layout for other pages - wrapped with HeaderContentProvider
  return (
    <HeaderContentProvider>
      <NormalLayoutContent organizationSlug={organizationSlug}>
        {children}
      </NormalLayoutContent>
    </HeaderContentProvider>
  );
}
