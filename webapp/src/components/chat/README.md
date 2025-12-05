# Chat Components

This folder contains all chat-related UI components used throughout the GrantWare AI application.

## Component Overview

### Input Components

| Component | File | Description |
|-----------|------|-------------|
| **InitialMessageInput** | `initial-message-input.tsx` | Large centered input shown when chat is **empty** (welcome/hero state). Features a rounded container with `+` button dropdown and submit button. |
| **MessageInput** | `message-input.tsx` | Input shown **during conversation** at the bottom of the chat. Includes animated placeholder, resize handle, stop button, and interrupt functionality. |

### Display Components

| Component | File | Description |
|-----------|------|-------------|
| **Chat** | `chat-container.tsx` | Main chat container that orchestrates empty vs. conversation states. Switches between `InitialMessageInput` and `MessageInput` based on message count. |
| **ChatMessage** | `chat-message.tsx` | Renders individual chat messages (user/assistant). Handles markdown rendering, file attachments, tool invocations, and reasoning blocks. |
| **MessageList** | `message-list.tsx` | Renders a list of `ChatMessage` components with typing indicator support. |
| **PromptSuggestions** | `prompt-suggestions.tsx` | Category pills (Search, Write, Summarize, Analyze, Recommend) with dropdown prompt suggestions for the empty state. |

### Feature Components

| Component | File | Description |
|-----------|------|-------------|
| **Chat (ChatDemo)** | `Chat.tsx` | Full chat implementation with state management, API calls, file uploads, and streaming response handling. Used by the chat page. |
| **ChatGreeting** | `ChatGreeting.tsx` | Personalized greeting component shown in the empty chat state. |
| **SourcesModal** | `SourcesModal.tsx` | Modal for selecting knowledge base documents as sources for chat context. |

## Component Hierarchy

```
Chat Page
└── ChatDemo (Chat.tsx)
    └── Chat (chat-container.tsx)
        ├── [Empty State]
        │   ├── ChatGreeting
        │   ├── InitialMessageInput
        │   └── PromptSuggestions
        │
        └── [Conversation State]
            ├── ChatMessages
            │   └── MessageList
            │       └── ChatMessage (per message)
            └── ChatForm
                └── MessageInput
```

## Key Features

### InitialMessageInput
- Large rounded container (`rounded-3xl`, min-height 120px)
- `+` button dropdown with: Attach files, Add sources, Google Drive
- Auto-resizing textarea
- Drag & drop file support
- Source document preview chips

### MessageInput
- Animated placeholder cycling through suggestions
- Manual resize handle (drag to expand)
- Stop button during AI generation
- Interrupt prompt (press Enter to stop and send new message)
- Long text paste auto-converts to file attachment (>500 chars)

### ChatMessage
- Markdown rendering with syntax highlighting
- File attachment previews
- Tool invocation display (calling, result, cancelled states)
- Reasoning block collapsible section
- Timestamp display
- Copy button action

## Usage Examples

### Basic Chat Container
```tsx
import { Chat } from "@/components/chat/chat-container";
import { Message } from "@/components/chat/chat-message";

<Chat
  messages={messages}
  handleSubmit={handleSubmit}
  input={input}
  handleInputChange={handleInputChange}
  isGenerating={isLoading}
  stop={stop}
  append={append}
  suggestions={["Find grants...", "Help me write..."]}
/>
```

### Using ChatDemo (Full Implementation)
```tsx
import { ChatDemo } from "@/components/chat/Chat";

<ChatDemo
  initialMessages={[]}
  chatId={chatId}
  onChatIdChange={handleChatIdChange}
  userName="John"
/>
```

## Exports

Each file exports its main component and relevant types:

- `initial-message-input.tsx`: `InitialMessageInput`, `HeroChatInput` (alias)
- `message-input.tsx`: `MessageInput`
- `chat-container.tsx`: `Chat`, `ChatContainer`, `ChatMessages`, `ChatForm`
- `chat-message.tsx`: `ChatMessage`, `Message` (type), `ChatMessageProps` (type)
- `message-list.tsx`: `MessageList`
- `prompt-suggestions.tsx`: `PromptSuggestions`
- `Chat.tsx`: `ChatDemo`, `ChatComponent` (alias)
- `SourcesModal.tsx`: `SourcesModal`, `SourceDocument` (type)


