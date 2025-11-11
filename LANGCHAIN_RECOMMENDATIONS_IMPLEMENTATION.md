# LangChain Recommendations Implementation

## Overview

The new LangChain-based recommendations system replaces the previous N8N webhook approach with a fully integrated AI workflow that uses OpenAI and the grant search tool to generate personalized grant recommendations.

---

## Architecture

```
User Request
    ↓
/api/ai/recommendations endpoint
    ↓
Authenticate & Fetch Organization Profile
    ↓
Build Recommendations Prompt (with district context)
    ↓
OpenAI GPT-4o with grant-search-tool
    ↓
Tool Calls: Search state + federal grants
    ↓
AI analyzes results & generates scored recommendations
    ↓
Save to database (Recommendation model)
    ↓
Return JSON response
```

---

## Key Components

### 1. New API Endpoint

**File**: `/webapp/src/app/api/ai/recommendations/route.ts`

**Features**:

- ✅ Authenticates user via Supabase
- ✅ Fetches organization profile (required: mission statement, strategic plan, state)
- ✅ Creates LangChain agent with GPT-4o
- ✅ Binds grant-search-tool to the model
- ✅ Executes AI workflow with tool calls
- ✅ Parses JSON recommendations from AI response
- ✅ Saves recommendations to database
- ✅ Returns structured JSON response

**Request Format**:

```json
POST /api/ai/recommendations
Content-Type: application/json

{
  // No body required - uses authenticated user's organization
}
```

**Response Format**:

```json
{
  "success": true,
  "count": 15,
  "recommendations": [
    {
      "id": "cuid...",
      "organizationId": "org123",
      "opportunityId": "4567",
      "fitScore": 85,
      "fitReasoning": "Strong alignment with STEM focus...",
      "fitDescription": "Supports STEM teacher training and curriculum development",
      "districtName": "Springfield School District",
      "queryDate": "2025-01-15T10:30:00Z",
      "createdAt": "2025-01-15T10:30:00Z"
    }
  ],
  "message": "Generated 15 grant recommendations"
}
```

---

### 2. Recommendations Prompt

The AI is given a detailed system prompt that includes:

**Task Summary**:

- Evaluate district profile
- Call grant search tool to retrieve top 20 relevant grants
- Rank grants based on fit (eligibility, scale, needs)
- Return structured JSON with fit scores and reasoning

**District Context**:

- Organization name, location, enrollment
- Mission statement and strategic plan
- Grade levels, budget, and other profile data

**Search Strategy**:

- Two parallel searches: state-specific + federal/national
- Extract keywords from strategic plan/mission
- Filter by eligibility, deadline, and relevance
- Prioritize first-time-friendly grants

**Output Requirements**:

- JSON array format (strictly enforced)
- Each recommendation includes:
  - `opportunity_id` (from grant search tool)
  - `opportunity_title` (from grant search tool)
  - `fit_score` (0-100 integer)
  - `fit_reasoning` (detailed explanation)
  - `fit_description` (concise plain-language summary)
  - Organization metadata

---

### 3. Tool Integration

**Grant Search Tool** (`@/lib/ai/tools/grant-search-tool.ts`):

- Already exists and integrates seamlessly
- Performs semantic search on vectorized grants database
- Returns formatted grant data with all metadata
- Supports filtering by state, status, and category

**Tool Flow**:

1. AI analyzes district profile
2. Generates semantic search queries
3. Calls `search_grants` tool (2-3 times)
4. Receives structured grant data
5. Evaluates fit for each grant
6. Returns scored recommendations

---

### 4. Database Integration

**Recommendation Model** (Prisma):

```prisma
model Recommendation {
  id             String       @id @default(cuid())
  organizationId String
  opportunityId  String
  fitScore       Int
  fitReasoning   String
  fitDescription String
  districtName   String
  queryDate      DateTime
  createdAt      DateTime     @default(now())
  organization   Organization @relation(...)
}
```

**Save Logic**:

- Checks if recommendation exists (by org + opportunity)
- Updates existing or creates new
- Handles duplicate prevention
- Logs all operations

---

### 5. Frontend Integration

