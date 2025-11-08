# LangChain Grants AI Assistant - Technical Documentation

## Overview

This is a **production-ready LangChain ReAct Agent** implementation that provides intelligent grant search and recommendations for K-12 school districts. The agent autonomously decides when to search the grants database versus responding conversationally, using semantic vector search powered by OpenAI embeddings and Supabase pgvector.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        User Interface                            │
│                    (Chat Component)                              │
└──────────────────────────┬──────────────────────────────────────┘
                           │ POST /api/ai/assistant-agent
                           │ { messages, chatId, organizationId }
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                     API Route Handler                            │
│                  (route.ts - This File)                          │
├─────────────────────────────────────────────────────────────────┤
│ 1. Authentication & Authorization (Supabase)                    │
│ 2. Organization Context Loading (Prisma)                        │
│ 3. Chat Session Management                                      │
│ 4. Agent Initialization                                         │
│ 5. Streaming Orchestration                                      │
│ 6. Response Filtering (LLM vs Tool outputs)                     │
│ 7. Database Persistence                                         │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                    LangChain Agent                               │
│                   (lib/ai/agent.ts)                              │
├─────────────────────────────────────────────────────────────────┤
│ • Model: GPT-4o-mini (streaming enabled)                        │
│ • Type: ReAct Agent (Reasoning + Acting)                        │
│ • Tools: [search_grants]                                        │
│ • System Prompt: Dynamic based on district context             │
└──────────────────┬────────────────┬─────────────────────────────┘
                   │                │
         ┌─────────▼────────┐      │
         │  System Prompt   │      │
         │  (prompts/)      │      │
         └──────────────────┘      │
                                   ▼
         ┌─────────────────────────────────────┐
         │    Grant Search Tool                 │
         │    (tools/grant-search-tool.ts)     │
         ├─────────────────────────────────────┤
         │ • Zod Schema Validation             │
         │ • Semantic Query Building           │
         │ • District Context Integration      │
         │ • Result Formatting                 │
         └──────────────┬──────────────────────┘
                        │
                        ▼
         ┌─────────────────────────────────────┐
         │    Vector Store                      │
         │    (lib/ai/vector-store.ts)         │
         ├─────────────────────────────────────┤
         │ • Supabase Vector Store             │
         │ • OpenAI Embeddings                 │
         │ • Similarity Search (cosine)        │
         │ • Metadata Filtering                │
         └──────────────┬──────────────────────┘
                        │
                        ▼
         ┌─────────────────────────────────────┐
         │    Supabase Database                │
         │    (documents table)                │
         ├─────────────────────────────────────┤
         │ • pgvector extension                │
         │ • 1536-dim embeddings               │
         │ • ~2000+ grant opportunities        │
         │ • Metadata: state, status, etc.     │
         └─────────────────────────────────────┘
```

## File Structure

```
webapp/src/
├── app/api/ai/assistant-agent/
│   ├── route.ts              # Main API endpoint (this file)
│   └── README.md             # This documentation
│
└── lib/ai/
    ├── agent.ts              # Agent factory & configuration
    ├── vector-store.ts       # Supabase vector search
    ├── prompts/
    │   └── grants-assistant.ts  # System prompts & district context
    └── tools/
        └── grant-search-tool.ts # Vector search tool definition
```

---

## Core Components

### 1. API Route Handler (`route.ts`)

**Purpose:** Orchestrates the entire request/response cycle with authentication, streaming, and persistence.

**Key Responsibilities:**

#### A. Authentication & Context Loading

```typescript
// 1. Supabase authentication
const { user } = await supabase.auth.getUser();

// 2. Load organization data
const organization = await prisma.organization.findUnique({
  where: { id: userOrgId },
});

// 3. Build district context for agent
const districtInfo: DistrictInfo = {
  name: organization.name,
  state: organization.state,
  enrollment: organization.enrollment,
  // ... 14 contextual fields
};
```

#### B. Chat Session Management

```typescript
// Get or create chat
let chat = await prisma.aiChat.findUnique({ where: { id: chatId } });
if (!chat) {
  chat = await prisma.aiChat.create({
    data: {
      title: generateChatTitle(lastUserMessage.content),
      userId: user.id,
      organizationId: userOrgId,
    },
  });
}

// Save user message immediately
await prisma.aiChatMessage.create({
  data: {
    role: "USER",
    content: lastUserMessage.content,
    chatId: chat.id,
  },
});
```

#### C. Streaming Response with Filtering

**The Critical Innovation:** Distinguishing between LLM responses and tool outputs

```typescript
// Stream with messages mode
const streamResult = await agent.stream(
  { messages: langChainMessages },
  { streamMode: "messages" }
);

