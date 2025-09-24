import React from "react";
import { ChatComponent } from "@/components/chat/Chat";

function ChatPage() {
  return (
    <div className="p-6 space-y-8 max-w-screen">
      <div>
        <h1 className="text-2xl font-bold mb-4">AI Assistant</h1>
        <p className="text-muted-foreground mb-6">
          Ask me anything about grants! I can help you find funding
          opportunities, understand application requirements, and provide
          guidance on grant writing.
        </p>
        <ChatComponent />
      </div>
    </div>
  );
}

export default ChatPage;