**Updated File**: `/webapp/src/app/private/[slug]/grants/page.tsx`

**Changes**:

```typescript
// OLD (N8N webhook)
fetch("/api/recommendations", {
  body: JSON.stringify({
    message: "Generate grant recommendations...",
  }),
});

// NEW (LangChain)
fetch("/api/ai/recommendations", {
  body: JSON.stringify({}), // No message needed
});
```

**UI Updates**:

- Better error messages with AI-generated error details
- Success toast shows count of recommendations found
- Automatic refresh of recommendations list
- Profile completeness validation

---

## Workflow Example

### 1. User Profile

```json
{
  "name": "Springfield School District",
  "state": "MA",
  "enrollment": 5000,
  "missionStatement": "Provide excellent STEM education...",
  "strategicPlan": "Focus on technology integration and teacher development..."
}
```

### 2. AI Generates Queries

- **State Search**: "STEM education technology integration teacher professional development MA"
- **Federal Search**: "STEM education technology integration teacher professional development US"

### 3. Tool Returns Grants

```json
{
  "success": true,
  "count": 10,
  "grants": [
    {
      "id": 4567,
      "title": "STEM Innovation Fund",
      "agency": "National Science Foundation",
      "amount": "$50,000 - $200,000",
      "deadline": "Mar 15, 2026",
      "state": "US",
      "status": "posted"
    }
  ]
}
```

### 4. AI Evaluates & Scores

```json
[
  {
    "opportunity_id": 4567,
    "opportunity_title": "STEM Innovation Fund",
    "fit_score": 85,
    "fit_reasoning": "Strong alignment with district's STEM focus and technology integration goals. Award range ($50k-$200k) matches district size (5000 students). Federal grant with open eligibility.",
    "fit_description": "Supports STEM teacher training and curriculum development with technology integration",
    "organization_name": "Springfield School District",
    "organization_id": "org123",
    "query_date": "2025-01-15T10:30:00Z"
  }
]
```

### 5. Saved to Database

```sql
INSERT INTO app.recommendations (
  organization_id, opportunity_id, fit_score,
  fit_reasoning, fit_description, ...
)
```

---

## Advantages Over N8N Webhook

| Feature           | N8N Webhook             | LangChain (New)          |
| ----------------- | ----------------------- | ------------------------ |
| **Integration**   | External service        | Native to codebase       |
| **Maintenance**   | Complex workflow editor | Standard TypeScript code |
| **Debugging**     | Limited visibility      | Full console logs        |
| **Performance**   | Network overhead        | Direct function calls    |
| **Reliability**   | Depends on N8N uptime   | Self-contained           |
| **Testability**   | Difficult to test       | Standard unit tests      |
| **Cost**          | N8N hosting + API calls | API calls only           |
| **Extensibility** | GUI-based changes       | Code-based changes       |

---

## Configuration

### Environment Variables

```bash
# Required for OpenAI
OPENAI_API_KEY=sk-...

# Required for Supabase
NEXT_PUBLIC_SUPABASE_URL=https://...
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...

# Required for vector search
DATABASE_URL=postgresql://...
```

### Model Settings

```typescript
const model = new ChatOpenAI({
  modelName: "gpt-4o", // Using GPT-4o for better reasoning
  temperature: 0.3, // Lower temp for consistent scoring
});
```

---

## Error Handling

### Profile Validation

```typescript
if (!organization.missionStatement ||
    !organization.strategicPlan ||
    !organization.state) {
  return 400 Bad Request
}
```

### JSON Parsing

- Handles markdown code blocks from AI
- Extracts JSON from mixed content
- Validates required fields
- Returns detailed error messages

### Database Operations

- Try-catch blocks for each save
- Logs warnings for invalid recommendations
- Continues processing on individual failures
- Returns success count

---

## Performance Considerations

### Tool Calls

- Typically 2-3 tool calls per request
- Parallel execution where possible
- ~5-10 seconds total execution time

### Token Usage

- System prompt: ~1,500 tokens
- Tool results: ~2,000 tokens per search
- AI response: ~1,000 tokens
- **Total**: ~6,000-7,000 tokens per request
- **Cost**: ~$0.03-0.05 per recommendation generation

