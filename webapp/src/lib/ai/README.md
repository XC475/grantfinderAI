# AI Library

This directory contains the core AI functionality for GrantWare AI, including LangChain agents, RAG systems, vector stores, and prompt engineering.

## Directory Structure

```
/lib/ai/
├── chat-agent.ts           # Chat assistant LangChain agent
├── editor-agent.ts         # Editor assistant LangChain agent
├── knowledgeBaseRAG.ts     # Knowledge base semantic search (RAG)
├── vector-store.ts         # Grants vector store and search
├── prompts/
│   ├── chat-assistant.ts   # System prompt for chat assistant
│   ├── chat-editor.ts      # System prompt for editor assistant
│   └── tools/
│       ├── grantsVectorStore.ts  # Grant search tool prompt
│       └── knowledgeBaseRAG.ts   # KB RAG tool prompt
└── tools/
    └── grant-search-tool.ts     # LangChain grant search tool
```

---

## Agents

### Chat Agent (`chat-agent.ts`)

LangChain agent for the main chat interface. Handles general grant discovery, eligibility questions, and lifecycle support.

```typescript
import { createChatAgent, DistrictInfo } from "@/lib/ai/chat-agent";

const agent = await createChatAgent(
  districtInfo,   // Organization/district context
  baseUrl,        // App base URL for grant links
  userSettings    // AI capability toggles
);

// Stream response
const result = await agent.stream({ messages }, { streamMode: "messages" });
```

**Configuration:**
- **Model:** GPT-4o-mini
- **Temperature:** 0.1 (more deterministic)
- **Tools:** Grant search (if enabled)
- **Settings:** Uses `enableGrantSearchChat`

### Editor Agent (`editor-agent.ts`)

LangChain agent for the document editor sidebar. Provides writing assistance with document and application context.

```typescript
import { createEditorAgent, EditorPromptOptions } from "@/lib/ai/editor-agent";

const agent = await createEditorAgent(
  {
    documentTitle,
    documentContent,
    organizationInfo,
    applicationContext,
    attachmentContext,
    sourceContext,
    knowledgeBaseContext,
    userSettings,
  },
  userSettings
);
```

**Configuration:**
- **Model:** GPT-4o-mini
- **Temperature:** 0.7 (more creative for writing)
- **Tools:** Grant search (if enabled)
- **Settings:** Uses `enableGrantSearchEditor`

---

## RAG Systems

### Knowledge Base RAG (`knowledgeBaseRAG.ts`)

Semantic search over organization's uploaded documents using vector embeddings.

```typescript
import { searchKnowledgeBase } from "@/lib/ai/knowledgeBaseRAG";

const context = await searchKnowledgeBase(
  userQuery,           // User's question
  organizationId,      // Filter to org's documents
  {
    topK: 5,           // Number of results
    userId: user.id,   // For AI settings check
    context: "chat" | "editor"  // Which settings to use
  }
);
```

**Features:**
- OpenAI `text-embedding-3-small` embeddings
- PostgreSQL pgvector similarity search
- Respects user AI settings
- Returns formatted context with source attribution

### Grants Vector Store (`vector-store.ts`)

Semantic search over grant opportunities database.

```typescript
import { searchGrants, GrantDocument, GrantMetadata } from "@/lib/ai/vector-store";

const grants = await searchGrants(query, {
  stateCode: "MA",      // State filter
  status: "posted",     // Only open grants
  services: ["k12_education"],  // Service type filter
});
```

**Features:**
- Supabase vector store integration
- Filters: state, status, services, funding type
- Returns grant metadata + similarity scores
- Top 10 results by default

---

## Prompts

### Chat Assistant Prompt (`prompts/chat-assistant.ts`)

System prompt for the main chat agent. Builds a comprehensive prompt including:

```typescript
import { buildSystemPrompt, DistrictInfo } from "@/lib/ai/prompts/chat-assistant";

const prompt = buildSystemPrompt(districtInfo, baseUrl, userSettings);
```

**Prompt Sections:**
1. **Task Summary:** Grants lifecycle assistant role
2. **Context:** Organization/district profile
3. **Available Tools:** Grant search, knowledge base (based on settings)
4. **Tool Usage Policy:** When to use tools vs respond directly
5. **Output Structure:** Markdown formatting rules, grant result templates
6. **Response Style:** Tone, length, language patterns
7. **Examples:** Sample interactions

### Editor Assistant Prompt (`prompts/chat-editor.ts`)

System prompt for the editor agent. Includes document context.

```typescript
import { buildEditorSystemPrompt, EditorPromptOptions } from "@/lib/ai/prompts/chat-editor";

const prompt = buildEditorSystemPrompt({
  documentTitle,
  documentContent,
  organizationInfo,
  applicationContext,
  attachmentContext,
  sourceContext,
  knowledgeBaseContext,
  userSettings,
});
```

