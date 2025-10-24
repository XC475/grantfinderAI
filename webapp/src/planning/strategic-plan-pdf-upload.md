# Strategic Plan PDF Upload Feature

## Overview

This feature allows organizations to upload PDF strategic plan documents and automatically extract funding-related content using AI. The extracted content is then populated into the strategic plan text field on the organization profile page.

## API Endpoint

### POST `/api/organizations/strategic-plan/upload`

**Purpose**: Process uploaded PDF files and extract funding-related content using OpenAI.

**Request**:

- Method: POST
- Content-Type: multipart/form-data
- Body: FormData with `pdf` field containing PDF file

**Validation**:

- File type must be `application/pdf`
- File size limit: 10MB
- User must be authenticated

**Response**:

```json
{
  "extractedText": "string",
  "originalLength": number,
  "extractedLength": number
}
```

**Error Responses**:

- `400`: Invalid file type, size, or no text found
- `401`: Unauthorized
- `500`: Processing error

## PDF Processing Workflow

1. **File Validation**
   - Check file type is PDF
   - Validate file size (max 10MB)
   - Authenticate user

2. **Text Extraction**
   - Use `pdf-parse` library to extract text from PDF
   - Handle corrupted or invalid PDFs gracefully

3. **AI Content Filtering**
   - Send extracted text to OpenAI GPT-4o-mini
   - Use specialized prompt to extract only funding-related content
   - Focus on goals, objectives, and initiatives relevant to grants

4. **Response**
   - Return filtered content
   - Include metadata about original and extracted text lengths

## OpenAI Prompt Engineering

**System Prompt**:

```
You are an expert at analyzing strategic plans and extracting funding-related content. Your task is to identify and extract only the content that would be relevant for grant applications and funding opportunities.
```

**User Prompt**:

```
Extract and summarize only the content related to funding, grants, financial planning, and resource allocation from the following strategic plan document. Focus on:

- Goals and objectives that require funding
- Budget needs and financial requirements
- Programs and initiatives that need financial support
- Strategic priorities that align with grant opportunities
- Mission and vision statements relevant to funding
- Organizational capacity and needs

Preserve important details but make it concise and well-structured. If no funding-related content is found, return "No funding-related content found in this document."

Document text: [PDF_TEXT]
```

**Model Configuration**:

- Model: `gpt-4o-mini`
- Temperature: 0.3 (for consistent, focused output)
- Max tokens: 2000

## Error Handling Strategies

### File Validation Errors

- Invalid file type: "File must be a PDF"
- File too large: "File size must be less than 10MB"
- No text found: "No text found in PDF"

### Processing Errors

- PDF parsing errors: "Invalid or corrupted PDF file"
- OpenAI API errors: "Failed to process document with AI"
- General errors: "Failed to process PDF"

### User Experience

- Loading states during processing
- Clear error messages
- File input reset after processing
- Success notifications

## File Size and Type Constraints

- **File Type**: Only PDF files (`application/pdf`)
- **File Size**: Maximum 10MB
- **Page Limit**: Recommended maximum 50 pages (enforced by file size)
- **Text Length**: No specific limit, but very large documents may hit OpenAI token limits

## Frontend Implementation

### UI Components

- Hidden file input for PDF selection
- Upload button with loading state
- File size and type constraints display
- Progress indicators during processing

### State Management

- `uploadingPdf`: Boolean for loading state
- `pdfInputRef`: Reference to file input
- Organization state update after successful extraction

### User Flow

1. User clicks "Upload Strategic Plan PDF" button
2. File picker opens (PDF files only)
3. File validation occurs
4. Loading state shows "Processing PDF..."
5. API call to extract content
6. Strategic plan textarea populated with extracted text
7. Success notification shown
8. File input reset

## Security Considerations

- User authentication required
- File type validation on both frontend and backend
- File size limits to prevent abuse
- No file storage - only text extraction
- OpenAI API key secured in environment variables

## Dependencies

- `pdf-parse`: PDF text extraction
- `@types/pdf-parse`: TypeScript definitions
- `openai`: AI content processing
- `@supabase/ssr`: User authentication

## Technical Notes

- PDF processing happens server-side for security
- No file storage - only temporary processing
- OpenAI API calls are rate-limited and cost-aware
- Error handling covers both PDF parsing and AI processing failures
- Extracted content is immediately available for editing
