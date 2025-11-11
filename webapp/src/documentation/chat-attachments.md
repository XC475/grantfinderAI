# AI Chat File Attachments

## Overview

The AI chat assistant supports file attachments, allowing users to upload documents and images that the AI can read, analyze, and discuss. This enables powerful use cases like document summarization, data analysis, and content comparison.

---

## Table of Contents

1. [User Guide](#user-guide)
2. [Technical Architecture](#technical-architecture)
3. [Supported File Types](#supported-file-types)
4. [API Reference](#api-reference)
5. [Security & Permissions](#security--permissions)
6. [Setup & Configuration](#setup--configuration)
7. [Troubleshooting](#troubleshooting)
8. [Future Enhancements](#future-enhancements)

---

## User Guide

### How to Attach Files

Users have three methods to attach files to their chat messages:

#### 1. Click to Attach

1. Click the **paperclip icon** (📎) in the chat input bar
2. Select one or multiple files from the file picker
3. See file previews appear below the input
4. Type your message (optional)
5. Press Enter or click Send

#### 2. Drag & Drop

1. Drag files from your file manager
2. Drop them onto the chat input area
3. Files automatically attach with previews
4. Type your message and send

#### 3. Paste

1. Copy a file in your file manager (Cmd+C / Ctrl+C)
2. Paste into the chat input (Cmd+V / Ctrl+V)
3. File automatically attaches
4. For large text (>500 characters), pasting creates a text file attachment

### File Previews

Before sending, users see previews of their attachments:

- **Images**: Thumbnail preview of the image
- **Documents**: File icon with filename
- **Remove**: X button on each preview to remove before sending

### AI Processing

Once sent:

1. Files upload to secure storage
2. Text is extracted from documents
3. Content is sent to AI with the message
4. AI can read, analyze, and discuss the files
5. Users can reference files in follow-up questions

### Example Use Cases

#### Document Analysis

```
User: *attaches research_paper.pdf*
Message: "Summarize the key findings"
AI: [Reads PDF and provides summary]
```

#### Data Review

```
User: *attaches sales_data.csv*
Message: "What are the trends in this data?"
AI: [Analyzes CSV content and identifies patterns]
```

#### Comparison

```
User: *attaches budget_2023.pdf, budget_2024.pdf*
Message: "What changed between these budgets?"
AI: [Compares both documents and highlights differences]
```

---

## Technical Architecture

### System Flow

```
User Action (Click/Drag/Paste)
    ↓
File Selection/Drop
    ↓
[Frontend] Chat.tsx handles file state
    ↓
User clicks Send
    ↓
[Frontend] Upload files to /api/chat/upload
    ↓
[Backend] File validation & processing
    ↓
[Backend] Upload to Supabase Storage
    ↓
[Backend] Extract text content
    ↓
[Backend] Return file metadata + extracted text
    ↓
[Frontend] Create message with attachments
    ↓
[Frontend] Send to AI agent
    ↓
[Backend] AI receives message with file content
    ↓
[AI] Process and respond
```

### Component Architecture

#### Frontend Components

**1. ChatForm (`src/components/ui/chat.tsx`)**

- Manages file state (files array)
- Handles form submission
- Waits for async upload before clearing files

**2. MessageInput (`src/components/ui/message-input.tsx`)**

- Paperclip button for file selection
- Drag & drop overlay
- Paste event handling
- File preview management
- Send button state (disabled when no text/files)

**3. Chat (`src/components/chat/Chat.tsx`)**

- Orchestrates file upload flow
- Calls upload API endpoint
- Handles upload errors
- Creates messages with attachment metadata
- Sends messages to AI agent

**4. ChatMessage (`src/components/ui/chat-message.tsx`)**

- Displays file attachments in messages
- Handles both data URLs and storage URLs
- Shows file previews

**5. FilePreview (`src/components/ui/file-preview.tsx`)**

- Image thumbnails
- Document icons
- Remove button functionality
- Supports both local and uploaded files

#### Backend Components

**1. Upload API (`src/app/api/chat/upload/route.ts`)**

Handles the file upload and processing pipeline:

```typescript
POST /api/chat/upload

Flow:
1. Authenticate user
2. Parse multipart form data
3. Validate each file:
   - Check file type against allowed list
   - Check file size (max 40MB)
4. Save to temporary location
5. Extract text from file
6. Upload to Supabase Storage (userId/fileId.ext)
7. Clean up temporary file
8. Return metadata with extracted text
```

**Text Extraction Methods:**

- **PDF**: Uses `unpdf` library (converts Buffer → Uint8Array)
- **Word (.docx)**: Uses LangChain `DocxLoader`
- **Text (.txt)**: Direct `fs.readFile`
- **CSV**: Uses LangChain `CSVLoader`

**Text Cleaning:**

- NULL bytes (`\u0000`) are automatically stripped from extracted text
- This prevents PostgreSQL errors with unsupported Unicode sequences

**2. AI Agent (`src/app/api/ai/assistant-agent/route.ts`)**

Processes messages with attachments:

```typescript
POST /api/ai/assistant-agent

Flow:
1. Receive message with attachments
2. Store attachments in message metadata
3. Append extracted text to message content:

   "[Attached: filename.pdf]
   File contents:
   [extracted text here]"

4. Send enhanced message to AI
5. AI processes with full file context
```

### Data Storage

#### Supabase Storage Structure

```
chat-attachments/
├── {userId}/
│   ├── {fileId1}.pdf
│   ├── {fileId2}.docx
│   └── {fileId3}.txt
```

#### Database Schema

Messages with attachments are stored with metadata:

```typescript
// AiChatMessage.metadata field
{
  "timestamp": 1234567890,
  "source": "webapp",
  "attachments": [
    {
      "id": "uuid-v4",
      "name": "document.pdf",
      "type": "application/pdf",
      "size": 123456,
      "url": "https://supabase-storage.url/...",
      "extractedText": "Full text content..."
    }
  ]
}
```

---

## Supported File Types

### Fully Supported (Text Extraction)

| File Type | Extensions | Extraction Method    | Status     |
| --------- | ---------- | -------------------- | ---------- |
| PDF       | `.pdf`     | unpdf library        | ✅ Working |
| Word      | `.docx`    | LangChain DocxLoader | ✅ Working |
| Text      | `.txt`     | fs.readFile          | ✅ Working |
| CSV       | `.csv`     | LangChain CSVLoader  | ✅ Working |

### Coming Soon

| File Type | Extensions              | Status         | Message                                           |
| --------- | ----------------------- | -------------- | ------------------------------------------------- |
| Excel     | `.xlsx`, `.xls`         | 🚧 In Progress | "Excel file support is currently being developed" |
| Images    | `.png`, `.jpg`, `.jpeg` | 🚧 In Progress | "Image file support is currently being developed" |

**Note**: When users try to upload Excel or Image files, they receive a friendly message:

> "Excel/Image file support is currently being developed. For now, please use PDF, Word (.docx), Text (.txt), or CSV files."

### File Constraints

- **Maximum File Size**: 40MB per file
- **Multiple Files**: Supported (no limit on count)
- **Supported Types**: PDF, Word (.docx), Text (.txt), CSV
- **Coming Soon**: Excel (.xlsx, .xls), Images (.png, .jpg, .jpeg)
- **File Name Length**: No specific limit
- **Concurrent Uploads**: One message at a time

---

## API Reference

### Upload Endpoint

**POST** `/api/chat/upload`

Upload files and extract text content.

**Authentication**: Required (Supabase session)

**Request Format**: `multipart/form-data`

**Request Body**:

```typescript
FormData {
  files: File[] // One or more files
}
```

**Response**: `200 OK`

```typescript
{
  files: [
    {
      id: string;           // UUID v4
      name: string;         // Original filename
      type: string;         // MIME type
      size: number;         // Bytes
      url: string;          // Supabase Storage public URL
      extractedText?: string; // Extracted content (if applicable)
    }
  ]
}
```

**Error Responses**:

```typescript
// 401 Unauthorized
{
  error: "Unauthorized";
}

// 400 Bad Request - No files
{
  error: "No files provided";
}

// 400 Bad Request - File type coming soon
{
  error: "Excel file support is currently being developed. For now, please use PDF, Word (.docx), Text (.txt), or CSV files.";
}

// 400 Bad Request - Unsupported type
{
  error: "File type {type} is not supported. Supported types: PDF, Word (.docx), Text (.txt), CSV.";
}

// 400 Bad Request - Too large
{
  error: "File {name} exceeds maximum size of 40MB";
}

// 500 Internal Server Error
{
  error: "Failed to upload {name}";
}
```

**Example Usage**:

```typescript
const formData = new FormData();
files.forEach((file) => formData.append("files", file));

const response = await fetch("/api/chat/upload", {
  method: "POST",
  body: formData,
});

const { files } = await response.json();
```

### AI Agent Endpoint

**POST** `/api/ai/assistant-agent`

Send message to AI agent (potentially with attachments).

**Request Body**:

```typescript
{
  messages: Array<{
    role: "user" | "assistant";
    content: string;
    attachments?: Array<{
      id: string;
      name: string;
      type: string;
      size: number;
      url: string;
      extractedText?: string;
    }>;
  }>;
  chatId: string;
  organizationId?: string;
}
```

**Response**: Streaming text response

**Headers**:

```
Content-Type: text/plain; charset=utf-8
X-Chat-Id: {chatId}
Transfer-Encoding: chunked
```

---

## Security & Permissions

### Authentication

- All upload operations require authenticated Supabase session
- Unauthenticated requests return 401 Unauthorized
- User identity verified via `supabase.auth.getUser()`

### File Validation

**Supported File Types**:

```typescript
const ALLOWED_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
  "text/plain",
  "text/csv",
];
```

**Coming Soon File Types**:

```typescript
const COMING_SOON_TYPES = [
  "application/vnd.ms-excel", // .xls
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
  "image/png",
  "image/jpeg",
  "image/jpg",
];
```

When users try to upload these file types, they receive a user-friendly message indicating the feature is being developed.

**File Size Limit**:

```typescript
const MAX_FILE_SIZE = 40 * 1024 * 1024; // 40MB
```

### Storage Security

**Folder Structure**:

- Files stored in user-specific folders: `{userId}/{fileId}.{ext}`
- Users cannot access other users' files
- File IDs are UUIDs to prevent enumeration

**Supabase Row Level Security (RLS) Policies**:

Required policies on `storage.objects` table:

1. **Upload Policy**

   ```sql
   CREATE POLICY "Allow authenticated users to upload"
   ON storage.objects FOR INSERT
   TO authenticated
   WITH CHECK (
     bucket_id = 'chat-attachments'
     AND (storage.foldername(name))[1] = auth.uid()::text
   );
   ```

2. **Read Policy**

   ```sql
   CREATE POLICY "Allow authenticated users to read own files"
   ON storage.objects FOR SELECT
   TO authenticated
   USING (
     bucket_id = 'chat-attachments'
     AND (storage.foldername(name))[1] = auth.uid()::text
   );
   ```

3. **Delete Policy**
   ```sql
   CREATE POLICY "Allow authenticated users to delete own files"
   ON storage.objects FOR DELETE
   TO authenticated
   USING (
     bucket_id = 'chat-attachments'
     AND (storage.foldername(name))[1] = auth.uid()::text
   );
   ```

### Data Privacy

- Files are not encrypted at rest (relies on Supabase encryption)
- Extracted text stored in database metadata (visible to org members)
- No automatic file deletion (manual cleanup required)
- Files persist indefinitely unless manually deleted

---

## Setup & Configuration

### Prerequisites

1. **Supabase Project** with Storage enabled
2. **Node.js packages** (required):
   - `unpdf` - PDF text extraction
   - `@langchain/community` - Document loaders
   - `@supabase/supabase-js` - Storage client
   - `d3-dsv@2` - CSV parsing (required by CSVLoader)
   - `mammoth` - Word document parsing (required by DocxLoader)

### Initial Setup

#### 1. Create Storage Bucket

Via Supabase Dashboard:

1. Navigate to Storage
2. Create new bucket: `chat-attachments`
3. Make bucket **public**
4. Click "Save"

Via SQL:

```sql
INSERT INTO storage.buckets (id, name, public)
VALUES ('chat-attachments', 'chat-attachments', true);
```

#### 2. Configure RLS Policies

Run these SQL commands in Supabase SQL Editor:

```sql
-- Upload policy
CREATE POLICY "Allow authenticated users to upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'chat-attachments'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Read policy
CREATE POLICY "Allow authenticated users to read own files"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'chat-attachments'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Delete policy
CREATE POLICY "Allow authenticated users to delete own files"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'chat-attachments'
  AND (storage.foldername(name))[1] = auth.uid()::text
);
```

#### 3. Install Dependencies

Install the required Node.js packages:

```bash
npm install unpdf @langchain/community d3-dsv@2 mammoth
```

These packages are essential for:

- `unpdf`: PDF text extraction
- `@langchain/community`: Document loaders (DocxLoader, CSVLoader)
- `d3-dsv@2`: CSV parsing (required by CSVLoader)
- `mammoth`: Word document parsing (required by DocxLoader)

#### 4. Verify Setup

Test the setup:

1. Start development server: `npm run dev`
2. Log in as a test user
3. Navigate to AI chat
4. Click paperclip button
5. Upload a test PDF
6. Ask AI to analyze it
7. Verify AI can read the content

Check Supabase Storage dashboard to confirm file was uploaded to correct folder.

### Configuration Options

#### Change File Size Limit

Edit `webapp/src/app/api/chat/upload/route.ts`:

```typescript
// Current: 40MB
const MAX_FILE_SIZE = 40 * 1024 * 1024;

// Change to 100MB:
const MAX_FILE_SIZE = 100 * 1024 * 1024;
```

#### Add New Supported File Types

To add a new file type (e.g., ZIP files):

1. Add to `ALLOWED_TYPES` in `webapp/src/app/api/chat/upload/route.ts`:

```typescript
const ALLOWED_TYPES = [
  // ... existing types ...
  "application/zip", // Add ZIP support
];
```

2. Add extraction logic in `extractTextFromFile()` function:

```typescript
case "application/zip": {
  // Add your extraction logic here
  return extractedContent;
}
```

3. Update the file picker in `message-input.tsx`:

```typescript
input.accept = ".pdf,.docx,.txt,.csv,.zip,...";
```

#### Change Storage Bucket Name

If using a different bucket name:

1. Update bucket name in upload route:

   ```typescript
   const { data: uploadData, error: uploadError } = await supabase.storage
     .from("your-bucket-name") // Change here
     .upload(storagePath, buffer, {
       contentType: file.type,
       upsert: false,
     });
   ```

2. Update RLS policies to use new bucket name

---

## Troubleshooting

### Common Issues

#### 1. "Failed to upload files"

**Symptoms**: Upload fails, error message shown in chat

**Possible Causes**:

- Storage bucket doesn't exist
- RLS policies not configured
- Network issue

**Solutions**:

1. Verify bucket exists in Supabase dashboard
2. Check RLS policies are active
3. Check browser console for detailed error
4. Verify Supabase credentials in `.env`

#### 2. "Unauthorized"

**Symptoms**: 401 error in console

**Cause**: User not authenticated

**Solution**: Ensure user is logged in via Supabase auth

#### 3. AI Says "Unable to view attachments"

**Symptoms**: File uploads but AI can't read content

**Possible Causes**:

- Text extraction failed
- Unsupported file type
- Corrupted file

**Solutions**:

1. Check server logs for extraction errors
2. Verify file type is supported
3. Try a different file
4. Check file isn't password-protected

#### 4. File Preview Not Showing

**Symptoms**: Attachment uploaded but no preview in chat

**Possible Causes**:

- CORS issue with Supabase Storage
- Bucket not public
- Invalid URL

**Solutions**:

1. Make bucket public
2. Check CORS settings in Supabase
3. Verify file URL in browser

#### 5. PDF Extraction Fails

**Symptoms**: Error in logs about unpdf

**Cause**: PDF might be scanned image or encrypted

**Solution**: Use OCR-enabled PDF or unencrypted file

#### 6. Database Error: "unsupported Unicode escape sequence"

**Symptoms**: 500 error with PostgreSQL error about `\u0000`

**Cause**: File contains NULL bytes that PostgreSQL can't store in text fields

**Solution**:

- **Fixed in v1.0.0**: NULL bytes are now automatically stripped
- If you still see this, the file may have other encoding issues
- Try converting the file to UTF-8 encoding

#### 7. Word Documents Fail: "Cannot find module 'mammoth'"

**Symptoms**: Error when uploading `.docx` files: `Cannot find module 'mammoth'`

**Cause**: Missing `mammoth` dependency required by DocxLoader

**Solution**:

```bash
npm install mammoth
```

#### 8. CSV Files Fail: "Cannot find module 'd3-dsv'"

**Symptoms**: Error when uploading `.csv` files: `Cannot find module 'd3-dsv'`

**Cause**: Missing `d3-dsv` dependency required by CSVLoader

**Solution**:

```bash
npm install d3-dsv@2
```

### Debug Mode

Enable verbose logging:

**Frontend** (`webapp/src/components/chat/Chat.tsx`):

- Check browser console for upload logs
- Look for: `📤 [Chat] Uploading files...`
- Look for: `✅ [Chat] Files uploaded successfully`

**Backend** (`webapp/src/app/api/chat/upload/route.ts`):

- Server logs show extraction progress
- Look for: `Error extracting text from file:`

### Testing Checklist

- [ ] Storage bucket created and public
- [ ] RLS policies configured
- [ ] User can log in
- [ ] Paperclip button visible
- [ ] Can select files
- [ ] File preview shows
- [ ] Can remove files before sending
- [ ] Upload completes successfully
- [ ] File appears in Supabase Storage
- [ ] AI receives file content
- [ ] AI can discuss file contents

---

## Future Enhancements

### Planned Features

#### 1. Excel File Support

- **Priority**: High
- **Description**: Proper Excel parsing with cell structure preservation
- **Use Case**: Complex spreadsheet analysis, multi-sheet workbooks
- **Effort**: Medium
- **Status**: Currently shows "coming soon" message to users

#### 2. Image OCR

- **Priority**: High
- **Description**: Extract text from images using Tesseract.js
- **Use Case**: Scan receipts, forms, screenshots
- **Effort**: Medium
- **Status**: Currently shows "coming soon" message to users

#### 3. Upload Progress Indicator

- **Priority**: High
- **Description**: Show progress bar for large files
- **Use Case**: User feedback during slow uploads
- **Effort**: Low

#### 4. File Management UI

- **Priority**: Medium
- **Description**: View and delete uploaded files
- **Use Case**: Manage storage, delete old files
- **Effort**: High

#### 5. Automatic File Cleanup

- **Priority**: Medium
- **Description**: Delete files after N days
- **Use Case**: Prevent storage bloat
- **Effort**: Medium

#### 6. PDF Page Previews

- **Priority**: Low
- **Description**: Show thumbnail of PDF first page
- **Use Case**: Visual confirmation of correct file
- **Effort**: High

#### 7. File Compression

- **Priority**: Low
- **Description**: Compress large files before upload
- **Use Case**: Reduce storage costs, faster uploads
- **Effort**: Medium

#### 8. Voice Memo Attachments

- **Priority**: Low
- **Description**: Record and attach voice memos
- **Use Case**: Quick thoughts, meeting notes
- **Effort**: High

### Contributing

To contribute enhancements:

1. Review the architecture section
2. Follow existing code patterns
3. Add appropriate error handling
4. Update this documentation
5. Add tests for new features

---

## Additional Resources

- [Supabase Storage Documentation](https://supabase.com/docs/guides/storage)
- [unpdf Library](https://github.com/unjs/unpdf)
- [LangChain Document Loaders](https://js.langchain.com/docs/modules/data_connection/document_loaders/)

---

**Last Updated**: January 2025  
**Version**: 1.0.0  
**Maintainer**: Development Team