### Caching

- Frontend caches recommendations (5 min TTL)
- Database stores all historical recommendations
- No redundant API calls unless explicit refresh

---

## Testing Recommendations

### 1. Complete Organization Profile

```bash
# Ensure organization has:
- ✓ Mission statement
- ✓ Strategic plan
- ✓ State/location
- ✓ Other demographic data
```

### 2. Run Recommendations

```typescript
// Frontend
Click "Run Recommendations" button

// Or API call
POST /api/ai/recommendations
Authorization: Bearer <supabase_token>
```

### 3. Check Logs

```bash
# Look for:
🎯 [Recommendations] Starting recommendation generation...
📋 [Recommendations] District info: {...}
🤖 [Recommendations] Executing AI workflow...
🔧 [Recommendations] Tool search_grants called (2x)
✅ [Recommendations] AI workflow completed
💾 [Recommendations] Saving to database...
✅ [Recommendations] Saved 15/15 recommendations
```

### 4. Verify Database

```sql
SELECT * FROM app.recommendations
WHERE organization_id = '<org_id>'
ORDER BY fit_score DESC;
```

---

## Migration Guide

### For Existing Systems Using N8N

**Option 1: Gradual Migration** (Recommended)

1. Keep N8N endpoint at `/api/recommendations` (now deprecated)
2. New endpoint at `/api/ai/recommendations` is production-ready
3. Frontend already updated to use new endpoint
4. Test new endpoint thoroughly
5. Remove N8N webhook URL from environment variables
6. Delete old endpoint when confident

**Option 2: Immediate Switch**

1. Update frontend to use `/api/ai/recommendations`
2. Remove N8N webhook configuration
3. Delete old `/api/recommendations` endpoint
4. Update any external services calling the old endpoint

---

## Future Enhancements

### Potential Improvements

1. **Batch Processing**: Generate recommendations for multiple organizations
2. **Scheduling**: Cron job to refresh recommendations weekly
3. **Personalization**: User-specific preferences and filtering
4. **Comparison**: Side-by-side grant comparison features
5. **Export**: PDF/CSV export of recommendations with reasoning
6. **Analytics**: Track recommendation acceptance rates
7. **Refinement**: User feedback loop to improve scoring
8. **Categories**: Recommendations by focus area (STEM, Arts, etc.)

---

## Troubleshooting

### Issue: "Organization profile incomplete"

**Solution**: Ensure organization has mission statement, strategic plan, and state filled in.

### Issue: "Failed to parse AI recommendations"

**Cause**: AI didn't return valid JSON
**Solution**: Check prompt formatting, increase model temperature, or add retry logic

### Issue: "No grants found matching the criteria"

**Cause**: Vector search returned no results
**Solution**: Check if grants are vectorized, verify district profile has keywords

### Issue: Tool calls timing out

**Cause**: Vector search taking too long
**Solution**: Optimize database indexes, reduce search limit, or add timeout handling

---

## Related Files

### Backend

- `/webapp/src/app/api/ai/recommendations/route.ts` - Main endpoint
- `/webapp/src/lib/ai/tools/grant-search-tool.ts` - Search tool
- `/webapp/src/lib/ai/prompts/grants-assistant.ts` - Prompt utilities
- `/webapp/src/lib/ai/vector-store.ts` - Vector search

### Frontend

- `/webapp/src/app/private/[slug]/grants/page.tsx` - UI integration

### Database

- `/webapp/prisma/schema.prisma` - Recommendation model

### Documentation

- `/backend/docs/SMART_PIPELINE_ARCHITECTURE.md` - Grant scraping
- `/backend/docs/SCRAPING_AGENT_README.md` - AI extraction

---

## Support

For questions or issues with the LangChain recommendations system:

1. Check console logs for detailed error messages
2. Verify organization profile completeness
3. Test grant search tool independently
4. Review Prisma schema for data model changes
5. Check OpenAI API key and quota

---

**Implementation Date**: January 15, 2025  
**Status**: ✅ Production Ready  
**Replaces**: N8N webhook-based recommendations
