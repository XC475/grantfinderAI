# Knowledge Base Feature Documentation

## Table of Contents
1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Data Model](#data-model)
4. [API Endpoints](#api-endpoints)
5. [File Processing](#file-processing)
6. [AI Integration](#ai-integration)
7. [Frontend Implementation](#frontend-implementation)
8. [Constraints and Limitations](#constraints-and-limitations)
9. [User Workflows](#user-workflows)
10. [Testing](#testing)
11. [Future Enhancements](#future-enhancements)

---

## Overview

### Purpose
The Knowledge Base feature allows organizations to upload documents (PDF, DOCX, CSV) that provide contextual information to AI assistants throughout the application. This enables the AI to have organization-specific knowledge when helping users with grant writing, chat interactions, and other tasks.

### Key Features
- Upload up to 10 documents per organization
- Support for PDF, Word (.docx), and CSV files
- Maximum file size of 10MB per document
- Toggle documents on/off to control AI context
- Replace existing documents with updated versions
- Delete documents when no longer needed
- Automatic text extraction from uploaded files
- Real-time updates (no save button required)
- Integration with AI chat assistant and writing assistant

---

## Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (React)                         │
│  - Upload UI with drag-and-drop                             │
│  - Document list with toggle/replace/delete actions        │
│  - Real-time feedback via toast notifications               │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  │ API Calls
                  ▼
┌─────────────────────────────────────────────────────────────┐
│                  API Routes (Next.js)                        │
│  - /api/organizations/[id]/knowledge-base                   │
│  - /api/organizations/[id]/knowledge-base/[docId]          │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  │ File Processing
                  ▼
┌─────────────────────────────────────────────────────────────┐
│               File Extraction Utility                        │
│  - PDF: unpdf library                                       │
│  - DOCX: DocxLoader from @langchain/community              │
│  - CSV: CSVLoader from @langchain/community                │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  │ Store Extracted Text
                  ▼
┌─────────────────────────────────────────────────────────────┐
│                Database (PostgreSQL)                         │
│  - KnowledgeBaseDocument table                             │
│  - Stores metadata + extracted text                         │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  │ Retrieve Active Docs
                  ▼
┌─────────────────────────────────────────────────────────────┐
│                  AI Context Provider                         │
│  - getActiveKnowledgeBase utility                          │
│  - Injects context into AI prompts                         │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  │ Enhanced Context
                  ▼
┌─────────────────────────────────────────────────────────────┐
│                    AI Assistants                            │
│  - Chat Assistant                                           │
│  - Writing Assistant                                        │
└─────────────────────────────────────────────────────────────┘
```

### Technology Stack
- **Frontend**: React, Next.js 15 (App Router), shadcn/ui
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL (via Supabase)
- **File Processing**: 
  - `unpdf` for PDF extraction
  - `@langchain/community` for DOCX and CSV extraction
- **AI Integration**: OpenAI GPT models

---

## Data Model

### Prisma Schema

```prisma
model KnowledgeBaseDocument {
  id             String       @id @default(cuid())
  fileName       String
  fileType       String       // MIME type: 'application/pdf', etc.
  fileSize       Int          // in bytes
  fileUrl        String?      // Supabase storage URL (optional, currently unused)
  extractedText  String       @db.Text // Full extracted text for AI context
  isActive       Boolean      @default(true) // Toggle for AI context inclusion
  organizationId String
  organization   Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  createdAt      DateTime     @default(now())
  updatedAt      DateTime     @updatedAt
  
  @@index([organizationId])
  @@map("knowledge_base_documents")
  @@schema("app")
}
```

### Field Descriptions

| Field | Type | Description |
|-------|------|-------------|
| `id` | String (cuid) | Unique identifier for the document |
| `fileName` | String | Original filename of the uploaded file |
| `fileType` | String | MIME type (e.g., "application/pdf") |
| `fileSize` | Int | File size in bytes |
| `fileUrl` | String? | Reserved for future Supabase storage integration |
| `extractedText` | Text | Full text extracted from the document |
| `isActive` | Boolean | Controls whether document is included in AI context |
| `organizationId` | String | Foreign key to Organization |
| `createdAt` | DateTime | Timestamp of initial upload |
| `updatedAt` | DateTime | Timestamp of last modification |

### Database Table Creation

The table is created in the `app` schema with the following SQL:

```sql
CREATE TABLE "app"."knowledge_base_documents" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "fileName" TEXT NOT NULL,
  "fileType" TEXT NOT NULL,
  "fileSize" INTEGER NOT NULL,
  "fileUrl" TEXT,
  "extractedText" TEXT NOT NULL,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "organizationId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "knowledge_base_documents_organizationId_fkey" 
    FOREIGN KEY ("organizationId") 
    REFERENCES "app"."organizations"("id") 
    ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "knowledge_base_documents_organizationId_idx" 
  ON "app"."knowledge_base_documents"("organizationId");
```

---

## API Endpoints

### 1. GET `/api/organizations/[id]/knowledge-base`

**Purpose**: Retrieve all knowledge base documents for an organization

**Authentication**: Required (Supabase Auth)

**Authorization**: User must belong to the organization

**Request**:
```
GET /api/organizations/org_123/knowledge-base
```

**Response** (200 OK):
```json
[
  {
    "id": "clx123abc",
    "fileName": "company-overview.pdf",
    "fileType": "application/pdf",
    "fileSize": 1024768,
    "fileUrl": null,
    "isActive": true,
    "organizationId": "org_123",
    "createdAt": "2025-11-23T10:00:00.000Z",
    "updatedAt": "2025-11-23T10:00:00.000Z"
  }
]
```

**Notes**:
- Documents are ordered by `createdAt` DESC (newest first)
- `extractedText` is NOT included in the response to reduce payload size
- Returns empty array `[]` if no documents exist

---

### 2. POST `/api/organizations/[id]/knowledge-base`

**Purpose**: Upload a new knowledge base document

**Authentication**: Required

**Authorization**: User must belong to the organization

**Request**:
```
POST /api/organizations/org_123/knowledge-base
Content-Type: multipart/form-data

file: [Binary file data]
```

**Validation Rules**:
- File type must be: PDF, DOCX, or CSV
- File size must be ≤ 10MB
- Organization must have < 10 documents

**Process Flow**:
1. Authenticate user
2. Verify user belongs to organization
3. Check document count limit
4. Validate file type and size
5. Save file to temporary location (`os.tmpdir()`)
6. Extract text using `extractTextFromFile()`
7. Clean extracted text (remove NULL bytes, normalize whitespace)
8. Create database record with extracted text
9. Delete temporary file
10. Return document metadata

**Response** (200 OK):
```json
{
  "id": "clx456def",
  "fileName": "budget-template.csv",
  "fileType": "text/csv",
  "fileSize": 51200,
  "fileUrl": null,
  "extractedText": "[Extracted text content...]",
  "isActive": true,
  "organizationId": "org_123",
  "createdAt": "2025-11-23T12:30:00.000Z",
  "updatedAt": "2025-11-23T12:30:00.000Z"
}
```

**Error Responses**:

| Status | Error | Description |
|--------|-------|-------------|
| 400 | "No file provided" | File missing from form data |
| 400 | "Unsupported file type..." | File type not PDF/DOCX/CSV |
| 400 | "File size exceeds 10MB limit" | File too large |
| 400 | "Maximum 10 documents allowed..." | Limit reached |
| 401 | "Unauthorized" | User not authenticated |
| 403 | "Forbidden" | User not in organization |
| 500 | "Failed to upload document" | Server error |

---

### 3. PATCH `/api/organizations/[id]/knowledge-base/[docId]`

**Purpose**: Update an existing document (toggle, rename, or replace file)

**Authentication**: Required

**Authorization**: User must belong to the organization

**Request Examples**:

**A. Toggle isActive status:**
```
PATCH /api/organizations/org_123/knowledge-base/clx123abc
Content-Type: multipart/form-data

isActive: "false"
```

**B. Rename document:**
```
PATCH /api/organizations/org_123/knowledge-base/clx123abc
Content-Type: multipart/form-data

fileName: "updated-name.pdf"
```

**C. Replace file:**
```
PATCH /api/organizations/org_123/knowledge-base/clx123abc
Content-Type: multipart/form-data

file: [Binary file data]
```

**Process Flow** (for file replacement):
1. Authenticate and authorize user
2. Validate new file type and size
3. Save file to temporary location
4. Extract text from new file
5. Clean extracted text
6. Update database record with new:
   - `extractedText`
   - `fileSize`
   - `fileType`
   - `fileName`
   - `updatedAt`
7. Delete temporary file
8. Return updated document

**Response** (200 OK):
```json
{
  "id": "clx123abc",
  "fileName": "company-overview-v2.pdf",
  "fileType": "application/pdf",
  "fileSize": 2048576,
  "extractedText": "[New extracted text...]",
  "isActive": true,
  "organizationId": "org_123",
  "createdAt": "2025-11-23T10:00:00.000Z",
  "updatedAt": "2025-11-23T15:45:00.000Z"
}
```

---

### 4. DELETE `/api/organizations/[id]/knowledge-base/[docId]`

**Purpose**: Delete a knowledge base document

**Authentication**: Required

**Authorization**: User must belong to the organization

**Request**:
```
DELETE /api/organizations/org_123/knowledge-base/clx123abc
```

**Process Flow**:
1. Authenticate and authorize user
2. Delete database record (cascades automatically)
3. Return success

**Response** (200 OK):
```json
{
  "success": true
}
```

**Error Responses**:
- 401: Unauthorized
- 403: Forbidden (not in organization)
- 404: Document not found
- 500: Server error

---

## File Processing

### Supported File Types

| File Type | MIME Type | Extraction Library | Notes |
|-----------|-----------|-------------------|-------|
| PDF | `application/pdf` | `unpdf` | Extracts text from all pages |
| DOCX | `application/vnd.openxmlformats-officedocument.wordprocessingml.document` | `@langchain/community` DocxLoader | Preserves paragraph structure |
| CSV | `text/csv` | `@langchain/community` CSVLoader | Converts rows to text format |

### Text Extraction Process

**File**: `webapp/src/lib/fileExtraction.ts`

#### 1. extractTextFromFile()

```typescript
export async function extractTextFromFile(
  filePath: string,
  mimeType: string
): Promise<string>
```

**PDF Extraction**:
```typescript
const fileBuffer = await readFile(filePath);
const uint8Array = new Uint8Array(fileBuffer);
const { text } = await extractText(uint8Array);
const extractedText = Array.isArray(text) ? text.join("\n\n") : text;
```

**DOCX Extraction**:
```typescript
const loader = new DocxLoader(filePath);
const documents = await loader.load();
return documents.map((doc: Document) => doc.pageContent).join("\n\n");
```

**CSV Extraction**:
```typescript
const loader = new CSVLoader(filePath);
const documents = await loader.load();
return documents.map((doc: Document) => doc.pageContent).join("\n\n");
```

#### 2. cleanExtractedText()

```typescript
export function cleanExtractedText(text: string): string {
  return text
    .replace(/\0/g, "") // Remove NULL bytes (PostgreSQL incompatible)
    .replace(/\r\n/g, "\n") // Normalize line endings
    .replace(/\r/g, "\n")
    .trim();
}
```

### Temporary File Handling

Files are saved to `os.tmpdir()` during processing:

```typescript
const tempFilePath = join(tmpdir(), `${randomUUID()}-${sanitizedFileName}`);
await writeFile(tempFilePath, buffer);

// ... process file ...

// Cleanup
await unlink(tempFilePath);
```

**Security Considerations**:
- Temporary files are deleted immediately after processing
- Filenames are sanitized to prevent path traversal
- Random UUIDs prevent filename collisions
- Original files are NOT stored (only extracted text)

---

## AI Integration

### Overview

Active knowledge base documents are automatically injected into AI assistant contexts to provide organization-specific information.

### getActiveKnowledgeBase Utility

**File**: `webapp/src/lib/getOrgKnowledgeBase.ts`

```typescript
export async function getActiveKnowledgeBase(organizationId: string): Promise<string> {
  const docs = await prisma.knowledgeBaseDocument.findMany({
    where: {
      organizationId,
      isActive: true,
    },
    select: {
      fileName: true,
      extractedText: true,
    },
  });

  if (docs.length === 0) {
    return "";
  }

  // Format as context string
  return docs
    .map(doc => `[Knowledge Base Document: ${doc.fileName}]\n${doc.extractedText}`)
    .join('\n\n---\n\n');
}
```

**Output Format**:
```
[Knowledge Base Document: company-overview.pdf]
[Extracted text from PDF...]

---

[Knowledge Base Document: budget-template.csv]
[Extracted text from CSV...]

---

[Knowledge Base Document: policies.docx]
[Extracted text from DOCX...]
```

### Integration Points

#### 1. AI Chat Assistant

**File**: `webapp/src/app/api/ai/assistant-agent/route.ts`

```typescript
// Get knowledge base context for organization
const knowledgeBaseContext = await getActiveKnowledgeBase(userOrgId);

const systemPrompt = `You are a helpful AI assistant for a grant writing application called GrantWare.
...
${knowledgeBaseContext ? `\n\nADDITIONAL KNOWLEDGE BASE CONTEXT:\n${knowledgeBaseContext}` : ""}
`;
```

**Impact**:
- AI has access to uploaded documents when answering user questions
- Context is prepended to system prompt
- Only includes documents where `isActive = true`

#### 2. Writing Assistant

**File**: `webapp/src/app/api/chat/editor/route.ts`

```typescript
// Get knowledge base context for organization
const knowledgeBaseContext = await getActiveKnowledgeBase(organization.id);

let organizationContext = "";
if (organization) {
  organizationContext = `
  // ... existing organization context
  ${knowledgeBaseContext ? `\n\nKNOWLEDGE BASE DOCUMENTS:\n${knowledgeBaseContext}` : ""}`;
}
```

**Impact**:
- Writing assistant uses knowledge base for content generation
- Helps maintain consistency with organizational information
- Improves relevance of AI-generated grant content

### Performance Considerations

- Knowledge base context is fetched on every AI request
- Text is stored in database (no file I/O overhead)
- PostgreSQL text columns handle large documents efficiently
- Consider caching for high-traffic scenarios

---

## Frontend Implementation

### Component Location

**File**: `webapp/src/app/private/[slug]/settings/profile/page.tsx`

**Tab**: "Knowledge Base" (3rd tab in Organization Profile)

### State Management

```typescript
// Knowledge Base state
const [knowledgeBaseDocs, setKnowledgeBaseDocs] = useState<KnowledgeBaseDocument[]>([]);
const [loadingDocs, setLoadingDocs] = useState(false);
const [uploadingDoc, setUploadingDoc] = useState(false);
const [replacingDoc, setReplacingDoc] = useState<KnowledgeBaseDocument | null>(null);
const docInputRef = useRef<HTMLInputElement>(null);

// Track active tab to conditionally show Save Changes button
const [activeTab, setActiveTab] = useState("basic-info");
```

### Key Functions

#### fetchKnowledgeBaseDocs()

```typescript
const fetchKnowledgeBaseDocs = async () => {
  if (!organization) return;
  setLoadingDocs(true);
  try {
    const response = await fetch(`/api/organizations/${organization.id}/knowledge-base`);
    if (!response.ok) throw new Error("Failed to fetch knowledge base documents");
    const data = await response.json();
    setKnowledgeBaseDocs(data);
  } catch (error) {
    console.error("Error fetching knowledge base documents:", error);
    toast.error("Failed to fetch knowledge base documents");
  } finally {
    setLoadingDocs(false);
  }
};
```

#### handleDocumentFileChange()

```typescript
const handleDocumentFileChange = async (
  event: React.ChangeEvent<HTMLInputElement>
) => {
  const file = event.target.files?.[0];
  if (!file || !organization) return;

  // Validation
  const allowedTypes = [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/csv",
  ];

  if (!allowedTypes.includes(file.type)) {
    toast.error("Please upload a PDF, Word (.docx), or CSV file");
    return;
  }

  if (file.size > 10 * 1024 * 1024) {
    toast.error("File size must be less than 10MB");
    return;
  }

  if (knowledgeBaseDocs.length >= 10) {
    toast.error("Maximum 10 documents allowed. Delete a document to upload a new one.");
    return;
  }

  // Upload
  setUploadingDoc(true);
  try {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(
      `/api/organizations/${organization.id}/knowledge-base`,
      { method: "POST", body: formData }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to upload document");
    }

    toast.success("Document uploaded successfully");
    fetchKnowledgeBaseDocs();
  } catch (error) {
    console.error("Error uploading document:", error);
    toast.error(error instanceof Error ? error.message : "Failed to upload document");
  } finally {
    setUploadingDoc(false);
    if (docInputRef.current) {
      docInputRef.current.value = "";
    }
  }
};
```

#### handleToggleDocument()

```typescript
const handleToggleDocument = async (doc: KnowledgeBaseDocument) => {
  if (!organization) return;
  setLoadingDocs(true);
  try {
    const formData = new FormData();
    formData.append("isActive", String(!doc.isActive));
    
    const response = await fetch(
      `/api/organizations/${organization.id}/knowledge-base/${doc.id}`,
      { method: "PATCH", body: formData }
    );
    
    if (!response.ok) throw new Error("Failed to toggle document status");
    
    toast.success(`Document ${doc.isActive ? "disabled" : "enabled"} in AI context`);
    fetchKnowledgeBaseDocs();
  } catch (error) {
    console.error("Error toggling document:", error);
    toast.error("Failed to toggle document status");
  } finally {
    setLoadingDocs(false);
  }
};
```

#### handleDeleteDocument()

```typescript
const handleDeleteDocument = async (doc: KnowledgeBaseDocument) => {
  if (!organization) return;
  
  const confirmed = window.confirm(
    `Are you sure you want to delete "${doc.fileName}"? This will remove it from AI context.`
  );
  
  if (!confirmed) return;

  setLoadingDocs(true);
  try {
    const response = await fetch(
      `/api/organizations/${organization.id}/knowledge-base/${doc.id}`,
      { method: "DELETE" }
    );
    
    if (!response.ok) throw new Error("Failed to delete document");
    
    toast.success("Document deleted successfully");
    fetchKnowledgeBaseDocs();
  } catch (error) {
    console.error("Error deleting document:", error);
    toast.error("Failed to delete document");
  } finally {
    setLoadingDocs(false);
  }
};
```

### UI Components

#### Header Section

```tsx
<div className="flex items-center justify-between">
  <div>
    <h3 className="text-lg font-semibold">Knowledge Base</h3>
    <p className="text-sm text-muted-foreground">
      Upload files to provide AI context throughout the application ({knowledgeBaseDocs.length}/10)
    </p>
  </div>
  <Button 
    onClick={() => docInputRef.current?.click()} 
    disabled={knowledgeBaseDocs.length >= 10 || uploadingDoc}
  >
    {uploadingDoc ? (
      <>
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Uploading...
      </>
    ) : (
      <>
        <Upload className="mr-2 h-4 w-4" />
        Upload File
      </>
    )}
  </Button>
</div>
```

#### Empty State

```tsx
<div className="text-center py-12 border-2 border-dashed rounded-lg">
  <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
  <p className="text-muted-foreground mb-4">
    No files uploaded yet. Upload your first file to enhance AI context.
  </p>
  <p className="text-xs text-muted-foreground mb-4">
    Supported formats: PDF, Word (.docx), CSV • Max size: 10MB • Max files: 10
  </p>
  <Button variant="outline" onClick={() => docInputRef.current?.click()}>
    <Upload className="mr-2 h-4 w-4" />
    Upload File
  </Button>
</div>
```

#### Document Card

```tsx
<div className="border rounded-lg p-4 space-y-3 hover:shadow-md transition-shadow">
  <div className="flex items-start justify-between">
    <div className="flex items-start gap-3 flex-1">
      {/* File icon */}
      <div className="flex-shrink-0">
        <FileIcon className="h-10 w-10 text-primary" />
      </div>
      
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-base truncate">{doc.fileName}</h4>
        <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
          <span>{doc.fileType.split('/').pop()?.toUpperCase()}</span>
          <span>•</span>
          <span>{formatFileSize(doc.fileSize)}</span>
          <span>•</span>
          <span>{format(new Date(doc.createdAt), "MMM d, yyyy")}</span>
        </div>
        
        {/* Active status badge */}
        <div className="mt-2">
          {doc.isActive ? (
            <Badge className="text-xs bg-green-100 text-green-700 hover:bg-green-100 border-green-200">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Active in AI Context
            </Badge>
          ) : (
            <Badge variant="secondary" className="text-xs">
              <XCircle className="h-3 w-3 mr-1" />
              Inactive
            </Badge>
          )}
        </div>
      </div>
    </div>
    
    <div className="flex items-center gap-3 ml-4">
      {/* Toggle switch with green styling */}
      <Switch
        checked={doc.isActive}
        onCheckedChange={() => handleToggleDocument(doc)}
        className="data-[state=checked]:bg-green-600"
      />
      
      <div className="h-8 w-px bg-border" />
      
      {/* Replace button */}
      <Button variant="ghost" size="icon" className="h-8 w-8">
        <Upload className="h-4 w-4" />
      </Button>
      
      {/* Delete button */}
      <Button 
        variant="ghost" 
        size="icon"
        className="h-8 w-8 text-muted-foreground hover:text-destructive"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  </div>
</div>
```

### UI/UX Features

1. **Real-time Updates**: No save button required; all actions update immediately
2. **Loading States**: Spinners shown during upload/processing
3. **Toast Notifications**: Success/error feedback for all operations
4. **File Validation**: Client-side checks before upload
5. **Confirmation Dialogs**: Delete operations require confirmation
6. **Responsive Design**: Works on desktop and mobile
7. **Accessibility**: Tooltips, ARIA labels, keyboard navigation
8. **Visual Feedback**: 
   - Green badge/toggle for active documents
   - Gray badge/toggle for inactive documents
   - Hover effects on cards and buttons
   - Loading spinners during operations

---

## Constraints and Limitations

### Hard Limits

| Constraint | Value | Rationale |
|------------|-------|-----------|
| Max Documents | 10 per organization | Balance context quality vs. token limits |
| Max File Size | 10MB | API timeout prevention, reasonable doc sizes |
| File Types | PDF, DOCX, CSV | Most common document formats |
| Text Storage | Database only | Simplicity, no file storage costs |

### Technical Limitations

1. **No File Storage**: Original files are not stored (only extracted text)
   - Cannot download original files
   - Cannot preview documents
   - Cannot recover original formatting

2. **Text Extraction Quality**:
   - Scanned PDFs without OCR: No text extracted
   - Complex formatting: May lose structure
   - Tables in PDFs: May not preserve layout
   - Images: Not extracted or described

3. **AI Context Window**:
   - Large documents consume token budget
   - May impact AI response quality if total context exceeds limits
   - No automatic summarization (full text used)

4. **Performance**:
   - Large documents (8-10MB) may take 10-30 seconds to process
   - Concurrent uploads blocked (sequential processing)
   - No progress bar during extraction

5. **Database**:
   - PostgreSQL text columns used (no specific limit, but practical limit ~1GB)
   - NULL bytes automatically cleaned (PostgreSQL incompatibility)

### Known Issues

1. **CSV Formatting**: LangChain CSVLoader may not preserve table structure well
2. **DOCX Images**: Embedded images are ignored
3. **PDF Forms**: Interactive form fields not extracted
4. **Concurrent Edits**: No conflict resolution if multiple users edit simultaneously

---

## User Workflows

### Workflow 1: Upload First Document

1. User navigates to Settings → Org Profile → Knowledge Base tab
2. Sees empty state with upload instructions
3. Clicks "Upload File" button
4. Selects PDF/DOCX/CSV file from computer
5. Frontend validates file type and size
6. If valid, shows "Uploading..." spinner
7. Backend extracts text (10-30 seconds for large files)
8. Success toast appears: "Document uploaded successfully"
9. Document appears in list with green "Active in AI Context" badge
10. Document count updates: "(1/10)"

### Workflow 2: Toggle Document Off

1. User sees document with green badge "Active in AI Context"
2. Clicks toggle switch to OFF position
3. Toggle animates to OFF, badge changes to gray "Inactive"
4. Toast appears: "Document disabled in AI context"
5. AI assistants no longer use this document's content

### Workflow 3: Replace Document

1. User clicks upload icon (↑) next to a document
2. File picker opens
3. User selects new file (can be different type/name)
4. Frontend validates new file
5. Backend processes new file, extracts text
6. Document metadata updates (size, type, name, date)
7. Toast appears: "Document replaced successfully"
8. AI now uses new document's content

### Workflow 4: Delete Document

1. User clicks trash icon next to a document
2. Confirmation dialog appears: "Are you sure you want to delete '[filename]'?"
3. User clicks OK
4. Document disappears from list
5. Toast appears: "Document deleted successfully"
6. Document count decreases: "(9/10)" → "(8/10)"

### Workflow 5: Hit Document Limit

1. User has 10 documents uploaded
2. "Upload File" button is disabled
3. Document count shows "(10/10)"
4. User tries to upload anyway (via replace)
5. Error toast: "Maximum 10 documents allowed. Delete a document to upload a new one."

### Workflow 6: AI Uses Knowledge Base

1. User uploads company policy document
2. User opens AI Chat Assistant
3. User asks: "What is our travel reimbursement policy?"
4. AI assistant:
   - Retrieves active knowledge base documents
   - Finds policy document in context
   - Provides accurate answer based on uploaded document
5. Response includes specific details from company policy

---

## Testing

### Unit Tests (Recommended)

```typescript
// Test file extraction
describe('extractTextFromFile', () => {
  it('should extract text from PDF', async () => {
    const text = await extractTextFromFile('test.pdf', 'application/pdf');
    expect(text).toBeTruthy();
    expect(text.length).toBeGreaterThan(0);
  });

  it('should extract text from DOCX', async () => {
    const text = await extractTextFromFile('test.docx', 'application/vnd...');
    expect(text).toBeTruthy();
  });

  it('should handle NULL bytes in text', () => {
    const dirtyText = "Hello\0World\0";
    const cleaned = cleanExtractedText(dirtyText);
    expect(cleaned).toBe("Hello\nWorld");
  });
});

// Test API routes
describe('Knowledge Base API', () => {
  it('should upload document', async () => {
    const formData = new FormData();
    formData.append('file', testFile);
    
    const response = await fetch('/api/organizations/test/knowledge-base', {
      method: 'POST',
      body: formData
    });
    
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.fileName).toBe('test.pdf');
  });

  it('should reject file over 10MB', async () => {
    // Test with 11MB file
  });

  it('should reject unsupported file type', async () => {
    // Test with .exe file
  });

  it('should enforce 10 document limit', async () => {
    // Upload 11th document
  });
});
```

### Integration Tests

**Manual Testing Checklist**:

1. ✅ Upload PDF (< 10MB)
2. ✅ Upload DOCX (< 10MB)
3. ✅ Upload CSV (< 10MB)
4. ✅ Reject file > 10MB
5. ✅ Reject unsupported file type (.txt, .jpg, .xlsx)
6. ✅ Enforce 10 document limit
7. ✅ Toggle document on/off
8. ✅ Replace document with new file
9. ✅ Delete document
10. ✅ Verify AI chat uses active documents
11. ✅ Verify AI chat ignores inactive documents
12. ✅ Verify writing assistant uses knowledge base
13. ✅ Test with empty state
14. ✅ Test with max documents (10/10)
15. ✅ Test concurrent actions (upload while toggling)

### Performance Testing

**Test Cases**:

1. **Large File Upload** (10MB PDF):
   - Expected: 20-30 seconds processing time
   - Monitor: Memory usage, CPU usage

2. **Multiple Documents**:
   - Upload 10 documents
   - Verify page load time remains < 2 seconds
   - Verify AI response time remains acceptable

3. **Long Text Extraction**:
   - 200-page PDF
   - Verify extraction completes
   - Verify database handles large text field

### Security Testing

**Test Cases**:

1. **Authentication**: Attempt API calls without auth token
2. **Authorization**: Attempt to access other organization's documents
3. **File Validation**: Upload malicious files (.exe, .sh, .bat)
4. **Path Traversal**: Upload file with "../../../etc/passwd" in name
5. **SQL Injection**: Filename with SQL injection attempt
6. **XSS**: Filename with `<script>` tags

---

## Future Enhancements

### Planned Features

1. **File Storage Integration**:
   - Store original files in Supabase Storage
   - Allow users to download original files
   - Preview documents in-browser

2. **OCR Support**:
   - Extract text from scanned PDFs
   - Process image-based documents

3. **Additional File Types**:
   - Excel/Sheets (.xlsx, .xls)
   - PowerPoint (.pptx)
   - Plain text (.txt)
   - Markdown (.md)

4. **Advanced Features**:
   - Document versioning (keep history)
   - Document tags/categories
   - Search within documents
   - Bulk upload (multiple files at once)
   - Drag-and-drop upload

5. **AI Enhancements**:
   - Automatic document summarization
   - Semantic search within knowledge base
   - Citation tracking (which documents AI used)
   - Relevance scoring

6. **Analytics**:
   - Track document usage by AI
   - Popular documents dashboard
   - Impact metrics

7. **Collaboration**:
   - Share documents with specific team members
   - Document permissions
   - Audit log of changes

### Technical Debt

1. **Caching**: Implement Redis cache for active knowledge base
2. **Streaming**: Stream large files instead of loading into memory
3. **Progress Bars**: Show upload/extraction progress
4. **Queue System**: Background job processing for large files
5. **Webhooks**: Notify users when processing completes
6. **Rate Limiting**: Prevent abuse of upload endpoint

---

## Troubleshooting

### Common Issues

#### 1. "Failed to fetch knowledge base documents"

**Cause**: API authentication or network issue

**Solution**:
- Check user is logged in
- Verify organization ID is correct
- Check browser console for detailed error
- Verify backend server is running

#### 2. "No text could be extracted from the file"

**Cause**: PDF is scanned/image-based, or file is corrupted

**Solution**:
- Use OCR tool to create searchable PDF
- Try re-saving the document
- Convert image to text-based PDF

#### 3. Document upload hangs indefinitely

**Cause**: File too large, network timeout, or server error

**Solution**:
- Reduce file size (compress, remove images)
- Check browser network tab for timeout
- Check server logs for errors
- Increase API timeout if needed

#### 4. AI not using uploaded documents

**Cause**: Document is toggled off, or context window exceeded

**Solution**:
- Verify document badge shows "Active in AI Context"
- Check toggle switch is ON (green)
- Reduce total document size if context window exceeded

#### 5. "Maximum 10 documents allowed"

**Solution**:
- Delete unnecessary documents
- Replace existing document instead of uploading new one
- Contact admin to increase limit (requires code change)

---

## Code References

### Key Files

| File | Purpose |
|------|---------|
| `webapp/prisma/schema.prisma` | Database model definition |
| `webapp/src/app/api/organizations/[id]/knowledge-base/route.ts` | GET/POST endpoints |
| `webapp/src/app/api/organizations/[id]/knowledge-base/[docId]/route.ts` | PATCH/DELETE endpoints |
| `webapp/src/lib/fileExtraction.ts` | Text extraction utilities |
| `webapp/src/lib/getOrgKnowledgeBase.ts` | AI context retrieval |
| `webapp/src/app/private/[slug]/settings/profile/page.tsx` | Frontend UI component |
| `webapp/src/app/api/ai/assistant-agent/route.ts` | AI chat integration |
| `webapp/src/app/api/chat/editor/route.ts` | Writing assistant integration |

### Dependencies

```json
{
  "dependencies": {
    "unpdf": "^0.x.x",
    "@langchain/community": "^0.x.x",
    "@langchain/core": "^0.x.x",
    "prisma": "^5.x.x",
    "@prisma/client": "^5.x.x",
    "next": "^15.x.x",
    "react": "^18.x.x"
  }
}
```

---

## Summary

The Knowledge Base feature provides a powerful way for organizations to give AI assistants context about their specific policies, procedures, and information. By supporting PDF, DOCX, and CSV uploads with automatic text extraction, organizations can enhance AI responses without manual data entry. The real-time toggle system gives users fine-grained control over which documents are active, while the 10-document limit ensures context quality remains high.

**Key Strengths**:
- ✅ Simple, intuitive UI
- ✅ Real-time updates (no save button)
- ✅ Robust file processing
- ✅ Seamless AI integration
- ✅ Secure and performant

**Key Limitations**:
- ⚠️ No original file storage
- ⚠️ 10 document limit
- ⚠️ Limited file type support
- ⚠️ No OCR for scanned PDFs

The feature is production-ready and provides immediate value to users while maintaining a clear path for future enhancements.

---

*Last Updated: November 24, 2025*
*Version: 1.0.0*

