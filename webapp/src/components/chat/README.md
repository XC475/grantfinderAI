# Chat Components

This folder contains all chat-related UI components used throughout the GrantWare AI application.

## Folder Structure

```
chat/
├── index.ts                    # Barrel exports for all components & constants
├── constants.ts                # Shared configuration constants & icons
├── ai-settings-dropdown.tsx    # AI capability toggles dropdown
├── initial-message-input.tsx   # Empty/hero state input
├── message-input.tsx           # Conversation state input
├── Chat.tsx                    # Full chat implementation
├── ChatGreeting.tsx            # Welcome greeting component
├── SourcesModal.tsx            # Document source picker
├── chat-container.tsx          # Main chat container
├── chat-message.tsx            # Individual message renderer
├── message-list.tsx            # Message list wrapper
├── prompt-suggestions.tsx      # Category suggestion pills
└── README.md
```

## Component Overview

### Input Components

| Component               | File                        | Description                                                                                                                                                        |
| ----------------------- | --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **InitialMessageInput** | `initial-message-input.tsx` | Large centered input shown when chat is **empty** (welcome/hero state). Features a rounded container with `+` button dropdown, settings button, and submit button. |
| **MessageInput**        | `message-input.tsx`         | Input shown **during conversation** at the bottom of the chat. Includes animated placeholder, resize handle, stop button, and interrupt functionality.             |

### Display Components

| Component             | File                     | Description                                                                                                                                            |
| --------------------- | ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Chat**              | `chat-container.tsx`     | Main chat container that orchestrates empty vs. conversation states. Switches between `InitialMessageInput` and `MessageInput` based on message count. |
| **ChatMessage**       | `chat-message.tsx`       | Renders individual chat messages (user/assistant). Handles markdown rendering, file attachments, tool invocations, and reasoning blocks.               |
| **MessageList**       | `message-list.tsx`       | Renders a list of `ChatMessage` components with typing indicator support.                                                                              |
| **PromptSuggestions** | `prompt-suggestions.tsx` | Category pills (Search, Write, Summarize, Analyze, Recommend) with dropdown prompt suggestions for the empty state.                                    |

### Feature Components

| Component              | File                       | Description                                                                                                                      |
| ---------------------- | -------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| **Chat (ChatDemo)**    | `Chat.tsx`                 | Full chat implementation with state management, API calls, file uploads, and streaming response handling. Used by the chat page. |
| **ChatGreeting**       | `ChatGreeting.tsx`         | Personalized greeting component shown in the empty chat state.                                                                   |
| **SourcesModal**       | `SourcesModal.tsx`         | Modal for selecting knowledge base documents as sources for chat context.                                                        |
| **AISettingsDropdown** | `ai-settings-dropdown.tsx` | Dropdown with AI capability toggles (Organization Profile, Knowledge Base, Grant Search) for chat or editor assistants.          |

## Constants (`constants.ts`)

The constants file centralizes configuration for input components:

### Icons

| Constant                | Description                                           |
| ----------------------- | ----------------------------------------------------- |
| `BUTTON_ICONS`          | Icons for buttons (plus, settings, submit, stop, etc) |
| `FILE_TYPE_ICONS`       | Icons for different file types (pdf, docx, csv, txt)  |
| `FILE_TYPE_ICON_COLORS` | Color classes for file type icons                     |
| `ICON_SIZES`            | Size classes (sm, md, lg)                             |

### Placeholder & Animation

| Constant                | Description                                              |
| ----------------------- | -------------------------------------------------------- |
| `PLACEHOLDER_TEXTS`     | Array of placeholder texts that cycle in the empty state |
| `DEFAULT_PLACEHOLDER`   | Default placeholder for non-empty chat states            |
| `PLACEHOLDER_ANIMATION` | Timing for placeholder typing effect                     |

### Menu Items

