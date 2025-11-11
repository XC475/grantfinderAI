<!-- 2a6423d5-1672-443c-ba44-ad56f6ad7289 cae3750f-3c11-4c9c-900d-dcbfb6cd55c2 -->
# AI Assistant File Attachments Implementation

## Overview

Enable users to attach documents and images in the AI chat assistant. The AI will be able to read and process file contents (text extraction from PDFs, Word docs, images with OCR). Following ChatGPT's model with Supabase Storage for file hosting.

## Key Implementation Steps

### 1. Database Schema Updates

**File**: `webapp/prisma/schema.prisma`

Update `AiChatMessage` model to support attachments in metadata:

- The `metadata` JSON field will store attachment information:
  ```json
  {
    "attachments": [
      {
        "id": "unique-id",
        "name": "document.pdf",
        "type": "application/pdf",
        "size": 123456,
        "url": "supabase-storage-url",
        "extractedText": "..."
      }
    ]
  }
  ```


### 2. File Upload API Endpoint

**New File**: `webapp/src/app/api/chat/upload/route.ts`

Create endpoint to handle file uploads:

- Accept multipart/form-data with files
- Validate file type (pdf, docx, txt, csv, xlsx, png, jpg, jpeg) and size (40MB limit)
- Upload to Supabase Storage bucket `chat-attachments`
- Extract text content using LangChain Document Loaders:
  - Use appropriate loader based on file type:
    - PDFs: `PDFLoader` from `@langchain/community/document_loaders/fs/pdf`
    - Word docs: `DocxLoader` from `@langchain/community/document_loaders/fs/docx`
    - Text files: `TextLoader` from `langchain/document_loaders/fs/text`
    - CSV: `CSVLoader` from `@langchain/community/document_loaders/fs/csv`
    - Images: `UnstructuredImageLoader` (with OCR support)
  - Call `loader.load()` to get Document objects with `page_content` and `metadata`
  - Combine page_content from all Document chunks
- Return file metadata including extracted text

**Example implementation:**

```typescript
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { DocxLoader } from "@langchain/community/document_loaders/fs/docx";
import { TextLoader } from "langchain/document_loaders/fs/text";
import { CSVLoader } from "@langchain/community/document_loaders/fs/csv";

async function extractTextFromFile(filePath: string, mimeType: string): Promise<string> {
  let loader;
  
  switch (mimeType) {
    case "application/pdf":
      loader = new PDFLoader(filePath);
      break;
    case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
      loader = new DocxLoader(filePath);
      break;
    case "text/plain":
      loader = new TextLoader(filePath);
      break;
    case "text/csv":
      loader = new CSVLoader(filePath);
      break;
    default:
      throw new Error(`Unsupported file type: ${mimeType}`);
  }
  
  // Load documents
  const documents = await loader.load();
  
  // Combine all page_content from Document objects
  return documents.map(doc => doc.page_content).join("\n\n");
}
```

### 3. Update Chat Component

**File**: `webapp/src/components/chat/Chat.tsx`

Modify `handleSubmit` to support file attachments:

- Check if `options?.experimental_attachments` exists
- Upload files to `/api/chat/upload` endpoint first
- Include file metadata (with extracted text) in the message payload
- Pass to backend API with message content

### 4. Update Backend Chat Processing

**File**: `webapp/src/app/api/ai/assistant-agent/route.ts`

Enhance message processing:

- Check for attachments in incoming messages
- When saving user message, include attachment metadata in the `metadata` field
- Append extracted file text to user message content for AI processing:
  ```
  User message: "Analyze this document"
  [Attached: document.pdf]
  File contents: <extracted text here>
  ```

- This allows the AI to access file contents in its context

### 5. Display Attachments in UI

**File**: `webapp/src/components/ui/chat-message.tsx`

Update message display:

- Check message for `experimental_attachments` prop
- Render file previews/icons above message content
- Show file name, size, and type
- Add download link using Supabase Storage URL
- Style similar to existing file displays in the app

### 6. Install Required Dependencies

```bash
npm install @langchain/community langchain
npm install pdf-parse  # Required by PDFLoader
```

Additional optional dependencies for enhanced functionality:

- For DOCX support: LangChain's DocxLoader uses built-in Node.js capabilities
- For image OCR: May require `unstructured` API or local installation
- For Excel: LangChain CSV loader can handle basic spreadsheet data

### 7. Configure Supabase Storage

- Create `chat-attachments` storage bucket in Supabase
- Set appropriate RLS policies for authenticated users
- Configure file size limits and allowed MIME types

## Technical Decisions

**Storage**: Supabase Storage (already integrated, follows ChatGPT's temporary storage model)

**File Types**: Documents (.pdf, .docx, .txt, .csv, .xlsx) and images (.png, .jpg, .jpeg)

**AI Processing**: Yes - extract text from files and include in AI context

**File Association**: Store in message `metadata` JSON field (tied to specific messages)

**File Size Limit**: 20MB per file (can increase later)

**Text Extraction**: Server-side extraction using LangChain Document Loaders

- Provides unified interface across all file types
- Returns standardized Document objects with page_content and metadata
- Easier to maintain and extend than multiple individual libraries
- Already compatible with existing LangChain AI infrastructure in the project

## Files to Modify

1. `webapp/prisma/schema.prisma` - Already has metadata field
2. `webapp/src/app/api/chat/upload/route.ts` - New file
3. `webapp/src/components/chat/Chat.tsx` - Update handleSubmit
4. `webapp/src/app/api/ai/assistant-agent/route.ts` - Process attachments
5. `webapp/src/components/ui/chat-message.tsx` - Display attachments
6. `webapp/package.json` - Add dependencies

## Notes

- The shadcn chat UI already has file upload button (`allowAttachments` prop is set)
- File previews are already partially supported via `experimental_attachments`
- Main work is backend upload, text extraction, and AI integration
- **LangChain Document Loaders**: Using LangChain provides:
  - Unified interface for all document types via `BaseLoader`
  - Standardized `Document` objects with `page_content` and `metadata`
  - Built-in support for chunking large documents with `load_and_split()`
  - Consistent error handling across different file types
  - Easy to extend with custom loaders if needed

### To-dos

- [ ] Install LangChain packages (@langchain/community, langchain, pdf-parse)
- [ ] Create chat-attachments storage bucket in Supabase with proper RLS policies
- [ ] Create /api/chat/upload endpoint using LangChain Document Loaders for text extraction
- [ ] Implement loader selection logic based on file MIME type
- [ ] Modify Chat.tsx handleSubmit to upload files before sending message
- [ ] Update assistant-agent API to process attachments and include extracted text in AI context
- [ ] Update chat-message.tsx to display file attachments with previews and download links
- [ ] Test uploading various file types (PDF, Word, CSV, text, images) and verify AI can process them