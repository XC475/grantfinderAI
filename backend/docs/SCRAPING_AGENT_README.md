# Grant Scraping Agent Documentation

## Overview

The `OpportunityExtractionAgent` is a generalized AI-powered tool for extracting structured grant opportunity data from web pages. It uses OpenAI's structured output capabilities via OpenRouter to parse HTML content and extract relevant information according to a predefined schema.

## Key Features

### 🔄 **Flexible Input Methods**
- **HTML Content**: Direct processing of provided HTML strings
- **URL Fetching**: Automatic HTML fetching from URLs using requests/BeautifulSoup
- **Mixed Usage**: Can work with both HTML and URL simultaneously

### 🧠 **AI-Powered Extraction**
- Uses Claude 3.5 Sonnet via OpenRouter for intelligent content parsing
- Structured output with strict JSON schema validation
- Field-specific extraction rules for accurate data capture

### 📋 **Comprehensive Data Schema**
Extracts 20+ fields including:
- Basic info (title, description, agency)
- Financial details (award amounts, funding totals, cost sharing)
- Timeline (post date, close date, archive date, fiscal year)
- Contact information (name, email, phone)
- Categorization (14 education-specific categories)
- Attachments and additional resources

### 🎯 **Education-Focused Categories**
- Academic Enrichment
- Arts and Culture  
- Career and Technical Education
- Community Engagement and Partnerships
- Early Childhood Education
- English Language Learning
- Health and Wellness
- Infrastructure and Facilities
- STEM Education
- Special Education and Inclusion
- Student Support and Mental Health
- Teacher Professional Development
- Technology and Digital Learning
- Transportation and Accessibility

## Usage Examples

### Basic HTML Extraction
```python
from scraping_agent import OpportunityExtractionAgent

agent = OpportunityExtractionAgent()

html_content = """<html>..."""
result = agent.extract_opportunity(html=html_content)
```

### URL-Based Extraction
```python
agent = OpportunityExtractionAgent()

# Agent automatically fetches HTML from URL
result = agent.extract_opportunity(page_url="https://example.gov/grant")
```

### With Preloaded Data
```python
agent = OpportunityExtractionAgent()

preloaded = {
    "funding_type": "federal",
    "source": "grants.gov"
}

result = agent.extract_opportunity(
    page_url="https://example.gov/grant",
    preloaded=preloaded
)
```

### Convenience Function
```python
from scraping_agent import extract_opportunity_from_html

result = extract_opportunity_from_html(
    html="<html>...</html>",
    page_url="https://example.gov/grant"
)
```

## Configuration

### Environment Variables
```bash
OPENROUTER_API_KEY=your_openrouter_api_key_here
```

### Model Options
- Default: `anthropic/claude-3.5-sonnet:beta`
- Can be changed via the `model` parameter

### Schema Files
The agent requires two schema files in the `schemas/` directory:
- `OpportunityExtraction.schema.json` - JSON schema for output validation
- `OpportunityExtraction.fieldRules.json` - Field-specific extraction rules

## Error Handling

The agent provides detailed error handling for:
- **Missing Parameters**: Clear error when neither HTML nor URL provided
- **Network Issues**: Proper handling of HTTP request failures
- **Schema Validation**: JSON schema validation with detailed error messages
- **API Failures**: Graceful handling of OpenRouter API errors

## Integration with Existing Scripts

The agent is designed to integrate seamlessly with existing grant scraping scripts:

```python
# In existing scraping scripts
from scraping_agent import OpportunityExtractionAgent

agent = OpportunityExtractionAgent()

# Replace manual field extraction with:
extracted_data = agent.extract_opportunity(
    html=page_html,
    page_url=current_url,
    preloaded={
        "source": "mass_dese",
        "funding_type": "state"
    }
)

# Use extracted_data to populate database fields
opportunity.title = extracted_data.get("title")
opportunity.description = extracted_data.get("description")
# ... etc
```

## Performance Considerations

- **Caching**: Consider caching results for identical URLs/HTML
- **Rate Limiting**: Be mindful of OpenRouter API rate limits
- **Batch Processing**: For multiple pages, consider implementing delays
- **Timeout Settings**: Configurable timeout for HTTP requests (default: 30s)

## Future Enhancements

Potential improvements for the agent:
1. **Caching Layer**: Redis/file-based caching for repeated extractions
2. **Batch Processing**: Extract multiple opportunities from a single page
3. **Custom Schemas**: Support for different opportunity types beyond education
4. **Validation Rules**: Additional validation for extracted data
5. **Retry Logic**: Automatic retries for failed API calls
6. **Performance Metrics**: Tracking extraction accuracy and speed

## Files Created/Modified

### New Files
- `backend/scripts/scraping_agent.py` - Main agent implementation
- `backend/scripts/schemas/OpportunityExtraction.schema.json` - JSON schema
- `backend/scripts/schemas/OpportunityExtraction.fieldRules.json` - Field rules
- `backend/scripts/test_agent.py` - Comprehensive test script
- `backend/scripts/test_url_fetch.py` - URL fetching test

### Schema Structure
The JSON schema supports OpenAI's structured output requirements with:
- Strict type validation
- Required field enforcement
- Enum constraints for categories
- Proper date/integer formatting
- Nested object support for attachments

This agent significantly simplifies the process of extracting structured data from grant opportunity web pages and provides a reusable foundation for future scraping needs.