| Constant                | Description                            |
| ----------------------- | -------------------------------------- |
| `ATTACHMENT_MENU_ITEMS` | Dropdown menu items for the `+` button |
| `SETTINGS_MENU_ITEMS`   | Dropdown menu items for settings       |

### File Handling

| Constant               | Description                                         |
| ---------------------- | --------------------------------------------------- |
| `SUPPORTED_FILE_TYPES` | Accepted file extensions and MIME types             |
| `TEXT_PASTE_THRESHOLD` | Character limit before paste converts to file (500) |

### Styling

| Constant        | Description                                       |
| --------------- | ------------------------------------------------- |
| `INPUT_SIZING`  | Sizing configuration for different input variants |
| `BUTTON_STYLES` | Tailwind class configurations for buttons         |

### Helper Functions

| Function                         | Description                          |
| -------------------------------- | ------------------------------------ |
| `getAISettingsUrl(slug)`         | Generate AI settings URL             |
| `getFileTypeIcon(fileType)`      | Get icon component for a file type   |
| `getFileTypeIconColor(fileType)` | Get color class for a file type icon |

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
- `⚙️` settings dropdown with AI capability toggles
- Auto-resizing textarea
- Drag & drop file support
- Source document preview chips

### MessageInput

- Animated placeholder cycling through suggestions
- Manual resize handle (drag to expand)
- Stop button during AI generation
- Interrupt prompt (press Enter to stop and send new message)
- Long text paste auto-converts to file attachment (>500 chars)
- `+` and `⚙️` settings buttons with AI toggles

### AISettingsDropdown

- Dropdown menu with switches for AI capabilities
- Three toggles: Organization Profile, Knowledge Base, Grant Search
- Supports both "chat" and "editor" assistant types
- Real-time toggle updates with optimistic UI
- Loading states per toggle
- Uses `useAISettings` hook for state management

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
/>;
```

### Using ChatDemo (Full Implementation)

```tsx
import { ChatDemo } from "@/components/chat/Chat";

<ChatDemo
  initialMessages={[]}
  chatId={chatId}
  onChatIdChange={handleChatIdChange}
  userName="John"
/>;
```

### Importing from chat

```tsx
// Import components
import {
  MessageInput,
  InitialMessageInput,
  ChatMessage,
  Chat,
} from "@/components/chat";

// Import constants & icons
import {
  BUTTON_ICONS,
  FILE_TYPE_ICONS,
  ICON_SIZES,
  PLACEHOLDER_TEXTS,
  SUPPORTED_FILE_TYPES,
  getAISettingsUrl,
  getFileTypeIcon,
} from "@/components/chat";
```

## Exports

### From `index.ts`

**Input Components:**

- `InitialMessageInput`, `HeroChatInput` (alias), `MessageInput`
- `AISettingsDropdown` - AI capability toggles dropdown

**Display Components:**

- `Chat`, `ChatContainer`, `ChatMessages`, `ChatForm`
- `ChatMessage`, `MessageList`
- `PromptSuggestions`, `ChatGreeting`
- `ChatDemo`, `ChatComponent` (alias)
- `SourcesModal`

**Icons:**

- `BUTTON_ICONS`, `FILE_TYPE_ICONS`, `FILE_TYPE_ICON_COLORS`, `ICON_SIZES`

**Constants:**

- `PLACEHOLDER_TEXTS`, `DEFAULT_PLACEHOLDER`, `PLACEHOLDER_ANIMATION`
- `ATTACHMENT_MENU_ITEMS`, `SETTINGS_MENU_ITEMS`
- `SUPPORTED_FILE_TYPES`, `TEXT_PASTE_THRESHOLD`
- `INPUT_SIZING`, `BUTTON_STYLES`

**Functions:**

- `getAISettingsUrl`, `getFileTypeIcon`, `getFileTypeIconColor`

**Types:**

- `DropdownItemConfig`, `AIAssistantType`
- `Message`, `ChatMessageProps`, `SourceDocument`