for await (const chunk of streamResult) {
  if (Array.isArray(chunk)) {
    const [message, metadata] = chunk;
    const node = metadata?.langgraph_node;

    // ✅ Stream these to user
    if (node === "model" || node === "model_request") {
      controller.enqueue(encoder.encode(message.content));
    }

    // ❌ Filter these out
    else if (node === "tools") {
      // Tool execution - don't show raw JSON to user
      console.log("Tool result filtered out");
    }
  }
}
```

**Why this matters:**

- Without filtering: User sees raw JSON from tool calls
- With filtering: User only sees formatted LLM response
- LLM uses tool data internally to generate human-readable output

#### D. Graceful Disconnection Handling

```typescript
const saveToDatabase = async () => {
  await prisma.aiChatMessage.create({
    data: {
      role: "ASSISTANT",
      content: fullResponse,
      metadata: {
        clientDisconnected, // Track if user closed browser
        timestamp: Date.now(),
      },
    },
  });
};

// Always save, even if client disconnects
try {
  // ... streaming
} finally {
  await saveToDatabase();
}
```

---

### 2. Agent Factory (`lib/ai/agent.ts`)

**Purpose:** Create and configure the LangChain ReAct agent.

```typescript
export async function createGrantsAgent(
  districtInfo: DistrictInfo | null,
  baseUrl: string
) {
  // 1. Initialize LLM
  const model = new ChatOpenAI({
    modelName: "gpt-4o-mini",
    temperature: 0.7, // Slightly creative
    streaming: true, // Enable token streaming
  });

  // 2. Create tools array
  const tools = [createGrantSearchTool(districtInfo)];

  // 3. Build system prompt with district context
  const systemPrompt = buildSystemPrompt(districtInfo, baseUrl);

  // 4. Create ReAct agent
  return createAgent({
    model,
    tools,
    systemPrompt,
  });
}
```

**Design Decisions:**

| Decision            | Rationale                                                           |
| ------------------- | ------------------------------------------------------------------- |
| **GPT-4o-mini**     | Fast, cost-effective, sufficient for structured reasoning           |
| **Temperature 0.7** | Balanced creativity for natural language while maintaining accuracy |
| **Streaming: true** | Real-time user feedback, perceived performance boost                |
| **ReAct Pattern**   | Allows agent to reason before acting, log its thought process       |

---

### 3. Grant Search Tool (`lib/ai/tools/grant-search-tool.ts`)

**Purpose:** Provide the agent with semantic search capabilities over the grants database.

#### Tool Definition

```typescript
new DynamicStructuredTool({
  name: "search_grants",
  description: `Search for grant funding opportunities...
    ${districtInfo?.state ? `District is in ${districtInfo.state}` : ""}
    ${districtInfo?.enrollment ? `${districtInfo.enrollment} students` : ""}`,

  schema: z.object({
    query: z
      .string()
      .describe("Search query with program focus, target population..."),
    stateCode: z
      .string()
      .optional()
      .describe("Two-letter state code (MA, NY, CA, US for federal)"),
    status: z
      .enum(["posted", "forecasted", "closed"])
      .optional()
      .describe("Grant status filter"),
  }),

  func: async ({ query, stateCode, status }) => {
    // Search vector store
    const results = await searchGrants(query, {
      stateCode: stateCode || districtInfo?.state,
      status: status || "posted",
    });

    // Return formatted JSON for LLM to parse
    return JSON.stringify({
      success: true,
      count: results.length,
      grants: results.map(formatGrant),
    });
  },
});
```

#### Key Features

1. **Zod Schema Validation** - Type-safe parameters with descriptions for LLM
2. **Auto-Context Integration** - District state/enrollment baked into description
3. **Structured Output** - LLM receives consistent JSON format
4. **Error Handling** - Graceful failures with helpful messages

#### Tool Invocation Example

**User:** "Find STEM grants for high school"

**Agent Reasoning:**

```
Thought: User wants STEM grants for high school level.
Action: search_grants
Action Input: {
  "query": "STEM science technology engineering math high school grades 9-12",
  "stateCode": "MA",  // From district context
  "status": "posted"
}
```

**Tool Response:**

```json
{
  "success": true,
  "count": 5,
  "grants": [
    {
      "id": 123,
      "title": "STEM Innovation Fund",
      "agency": "NSF",
      "amount": "$50,000 - $200,000",
      "deadline": "Mar 15, 2026",
      ...
    }
  ]
}
```

**Agent Output to User:**

```markdown
# 🎯 STEM Grant Opportunities

