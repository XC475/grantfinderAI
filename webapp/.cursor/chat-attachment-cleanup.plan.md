<!-- e3b7013b-615d-4898-ab53-3e8349998c8b 20ac29cf-ad64-4e59-951e-56b8f6933976 -->

# Add Sources Button to AI Assistant Chat Input

## Overview

Add a "Sources" button to the AI Assistant chat input dropdown that allows users to select documents from their organization's folder hierarchy and add them as context to the chat.

### Critical Discovery: Three Chat Input Components

The application has **THREE different chat input components** that all need to be updated:

1. **MessageInput** (`message-input.tsx`) - Main AI Assistant page with existing messages
   - ✅ Already has dropdown with Plus button
   - Needs: Add "Sources" menu item

2. **HeroChatInput** (`hero-chat-input.tsx`) - Main AI Assistant page empty state
   - ✅ Already has dropdown with Plus button
   - Needs: Add "Sources" menu item

3. **SidebarMessageInput** (`DocumentSidebarChat.tsx`) - Document editor sidebar
   - ❌ NO dropdown, only a Paperclip button
   - Needs: **Create dropdown structure** + Add "Sources" menu item

## Key Implementation Details

### 1. Document Data Structure (Analysis)

Based on schema analysis:

- **Uploaded files**: `metadata.extractedText` contains extracted text
- **Normal documents**: `content` field contains TipTap JSON
- Document fields: `id`, `title`, `fileUrl`, `content`, `contentType`, `metadata`, `folderId`

### 2. Create SourcesModal Component

**File**: `webapp/src/components/chat/SourcesModal.tsx`

Similar to `MoveModal.tsx` but for document selection:

- Display folder hierarchy with documents
- Search functionality for filtering
- Multi-select support (checkbox-based)
- Limit of 10 source documents
- Use existing `getDocumentIcon()` function from `FolderList.tsx` for consistent file type icons (PDF=red, Word=blue, CSV=green, TXT=gray)

Key props:

```typescript
interface SourcesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectDocuments: (documents: SourceDocument[]) => void;
  selectedDocumentIds: string[];
}

interface SourceDocument {
  id: string;
  title: string;
  contentType: string;
  fileUrl: string | null;
}
```

### 3. Create API Endpoint for Fetching Documents

**File**: `webapp/src/app/api/documents/route.ts` (modify GET endpoint)

Add query parameter `?withFolders=true` to return documents grouped by folder hierarchy:

- Fetch all documents for user's organization
- Include folder information
- Return structure similar to folders API

### 4. Source Document State Management

**File**: `webapp/src/components/chat/Chat.tsx` (or chat page)

Add state for source documents:

```typescript
const [sourceDocuments, setSourceDocuments] = useState<SourceDocument[]>([]);
```

Pass to chat input component and include in message submission.

### 5. Update All Chat Input Components

The application has THREE different chat input components that all need to be updated:

#### 5a. Update MessageInput Component (Main Chat - With Messages)

**File**: `webapp/src/components/ui/message-input.tsx`

**Context**: Used in the main AI Assistant page when there are existing messages in the conversation.

**Changes**:

1. Add new props for source documents:

```typescript
interface MessageInputWithSourcesProps {
  sourceDocuments?: SourceDocument[];
  onSourceDocumentsChange?: (docs: SourceDocument[]) => void;
}
```

2. Add "Sources" menu item to existing dropdown (lines 359-374):

```typescript
<DropdownMenuItem
  onClick={() => setSourcesModalOpen(true)}
  className="cursor-pointer"
>
  <FileText className="mr-2 h-4 w-4" />
  <span>Add sources</span>
</DropdownMenuItem>
```

3. Display selected source documents above input (similar to file attachments, lines 286-305):
   - Show document cards with title and type
   - Add remove button for each source
   - Visually distinguish from file attachments (different styling/icon)
   - Use `getDocumentIcon()` helper for consistent file type icons

4. Add SourcesModal integration with state management

#### 5b. Update HeroChatInput Component (Main Chat - Empty State)

**File**: `webapp/src/components/ui/hero-chat-input.tsx`

**Context**: Used in the main AI Assistant page when the chat is EMPTY (initial/hero state). Already has a dropdown with Plus button (lines 153-174).

**Changes**:

1. Add props for source documents:

```typescript
interface HeroChatInputProps {
  // ... existing props
  sourceDocuments?: SourceDocument[];
  onSourceDocumentsChange?: (docs: SourceDocument[]) => void;
}
```

2. Add state for sources modal:

```typescript
const [sourcesModalOpen, setSourcesModalOpen] = useState(false);
```

3. Add "Sources" menu item to existing dropdown (after "Attach files", before "Google Drive", line 165):

```typescript
<DropdownMenuItem onClick={() => setSourcesModalOpen(true)} className="cursor-pointer">
  <FileText className="mr-2 h-4 w-4" />
  <span>Add sources</span>
</DropdownMenuItem>
```

4. Display selected source documents above file attachments preview (before line 98)

5. Update onSubmit to pass sources along with files

6. Add SourcesModal component integration

7. Import FileText icon from lucide-react

#### 5c. Update SidebarMessageInput Component (Document Editor Sidebar)

