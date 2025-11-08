<!-- 256889e2-d1d3-4c05-8618-0fe80eeb46aa d09c03f5-0e76-4bb3-80e3-d6d2ba4cf81a -->
# LangChain Agent RAG Migration Plan

## Overview

Replace n8n AI agent with a LangChain Agent that intelligently uses vector search as a tool via SupabaseVectorStore from @langchain/community. The LLM automatically decides when to search the database based on user queries.

## Phase 1: Dependencies & Setup

### Install Required Packages

Run in the webapp directory:

```bash
npm install @langchain/core @langchain/openai @langchain/community langchain --legacy-peer-deps
```

**Note**:

- Using `--legacy-peer-deps` to resolve peer dependency conflicts
- No LangGraph needed - using pure LangChain agents!
- zod already installed

### Environment Variables

Already configured:

- OPENAI_API_KEY
- NEXT_PUBLIC_SUPABASE_URL  
- NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

## Phase 2: Prompt Templates

**File**: `webapp/src/lib/ai/prompts/grants-assistant.ts`

Convert n8n prompt to modular TypeScript templates with district context, formatting rules, and examples.

## Phase 3: Vector Search Tool

**File**: `webapp/src/lib/ai/vector-store.ts`

Use SupabaseVectorStore with OpenAIEmbeddings, documents table, and metadata filtering.

**File**: `webapp/src/lib/ai/tools/grant-search-tool.ts`

Create DynamicStructuredTool with zod schema for query, stateCode, status parameters.

## Phase 4: Agent Setup

**File**: `webapp/src/lib/ai/agent.ts`

Create agent with ChatOpenAI, tools array, and ChatPromptTemplate.

## Phase 5: API Route

**File**: `webapp/src/app/api/ai/assistant-agent/route.ts`

Implement streaming endpoint with auth, chat management, and agent execution.

## Phase 6: UI Update

**File**: `webapp/src/components/chat/Chat.tsx`

Change endpoint from `/api/chat` to `/api/ai/assistant-agent`.

## Phase 7: Testing

Test conversational vs search queries, validate tool calling, check streaming and database saves.

## Phase 8: Migration

Deploy alongside old endpoint, test, then switch traffic.

## Estimated Time: 10-12 hours

### To-dos

- [ ] Install LangChain, LangGraph, and related packages
- [ ] Create modular prompt template system from n8n prompt
- [ ] Define TypeScript types for graph state and messages
- [ ] Create intent router node to classify user queries
- [ ] Create conversational node for non-search interactions
- [ ] Create grant search node with vector store integration
- [ ] Create response generator node with formatting
- [ ] Build LangGraph workflow with conditional routing
- [ ] Create Supabase vector store wrapper with metadata filtering
- [ ] Create /api/ai/assistant-agent route with streaming
- [ ] Integrate AI SDK streamText with LangGraph output
- [ ] Update Chat component to use new API endpoint
- [ ] Test all scenarios and validate functionality