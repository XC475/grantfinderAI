"use client";

import { ResizablePanel } from "@/components/ui/resizable";
import { DocumentChatSidebar } from "@/components/applications/DocumentChatSidebar";

interface DocumentAssistantPanelProps {
  documentId: string;
}

export function DocumentAssistantPanel({
  documentId,
}: DocumentAssistantPanelProps) {
  return (
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
  );
}
