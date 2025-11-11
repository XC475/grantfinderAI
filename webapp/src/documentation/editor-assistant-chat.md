# Document Editor Assistant Chat

## Overview

The Document Editor Assistant is a specialized AI chat interface integrated directly into the document editing experience. Unlike the main AI chat, the editor assistant is contextually aware of the document being edited and provides writing assistance, suggestions, and collaboration features specifically tailored to document creation and editing workflows.

**Key Differentiators:**

- **Document-Centric**: Always has full context of the current document
- **Multiple Chat Sessions**: Support for multiple conversation threads per document
- **Persistent State**: Chat sessions are saved and restored across page reloads
- **Cursor-Style UI**: Tab-based navigation with rename, close, and history features
- **Contextually Separate**: Editor chats don't appear in the main sidebar, keeping workflows focused

---

## Table of Contents

1. [User Guide](#user-guide)
2. [Technical Architecture](#technical-architecture)
3. [Chat Persistence & State](#chat-persistence--state)
4. [API Reference](#api-reference)
5. [Database Schema](#database-schema)
6. [UI Components](#ui-components)
7. [Troubleshooting](#troubleshooting)
8. [Future Enhancements](#future-enhancements)

---

## User Guide

### Accessing the Editor Assistant

The editor assistant is available whenever you're editing a document:

1. Open any document in the editor
2. Look for the **AI Assistant** panel on the right side
3. The assistant automatically loads with document context
4. Start typing to begin a new conversation

### Key Features

#### 1. Persistent Chat Sessions

Every conversation with the editor assistant is automatically saved:

- **Auto-Save**: Messages save immediately to the database
- **Session Recovery**: Reload the page and your chat is still there
- **Multiple Sessions**: Create multiple conversation threads per document
- **History Access**: View and restore any previous chat session

#### 2. Tab-Based Navigation (Cursor-Style)

Manage multiple conversations with an intuitive tab interface:

**Tab Bar Features:**

- Each chat session appears as a tab
- Active tab is highlighted
- Click any tab to switch conversations
- Close button (X) appears on hover for active tab
- Tabs persist across page reloads

**Creating New Chats:**

- Click the **"+"** icon on the right to start a fresh conversation
- New chats automatically get added to the tab bar
- Previous chat remains saved, just switches to new tab

**History Dropdown:**

- Click the **history icon** (clock) to see all chat sessions
- Shows all conversations for the current document
- Displays chat title, message count, and timestamp
- Click any session to load it and add it to tabs

#### 3. Renaming Chat Sessions

Organize your conversations by giving them meaningful names:

**To Rename:**

1. **Double-click** on any tab title
2. Input field appears with text selected
3. Type your new title
4. Press **Enter** or click away to save
5. Press **Escape** to cancel

**Auto-Generated Titles:**

- First chat message automatically becomes the title
- Titles are truncated to 50 characters for display
- Full title visible on hover

#### 4. Closing Tabs

Keep your workspace clean by closing tabs you don't need:

**To Close:**

- Hover over the active tab
- Click the **X** icon that appears
- Tab closes and switches to previous tab
- Chat session remains saved in database

**Behavior:**

- Closing active tab switches to previous tab (index - 1)
- If closing first tab, switches to next available
- If no tabs remain, starts with empty state
- Chat history always accessible from dropdown

### Writing Assistance Use Cases

#### Drafting Content

```
User: "Help me write an introduction about climate change impacts"
AI: [Provides draft introduction with document context]
User: "Make it more formal"
AI: [Refines tone while maintaining context]
```

#### Editing & Refinement

```
User: "Review the second paragraph for clarity"
AI: [Analyzes paragraph and suggests improvements]
User: "Apply those changes"
AI: [Provides revised version]
```

#### Research & Expansion

```
User: "What are the main arguments I should include about renewable energy?"
AI: [Suggests key points based on document topic]
User: "Elaborate on solar energy benefits"
AI: [Provides detailed content with sources]
```

#### Grant-Specific Assistance

When editing grant proposals, the assistant can:

- Suggest content aligned with grant requirements
- Help match language to funder priorities
- Provide examples of strong proposal sections
- Review against eligibility criteria

### Document Attachments

Upload additional documents to enrich your writing context:

**Supported File Types:**

- PDF documents (.pdf)
- Word documents (.docx)
- Text files (.txt)
- CSV files (.csv)

**Maximum File Size:** 40MB per file

**How to Attach:**

1. Click the paperclip icon (📎) in the input bar
2. Drag and drop files onto the input area
3. Copy a file and paste (Cmd+V / Ctrl+V)

**Use Cases:**

#### Reference Integration

```
User: *attaches research_paper.pdf*
"Summarize the key findings and help me integrate them into my methods section"
AI: [Reads PDF and provides relevant excerpts with integration suggestions]
```

#### Data-Driven Content

```
User: *attaches survey_results.csv*
"Analyze this data and draft a results paragraph"
AI: [Analyzes CSV and generates data-driven content]
```

#### Comparison and Improvement

```
User: *attaches successful_proposal_2023.pdf*
"Compare this with my current draft and suggest improvements"
AI: [Identifies strong elements from reference document]
```

#### Multiple File Analysis

```
User: *attaches budget_template.docx, guidelines.pdf*
"Help me create a budget section that follows these guidelines"
AI: [Uses both documents to guide budget creation]
```

---

## Technical Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Document Editor Page                      │
│  ┌───────────────────────────┐  ┌──────────────────────────┐│
│  │   Document Content        │  │  Editor Assistant        ││
│  │   (TipTap Editor)         │  │  (DocumentChatSidebar)   ││
│  │                           │  │                          ││
│  │  - Rich text editing      │  │  Tab Bar                 ││
│  │  - Auto-save              │  │  ┌─────┬─────┬─────┐    ││
│  │  - Version control        │  │  │Tab1 │Tab2 │Tab3 │    ││
│  │                           │  │  └─────┴─────┴─────┘    ││
│  │                           │  │                          ││
│  │                           │  │  Chat Messages           ││
│  │                           │  │  ┌────────────────────┐  ││
│  │                           │  │  │ User: ...          │  ││
│  │                           │  │  │ AI: ...            │  ││
│  │                           │  │  └────────────────────┘  ││
│  │                           │  │                          ││
│  │                           │  │  Input + Controls        ││
│  └───────────────────────────┘  └──────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

### Context Flow

```
Document Context → DocumentContext Provider
                         ↓
            DocumentChatSidebar Component
                         ↓
        ┌────────────────┴────────────────┐
        ↓                                  ↓
   localStorage                      /api/chat/editor
   (tab state)                       (AI processing)
        ↓                                  ↓
   Tab Restoration                  Streaming Response
                                           ↓
                                    Database Persistence
```

### Key Components

#### 1. DocumentContext Provider

**Location:** `src/contexts/DocumentContext.tsx`

Provides document state to all child components:

```typescript
interface DocumentContextType {
  documentTitle: string;
  documentContent: string;
  setDocumentTitle: (title: string) => void;
  setDocumentContent: (content: string) => void;
}
```

**Usage:**

- Wraps the document editor page
- Makes document title and content available to assistant
- Updates automatically when document changes

#### 2. DocumentChatSidebar Component

**Location:** `src/components/applications/DocumentChatSidebar.tsx`

The main UI component for the editor assistant.

**State Management:**

```typescript
// Chat state
const [messages, setMessages] = useState<Message[]>([]);
const [chatId, setChatId] = useState<string | null>(null);
const [input, setInput] = useState("");
const [isLoading, setIsLoading] = useState(false);

// Session management
const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
const [openTabs, setOpenTabs] = useState<string[]>([]);
const [loadingSessions, setLoadingSessions] = useState(false);

// Tab editing
const [editingTabId, setEditingTabId] = useState<string | null>(null);
const [editingTitle, setEditingTitle] = useState("");
```

**Key Functions:**

- `loadChatSessions()`: Fetches all chat sessions for the document
- `loadChatSession(chatId)`: Loads a specific chat with messages
- `startNewChat()`: Clears state for fresh conversation
- `closeTab(tabId)`: Removes tab and switches to previous
- `startEditingTab(tabId, title)`: Enables inline title editing
- `saveTabTitle(tabId)`: Persists renamed title to database

#### 3. Document Editor Route

**Location:** `src/app/[orgSlug]/applications/[appId]/documents/[docId]/page.tsx`

The page that combines the editor with the assistant:

```typescript
<DocumentProvider
  initialTitle={document.title}
  initialContent={document.content}
>
  <div className="flex h-full">
    {/* Document Editor */}
    <DocumentEditor />

    {/* Editor Assistant */}
    <DocumentChatSidebar documentId={params.docId} />
  </div>
</DocumentProvider>
```

---

## Chat Persistence & State

### Database Persistence

Every chat session is saved to the database with:

- **Unique Chat ID**: `chatId` (cuid)
- **Context Type**: `DRAFTING` (differentiates from other chat types)
- **Metadata**: Document linkage and chat type identification
- **Messages**: All user and AI messages with timestamps
- **Title**: Auto-generated or user-renamed
- **Ownership**: Linked to user and organization

### LocalStorage State

For optimal UX, certain state persists in the browser:

**Keys Used:**

```typescript
// Last active chat ID per document
`lastEditorChat_${documentId}`
// Open tabs per document
`openEditorTabs_${documentId}`;
```

**Example LocalStorage Data:**

```json
{
  "lastEditorChat_doc123": "chat_abc456",
  "openEditorTabs_doc123": ["chat_abc456", "chat_def789", "chat_ghi012"]
}
```

### State Restoration Flow

**On Page Load:**

1. **Fetch All Sessions**: Load all chat sessions for document from database
2. **Restore Tabs**: Read `openEditorTabs` from localStorage
3. **Validate Tabs**: Filter tabs to ensure they still exist in database
4. **Load Last Active**: Read `lastEditorChat` and load its messages
5. **Update UI**: Display tabs and active chat

**On Tab Switch:**

1. Load chat messages from database
2. Update active `chatId`
3. Save `chatId` to localStorage
4. Add to `openTabs` if not already present
5. Save `openTabs` to localStorage

**On New Chat:**

1. Clear current messages
2. Set `chatId` to null
3. Create new chat on first message send
4. Auto-generate title from first message
5. Add new chat to tabs and localStorage

**On Tab Close:**

1. Remove from `openTabs` array
2. Save updated `openTabs` to localStorage
3. If closing active tab, switch to previous
4. Chat remains in database (accessible from history)

---

## API Reference

### 1. Send Chat Message

**Endpoint:** `POST /api/chat/editor`

Sends a message to the editor assistant and receives streaming AI response.

**Request Body:**

```typescript
{
  message: string;           // User's message
  chatId?: string | null;    // Existing chat ID or null for new chat
  documentId: string;        // Document being edited
  documentTitle: string;     // Document title
  documentContent: string;   // Full document content
  conversationHistory: Array<{
    role: "user" | "assistant";
    content: string;
  }>;
}
```

**Response:**

Streaming response with AI-generated content (Server-Sent Events).

**Example:**

```typescript
const response = await fetch("/api/chat/editor", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    message: "Help me improve this introduction",
    chatId: existingChatId,
    documentId: "doc_123",
    documentTitle: "My Proposal",
    documentContent: "...",
    conversationHistory: messages,
  }),
});

// Handle streaming response
const reader = response.body.getReader();
const decoder = new TextDecoder();

while (true) {
  const { done, value } = await reader.read();
  if (done) break;

  const chunk = decoder.decode(value);
  // Process chunk...
}
```

**Success Response:**

- Status: 200 OK
- Body: Streaming text content
- Headers: `Content-Type: text/event-stream`

**Error Responses:**

- `401 Unauthorized`: User not authenticated
- `400 Bad Request`: Missing required fields
- `404 Not Found`: Document doesn't exist
- `403 Forbidden`: User doesn't have access to document
- `500 Internal Server Error`: Server or AI processing error

### 2. List Chat Sessions

**Endpoint:** `GET /api/chats/editor?documentId={documentId}`

Retrieves all chat sessions for a specific document.

**Query Parameters:**

- `documentId` (required): The document's ID

**Response Body:**

```typescript
{
  chats: Array<{
    id: string;
    title: string;
    createdAt: string;
    updatedAt: string;
    messageCount: number;
  }>;
}
```

**Example:**

```typescript
const response = await fetch(`/api/chats/editor?documentId=doc_123`);
const { chats } = await response.json();

chats.forEach((chat) => {
  console.log(`${chat.title} (${chat.messageCount} messages)`);
});
```

**Error Responses:**

- `401 Unauthorized`: User not authenticated
- `400 Bad Request`: Missing documentId parameter
- `500 Internal Server Error`: Database error

### 3. Get Chat Session

**Endpoint:** `GET /api/chats/editor/{chatId}`

Retrieves a specific chat session with all its messages.

**Path Parameters:**

- `chatId` (required): The chat session ID

**Response Body:**

```typescript
{
  chat: {
    id: string;
    title: string;
    createdAt: string;
    messages: Array<{
      id: string;
      role: "user" | "assistant";
      content: string;
      createdAt: string;
    }>;
  }
}
```

**Example:**

```typescript
const response = await fetch(`/api/chats/editor/chat_abc123`);
const { chat } = await response.json();

console.log(`Chat: ${chat.title}`);
console.log(`Messages: ${chat.messages.length}`);
```

**Error Responses:**

- `401 Unauthorized`: User not authenticated
- `404 Not Found`: Chat doesn't exist or user doesn't own it
- `500 Internal Server Error`: Database error

### 4. Update Chat Title

**Endpoint:** `PATCH /api/chats/editor/{chatId}/title`

Updates the title of a chat session.

**Path Parameters:**

- `chatId` (required): The chat session ID

**Request Body:**

```typescript
{
  title: string; // New title (1-255 characters)
}
```

**Response Body:**

```typescript
{
  success: true;
  title: string; // Updated title
}
```

**Example:**

```typescript
const response = await fetch(`/api/chats/editor/chat_abc123/title`, {
  method: "PATCH",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    title: "Grant Budget Discussion",
  }),
});

const { success, title } = await response.json();
console.log(`Title updated to: ${title}`);
```

**Error Responses:**

- `401 Unauthorized`: User not authenticated
- `400 Bad Request`: Invalid or missing title
- `404 Not Found`: Chat doesn't exist or user doesn't own it
- `500 Internal Server Error`: Database error

---

## Database Schema

### AiChat Model

The chat sessions are stored in the `ai_chats` table:

```prisma
model AiChat {
  id             String          @id @default(cuid())
  title          String?
  context        AiChatContext   // Set to "DRAFTING" for editor chats
  createdAt      DateTime        @default(now())
  updatedAt      DateTime        @updatedAt
  userId         String          @db.Uuid
  applicationId  String?         // Optional: if document is linked to application
  organizationId String
  metadata       Json?           // Contains documentId, chatType, etc.
  messages       AiChatMessage[]

  @@map("ai_chats")
  @@schema("app")
}
```

### AiChatMessage Model

Individual messages are stored in `ai_chat_messages`:

```prisma
model AiChatMessage {
  id        String            @id @default(cuid())
  chatId    String
  role      AiChatMessageRole // "user" or "assistant"
  content   String
  createdAt DateTime          @default(now())
  chat      AiChat            @relation(fields: [chatId], references: [id], onDelete: Cascade)

  @@map("ai_chat_messages")
  @@schema("app")
}
```

### Metadata Structure

The `metadata` JSON field for editor chats contains:

```typescript
{
  documentId: string;           // Required: Links to document
  documentTitle: string;        // Document title at chat creation
  chatType: "editor_assistant"; // Required: Identifies as editor chat
  opportunityId?: string;       // Optional: If document is for specific grant
}
```

### Query Examples

**Find all editor chats for a document:**

```typescript
const chats = await prisma.aiChat.findMany({
  where: {
    userId: userId,
    context: "DRAFTING",
    metadata: {
      path: ["documentId"],
      equals: documentId,
    },
    AND: {
      metadata: {
        path: ["chatType"],
        equals: "editor_assistant",
      },
    },
  },
  orderBy: { updatedAt: "desc" },
});
```

**Exclude editor chats from main chat list:**

```typescript
const chats = await prisma.aiChat.findMany({
  where: {
    userId: userId,
    OR: [
      {
        context: {
          in: ["GENERAL", "APPLICATION", "GRANT_ANALYSIS", "ELIGIBILITY"],
        },
      },
      {
        AND: [
          { context: "DRAFTING" },
          {
            NOT: {
              metadata: {
                path: ["chatType"],
                equals: "editor_assistant",
              },
            },
          },
        ],
      },
    ],
  },
});
```

---

## UI Components

### Tab Bar

**Component Structure:**

```tsx
<div className="flex items-center border-b bg-background">
  {/* Tab buttons */}
  <div className="flex-1 flex items-center overflow-x-auto">
    {openTabs.map((tabId) => (
      <TabButton
        key={tabId}
        session={session}
        isActive={chatId === session.id}
        onSwitch={() => loadChatSession(session.id)}
        onClose={() => closeTab(session.id)}
        onRename={(newTitle) => saveTabTitle(session.id, newTitle)}
      />
    ))}
  </div>

  {/* Icon buttons */}
  <div className="flex items-center gap-1 px-2 border-l">
    <HistoryButton onClick={openHistoryDropdown} />
    <NewChatButton onClick={startNewChat} />
  </div>
</div>
```

### Tab Button Features

**States:**

- Default: Grey background, normal opacity
- Active: Highlighted background, full opacity
- Hover: Lighter background, close button appears

**Interactions:**

- **Click**: Switch to this chat session
- **Double-click**: Enter edit mode for title
- **Hover (active)**: Show close button
- **Click X**: Close tab

**Edit Mode:**

```tsx
{
  isEditing ? (
    <input
      ref={editInputRef}
      value={editingTitle}
      onChange={(e) => setEditingTitle(e.target.value)}
      onBlur={() => saveTabTitle(session.id)}
      onKeyDown={(e) => {
        if (e.key === "Enter") saveTabTitle(session.id);
        if (e.key === "Escape") cancelEditingTab();
      }}
      className="text-sm flex-1 bg-background border-none outline-none focus:ring-1 focus:ring-primary"
    />
  ) : (
    <span
      onDoubleClick={() => startEditingTab(session.id, session.title)}
      className="text-sm truncate flex-1 cursor-pointer"
    >
      {session.title}
    </span>
  );
}
```

### History Dropdown

**Component:** DropdownMenu from shadcn/ui

**Features:**

- Lists all chat sessions for the document
- Shows title, message count, and relative time
- Sorted by most recently updated
- Click to load session and add to tabs

**Structure:**

```tsx
<DropdownMenu>
  <DropdownMenuTrigger>
    <Button variant="ghost" size="icon">
      <Clock className="h-4 w-4" />
    </Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent>
    {chatSessions.map((session) => (
      <DropdownMenuItem
        key={session.id}
        onClick={() => loadChatSession(session.id)}
      >
        <div className="flex flex-col">
          <span className="font-medium">{session.title}</span>
          <span className="text-xs text-muted-foreground">
            {session.messageCount} messages •{" "}
            {formatRelativeTime(session.updatedAt)}
          </span>
        </div>
      </DropdownMenuItem>
    ))}
  </DropdownMenuContent>
</DropdownMenu>
```

### Chat Messages Display

Standard chat bubble layout:

```tsx
<div className="flex-1 overflow-y-auto space-y-4 p-4">
  {messages.map((message) => (
    <div
      key={message.id}
      className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`
          max-w-[80%] rounded-lg p-3
          ${message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"}
        `}
      >
        <Markdown content={message.content} />
      </div>
    </div>
  ))}
</div>
```

---

## Troubleshooting

### Chat Not Persisting

**Symptom:** Messages disappear on page reload

**Possible Causes:**

1. Database connection issue
2. Chat not being created on first message
3. `chatId` not being set after creation

**Solutions:**

- Check browser console for API errors
- Verify `/api/chat/editor` returns a `chatId`
- Ensure `chatId` is saved to state and localStorage
- Check database for created `AiChat` records

### Tabs Not Restoring

**Symptom:** Only one tab shows after reload

**Possible Causes:**

1. localStorage not saving `openTabs`
2. Tab validation filtering out valid tabs
3. Chat sessions deleted from database

**Solutions:**

- Check localStorage for `openEditorTabs_{documentId}` key
- Verify tab IDs match existing chat sessions
- Look for console warnings about filtered tabs
- Ensure chat sessions exist in database

**Debug Code:**

```typescript
// Add to loadAndRestoreSession
console.log("Loaded sessions:", sessions.length);
console.log("Restored tabs from localStorage:", restoredTabs);
console.log("Valid tabs after filtering:", validTabs);
console.log("Last active chat:", lastChatId);
```

### Title Not Updating

**Symptom:** Double-click rename doesn't save

**Possible Causes:**

1. API endpoint not working
2. Edit mode canceling too quickly
3. Permission issue

**Solutions:**

- Check network tab for PATCH request to `/api/chats/editor/{chatId}/title`
- Ensure user owns the chat
- Verify title is trimmed and non-empty
- Check for console errors

### Slow Performance

**Symptom:** Lag when switching tabs or loading sessions

**Possible Causes:**

1. Too many messages in a chat
2. Fetching all sessions on every tab switch
3. Not using React memo optimization

**Solutions:**

- Implement message pagination for large chats
- Cache chat sessions in state (already implemented)
- Add React.memo to TabButton component
- Limit initial message load (e.g., last 50 messages)

### Wrong Document Context

**Symptom:** AI responses don't match current document

**Possible Causes:**

1. Document context not updating
2. Stale content being sent
3. Wrong documentId in request

**Solutions:**

- Verify DocumentContext is providing latest content
- Check document auto-save is working
- Ensure `documentContent` in API request is current
- Add logging to track document state changes

---

## Future Enhancements

### Planned Features

#### 1. Collaborative Editing Suggestions

**Concept:** AI directly suggests edits with inline diff view

```typescript
interface EditSuggestion {
  type: "insert" | "replace" | "delete";
  position: number;
  oldText?: string;
  newText?: string;
  reason: string;
}
```

**UI:** Click to accept/reject suggestions inline

#### 2. Chat Export

**Feature:** Export chat conversation as PDF or markdown

**Use Cases:**

- Share AI assistance with collaborators
- Document research and decision-making
- Include in grant submission packages

#### 3. Voice Input

**Feature:** Dictate messages to the assistant

**Benefits:**

- Faster input for long queries
- Accessibility improvement
- Natural conversation flow

#### 4. Chat Templates

**Feature:** Pre-defined prompts for common tasks

**Examples:**

- "Review for grammar and style"
- "Expand this section with research"
- "Make this more concise"
- "Add citations to this paragraph"

#### 5. Smart Context

**Feature:** Automatically include relevant context from application

**Context Types:**

- Grant requirements
- Eligibility criteria
- Reviewer priorities
- Organization profile

**Implementation:**

```typescript
metadata: {
  documentId: string;
  chatType: "editor_assistant";
  opportunityId?: string;
  contextIncludes: {
    grantRequirements: boolean;
    eligibilityCriteria: boolean;
    organizationProfile: boolean;
  };
}
```

#### 6. Chat Search

**Feature:** Search across all chat sessions for a document

**UI:** Search bar in history dropdown

**Backend:** Full-text search on message content

```typescript
const results = await prisma.aiChatMessage.findMany({
  where: {
    chat: {
      userId: userId,
      metadata: {
        path: ["documentId"],
        equals: documentId,
      },
    },
    content: {
      search: searchQuery,
    },
  },
});
```

#### 7. Chat Sharing

**Feature:** Share chat session with team members

**Permissions:**

- View only
- Can continue conversation
- Can create branch (fork)

**Use Cases:**

- Get feedback from colleagues
- Collaborate on research
- Training and knowledge sharing

#### 8. Version Linking

**Feature:** Link chat sessions to document versions

**Benefit:** See which AI suggestions were applied in each version

**Schema Addition:**

```typescript
interface ChatMetadata {
  documentId: string;
  documentVersion?: number;
  linkedVersions?: number[];
}
```

---

## Best Practices

### For Users

1. **Use Descriptive Titles**: Rename chats to reflect their purpose
2. **Close Unused Tabs**: Keep workspace focused
3. **Review Chat History**: Don't lose valuable research
4. **Be Specific**: Provide context in your messages
5. **Iterate**: Build on AI suggestions rather than starting over

### For Developers

1. **Always Validate Chat Ownership**: Check user has access before operations
2. **Handle Null Chat IDs**: First message creates the chat
3. **Use Transactions**: When creating chat + message together
4. **Index Metadata Queries**: Optimize for `documentId` and `chatType` lookups
5. **Implement Rate Limiting**: Prevent abuse of AI endpoint
6. **Cache Sessions**: Don't refetch on every interaction
7. **Clean Up LocalStorage**: Handle deleted documents/chats
8. **Test Edge Cases**: Empty states, deleted chats, concurrent edits

### Performance Optimization

```typescript
// Good: Cache sessions
const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);

// Good: Only load messages when switching
const loadChatSession = async (chatId: string) => {
  if (chatId === currentChatId) return; // Already loaded
  // ... fetch messages
};

// Good: Debounce localStorage writes
const debouncedSaveOpenTabs = useMemo(
  () =>
    debounce((tabs: string[]) => {
      localStorage.setItem(
        `openEditorTabs_${documentId}`,
        JSON.stringify(tabs)
      );
    }, 500),
  [documentId]
);
```

---

## Related Documentation

- [Chat Attachments](./chat-attachments.md) - File upload in AI chat
- [Document Editor](./document-editor.md) - Rich text editing features
- [AI Chat System](./ai-chat-system.md) - Main AI chat functionality
- [Grant Search](./grant-search.md) - Finding opportunities with AI

---

**Last Updated:** November 11, 2025  
**Version:** 1.0  
**Authors:** GrantFinder AI Team
