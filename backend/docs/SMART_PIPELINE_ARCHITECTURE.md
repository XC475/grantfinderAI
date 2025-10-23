# Smart Scraping Pipeline Architecture

## 🎯 Overview

The smart scraping pipeline provides an intelligent, efficient way to process grant data with automatic duplicate detection, content change monitoring, and cost optimization.

## 🏗️ Architecture Components

### 1. Smart Pipeline Functions

- **`smart_scrape_pipeline()`** - Core function for processing individual grants
- **`batch_smart_scrape_pipeline()`** - Batch version for processing multiple grants
- **`opportunity_to_preloaded_dict()`** - Converts existing opportunities to AI preloaded data
- **`extract_with_preloaded()`** - Wrapper for AI extraction with preloaded data

### 2. Intelligent Processing Flow

```
HTML Content + URL + Template
           ↓
    Calculate Content Hash
           ↓
   Check if URL exists in DB
           ↓
    ┌─────────────────┐
    │ URL Not in DB   │ → Create New Opportunity
    └─────────────────┘
           ↓
    ┌─────────────────┐
    │ URL Exists      │ → Compare Content Hash
    └─────────────────┘
           ↓
    ┌─────────────────┐
    │ Hash Same       │ → Skip (return existing)
    │ Hash Different  │ → Update with new data
    └─────────────────┘
```

### 3. Preloaded Data System

**Template Fields** (predefined) + **Existing Opportunity Data** = **AI Preloaded Context**

This means:
- Known fields (source, funding_type, etc.) don't need AI extraction
- Existing opportunity data helps AI understand context
- Only new/changed content gets processed by AI

## 🚀 Usage Examples

### Basic Usage
```python
from helpers import smart_scrape_pipeline
from flask_server.db import db

result = smart_scrape_pipeline(
    html_content=page_html,
    page_url="https://doe.mass.edu/grants/grant123",
    opportunity_template={
        "source": "doe.mass.edu",
        "funding_type": "state",
        "state_code": "MA",
        "relevance_score": 100
    },
    db_session=db.session
)

print(f"Action: {result['action']} - {result['reason']}")
# Output: "Action: created - New opportunity created"
# or:     "Action: skipped - Content unchanged (hash: abc123...)"
# or:     "Action: updated - Content changed, updated with new hash: def456..."
```

### Batch Processing
```python
from helpers import batch_smart_scrape_pipeline

html_data_list = [
    {"html": html1, "url": url1},
    {"html": html2, "url": url2, "template": {"fiscal_year": 2025}},  # Per-item override
    {"html": html3, "url": url3}
]

result = batch_smart_scrape_pipeline(
    html_data_list=html_data_list,
    opportunity_template=common_template,
    db_session=db.session
)

print(f"Created: {result['stats']['created']}")
print(f"Updated: {result['stats']['updated']}")
print(f"Skipped: {result['stats']['skipped']}")
```

## 🔧 Key Features

### 1. Automatic Duplicate Detection
- Uses URL as primary key for existing opportunities
- Prevents duplicate entries in database

### 2. Content Change Detection
- Calculates SHA-256 hash of HTML content
- Only processes opportunities when content actually changes
- Massive cost savings by avoiding unnecessary AI calls

### 3. Smart Preloading
- Existing opportunity data automatically becomes AI context
- Template fields provide known information to AI
- Reduces tokens needed and improves extraction accuracy

### 4. Flexible Templates
- Common template applied to all opportunities
- Per-item template overrides for specific cases
- Template fields can override existing opportunity data

### 5. Comprehensive Statistics
- Detailed breakdown of actions taken (created/updated/skipped/errors)
- Individual results for each opportunity processed
- Error handling with specific failure reasons

## 💰 Cost Optimization

### Before (naive approach):
- Every grant = 1 AI API call
- 100 grants = 100 API calls = ~$50-100
- No duplicate detection
- Processing unchanged content repeatedly

### After (smart pipeline):
- First run: 100 grants = ~33 API calls (batch of 3) = ~$15-30
- Subsequent runs: Only changed content processed
- 99%+ cost reduction on re-runs
- Automatic duplicate prevention

## 🎛️ Configuration Options

### `smart_scrape_pipeline()` Parameters:
- **`force_update`**: Re-process even if content hash matches
- **`use_lightweight`**: Use faster, limited field extraction
- **`commit`**: Whether to commit database changes

### `batch_smart_scrape_pipeline()` Parameters:
- All above options plus batch-specific settings
- Processes all items before committing (atomic operation)

## 📊 Return Values

### Individual Processing:
```python
{
    "action": "created|updated|skipped",
    "opportunity": Opportunity_object,
    "reason": "Human readable explanation"
}
```

### Batch Processing:
```python
{
    "stats": {"created": 2, "updated": 1, "skipped": 5, "errors": 0},
    "results": [list_of_individual_results]
}
```

## 🔄 Migration from Existing Scripts

### Old Pattern:
```python
# Manual processing, individual API calls
for url in urls:
    html = fetch_html(url)
    result = agent.extract_opportunity(html, url)
    # Manual duplicate checking
    # Manual database operations
```

### New Pattern:
```python
# Smart pipeline handles everything
html_data = [{"html": fetch_html(url), "url": url} for url in urls]
result = batch_smart_scrape_pipeline(html_data, template, db.session)
```

## 🎯 Perfect For

- **Regular scraping jobs** (daily/weekly grant updates)
- **Large datasets** (hundreds of grants)
- **Cost-conscious processing** (minimize AI API costs)
- **Production systems** (reliability + error handling)
- **Incremental updates** (only process what changed)

The smart pipeline transforms scraping from a manual, expensive process into an intelligent, efficient system that automatically handles duplicates, detects changes, and minimizes costs while providing comprehensive feedback on what happened.