**File**: `webapp/src/components/applications/DocumentSidebarChat.tsx` (SidebarMessageInput function, lines 298-476)

**Context**: Used in the document editor sidebar for AI assistance. Currently has NO dropdown - just a single Paperclip button.

**Changes**:

1. **Create dropdown structure** - Replace single Paperclip button (lines 438-450) with Plus button + dropdown menu:

```typescript
<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button
      type="button"
      size="icon"
      variant="ghost"
      className="h-8 w-8"
      aria-label="Add content"
      disabled={isGenerating}
    >
      <Plus className="h-4 w-4" />
    </Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent align="end" className="w-56">
    <DropdownMenuItem onClick={handleFileButtonClick} className="cursor-pointer">
      <Paperclip className="mr-2 h-4 w-4" />
      <span>Attach files</span>
    </DropdownMenuItem>
    <DropdownMenuItem onClick={() => setSourcesModalOpen(true)} className="cursor-pointer">
      <FileText className="mr-2 h-4 w-4" />
      <span>Add sources</span>
    </DropdownMenuItem>
    <DropdownMenuItem disabled className="cursor-not-allowed opacity-50">
      <FolderOpen className="mr-2 h-4 w-4" />
      <span>Google Drive (Coming Soon)</span>
    </DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

2. Add props for source documents:

```typescript
interface SidebarMessageInputProps {
  // ... existing props
  sourceDocuments?: SourceDocument[];
  onSourceDocumentsChange?: (docs: SourceDocument[]) => void;
}
```

3. Add state for sources modal:

```typescript
const [sourcesModalOpen, setSourcesModalOpen] = useState(false);
```

4. Display selected source documents above file preview (before line 410)

5. Add SourcesModal integration

6. Import required components:
   - Plus, FileText, FolderOpen from lucide-react
   - DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger from @/components/ui/dropdown-menu

#### 5d. Update Parent Components to Pass Source Props

**Files to update**:

- `webapp/src/components/chat/Chat.tsx` - Pass sources to MessageInput
- `webapp/src/components/ui/chat.tsx` - Pass sources to HeroChatInput
- `webapp/src/components/applications/DocumentSidebarChat.tsx` - Pass sources to SidebarMessageInput (main component, line 37-187)

### 6. Extract Context from Source Documents

**File**: Helper function in `webapp/src/lib/documentContext.ts` (new file)

Create utility to extract text from source documents:

```typescript
export async function getSourceDocumentContext(
  documentIds: string[]
): Promise<string> {
  // Fetch documents from database
  // For each document:
  //   - If fileUrl exists: use metadata.extractedText
  //   - If normal document: parse content JSON to plain text
  // Concatenate with document titles as headers
}
```

### 7. Update Chat APIs to Include Source Context

**Files**:

- `webapp/src/app/api/chat/route.ts` (main chat)
- `webapp/src/app/api/ai/assistant-agent/route.ts` (assistant agent)
- `webapp/src/app/api/chat/editor/route.ts` (document editor sidebar)

**Changes**:

1. Accept `sourceDocumentIds` in request body
2. Call `getSourceDocumentContext()` to get text
3. Prepend source context to system prompt or first user message:

```
SOURCE DOCUMENTS:

--- Document: [Title] ---
[Extracted text or content]

--- Document: [Title 2] ---
[Extracted text or content]
```

### 8. Persist Source Documents in Chat Messages

**File**: `webapp/prisma/schema.prisma` (analysis only)

Store source document IDs in `AiChatMessage.metadata`:

```json
{
  "sourceDocuments": ["doc-id-1", "doc-id-2"],
  "timestamp": ...
}
```

This allows viewing which sources were used for each message.

### 9. Update Chat Page to Display Sources

**File**: `webapp/src/app/private/[slug]/chat/page.tsx`

When loading existing chat, extract source documents from latest message metadata and initialize state.

## Files to Create

1. `webapp/src/components/chat/SourcesModal.tsx` - Modal for selecting documents
2. `webapp/src/lib/documentContext.ts` - Utility for extracting document context

## Files to Modify

### Chat Input Components (3 files)

1. `webapp/src/components/ui/message-input.tsx` - Add sources button and display (main chat with messages)
2. `webapp/src/components/ui/hero-chat-input.tsx` - Add sources button and display (main chat empty state)
3. `webapp/src/components/applications/DocumentSidebarChat.tsx` - Add dropdown + sources button (sidebar chat)

### Parent Components (3 files)

4. `webapp/src/components/chat/Chat.tsx` - State management and pass sources to MessageInput
5. `webapp/src/components/ui/chat.tsx` - Pass sources to HeroChatInput
6. `webapp/src/app/private/[slug]/chat/page.tsx` - Load sources from chat history and pass to ChatDemo

### API Routes (4 files)

7. `webapp/src/app/api/documents/route.ts` - Add endpoint for fetching documents with folders
8. `webapp/src/app/api/chat/route.ts` - Include source context in requests (main chat)
9. `webapp/src/app/api/ai/assistant-agent/route.ts` - Include source context in requests (assistant agent)
10. `webapp/src/app/api/chat/editor/route.ts` - Include source context in requests (document editor sidebar)
