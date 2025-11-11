<!-- 06b2f940-d5e8-4d15-894a-70e7fb0468ae 05025abc-e6a8-436b-9c70-158907ae2750 -->

# Writer Assistant Chat Saving Implementation

## Overview

Add persistence for editor assistant chats using the existing `AiChat` schema with `DRAFTING` context. Support multiple chat sessions per document while keeping them separate from normal chats in the UI.

## Database Strategy

**No schema changes needed.** Use existing structure with metadata differentiation:

- **Context**: `DRAFTING` for editor chats
- **Metadata**: `{ documentId, documentTitle, chatType: 'editor_assistant' }`
- **applicationId**: Optional (null if standalone document)
- **Backward compatibility**: Existing chats without `metadata.chatType` = normal chats

## Files to Modify

### 1. Backend: `/webapp/src/app/api/chat/editor/route.ts`

**Current state:** Streams responses but doesn't persist to database

**Changes needed:**

- Accept `chatId` from client (or generate new for each session)
- Fetch document with application relationship
- Create new `AiChat` record with:
  - `context: 'DRAFTING'`
  - `metadata: { documentId, documentTitle, chatType: 'editor_assistant', opportunityId }`
  - `applicationId` (if document linked to application)
  - `organizationId` (from application or user)
- Save user message before streaming
- Save assistant message after streaming completes
- Return `chatId` in response header `X-Chat-Id`

**Pattern to follow:** Similar to `/webapp/src/app/api/chat/route.ts` (lines 52-95, 164-187)

### 2. Frontend: `/webapp/src/components/applications/DocumentChatSidebar.tsx`

**Current state:** Maintains messages only in local state, lost on refresh

**Changes needed:**

- Add state: `const [chatId, setChatId] = useState<string | null>(null)`
- Remove loading existing chat logic (multiple sessions strategy)
- Each new conversation creates new chat session (generate temp chatId)
- Pass `chatId` in API request body
- Extract `chatId` from response header and update state
- Keep messages in component state (no need to load history for new sessions)

### 3. New API Endpoint: `/webapp/src/app/api/chats/editor/route.ts`

**Purpose:** List all editor chat sessions for a document

**Endpoint:** `GET /api/chats/editor?documentId={id}`

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

**Query:**

```typescript
await prisma.aiChat.findMany({
  where: {
    context: "DRAFTING",
    metadata: {
      path: ["documentId"],
      equals: documentId,
    },
    metadata: {
      path: ["chatType"],
      equals: "editor_assistant",
    },
  },
  include: {
    _count: { select: { messages: true } },
  },
  orderBy: { createdAt: "desc" },
});
```

### 4. New API Endpoint: `/webapp/src/app/api/chats/editor/[chatId]/route.ts`

**Purpose:** Get full chat session with messages

**Endpoint:** `GET /api/chats/editor/{chatId}`

**Response:**

```typescript
{
  chat: {
    id: string;
    title: string;
    createdAt: string;
    messages: Array<{
      id: string;
      role: "USER" | "ASSISTANT";
      content: string;
      createdAt: string;
    }>;
  }
}
```

### 5. Update: `/webapp/src/app/api/chats/route.ts`

**Current behavior:** Returns all chats for user

**Changes needed:**

- Exclude editor assistant chats from normal chat list
- Filter where: `context IN ('GENERAL', 'APPLICATION', 'GRANT_ANALYSIS', 'ELIGIBILITY')`
- OR where: `context = 'DRAFTING' AND metadata.chatType != 'editor_assistant'`

**Query pattern:**

```typescript
where: {
  userId: user.id,
  OR: [
    { context: { in: ['GENERAL', 'APPLICATION', 'GRANT_ANALYSIS', 'ELIGIBILITY'] } },
    {
      AND: [
        { context: 'DRAFTING' },
        {
          OR: [
            { metadata: { path: ['chatType'], not: 'editor_assistant' } },
            { metadata: { equals: null } }  // Backward compatibility
          ]
        }
      ]
    }
  ]
}
```

### 6. UI Enhancement: `/webapp/src/components/applications/DocumentChatSidebar.tsx`

**Add chat history dropdown:**

- Show button "Previous Sessions" or icon in header
- Click opens dropdown/modal with list of past chats
- Each item: title, date, message count
- Click to load chat into view (replace current messages)
- Use `/api/chats/editor?documentId={id}` and `/api/chats/editor/{chatId}`

### 7. Optional: Document Page Chat List

**Location:** `/webapp/src/app/private/[slug]/documents/page.tsx` or similar

**Feature:** Show all editor chat sessions grouped by document

- Useful for browsing document chat history
- Uses same API endpoints as above

## Backward Compatibility

**Existing chats preservation:**

- All current `AiChat` records without `metadata.chatType` = normal chats
- Query filters ensure they appear in main chat list
- No migration needed - handled by query logic

## Testing Checklist

- [ ] Create new editor chat session → saves to database
- [ ] Refresh page → chat persists in sidebar
- [ ] Create another session → new chat created (not reused)
- [ ] Main chat list → doesn't show editor chats
- [ ] Editor sidebar → shows only document's editor chats
- [ ] Existing chats → still appear in main list
- [ ] Standalone document (no application) → chat saves correctly
- [ ] Application-linked document → chat saves with applicationId

## Key Implementation Notes

1. **Multiple sessions:** Each "New Chat" in editor creates fresh `AiChat` record
2. **Context separation:** DRAFTING includes document content, APPLICATION includes grant details
3. **Metadata is critical:** `chatType: 'editor_assistant'` differentiates from other DRAFTING chats
4. **Optional linking:** `applicationId` can be null for standalone documents
5. **Streaming pattern:** Save user message before stream, assistant message after (same as normal chat)

### To-dos

- [x] Add chat persistence to /api/chat/editor/route.ts - create AiChat, save messages, return chatId
- [x] Modify DocumentChatSidebar.tsx to track chatId and pass to API
- [x] Create /api/chats/editor/route.ts to list document chat sessions
- [x] Create /api/chats/editor/[chatId]/route.ts to get full chat with messages
- [x] Update /api/chats/route.ts to exclude editor chats from normal chat list
- [x] Add 'Previous Sessions' UI to DocumentChatSidebar for browsing past chats
- [ ] Test all scenarios: new chat, persistence, multiple sessions, backward compatibility

## ✅ IMPLEMENTATION COMPLETE

All code has been implemented and database migration has been run. Ready for testing!

See `TESTING_GUIDE.md` for detailed testing instructions.