## 🧪 STEM Innovation Fund

**Agency**: National Science Foundation
💰 **Award Range**: $50,000–$200,000
...
```

---

### 4. Vector Store (`lib/ai/vector-store.ts`)

**Purpose:** Semantic search over grant embeddings using Supabase pgvector.

```typescript
export async function searchGrants(
  query: string,
  filters?: {
    stateCode?: string;
    status?: string;
  }
): Promise<GrantDocument[]> {
  // 1. Create vector store
  const vectorStore = new SupabaseVectorStore(embeddings, {
    client: supabaseClient,
    tableName: "documents",
    queryName: "match_documents", // Custom RPC function
  });

  // 2. Build metadata filters
  const filter: Record<string, any> = {};
  if (filters?.stateCode) filter.state_code = filters.stateCode;
  if (filters?.status) filter.status = filters.status;

  // 3. Similarity search (cosine distance)
  const results = await vectorStore.similaritySearch(
    query,
    10, // Top 10 results
    filter // Metadata filter
  );

  return results.map((doc) => ({
    content: doc.pageContent,
    metadata: doc.metadata as GrantMetadata,
  }));
}
```

#### Vector Search Flow

1. **Query Embedding**
   - Input: "STEM grants for middle school"
   - Model: `text-embedding-3-small` (1536 dimensions)
   - Output: `[0.123, -0.456, ...]` (vector representation)

2. **Similarity Computation**
   - Supabase pgvector computes cosine similarity
   - Finds top 10 most semantically similar grants
   - Applies metadata filters (state, status)

3. **Result Ranking**
   - Sorted by similarity score (0.0 to 1.0)
   - Higher score = better match

#### Database Schema

```sql
-- documents table
CREATE TABLE documents (
  id BIGSERIAL PRIMARY KEY,
  content TEXT,                    -- Full grant description
  metadata JSONB,                  -- Structured grant data
  embedding VECTOR(1536),          -- OpenAI embedding

  -- Metadata fields (for filtering)
  opportunity_id INTEGER,
  source TEXT,
  status TEXT,
  state_code TEXT,
  category TEXT[],
  post_date TIMESTAMP,
  close_date TIMESTAMP
);

-- Vector similarity function
CREATE FUNCTION match_documents(
  query_embedding VECTOR(1536),
  match_threshold FLOAT,
  match_count INT
) RETURNS TABLE (...);
```

---

### 5. System Prompts (`lib/ai/prompts/grants-assistant.ts`)

**Purpose:** Configure agent behavior, response formatting, and district-specific context.

#### Prompt Structure

```typescript
export function buildSystemPrompt(
  districtInfo: DistrictInfo | null,
  baseUrl: string
): string {
  return `
    <task_summary>
    You are an expert Grants Lifecycle Assistant for K-12 districts.
    </task_summary>
    
    <context>
    ${buildDistrictContext(districtInfo)}
    </context>
    
    <available_tools>
    - Grants Vector Store: Semantic search over verified grants
    </available_tools>
    
    <tool_usage_policy>
    - ALWAYS rely on tools for data
    - NEVER fabricate grant information
    - For greetings/casual chat, respond without tools
    </tool_usage_policy>
    
    <output_structure>
    - Use clean markdown
    - Emoji for visual hierarchy (💰 🗓️ 🏫)
    - One grant per section
    - Include: Title, Agency, Amount, Deadline, Eligibility
    - Separate grants with ---
    </output_structure>
    
    <examples>
    [Detailed examples of good responses]
    </examples>
  `;
}
```

#### District Context Injection

```typescript
function buildDistrictContext(info: DistrictInfo): string {
  return `
**Current District:** ${info.name}
- Location: ${info.city}, ${info.state}
- Enrolled Students: ${info.enrollment}
- Grade Levels: ${info.lowestGrade} – ${info.highestGrade}
- Annual Budget: $${info.annualOperatingBudget}
- Mission: ${info.missionStatement}

**Critical:** Tailor ALL recommendations to this district's profile.
  `;
}
```

**Why this works:**

- **Grounded in context** - Agent sees district data in every request
- **Clear constraints** - "NEVER fabricate" prevents hallucination
- **Format examples** - Shows agent exactly how to structure responses
- **Natural language rules** - LLM understands instructions better than code

---

## Data Flow: End-to-End

### Example: User asks "Find STEM grants"

```
1. User Types Message
   ↓
   "Find STEM grants for my district"

