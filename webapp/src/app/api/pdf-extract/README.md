# PDF Text Extraction API

## Overview

This API endpoint extracts text from uploaded PDF files and returns the extracted text content.

## Endpoint

`POST /api/pdf-extract`

## Authentication

Requires a valid Supabase session (authenticated user).

## Request

- **Content-Type:** `multipart/form-data`
- **Body:**
  - `file`: PDF file (required)

## Validation

- Only PDF files are accepted (`application/pdf`)
- Maximum file size: 10MB
- Must contain extractable text

## Response

### Success (200 OK)

```json
{
  "success": true,
  "text": "Extracted text content from the PDF...",
  "pageCount": 5,
  "info": {
    "Title": "Document Title",
    "Author": "Author Name"
    // ... other PDF metadata
  }
}
```

### Errors

- **400 Bad Request**
  - No file provided
  - Invalid file type (not PDF)
  - File too large (>10MB)
  - No text could be extracted

- **401 Unauthorized**
  - User not authenticated

- **500 Internal Server Error**
  - PDF parsing failed
  - Server error during processing

## Usage Example

```typescript
const formData = new FormData();
formData.append("file", pdfFile);

const response = await fetch("/api/pdf-extract", {
  method: "POST",
  body: formData,
});

const data = await response.json();
console.log(data.text); // Extracted text
console.log(data.pageCount); // Number of pages
```

## Implementation Details

- Uses `pdf-parse` library for text extraction
- Performs basic text cleaning (normalizes line endings, removes excessive breaks)
- Returns PDF metadata for reference

## Related Files

- API Route: `/webapp/src/app/api/pdf-extract/route.ts`
- Used in: `/webapp/src/app/private/[slug]/settings/profile/page.tsx` (Organization Plan upload)
