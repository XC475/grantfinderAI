# AI API Endpoints

This directory contains the AI assistant API endpoints for GrantWare AI.

## Endpoints Overview

| Endpoint             | Path                       | Purpose                                                        |
| -------------------- | -------------------------- | -------------------------------------------------------------- |
| **Chat Assistant**   | `/api/ai/chat-assistant`   | Main chat interface for grant discovery and general assistance |
| **Editor Assistant** | `/api/ai/editor-assistant` | Document editor sidebar assistant for writing help             |
| **Recommendations**  | `/api/ai/recommendations`  | Grant recommendation system                                    |

---

## Chat Assistant

**Path:** `POST /api/ai/chat-assistant`

The main conversational AI assistant for the chat interface. Designed for standalone conversations about grant discovery, eligibility analysis, and general grant lifecycle support.

### Features

- LangChain agent with grant search tool
- RAG-based knowledge base access
- Organization profile context
- File attachment support with text extraction
- Streaming responses
- Persistent chat history

### Request Body

```typescript
{
  messages: Array<{
    role: "user" | "assistant";
    content: string;
    attachments?: FileAttachment[];
  }>;
  chatId?: string;              // Existing chat ID or auto-generated
  organizationId?: string;      // Override org ID (optional)
  sourceDocumentIds?: string[]; // Knowledge base documents to include
}
```

### Response

- **Streaming:** Text chunks via `ReadableStream`
- **Header:** `X-Chat-Id` contains the chat ID

### Chat Context

- **Context Type:** `GENERAL`
- **Memory Scope:** Standalone conversations per user
- **AI Settings:** Uses `enableOrgProfileChat`, `enableKnowledgeBaseChat`, `enableGrantSearchChat`

### Used By

- `/private/[slug]/chat` page
- `components/chat/Chat.tsx`

---

## Editor Assistant

**Path:** `POST /api/ai/editor-assistant`

Document-focused AI assistant for the editor sidebar. Helps users write, edit, and improve grant proposals with context from the current document and associated grant opportunity.

### Features

- LangChain agent with grant search tool
- Document content awareness
- Application/opportunity context
- RAG-based knowledge base access
- File attachment support
- Streaming responses
- Chat history linked to documents

### Request Body

```typescript
{
  messages: Array<{
    role: "user" | "assistant";
    content: string;
    attachments?: FileAttachment[];
  }>;
  documentId: string;           // Required - current document
  documentTitle?: string;       // Current title
  documentContent?: string;     // Current content
  chatId?: string;              // Existing chat ID
  sourceDocumentIds?: string[]; // Knowledge base documents to include
}
```

### Response

- **Streaming:** Text chunks via `ReadableStream`
- **Header:** `X-Chat-Id` contains the chat ID

### Chat Context

- **Context Type:** `DRAFTING`
- **Memory Scope:** Scoped to specific `documentId` and `applicationId`
- **AI Settings:** Uses `enableOrgProfileEditor`, `enableKnowledgeBaseEditor`, `enableGrantSearchEditor`

### Additional Context

The editor assistant automatically includes:

1. **Document Content:** Current state of the document being edited
2. **Application Context:** If document belongs to an application, includes the grant opportunity details
3. **Organization Info:** District/organization profile for personalized suggestions

### Used By

- `/private/[slug]/editor/[documentId]` page
- `components/applications/DocumentChatSidebar.tsx`

---

## Recommendations

**Path:** `GET/POST /api/ai/recommendations`

Grant recommendation system based on organization profile matching.

### Sub-endpoints

- `GET /api/ai/recommendations` - Get recommendations for organization
- `GET /api/ai/recommendations/list` - List all recommendations

---

## Common Patterns

### Authentication

All endpoints require authentication via Supabase session cookies.

```typescript
const supabase = await createClient();
const {
  data: { user },
  error,
} = await supabase.auth.getUser();
```

### Streaming Response

Both chat and editor assistants use streaming:

```typescript
return new Response(stream, {
  headers: {
    "Content-Type": "text/plain; charset=utf-8",
    "X-Chat-Id": chat.id,
    "Transfer-Encoding": "chunked",
  },
});
```

### AI Context Settings

Users can toggle AI capabilities via settings. Each endpoint respects:

| Setting              | Chat                      | Editor                      |
| -------------------- | ------------------------- | --------------------------- |
| Organization Profile | `enableOrgProfileChat`    | `enableOrgProfileEditor`    |
| Knowledge Base       | `enableKnowledgeBaseChat` | `enableKnowledgeBaseEditor` |
| Grant Search         | `enableGrantSearchChat`   | `enableGrantSearchEditor`   |

### Settings Status Injection

To ensure the AI respects current settings even mid-conversation (overriding conversation history patterns), both endpoints inject the current settings status directly into each user message:

```
[CURRENT AI SETTINGS - These override any previous conversation patterns]
• Grant Search: ✅ ENABLED - You CAN use the search_grants tool
• Knowledge Base: ✅ ENABLED
• Organization Profile: ✅ ENABLED
[END SETTINGS - Always respect these current settings, not past responses]
```

This ensures the AI always sees and respects the current state, regardless of what was said earlier in the conversation.

---

## Debug Logging

Both endpoints include comprehensive logging for debugging:

```
🔍 [AIContextSettings] Fetching settings for userId: xxx
📋 [AIContextSettings] Found settings from DB: { ... }
⚙️ [Chat/Editor Assistant API] User AI Settings fetched: { ... }
🤖 [ChatAgent/EditorAgent] Creating agent with settings: { ... }
🔧 [ChatAgent/EditorAgent] Tools configuration: { toolsCount: 1, toolNames: ['search_grants'] }
✅ [ChatAgent/EditorAgent] Agent created successfully
```

---

## Architecture

```
Frontend Component
       │
       ▼
  API Endpoint (/api/ai/*)
       │
       ├── Authentication (Supabase)
       ├── Context Loading (Prisma)
       │     ├── Organization data
       │     ├── User AI settings
       │     └── Document/Application context
       │
       ├── RAG Context (Knowledge Base)
       │     ├── Semantic search
       │     └── General KB context
       │
       ├── Agent Creation (/lib/ai/*-agent.ts)
       │     ├── LLM (GPT-4o-mini)
       │     ├── Tools (Grant Search)
       │     └── System Prompt
       │
       ▼
  Streaming Response → Database Save
```

---

## Related Files

- **Agents:** `/lib/ai/chat-agent.ts`, `/lib/ai/editor-agent.ts`
- **Prompts:** `/lib/ai/prompts/chat-assistant.ts`, `/lib/ai/prompts/chat-editor.ts`
- **Tools:** `/lib/ai/tools/grant-search-tool.ts`
- **RAG:** `/lib/ai/knowledgeBaseRAG.ts`
- **Vector Store:** `/lib/ai/vector-store.ts`