2. Frontend Sends Request
   ↓
   POST /api/ai/assistant-agent
   {
     messages: [{ role: "user", content: "Find STEM grants..." }],
     chatId: "chat_123",
     organizationId: "org_456"
   }

3. API Route: Authentication
   ↓
   ✓ Verify Supabase session
   ✓ Load user's organization
   ✓ Build district context

4. API Route: Create Agent
   ↓
   createGrantsAgent(districtInfo, baseUrl)
   → Returns configured ReAct agent

5. Agent: Reasoning Phase
   ↓
   Thought: "User wants STEM grants. I should search the database."
   Action: search_grants
   Action Input: { query: "STEM science...", stateCode: "MA" }

6. Tool: Vector Search
   ↓
   • Embed query → [0.123, -0.456, ...]
   • Search Supabase pgvector
   • Filter by state_code="MA", status="posted"
   • Return top 10 results

7. Tool Returns Data
   ↓
   {
     "success": true,
     "grants": [
       { id: 123, title: "STEM Innovation Fund", ... }
     ]
   }

8. Agent: Response Generation
   ↓
   Thought: "I have grant data. Format it nicely for the user."

   Streams tokens:
   "#" " " "🎯" " " "STEM" " " "Grant" ...

9. API Route: Filtering
   ↓
   FOR EACH chunk:
     IF langgraph_node === "tools":
       ❌ Filter out (raw JSON)
     ELSE IF langgraph_node === "model_request":
       ✅ Stream to client

10. Client Receives Formatted Response
    ↓
    # 🎯 STEM Grant Opportunities

    ## 🧪 STEM Innovation Fund
    **Agency**: National Science Foundation
    💰 **Award Range**: $50,000–$200,000
    ...

11. API Route: Persist to Database
    ↓
    • Save user message
    • Save assistant response
    • Update chat timestamp
```

---

## Streaming Architecture

### Why Streaming?

| Benefit                    | Impact                                               |
| -------------------------- | ---------------------------------------------------- |
| **Perceived Performance**  | User sees response immediately, not after 5+ seconds |
| **Token-by-Token Display** | Natural reading experience                           |
| **Early Cancellation**     | User can stop if answer is clear                     |
| **Reduced Latency**        | First token in ~500ms vs full response in 5s         |

### Implementation Details

```typescript
// 1. Enable streaming on model
const model = new ChatOpenAI({
  streaming: true
});

// 2. Use ReadableStream for HTTP response
const stream = new ReadableStream({
  async start(controller) {
    // Stream tokens
    for await (const chunk of agent.stream(...)) {
      if (shouldStreamThisChunk(chunk)) {
        controller.enqueue(encoder.encode(content));
      }
    }
    controller.close();
  }
});

// 3. Return streaming response
return new Response(stream, {
  headers: {
    "Content-Type": "text/plain; charset=utf-8",
    "Transfer-Encoding": "chunked"
  }
});
```

### Chunk Filtering Logic

**Problem:** LangChain streams EVERYTHING (tool calls, results, LLM responses)

**Solution:** Filter by `langgraph_node` metadata

```typescript
const [message, metadata] = chunk;
const node = metadata?.langgraph_node;

switch (node) {
  case "model": // ✅ LLM thinking
  case "model_request": // ✅ LLM response
    return STREAM_TO_USER;

  case "tools": // ❌ Tool execution
    return FILTER_OUT;

  case "__start__": // ✅ Agent initialization
    return STREAM_TO_USER;

  default:
    console.log(`Unknown node: ${node}`);
    return FILTER_OUT;
}
```

---

## Key Technical Decisions

### 1. Why LangChain over Custom Implementation?

| Feature         | Custom                    | LangChain              |
| --------------- | ------------------------- | ---------------------- |
| Agent reasoning | Manual prompt engineering | Built-in ReAct pattern |
| Tool execution  | Custom parser             | Automatic with Zod     |
| Streaming       | Complex state management  | Native support         |
| Error handling  | Manual try/catch          | Graceful fallbacks     |
| Extensibility   | Hard to add tools         | `tools.push(newTool)`  |

**Verdict:** LangChain provides production-ready patterns with less code.

### 2. Why GPT-4o-mini?

- **Cost:** ~80% cheaper than GPT-4
- **Speed:** ~2x faster responses
- **Quality:** Sufficient for structured tasks
- **Streaming:** Full support

### 3. Why Vector Search?

**Alternative approaches:**

```typescript
// ❌ Keyword search
SELECT * FROM grants WHERE title LIKE '%STEM%';
// Problem: Misses "Science, Technology, Engineering" grants

