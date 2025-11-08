"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PanelRight } from "lucide-react";
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
import { DocumentProvider } from "@/contexts/DocumentContext";

interface DocumentEditorLayoutProps {
  children: React.ReactNode;
  organizationSlug: string;
  documentId: string;
}

export function DocumentEditorLayout({
  children,
  organizationSlug,
  documentId,
}: DocumentEditorLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <DocumentProvider>
      <SidebarProvider className="h-screen">
        <AppSidebar />
        <ResizablePanelGroup direction="horizontal" className="flex-1 w-full">
          {/* Main content panel with breadcrumbs */}
          <ResizablePanel defaultSize={isSidebarOpen ? 60 : 100} minSize={30}>
            <SidebarInset className="flex flex-col h-full">
              <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 border-b">
                <div className="flex items-center gap-2 px-4">
                  <Separator orientation="vertical" className="mr-2 h-4" />
                  <DynamicBreadcrumb organizationSlug={organizationSlug} />
                </div>
              </header>
              <div className="flex-1 flex flex-col overflow-hidden">
                {children}
                {/* Toggle button when sidebar is closed */}
                {!isSidebarOpen && (
                  <div className="fixed top-4 right-4 z-40">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setIsSidebarOpen(true)}
                      className="size-7 bg-background/95 backdrop-blur-sm border shadow-sm"
                    >
                      <PanelRight className="h-4 w-4" />
                      <span className="sr-only">Open Assistant Sidebar</span>
                    </Button>
                  </div>
                )}
              </div>
            </SidebarInset>
          </ResizablePanel>

          {/* Resizable handle (only shown when sidebar is open) */}
          {isSidebarOpen && <ResizableHandle withHandle />}

          {/* Document chat sidebar panel - at same level as main content */}
          {isSidebarOpen && (
            <ResizablePanel defaultSize={40} minSize={25} maxSize={60}>
              <div className="h-full flex flex-col border-l bg-background">
                {/* Toggle sidebar button - aligned with breadcrumbs */}
                <div className="flex h-16 shrink-0 items-center gap-2 px-4 border-b">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsSidebarOpen(false)}
                    className="size-7"
                  >
                    <PanelRight className="h-4 w-4 transition-transform rotate-180" />
                    <span className="sr-only">Close Assistant Sidebar</span>
                  </Button>
                  <h2 className="text-lg font-semibold">Assistant</h2>
                </div>
                <div className="flex-1 overflow-hidden">
                  <DocumentChatSidebar
                    documentId={documentId}
                    onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
                  />
                </div>
              </div>
            </ResizablePanel>
          )}
        </ResizablePanelGroup>
      </SidebarProvider>
    </DocumentProvider>
  );
}
