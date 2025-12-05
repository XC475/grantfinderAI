# Writing Editor - Comprehensive Implementation Analysis

## Executive Summary

The GrantWare AI Writing Editor is a sophisticated rich text editing system built on **TipTap** (a headless editor framework) with integrated AI assistance. It provides a Google Docs-like editing experience with auto-save, version control, and a contextually-aware AI chat assistant that understands the document being edited.

**Key Technologies:**

- **TipTap** (ProseMirror-based rich text editor)
- **Next.js 15** (App Router)
- **React** (Client components)
- **Prisma ORM** (Database access)
- **PostgreSQL** (Database)
- **OpenAI GPT-4o-mini** (AI chat assistant)
- **Supabase Auth** (Authentication)

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Frontend Implementation](#frontend-implementation)
3. [Backend/API Implementation](#backendapi-implementation)
4. [Data Flow & State Management](#data-flow--state-management)
5. [Key Features](#key-features)
6. [Styling & Theming](#styling--theming)
7. [Integration Points](#integration-points)
8. [Dependencies & Libraries](#dependencies--libraries)
9. [File Structure](#file-structure)

---

## Architecture Overview

### System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    Document Editor Page                          │
│  Route: /private/[slug]/editor/[documentId]                     │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  ConditionalLayout (Detects editor route)                │  │
│  │  └─ DocumentProvider (Context for document state)        │  │
│  │     └─ ResizablePanelGroup (Split view)                  │  │
│  │        ├─ ResizablePanel (60% - Editor)                  │  │
│  │        │  └─ DocumentEditor                              │  │
│  │        │     └─ SimpleEditor (TipTap)                    │  │
│  │        │                                                  │  │
│  │        └─ ResizablePanel (40% - AI Assistant)            │  │
│  │           └─ DocumentChatSidebar                         │  │
│  │              └─ DocumentSidebarChat                      │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### Component Hierarchy

```
EditorPage (page.tsx)
  └─ DocumentEditor
      └─ SimpleEditor (TipTap)
          ├─ Toolbar (TipTap UI)
          └─ EditorContent (TipTap)

ConditionalLayout
  └─ DocumentEditorLayoutContent
      ├─ DocumentEditor (Main content)
      └─ DocumentChatSidebar
          └─ DocumentSidebarChat
              ├─ Tab Bar (Chat sessions)
              ├─ Chat Messages
              └─ Message Input
```

---

## Frontend Implementation

### 1. Main Editor Page

**File:** `webapp/src/app/private/[slug]/editor/[documentId]/page.tsx`

**Responsibilities:**

- Fetches document data from API
- Manages document state (loading, saving)
- Handles save operations
- Renders `DocumentEditor` component

**Key Features:**

- Server-side document fetching
- Error handling (404, unauthorized)
- Loading states
- Save callback with version increment

**Code Flow:**

```typescript
1. Extract documentId from params
2. Fetch document via GET /api/documents/[documentId]
3. Handle save via PUT /api/documents/[documentId] or PUT /api/applications/[appId]/documents/[docId]
4. Pass document and save handler to DocumentEditor
```

### 2. DocumentEditor Component

**File:** `webapp/src/components/applications/DocumentEditor.tsx`

**Responsibilities:**

- Wraps TipTap SimpleEditor
- Manages auto-save logic (2-second debounce)
- Updates DocumentContext with title/content
- Handles save status indicators

**Key Features:**

- **Auto-save:** Debounced save after 2 seconds of inactivity
- **Save Status:** Tracks "saved", "saving", "unsaved" states
- **Context Integration:** Updates DocumentContext for AI assistant
- **Content Management:** Tracks last saved content to prevent unnecessary saves

**State Management:**

```typescript
- title: Local state from document prop
- content: Local state from document prop
- autoSaveTimeoutRef: Debounce timer reference
- lastSavedContentRef: Tracks last saved content
```

**Auto-Save Logic:**

```typescript
1. User types → content changes
2. useEffect triggers on content change
3. Clear existing timeout
4. Set status to "unsaved"
5. Set new timeout (2 seconds)
6. On timeout → call handleSave()
7. Update status to "saving" → "saved"
```

### 3. SimpleEditor Component (TipTap)

**File:** `webapp/src/components/tiptap-templates/simple/simple-editor.tsx`

**Responsibilities:**

- Initializes TipTap editor instance
- Configures editor extensions
- Renders toolbar and editor content
- Handles mobile/desktop responsive behavior

**TipTap Extensions Configured:**

- **StarterKit:** Basic formatting (bold, italic, headings, lists, etc.)
- **TextAlign:** Left, center, right, justify
- **TaskList/TaskItem:** Checkbox lists
- **Highlight:** Multi-color text highlighting
- **Image:** Image insertion
- **Typography:** Smart typography (quotes, dashes, etc.)
- **Superscript/Subscript:** Text positioning
- **ImageUploadNode:** Custom image upload with drag-and-drop
- **HorizontalRule:** Custom horizontal rule node

**Editor Configuration:**

```typescript
{
  immediatelyRender: false,
  shouldRerenderOnTransaction: false,
  editorProps: {
    attributes: {
      autocomplete: "off",
      autocorrect: "off",
      autocapitalize: "off",
      "aria-label": "Main content area, start typing to enter text.",
      class: "simple-editor",
    },
  },
  extensions: [...],
  content: initialContent || "",
  onUpdate: ({ editor }) => {
    onContentChange(editor.getHTML());
  },
}
```

**Toolbar Structure:**

- **Undo/Redo:** History navigation
- **Headings:** Dropdown (H1-H4)
- **Lists:** Dropdown (bullet, ordered, task)
- **Blockquote/Code Block:** Block formatting
- **Text Marks:** Bold, italic, strike, code, underline
- **Highlight:** Color picker popover
- **Link:** Link insertion popover
- **Superscript/Subscript:** Text positioning
- **Text Align:** Left, center, right, justify
- **Image Upload:** File upload button

**Mobile Support:**

- Responsive toolbar (collapses on mobile)
- Mobile-specific views for highlighter and link tools
- Touch-friendly interactions

### 4. DocumentChatSidebar Component

**File:** `webapp/src/components/applications/DocumentChatSidebar.tsx`

**Responsibilities:**

- Manages chat sessions (tabs)
- Handles chat persistence (localStorage + database)
- Coordinates with DocumentContext for document content
- Manages file attachments
- Handles streaming AI responses

**Key Features:**

- **Tab Management:** Multiple chat sessions per document
- **Session Persistence:** Restores tabs and active chat on page reload
- **Tab Renaming:** Double-click to edit tab titles
- **Tab Closing:** Close tabs while preserving chat history
- **History Dropdown:** View all chat sessions for document
- **File Attachments:** Upload PDF, DOCX, TXT, CSV files
- **Streaming Responses:** Real-time AI response display

**State Management:**

```typescript
- messages: Current chat messages
- chatId: Active chat session ID
- chatSessions: All sessions for document
- openTabs: Array of tab IDs currently open
- editingTabId: Tab being renamed
- isLoading: AI response in progress
- abortControllerRef: For canceling requests
```

**LocalStorage Keys:**

```typescript
- `lastEditorChat_${documentId}`: Last active chat ID
- `openEditorTabs_${documentId}`: Array of open tab IDs
```

**Chat Session Flow:**

```typescript
1. On mount → Load all sessions for document
2. Restore openTabs from localStorage
3. Auto-load last active chat or most recent
4. On new message → Create chat if needed (chatId === null)
5. Save chatId to localStorage
6. Add to openTabs if not present
7. Stream AI response
8. Save messages to database
```

**File Upload Flow:**

```typescript
1. User selects files (via button, drag-drop, or paste)
2. Files uploaded to /api/chat/upload
3. Files processed (text extraction for PDF/DOCX)
4. File metadata attached to user message
5. Files included in AI context
```

### 5. DocumentSidebarChat Component

**File:** `webapp/src/components/applications/DocumentSidebarChat.tsx`

**Responsibilities:**

- Renders chat messages
- Handles message input
- Manages file attachments UI
- Auto-scrolls to bottom
- Provides stop/cancel functionality

**Key Features:**

- **Message Display:** User and assistant messages with markdown
- **Auto-scroll:** Scrolls to bottom on new messages
- **Scroll-to-bottom Button:** Appears when user scrolls up
- **File Previews:** Shows attached files before sending
- **Drag & Drop:** Drop files onto input area
- **Paste Files:** Paste files from clipboard
- **Stop Generation:** Cancel ongoing AI response

**Input Features:**

- Auto-resizing textarea (max 240px height)
- Enter to send, Shift+Enter for new line
- File attachment button
- Send/Stop button toggle

### 6. DocumentContext Provider

**File:** `webapp/src/contexts/DocumentContext.tsx`

**Responsibilities:**

- Provides document title and content to all child components
- Tracks save status
- Enables AI assistant to access current document state

**Context API:**

```typescript
interface DocumentContextType {
  documentTitle: string;
  documentContent: string;
  saveStatus: "saved" | "saving" | "unsaved";
  setDocumentTitle: (title: string) => void;
  setDocumentContent: (content: string) => void;
  setSaveStatus: (status: "saved" | "saving" | "unsaved") => void;
}
```

**Usage:**

- Wraps editor page in `ConditionalLayout`
- `DocumentEditor` updates context on content changes
- `DocumentChatSidebar` reads context for AI prompts

---

## Backend/API Implementation

### 1. Document API Routes

#### GET `/api/documents/[documentId]`

**File:** `webapp/src/app/api/documents/[documentId]/route.ts`

**Purpose:** Fetch a single document

**Authentication:** Required (Supabase)

**Authorization:** User must belong to document's organization

**Response:**

```typescript
{
  document: {
    id: string;
    title: string;
    content?: string;
    contentType: string;
    version: number;
    applicationId?: string;
    folderId?: string;
    createdAt: string;
    updatedAt: string;
  }
}
```

#### PUT `/api/documents/[documentId]`

**Purpose:** Update document content, title, or folder

**Request Body:**

```typescript
{
  title?: string;
  content?: string;
  contentType?: string;
  folderId?: string;
}
```

**Features:**

- Auto-increments version
- Updates `updatedAt` timestamp
- Handles folder changes (auto-unlinks from application if moved)
- Validates folder belongs to organization

#### DELETE `/api/documents/[documentId]`

**Purpose:** Delete a document

**Cascade:** Related records (if any) are handled by Prisma

#### POST `/api/documents`

**Purpose:** Create a new standalone document

**Request Body:**

```typescript
{
  title: string;
  content?: string;
  contentType?: string;
  folderId?: string;
}
```

**Default Content:** Includes welcome message with getting started tips

### 2. Application Document Routes

#### GET `/api/applications/[applicationId]/documents`

**Purpose:** List all documents for an application

#### POST `/api/applications/[applicationId]/documents`

**Purpose:** Create a document linked to an application

#### GET `/api/applications/[applicationId]/documents/[documentId]`

**Purpose:** Get a specific application document

#### PUT `/api/applications/[applicationId]/documents/[documentId]`

**Purpose:** Update an application document

**Features:**

- Auto-increments version
- Updates `updatedAt`
- Validates user has access to application

### 3. Editor Chat API

#### POST `/api/chat/editor`

**File:** `webapp/src/app/api/chat/editor/route.ts`

**Purpose:** Send message to editor assistant and receive streaming response

**Request Body:**

```typescript
{
  messages: Array<{
    role: "user" | "assistant";
    content: string;
    attachments?: FileAttachment[];
  }>;
  documentId: string;
  documentTitle: string;
  documentContent: string;
  chatId?: string | null;
}
```

**Response:**

- **Streaming:** Server-Sent Events (text/plain)
- **Header:** `X-Chat-Id` (new chat ID if created)

**AI Context Building:**

1. **Document Context:** Current document title and content
2. **Organization Context:** Organization details (name, location, mission, etc.)
3. **Application Context:** Grant opportunity details (if document linked to application)
4. **Attachment Context:** Extracted text from attached files

**System Prompt Structure:**

```
You are a helpful assistant for a grant writing application called GrantWare.
You are helping the user with their document titled "{documentTitle}".

ORGANIZATION CONTEXT:
[Organization details]

APPLICATION CONTEXT:
[Grant opportunity details if applicable]

CURRENT DOCUMENT CONTENT:
{documentContent}

ATTACHED FILES:
[File contents if any]

[Instructions for formatting and behavior]
```

**Chat Creation:**

- If `chatId` is null, creates new chat
- Context: `DRAFTING`
- Metadata includes:
  - `documentId`
  - `documentTitle`
  - `chatType: "editor_assistant"`
  - `opportunityId` (if applicable)

**Message Persistence:**

- User messages saved immediately
- Assistant messages saved after stream completes
- Handles client disconnection gracefully

**Streaming Implementation:**

```typescript
1. Create OpenAI streaming completion
2. Create ReadableStream
3. For each chunk:
   - Append to fullText
   - Enqueue to client stream
4. On completion:
   - Save fullText to database
   - Update chat updatedAt
5. Handle client disconnect (continue saving in background)
```

### 4. Chat Session Management API

#### GET `/api/chats/editor?documentId={documentId}`

**Purpose:** List all chat sessions for a document

**Response:**

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

**Query:** Filters by `context: "DRAFTING"` and `metadata.chatType: "editor_assistant"`

#### GET `/api/chats/editor/{chatId}`

**Purpose:** Get a specific chat session with all messages

**Response:**

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
      metadata?: {
        attachments?: FileAttachment[];
      };
    }>;
  }
}
```

#### PATCH `/api/chats/editor/{chatId}/title`

**Purpose:** Update chat session title

**Request Body:**

```typescript
{
  title: string;
}
```

---

## Data Flow & State Management

### Document Editing Flow

```
User Types
  ↓
SimpleEditor.onUpdate
  ↓
DocumentEditor.handleContentChange
  ↓
DocumentEditor.setState(content)
  ↓
DocumentEditor.useEffect (content change)
  ↓
DocumentEditor.setSaveStatus("unsaved")
  ↓
DocumentEditor.setTimeout (2 seconds)
  ↓
DocumentEditor.handleSave
  ↓
EditorPage.handleSave
  ↓
PUT /api/documents/[documentId]
  ↓
Prisma.document.update
  ↓
DocumentEditor.setSaveStatus("saved")
```

### AI Chat Flow

```
User Sends Message
  ↓
DocumentChatSidebar.handleSubmit
  ↓
Upload Files (if any) → /api/chat/upload
  ↓
POST /api/chat/editor
  ↓
Create/Find Chat (if chatId === null)
  ↓
Save User Message to Database
  ↓
Build System Prompt (document + org + app context)
  ↓
OpenAI Streaming Completion
  ↓
Stream Chunks to Client
  ↓
DocumentChatSidebar Updates UI (character-by-character)
  ↓
Save Assistant Message to Database (on completion)
```

### Context Flow

```
DocumentProvider
  ├─ documentTitle
  ├─ documentContent
  └─ saveStatus
       ↓
DocumentEditor (updates context)
       ↓
DocumentChatSidebar (reads context)
       ↓
POST /api/chat/editor (includes context in prompt)
```

---

## Key Features

### 1. Auto-Save

- **Debounce:** 2 seconds of inactivity
- **Status Indicators:** "saved", "saving", "unsaved"
- **Optimization:** Only saves if content changed
- **Error Handling:** Reverts status on save failure

### 2. Version Control

- **Auto-increment:** Version number on each save
- **Timestamp:** `updatedAt` updated on save
- **History:** Version history stored in database

### 3. Rich Text Editing

- **Formatting:** Bold, italic, underline, strike, code
- **Headings:** H1-H4
- **Lists:** Bullet, ordered, task lists
- **Alignment:** Left, center, right, justify
- **Highlighting:** Multi-color text highlighting
- **Links:** Insert and edit links
- **Images:** Upload and insert images
- **Blockquotes:** Quote blocks
- **Code Blocks:** Syntax-highlighted code

### 4. AI Assistant Integration

- **Document Context:** AI always knows current document content
- **Organization Context:** AI knows organization details
- **Application Context:** AI knows grant opportunity (if applicable)
- **File Attachments:** AI can read attached files
- **Multiple Sessions:** Multiple conversation threads per document
- **Persistent Chats:** Chats saved and restored on reload
- **Tab Management:** Cursor-style tab interface
- **Streaming Responses:** Real-time AI response display

### 5. Responsive Design

- **Mobile Support:** Responsive toolbar and editor
- **Resizable Panels:** Adjustable editor/assistant split
- **Touch-Friendly:** Mobile-optimized interactions

### 6. File Management

- **Drag & Drop:** Drop files onto input
- **Paste Files:** Paste from clipboard
- **File Types:** PDF, DOCX, TXT, CSV
- **Text Extraction:** Automatic text extraction for AI context
- **File Previews:** Visual file previews before sending

---

## Styling & Theming

### Editor Styles

**File:** `webapp/src/components/tiptap-templates/simple/simple-editor.scss`

**Key Styles:**

- **Font:** DM Sans for editor content
- **Max Width:** 648px centered
- **Padding:** 3rem horizontal, 30vh bottom (for infinite scroll feel)
- **Mobile:** Reduced padding (1rem horizontal, 1.5rem vertical)

**File:** `webapp/src/components/applications/editor-overrides.css`

**Overrides:**

- Removes max-width constraints for sidebar layout
- Adjusts padding for document editor context
- Ensures proper overflow handling

### Theme Support

- **Dark Mode:** Supported via CSS variables
- **Light Mode:** Default theme
- **Consistent:** Matches global design system

### Typography

- **Editor:** DM Sans (TipTap)
- **UI:** Inter (global)
- **Prose:** Tailwind prose classes for content

---

## Integration Points

### 1. ConditionalLayout

**File:** `webapp/src/components/layouts/ConditionalLayout.tsx`

**Detection:**

- Detects `/editor/[documentId]` route
- Wraps with `DocumentProvider`
- Renders `DocumentEditorLayoutContent` with resizable panels

**Features:**

- **Save Status Indicator:** Shows save status in header
- **Sidebar Toggle:** Button to show/hide AI assistant
- **Resizable Panels:** Adjustable editor/assistant split (60/40 default)

### 2. DocumentsView

**File:** `webapp/src/components/folders/DocumentsView.tsx`

**Integration:**

- Lists documents in folder structure
- Click document → Navigate to editor
- Create document → Navigate to new editor

### 3. ApplicationPage

**File:** `webapp/src/components/applications/ApplicationPage.tsx`

**Integration:**

- Documents can be linked to applications
- Application context available in AI assistant
- Grant opportunity details included in AI prompts

---

## Dependencies & Libraries

### Core Dependencies

```json
{
  "@tiptap/react": "^2.x",
  "@tiptap/starter-kit": "^2.x",
  "@tiptap/extension-*": "^2.x",
  "next": "^15.x",
  "react": "^18.x",
  "prisma": "^5.x",
  "openai": "^4.x"
}
```

### TipTap Extensions

- `@tiptap/starter-kit` - Basic formatting
- `@tiptap/extension-text-align` - Text alignment
- `@tiptap/extension-list` - Lists
- `@tiptap/extension-highlight` - Text highlighting
- `@tiptap/extension-image` - Images
- `@tiptap/extension-typography` - Smart typography
- `@tiptap/extension-superscript` - Superscript
- `@tiptap/extension-subscript` - Subscript

### Custom TipTap Components

**Location:** `webapp/src/components/tiptap-ui/` and `webapp/src/components/tiptap-node/`

**UI Components:**

- Heading dropdown menu
- List dropdown menu
- Mark buttons (bold, italic, etc.)
- Text align buttons
- Color highlight popover
- Link popover
- Image upload button
- Blockquote button
- Code block button
- Undo/redo buttons

**Node Extensions:**

- Image upload node (custom)
- Horizontal rule node (custom)

---

## File Structure

```
webapp/src/
├── app/
│   ├── private/[slug]/editor/[documentId]/
│   │   └── page.tsx                    # Main editor page
│   └── api/
│       ├── documents/
│       │   ├── route.ts                # POST /api/documents
│       │   └── [documentId]/
│       │       └── route.ts            # GET/PUT/DELETE /api/documents/[id]
│       ├── applications/[appId]/documents/
│       │   ├── route.ts                # GET/POST /api/applications/[id]/documents
│       │   └── [documentId]/
│       │       └── route.ts            # GET/PUT/DELETE application documents
│       └── chat/
│           └── editor/
│               └── route.ts            # POST /api/chat/editor
│
├── components/
│   ├── applications/
│   │   ├── DocumentEditor.tsx          # Main editor wrapper
│   │   ├── DocumentChatSidebar.tsx     # Chat sidebar with tabs
│   │   ├── DocumentSidebarChat.tsx     # Chat UI component
│   │   └── editor-overrides.css        # Editor style overrides
│   │
│   ├── tiptap-templates/
│   │   └── simple/
│   │       ├── simple-editor.tsx       # TipTap editor component
│   │       └── simple-editor.scss      # Editor styles
│   │
│   ├── tiptap-ui/                      # TipTap UI components
│   │   ├── heading-dropdown-menu/
│   │   ├── list-dropdown-menu/
│   │   ├── mark-button/
│   │   ├── text-align-button/
│   │   ├── color-highlight-popover/
│   │   ├── link-popover/
│   │   ├── image-upload-button/
│   │   ├── blockquote-button/
│   │   ├── code-block-button/
│   │   └── undo-redo-button/
│   │
│   ├── tiptap-node/                    # TipTap node extensions
│   │   ├── image-upload-node/
│   │   ├── horizontal-rule-node/
│   │   └── [node-style-files].scss
│   │
│   └── layouts/
│       └── ConditionalLayout.tsx       # Layout with editor detection
│
├── contexts/
│   └── DocumentContext.tsx             # Document state context
│
├── hooks/
│   ├── use-tiptap-editor.ts            # TipTap editor hook
│   ├── use-autosize-textarea.ts        # Auto-resize textarea
│   ├── use-cursor-visibility.ts        # Cursor visibility tracking
│   └── use-mobile.ts                   # Mobile detection
│
└── lib/
    └── tiptap-utils.ts                 # Image upload handler
```

---

## Database Schema

### Document Model

```prisma
model Document {
  id             String       @id @default(cuid())
  applicationId  String?
  title          String
  content        String?
  contentType    String       @default("html")
  metadata       Json?
  version        Int          @default(1)
  createdAt      DateTime     @default(now())
  updatedAt      DateTime     @updatedAt
  organizationId String
  folderId       String?

  application    Application? @relation(...)
  folder         Folder?      @relation(...)
  organization   Organization @relation(...)

  @@index([applicationId])
  @@index([updatedAt])
  @@index([applicationId, createdAt])
  @@index([folderId])
  @@map("documents")
}
```

### AiChat Model (Editor Chats)

```prisma
model AiChat {
  id             String          @id @default(cuid())
  title          String?
  context        AiChatContext   // "DRAFTING" for editor chats
  createdAt      DateTime        @default(now())
  updatedAt      DateTime        @updatedAt
  userId         String          @db.Uuid
  applicationId  String?         // Optional: if document linked to application
  organizationId String
  metadata       Json?           // { documentId, chatType: "editor_assistant", ... }
  messages       AiChatMessage[]

  @@map("ai_chats")
}
```

### AiChatMessage Model

```prisma
model AiChatMessage {
  id        String            @id @default(cuid())
  chatId    String
  role      AiChatMessageRole // "USER" | "ASSISTANT"
  content   String
  createdAt DateTime          @default(now())
  metadata  Json?             // { attachments, timestamp, model, ... }
  chat      AiChat            @relation(...)

  @@map("ai_chat_messages")
}
```

---

## Summary

The Writing Editor is a comprehensive, production-ready rich text editing system with:

✅ **Full-featured editor** (TipTap with extensive formatting options)  
✅ **Auto-save** (Google Docs-style with status indicators)  
✅ **AI integration** (Context-aware assistant with document understanding)  
✅ **Multi-session chats** (Tab-based interface with persistence)  
✅ **File attachments** (PDF, DOCX, TXT, CSV with text extraction)  
✅ **Responsive design** (Mobile and desktop support)  
✅ **Version control** (Auto-incrementing versions)  
✅ **Organization context** (AI knows organization details)  
✅ **Application context** (AI knows grant opportunity if linked)

The system is well-architected with clear separation of concerns, proper state management, and comprehensive error handling. It integrates seamlessly with the broader GrantWare AI application while maintaining its own specialized functionality for document editing and AI-assisted writing.