// ❌ Full-text search
SELECT * FROM grants WHERE to_tsvector(description) @@ 'STEM';
// Problem: No semantic understanding

// ✅ Vector search
SELECT * FROM grants ORDER BY embedding <=> query_embedding LIMIT 10;
// Solution: Understands "STEM" = "Science & Technology education"
```

### 4. Why Supabase pgvector?

- **Integrated:** Database + vector search in one
- **Cost-effective:** No separate vector DB subscription
- **Performance:** Native Postgres extension
- **Metadata filtering:** Combine vector + SQL filters
- **Familiarity:** Team already uses Supabase

---

## Environment Variables

```bash
# OpenAI (Required)
OPENAI_API_KEY=sk-...

# Supabase (Required)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=eyJxxx...

# Database (Required - via Prisma)
DATABASE_URL=postgresql://...
```

---

## Performance Metrics

| Metric                      | Value        | Notes                         |
| --------------------------- | ------------ | ----------------------------- |
| **First Token Latency**     | ~800ms       | Time until first word appears |
| **Full Response Time**      | 3-5s         | Depends on tool usage         |
| **Conversational Response** | 1-2s         | No tool call needed           |
| **Vector Search Time**      | ~200ms       | Supabase pgvector query       |
| **Token Streaming Rate**    | ~30 tokens/s | Network dependent             |

---

## Error Handling

### 1. Authentication Failures

```typescript
if (authError || !user) {
  return new Response("Unauthorized", { status: 401 });
}
```

### 2. Vector Search Failures

```typescript
try {
  const results = await searchGrants(...);
} catch (error) {
  return JSON.stringify({
    success: false,
    error: "Failed to search grants database"
  });
}
```

### 3. Client Disconnection

```typescript
try {
  controller.enqueue(encoder.encode(content));
} catch {
  clientDisconnected = true;
  // Continue processing, save to DB
}
```

### 4. Stream Errors

```typescript
try {
  // Stream chunks
} catch (error) {
  console.error("Stream error:", error);
  if (fullResponse) {
    await saveToDatabase(); // Save partial response
  }
  controller.error(error);
}
```

---

## Extension Points

### Adding New Tools

```typescript
// lib/ai/tools/draft-proposal-tool.ts
export function createProposalDraftTool() {
  return new DynamicStructuredTool({
    name: "draft_proposal",
    description: "Generate grant proposal draft",
    schema: z.object({
      grantId: z.number(),
      sections: z.array(z.string()),
    }),
    func: async ({ grantId, sections }) => {
      // Implementation
    },
  });
}

// lib/ai/agent.ts
const tools = [
  createGrantSearchTool(districtInfo),
  createProposalDraftTool(), // ← Add new tool
];
```

### Adding Memory/History

```typescript
// Currently: Stateless agent
const langChainMessages = messages.map(...);

// Future: Add conversation buffer
import { BufferMemory } from "langchain/memory";

const memory = new BufferMemory({
  returnMessages: true,
  memoryKey: "chat_history"
});

const agent = createAgent({
  model,
  tools,
  memory  // ← Add memory
});
```

### Custom Retrieval Strategy

```typescript
// Current: Top 10 similarity
await vectorStore.similaritySearch(query, 10);

// Future: Maximal Marginal Relevance (diversity)
await vectorStore.maxMarginalRelevanceSearch(query, {
  k: 10,
  fetchK: 50, // Fetch 50, rerank to top 10
  lambda: 0.5, // Balance relevance vs diversity
});
```

---

## Testing

### Unit Tests

```typescript
// tests/agent.test.ts
describe("createGrantsAgent", () => {
  it("should create agent with district context", async () => {
    const agent = await createGrantsAgent(mockDistrict, "http://localhost");
    expect(agent).toBeDefined();
  });
});
```

### Integration Tests

```typescript
// tests/search.test.ts
describe("searchGrants", () => {
  it("should return relevant grants for STEM query", async () => {
    const results = await searchGrants("STEM education", {
      stateCode: "MA",
      status: "posted",
    });
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].metadata.category).toContain("STEM");
  });
});
```

### E2E Tests

```typescript
// tests/e2e/chat.test.ts
describe("Chat Flow", () => {
  it("should handle full conversation", async () => {
    const response = await fetch("/api/ai/assistant-agent", {
      method: "POST",
      body: JSON.stringify({
        messages: [{ role: "user", content: "Find STEM grants" }],
        chatId: "test_123",
      }),
    });

    expect(response.ok).toBe(true);
    const text = await response.text();
    expect(text).toContain("STEM");
  });
});
```

---

## Monitoring & Debugging

### Console Logs

```typescript
// Agent execution
🤖 [Assistant Agent] Executing agent for chat: chat_123
📝 [Assistant Agent] User message: Find STEM grants

