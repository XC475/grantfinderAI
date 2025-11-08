# Grant Vectorization API Documentation

## Overview

The Vectorization API provides endpoints for converting grant opportunity text into vector embeddings using OpenAI's `text-embedding-3-small` model. These embeddings enable semantic search capabilities for grant discovery.

All endpoints require API key authentication and are designed for internal/server-to-server communication only.

---

## Table of Contents

1. [Authentication](#authentication)
2. [Endpoints](#endpoints)
   - [POST /vectorize](#post-vectorize) - Incremental vectorization
   - [POST /vectorize/all](#post-vectorizeall) - Full refresh vectorization
   - [GET /vectorize/estimate](#get-vectorizeestimate) - Cost estimation
   - [GET /vectorize/status](#get-vectorizestatus) - Status check
3. [How It Works](#how-it-works)
4. [Change Detection](#change-detection)
5. [Error Handling](#error-handling)
6. [Best Practices](#best-practices)

---

## Authentication

All endpoints require the `x-api-key` header with a valid internal API key.

```bash
x-api-key: YOUR_INTERNAL_API_KEY
```

**Environment Variable:** `INTERNAL_API_KEY`

**Unauthorized Response (401):**

```json
{
  "error": "Unauthorized"
}
```

---

## Endpoints

### POST `/vectorize`

**Purpose:** Incrementally vectorize new and changed grant opportunities.

**Method:** `POST`

**Description:**

- Only processes grants that are **new** (no document exists) or **changed** (raw_text hash differs)
- Automatically detects changes by comparing content hashes
- Cost-efficient for regular updates
- Deletes outdated embeddings before creating new ones

**Request:**

```bash
curl -X POST http://localhost:3000/api/grants/vectorize \
  -H "x-api-key: YOUR_INTERNAL_API_KEY" \
  -H "Content-Type: application/json"
```

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Successfully vectorized 42 grants (30 new, 12 changed)",
  "stats": {
    "opportunities": 1000,
    "documents": 995,
    "vectorized": 42,
    "new": 30,
    "changed": 12,
    "errors": 0
  },
  "errors": []
}
```

**Response Fields:**

- `opportunities`: Total number of opportunities in database
- `documents`: Total number of vectorized documents (after processing)
- `vectorized`: Number of grants processed in this run
- `new`: Number of newly vectorized grants
- `changed`: Number of re-vectorized grants (content changed)
- `errors`: Number of failures

**When to Use:**

- ✅ Regular scheduled updates (daily/weekly)
- ✅ After scraping new grants
- ✅ When you want cost-efficient incremental updates
- ✅ Production environments

**Performance:**

- Batch size: 20 grants per batch
- Processing: Sequential (one at a time within each batch)
- Rate limiting: 1-second delay between batches
- Processing time: ~1-2 seconds per grant

---

### POST `/vectorize/all`

**Purpose:** Force re-vectorize ALL grants with `raw_text`, ignoring change detection.

**Method:** `POST`

**Description:**

- Deletes ALL existing documents before starting
- Vectorizes every grant that has `raw_text` (no hash comparison)
- Useful for model upgrades, data cleanup, or recovery
- ⚠️ **WARNING:** This is destructive and re-processes everything

**Request:**

```bash
curl -X POST http://localhost:3000/api/grants/vectorize/all \
  -H "x-api-key: YOUR_INTERNAL_API_KEY" \
  -H "Content-Type: application/json"
```

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Successfully vectorized 950 grants (full refresh)",
  "stats": {
    "total_opportunities": 1000,
    "opportunities_with_raw_text": 950,
    "skipped_no_raw_text": 50,
    "vectorized": 945,
    "errors": 5
  },
  "errors": [
    {
      "id": 123,
      "error": "No raw_text available"
    }
  ]
}
```

**Response Fields:**

- `total_opportunities`: Total opportunities in database (before filtering)
- `opportunities_with_raw_text`: Opportunities that have `raw_text` populated
- `skipped_no_raw_text`: Opportunities excluded due to missing `raw_text`
- `vectorized`: Successfully vectorized grants
- `errors`: Failed vectorizations

**When to Use:**

- ✅ Upgrading embedding model (e.g., small → large)
- ✅ Changing embedding dimensions
- ✅ Recovering from data corruption
- ✅ Data cleanup/migration scenarios
- ❌ **NOT for regular updates** (use `/vectorize` instead)

**Metadata Tracking:**

- Sets `vectorize_mode: "full_refresh"` in document metadata
- Timestamps with `vectorized_at`

---

### GET `/vectorize/estimate`

**Purpose:** Estimate token usage and costs for pending vectorization work.

**Method:** `GET`

**Description:**

- Analyzes grants that need vectorization (new + changed)
- Calculates character counts, token estimates, and costs
- **Dry-run mode** - doesn't actually vectorize anything
- Includes sample previews for inspection

**Request:**

```bash
curl -X GET http://localhost:3000/api/grants/vectorize/estimate \
  -H "x-api-key: YOUR_INTERNAL_API_KEY"
```

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Analysis complete for 42 grants (30 new, 12 changed)",
  "dryRun": true,
  "stats": {
    "opportunities": 1000,
    "documents": 958,
    "toVectorize": 42,
    "new": 30,
    "changed": 12,
    "textStatistics": {
      "avgCharacters": 3500,
      "avgTokens": 875,
      "minCharacters": 500,
      "maxCharacters": 15000,
      "totalCharacters": 147000,
      "totalTokens": 36750,
      "estimatedCostUSD": "0.0007",
      "embeddingDimensions": 1536,
      "processedCount": 42,
      "samples": [
        {
          "id": 1001,
          "title": "STEM Education Grant 2024",
          "characters": 3200,
          "tokens": 800,
          "preview": "This grant provides funding for..."
        }
      ]
    }
  }
}
```

**Response Fields:**

- `toVectorize`: Total grants needing vectorization
- `new`: New grants (not yet vectorized)
- `changed`: Changed grants (need re-vectorization)
- `avgCharacters`: Average character count per grant
- `avgTokens`: Average estimated tokens per grant
- `totalTokens`: Total tokens to be processed
- `estimatedCostUSD`: Estimated cost in USD (at $0.02 per 1M tokens)
- `processedCount`: Actually analyzed (excludes skipped grants)
- `samples`: First 10 grants with previews

**When to Use:**

- ✅ Before running large vectorization jobs
- ✅ Budget planning and cost estimation
- ✅ Checking how much work is pending
- ✅ Debugging/inspecting grant text quality

**Token Estimation Formula:**

```
estimated_tokens = character_count / 4
```

**Cost Calculation:**

```
cost_usd = (total_tokens / 1,000,000) × $0.02
```

---

### GET `/vectorize/status`

**Purpose:** Check current vectorization coverage status.

**Method:** `GET`

**Description:**

- Simple count comparison
- Shows how many opportunities have corresponding documents
- Doesn't check for content changes (use `/estimate` for that)

**Request:**

```bash
curl -X GET http://localhost:3000/api/grants/vectorize/status \
  -H "x-api-key: YOUR_INTERNAL_API_KEY"
```

**Response (200 OK):**

```json
{
  "success": true,
  "opportunities": 1000,
  "documents": 995,
  "missing": 5,
  "percentage": "99.50%",
  "complete": false
}
```

**Response Fields:**

- `opportunities`: Total opportunities in database
- `documents`: Total vectorized documents
- `missing`: Opportunities without documents
- `percentage`: Vectorization coverage percentage
- `complete`: `true` if missing === 0

**When to Use:**

- ✅ Quick status checks
- ✅ Monitoring dashboards
- ✅ Health checks
- ✅ Before deciding whether to run `/vectorize`

**Note:** This endpoint doesn't detect **changed** content, only missing documents.

---

## How It Works

### Data Flow

```
┌─────────────────┐
│  Opportunities  │
│  (PostgreSQL)   │
│  - id           │
│  - title        │
│  - raw_text     │
│  - ...          │
└────────┬────────┘
         │
         │ /vectorize or /vectorize/all
         ↓
┌─────────────────┐
│  Vectorization  │
│  Process        │
│  1. Fetch       │
│  2. Hash        │
│  3. Compare     │
│  4. Embed       │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│   Documents     │
│  (PostgreSQL)   │
│  - content      │ ← raw_text
│  - metadata     │ ← JSON (id, title, hash, etc.)
│  - embedding    │ ← 1536-dim vector
└─────────────────┘
```

### Vectorization Process

1. **Fetch Opportunities**
   - Queries all opportunities from database
   - Selects fields needed for metadata + `raw_text`

2. **Hash Calculation**
   - Computes SHA-256 hash of `raw_text`
   - Used for change detection

3. **Change Detection** (only in `/vectorize`)
   - Compares current hash with stored hash in documents metadata
   - Identifies new (no document) and changed (hash mismatch) grants

4. **Embedding Generation**
   - Sends `raw_text` to OpenAI API
   - Model: `text-embedding-3-small`
   - Dimensions: 1536
   - Processes in batches of 20

5. **Storage**
   - Stores `raw_text` in `documents.content`
   - Stores metadata as JSONB in `documents.metadata`
   - Stores embedding vector in `documents.embedding`

### Metadata Structure

Stored in `documents.metadata` as JSONB:

```json
{
  "opportunity_id": 123,
  "source": "grants.gov",
  "source_grant_id": "ED-GRANTS-2024-001",
  "status": "posted",
  "title": "STEM Education Grant 2024",
  "agency": "Department of Education",
  "funding_instrument": "Grant",
  "state_code": "US",
  "fiscal_year": 2024,
  "total_funding_amount": 5000000,
  "award_min": 50000,
  "award_max": 250000,
  "cost_sharing": false,
  "post_date": "2024-01-15T00:00:00.000Z",
  "close_date": "2024-03-15T00:00:00.000Z",
  "url": "https://grants.gov/view/123",
  "content_hash": "abc123def456...",
  "vectorized_at": "2024-01-20T10:30:00.000Z",
  "model": "text-embedding-3-small",
  "source_field": "raw_text",
  "vectorize_mode": "incremental" // or "full_refresh" for /all
}
```

---

## Change Detection

### How Change Detection Works

The system uses content hashing to detect when a grant's text has been updated:

```typescript
// Calculate hash from raw_text
const currentHash = crypto
  .createHash("sha256")
  .update(opportunity.raw_text)
  .digest("hex");

// Compare with stored hash
const existingHash = documentsMetadata.content_hash;

if (currentHash !== existingHash) {
  // Content changed - re-vectorize
}
```

### Why Hash `raw_text`?

- ✅ **Accurate:** Hashes exactly what we're embedding
- ✅ **Consistent:** No drift between hash source and vector source
- ✅ **Efficient:** Detects actual content changes, not metadata changes
- ❌ **Not DB's `content_hash`:** That's based on HTML, not processed text

### Change Detection Behavior

| Scenario                         | Detection   | Action                   |
| -------------------------------- | ----------- | ------------------------ |
| New grant (no document exists)   | ✅ Detected | Vectorize                |
| Content changed (hash differs)   | ✅ Detected | Delete old, re-vectorize |
| Content unchanged (hash matches) | ✅ Detected | Skip                     |
| No `raw_text` available          | ⚠️ Warning  | Skip with log            |

### Cost Savings

**Example Scenario:**

- 1000 grants in database
- Run `/vectorize` daily
- Only 10 grants changed per day

**Cost:**

- First run: $0.50 (1000 grants)
- Daily runs: $0.005 (10 grants)
- **99% cost reduction** after initial vectorization

---

## Error Handling

### Common Errors

#### 1. **Missing `raw_text`**

**Symptom:**

```json
{
  "id": 123,
  "error": "No raw_text available for vectorization"
}
```

**Cause:** Opportunity doesn't have `raw_text` populated

**Solution:**

- Update scraping scripts to populate `raw_text`
- Or filter opportunities before vectorizing

---

#### 2. **Unexpected Embedding Size**

**Symptom:**

```
Unexpected embedding size: 3072 (expected 1536)
```

**Cause:** Model mismatch (e.g., using `text-embedding-3-large` instead of `small`)

**Solution:**

- Check `EMBEDDING_MODEL` constant in code
- Ensure model matches expected dimensions

---

#### 3. **OpenAI API Errors**

**Symptom:**

```json
{
  "error": "Internal server error",
  "message": "Rate limit exceeded"
}
```

**Cause:** OpenAI rate limiting or API issues

**Solution:**

- Increase delay between batches
- Reduce `BATCH_SIZE`
- Check OpenAI API status
- Verify `OPENAI_API_KEY` is valid

---

#### 4. **Database Connection Issues**

**Symptom:**

```
Failed to connect to PostgreSQL
```

**Cause:** Database connection issues

**Solution:**

- Check `DATABASE_URL` environment variable
- Ensure database is running
- Verify pgvector extension is installed

---

### Error Response Format

All endpoints return errors in this format:

```json
{
  "error": "Internal server error",
  "message": "Detailed error message here"
}
```

**Status Codes:**

- `401` - Unauthorized (invalid API key)
- `500` - Internal server error

---

## Best Practices

### 1. **Regular Scheduled Updates**

Use `/vectorize` for daily/weekly updates:

```bash
# Cron job example (daily at 2 AM)
0 2 * * * curl -X POST https://your-domain.com/api/grants/vectorize \
  -H "x-api-key: $INTERNAL_API_KEY"
```

---

### 2. **Check Before Vectorizing**

```bash
# 1. Check status
curl -X GET https://your-domain.com/api/grants/vectorize/status \
  -H "x-api-key: $INTERNAL_API_KEY"

# 2. Estimate cost if needed
curl -X GET https://your-domain.com/api/grants/vectorize/estimate \
  -H "x-api-key: $INTERNAL_API_KEY"

# 3. Run vectorization
curl -X POST https://your-domain.com/api/grants/vectorize \
  -H "x-api-key: $INTERNAL_API_KEY"
```

---

### 3. **Monitor for Errors**

Check the `errors` array in responses:

```javascript
const response = await fetch("/api/grants/vectorize", {
  method: "POST",
  headers: { "x-api-key": API_KEY },
});

const data = await response.json();

if (data.errors && data.errors.length > 0) {
  console.error(`Vectorization had ${data.errors.length} errors:`, data.errors);

  // Log specific grants that failed
  data.errors.forEach((err) => {
    console.error(`Grant ${err.id}: ${err.error}`);
  });
}
```

---

### 4. **Handle Missing `raw_text`**

Before vectorizing, ensure `raw_text` is populated:

```sql
-- Check coverage
SELECT
  COUNT(*) as total,
  COUNT(raw_text) as with_text,
  ROUND(100.0 * COUNT(raw_text) / COUNT(*), 2) as percentage
FROM public.opportunities;
```

If coverage is low (<90%), update your scraping scripts.

---

### 5. **Use `/all` Sparingly**

The `/vectorize/all` endpoint is expensive and destructive:

**When to use:**

- ✅ Model upgrades (changing embedding dimensions)
- ✅ One-time data migrations
- ✅ Recovery from corruption

**When NOT to use:**

- ❌ Regular updates (use `/vectorize` instead)
- ❌ Testing (use `/estimate` first)
- ❌ Production without backups

---

### 6. **Batch Processing Tips**

Current settings:

- Batch size: 20 grants per batch
- Processing mode: Sequential (one grant at a time)
- Delay: 1 second between batches

**Why Sequential Processing?**

- ✅ Prevents API timeouts
- ✅ More reliable for large datasets
- ✅ Better error handling
- ✅ Easier to monitor progress

**To increase throughput:**

```typescript
// Increase batch size
const BATCH_SIZE = 50;

// Reduce delay between batches (if within rate limits)
await new Promise((resolve) => setTimeout(resolve, 500));

// Note: Each grant is still processed sequentially within the batch
```

**OpenAI Rate Limits:**

- Tier 1: 3,000 requests/min (50 requests/sec)
- Tier 2: 3,500 requests/min (58 requests/sec)
- Current rate: ~60 requests/min (safe for all tiers)
- Check your tier: https://platform.openai.com/account/limits

---

### 7. **Monitoring Metrics**

Track these metrics for production:

- **Vectorization rate:** grants/second
- **Success rate:** (vectorized / attempted) × 100
- **Error rate:** (errors / attempted) × 100
- **Cost per run:** (tokens × $0.02) / 1M
- **Coverage:** (documents / opportunities) × 100

---

## Environment Variables

Required environment variables:

```bash
# OpenAI API Key
OPENAI_API_KEY=sk-...

# Internal API Key for authentication
INTERNAL_API_KEY=your-secret-key

# Database connection
DATABASE_URL=postgresql://user:pass@host:5432/dbname
DIRECT_URL=postgresql://user:pass@host:5432/dbname
```

---

## Technical Details

### Dependencies

- **OpenAI SDK:** For embedding generation
- **Prisma:** For database access
- **Next.js:** API route handlers
- **PostgreSQL + pgvector:** For vector storage

### Model Specifications

- **Model:** `text-embedding-3-small`
- **Dimensions:** 1536
- **Cost:** $0.02 per 1M tokens
- **Max input tokens:** 8191

### Database Schema

**documents table:**

```sql
CREATE TABLE public.documents (
  id BIGSERIAL PRIMARY KEY,
  content TEXT,
  metadata JSONB,
  embedding vector(1536)
);
```

**Indexes:**

```sql
-- For vector similarity search
CREATE INDEX ON documents USING ivfflat (embedding vector_cosine_ops);

-- For metadata filtering
CREATE INDEX ON documents USING gin (metadata);
```

---

## Changelog

### Version 1.2 (Current)

- ✅ Changed batch processing from parallel to sequential
- ✅ Prevents OpenAI API timeout errors
- ✅ More reliable error handling

### Version 1.1

- ✅ Fixed early exit bug in `/vectorize`
- ✅ Added change detection to `/estimate`
- ✅ Fixed average calculation in `/estimate`
- ✅ Improved stats reporting in `/all`
- ✅ Use `raw_text` for all vectorization

### Version 1.0

- Initial implementation with field concatenation
- Basic change detection
- Batch processing

---

## Support

For issues or questions:

1. Check the [error handling section](#error-handling)
2. Review [best practices](#best-practices)
3. Check OpenAI API status: https://status.openai.com/

---

_Last Updated: 2025-10-28_  
_API Version: 1.2_  
_Model: text-embedding-3-small (1536 dimensions)_