**Additional Context:**
- Current document content
- Application/opportunity details (if applicable)
- Attached files
- Source documents from knowledge base

---

## Tools

### Grant Search Tool (`tools/grant-search-tool.ts`)

LangChain tool for semantic grant search.

```typescript
import { createGrantSearchTool } from "@/lib/ai/tools/grant-search-tool";

const tool = createGrantSearchTool(districtInfo, organizationServices);
```

**Tool Schema:**
```typescript
{
  name: "search_grants",
  schema: {
    query: string,      // What grants to find
    stateCode?: string, // State filter (e.g., "MA", "US")
  }
}
```

**Returns:** JSON with grant results including:
- Grant ID, title, agency
- Award amounts, deadlines
- Eligibility summary
- Relevance scoring

---

## AI Context Settings

Users can toggle AI capabilities. Both agents respect these settings:

| Setting | Chat | Editor | Purpose |
|---------|------|--------|---------|
| Organization Profile | `enableOrgProfileChat` | `enableOrgProfileEditor` | Include org context in prompts |
| Knowledge Base | `enableKnowledgeBaseChat` | `enableKnowledgeBaseEditor` | Enable RAG search |
| Grant Search | `enableGrantSearchChat` | `enableGrantSearchEditor` | Enable grant search tool |

Settings are stored in `UserAIContextSettings` model and managed via `/api/user/ai-context-settings`.

### Settings Status Injection

To ensure the AI respects current settings even mid-conversation (overriding conversation history patterns), the API routes inject the current settings status directly into each user message:

```
[CURRENT AI SETTINGS - These override any previous conversation patterns]
• Grant Search: ✅ ENABLED - You CAN use the search_grants tool
• Knowledge Base: ✅ ENABLED
• Organization Profile: ✅ ENABLED
[END SETTINGS - Always respect these current settings, not past responses]
```

This is handled in the API routes (`/api/ai/chat-assistant` and `/api/ai/editor-assistant`), not in the agents themselves.

---

## Data Flow

```
User Message
     │
     ▼
┌─────────────────────────────────────────────────────────┐
│                    API Endpoint                          │
│  ┌─────────────────────────────────────────────────┐   │
│  │ 1. Load Context                                  │   │
│  │    - Organization profile                        │   │
│  │    - User AI settings                           │   │
│  │    - Document/Application (editor only)         │   │
│  └─────────────────────────────────────────────────┘   │
│                         │                               │
│                         ▼                               │
│  ┌─────────────────────────────────────────────────┐   │
│  │ 2. RAG Context                                   │   │
│  │    - searchKnowledgeBase() → semantic search    │   │
│  │    - getActiveKnowledgeBase() → general context │   │
│  └─────────────────────────────────────────────────┘   │
│                         │                               │
│                         ▼                               │
│  ┌─────────────────────────────────────────────────┐   │
│  │ 3. Create Agent                                  │   │
│  │    - createChatAgent() or createEditorAgent()   │   │
│  │    - Attach tools (grant search if enabled)     │   │
│  │    - Build system prompt with settings status   │   │
│  └─────────────────────────────────────────────────┘   │
│                         │                               │
│                         ▼                               │
│  ┌─────────────────────────────────────────────────┐   │
│  │ 4. Inject Settings Status                        │   │
│  │    - Prepend current settings to user message   │   │
│  │    - Ensures AI sees current state, not history │   │
│  │    - Overrides conversation pattern following   │   │
│  └─────────────────────────────────────────────────┘   │
│                         │                               │
│                         ▼                               │
│  ┌─────────────────────────────────────────────────┐   │
│  │ 5. Execute & Stream                             │   │
│  │    - agent.stream({ messages })                 │   │
│  │    - Filter LLM vs tool outputs                 │   │
│  │    - Stream to client                           │   │
│  └─────────────────────────────────────────────────┘   │
│                         │                               │
│                         ▼                               │
│  ┌─────────────────────────────────────────────────┐   │
│  │ 6. Persist                                       │   │
│  │    - Save user message                          │   │
│  │    - Save assistant response                    │   │
│  │    - Update chat timestamp                      │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

---

## Environment Variables

| Variable | Purpose |
|----------|---------|
| `OPENAI_API_KEY` | OpenAI API for LLM and embeddings |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase for vector store |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase client auth |

---

## Dependencies

- **@langchain/openai** - OpenAI integration for LangChain
- **@langchain/core** - LangChain core (tools, messages)
- **@langchain/community** - Supabase vector store
- **langchain** - Agent creation
- **openai** - Direct OpenAI SDK for embeddings
- **zod** - Tool schema validation

---

## Related API Endpoints

- `/api/ai/chat-assistant` - Uses `chat-agent.ts`
- `/api/ai/editor-assistant` - Uses `editor-agent.ts`
- `/api/ai/recommendations` - Grant recommendations
- `/api/documents/vectorize` - Document vectorization for RAG