// Tool invocation
🔧 Tool invoked: search_grants
   Query: "STEM science technology"
   State: MA
   Status: posted

// Chunk filtering
✅ [Assistant Agent] Model response chunk
🔧 [Assistant Agent] Tool execution chunk (filtered out)

// Database operations
💾 [Assistant Agent] Saving response to database...
✅ [Assistant Agent] Saved response to DB
```

### Performance Tracking

```typescript
console.time('agent-execution');
const response = await agent.stream(...);
console.timeEnd('agent-execution');
// agent-execution: 3456ms
```

### Error Tracking

```typescript
try {
  // Agent logic
} catch (error) {
  console.error("❌ [Assistant Agent] Error:", error);
  // Send to error tracking service (Sentry, etc.)
}
```

---

## Security Considerations

### 1. Authentication

- ✅ Supabase session validation on every request
- ✅ User can only access their organization's data

### 2. Authorization

- ✅ Organization-scoped queries
- ✅ No cross-organization data leakage

### 3. Input Validation

- ✅ Zod schema validation on tool parameters
- ✅ SQL injection prevention via Prisma/Supabase

### 4. Rate Limiting

- ⚠️ TODO: Implement rate limiting per user/organization

### 5. Cost Control

- ✅ Using cost-effective GPT-4o-mini
- ⚠️ TODO: Monitor token usage per user

---

## Known Limitations

1. **Tool Call Visibility**
   - User doesn't see when tools are being invoked
   - Solution: Add UI indicators (coming soon)

2. **Context Window**
   - Currently sending all messages
   - Large conversations may hit token limits
   - Solution: Implement sliding window or summarization

3. **No Multi-Turn Tool Use**
   - Agent calls one tool per turn
   - Can't chain: search grants → get details → draft proposal
   - Solution: Use LangChain agents with `AgentExecutor`

4. **Limited Error Recovery**
   - If tool fails, agent may give generic response
   - Solution: Add retry logic and fallback strategies

---

## Future Enhancements

### Short Term

- [ ] Add stop button functionality (UI implemented, needs testing)
- [ ] Tool call indicators in UI
- [ ] Rate limiting per organization
- [ ] Token usage tracking

### Medium Term

- [ ] Proposal drafting tool
- [ ] Grant comparison tool
- [ ] Deadline reminder tool
- [ ] Multi-step tool chaining

### Long Term

- [ ] Fine-tuned model on grant data
- [ ] Persistent memory across sessions
- [ ] Multi-agent collaboration (researcher + writer agents)
- [ ] Proactive grant recommendations

---

## Support & Maintenance

### Updating Dependencies

```bash
# Update LangChain packages
npm update @langchain/core @langchain/openai @langchain/community langchain

# Update OpenAI
npm update openai
```

### Regenerating Vector Embeddings

```typescript
// Run vectorization script
POST /api/grants/vectorize
{
  "opportunityIds": [123, 456, 789]  // Or null for all
}
```

### Debugging Agent Behavior

```typescript
// Enable verbose logging
const agent = createAgent({
  model,
  tools,
  systemPrompt,
  verbose: true, // ← Shows reasoning steps
});
```

---

## Resources

- [LangChain Documentation](https://js.langchain.com/docs/)
- [OpenAI Embeddings](https://platform.openai.com/docs/guides/embeddings)
- [Supabase Vector](https://supabase.com/docs/guides/ai/vector-columns)
- [ReAct Pattern Paper](https://arxiv.org/abs/2210.03629)

---

## Questions?

For technical questions or implementation issues:

1. Check console logs for detailed error messages
2. Review the chunk structure logging for streaming issues
3. Test tool behavior independently via `searchGrants()` function
4. Verify environment variables are set correctly

**Last Updated:** November 8, 2025  
**Version:** 1.0.0  
**Maintainer:** GrantWare AI Team
