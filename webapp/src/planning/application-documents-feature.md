# Application Documents Feature Implementation Plan

## Overview

This document outlines the implementation plan for enhancing the application management system to support multiple documents per application, replacing the single "Edit Application" button with an "Application Page" that provides access to grant details, related documents, and document management capabilities.

## Current State Analysis

### Database Schema

The current schema already has a foundation for this feature:

```prisma
model Application {
  id                    String                  @id @default(cuid())
  opportunityId         Int
  status                ApplicationStatus       @default(DRAFT)
  content               Json?                   // Legacy field - can be deprecated
  contentHtml           String?                 // Legacy field - can be deprecated
  title                 String?
  notes                 String?
  documents             Json?                   // Legacy field - can be deprecated
  createdAt             DateTime                @default(now())
  updatedAt             DateTime                @updatedAt
  submittedAt           DateTime?
  lastEditedAt          DateTime                @default(now())
  organizationId        String
  aiChats               AiChat[]
  application_documents application_documents[] // ✅ Already exists!
  organization          Organization            @relation(fields: [organizationId], references: [id], onDelete: Cascade)
}

model application_documents {
  id            String      @id
  applicationId String
  title         String
  content       String?
  contentType   String      @default("html")
  metadata      Json?
  version       Int         @default(1)
  isActive      Boolean     @default(true)
  createdAt     DateTime    @default(now())
  updatedAt     DateTime
  applications  Application @relation(fields: [applicationId], references: [id], onDelete: Cascade)
}
```

### Current UI Flow

- Applications page shows a table with "Edit Application" button
- Button navigates to `/private/[slug]/applications/[applicationId]`
- Currently handles single document editing

## Required Changes

### 1. Database Schema Updates

#### 1.1 Update application_documents Model

```prisma
model application_documents {
  id            String      @id @default(cuid())
  applicationId String
  title         String
  content       String?
  contentType   String      @default("html")
  metadata      Json?
  version       Int         @default(1)
  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt
  applications  Application @relation(fields: [applicationId], references: [id], onDelete: Cascade)

  @@index([applicationId])
  @@index([updatedAt])
  @@index([applicationId, createdAt])
  @@schema("app")
}
```

### 2. API Endpoints

#### 2.1 New API Routes

```
/api/applications/[applicationId]/documents
├── GET    - List all documents for an application
└── POST   - Create a new document

/api/applications/[applicationId]/documents/[documentId]
├── GET    - Get specific document
├── PUT    - Update specific document
└── DELETE - Delete specific document
```

#### 2.2 API Implementation Structure

```typescript
// /api/applications/[applicationId]/documents/route.ts
export async function GET(
  request: NextRequest,
  { params }: { params: { applicationId: string } }
) {
  // List documents with pagination and filtering
}

export async function POST(
  request: NextRequest,
  { params }: { params: { applicationId: string } }
) {
  // Create new document
}

// /api/applications/[applicationId]/documents/[documentId]/route.ts
export async function GET(
  request: NextRequest,
  { params }: { params: { applicationId: string; documentId: string } }
) {
  // Get specific document
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { applicationId: string; documentId: string } }
) {
  // Update specific document
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { applicationId: string; documentId: string } }
) {
  // Delete document
}
```

### 3. Frontend Implementation

#### 3.1 Update Applications Page

**File**: `/src/app/private/[slug]/applications/page.tsx`

**Changes**:

- Replace "Edit Application" button with "Application Page" button
- Update button text and icon
- Change navigation to new application page route

```typescript
// Before
<Button
  variant="default"
  size="sm"
  onClick={() => router.push(`/private/${slug}/applications/${application.id}`)}
>
  <FileText className="h-4 w-4 mr-1" />
  Edit Application
</Button>

// After
<Button
  variant="default"
  size="sm"
  onClick={() => router.push(`/private/${slug}/applications/${application.id}`)}
>
  <FileText className="h-4 w-4 mr-1" />
  Application Page
</Button>
```

#### 3.2 Create New Application Page

**File**: `/src/app/private/[slug]/applications/[applicationId]/page.tsx`

**Features**:

- Display grant information (title, description, deadline, etc.)
- List all application documents
- "Create Document" button
- Document management (edit, delete, view)
- Navigation to document editor

**Layout Structure**:

```
┌─────────────────────────────────────────────────────────┐
│ Application: [Application Title]                        │
├─────────────────────────────────────────────────────────┤
│ Grant Information                                       │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Grant Title                                         │ │
│ │ Description                                         │ │
│ │ Deadline: [Date]                                    │ │
│ │ Status: [Status]                                    │ │
│ └─────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────┤
│ Documents                                               │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ [Create Document] Button                            │ │
│ │                                                     │ │
│ │ Document List:                                      │ │
│ │ • Proposal Document [Edit] [Delete]                 │ │
│ │ • Budget Document [Edit] [Delete]                   │ │
│ │ • Timeline Document [Edit] [Delete]                 │ │
│ └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

#### 3.3 Create Document Editor Page

**File**: `/src/app/private/[slug]/applications/[applicationId]/documents/[documentId]/page.tsx`

**Features**:

- Full-screen TipTap editor
- Document title editing
- Auto-save functionality
- Navigation back to application page
- Document type selection

#### 3.4 Create Document Creation Modal

**Component**: `CreateDocumentModal.tsx`

**Features**:

- Document title input
- Modal form for document creation
- Creates document and redirects to editor

### 4. Component Structure

#### 4.1 New Components

```
src/components/applications/
├── ApplicationPage.tsx           // Main application page component
├── GrantInfoCard.tsx            // Grant information display
├── DocumentList.tsx             // Document listing component
├── DocumentCard.tsx             // Individual document card
├── CreateDocumentButton.tsx     // Button that opens create modal
├── CreateDocumentModal.tsx      // Create document modal
└── DocumentEditor.tsx           // Document editing component
```

#### 4.2 Component Responsibilities

**ApplicationPage.tsx**:

- Main container for application page
- Fetches application and grant data
- Manages document state
- Handles document CRUD operations

**GrantInfoCard.tsx**:

- Displays grant information
- Shows grant status and deadlines
- Links to full grant details

**DocumentList.tsx**:

- Lists all application documents
- Handles document filtering and sorting
- Manages document actions (edit, delete)

**DocumentCard.tsx**:

- Individual document display
- Shows document metadata
- Provides action buttons

**CreateDocumentButton.tsx**:

- Button that opens the create document modal
- Triggers modal state management

**CreateDocumentModal.tsx**:

- Modal form for document creation
- Document title input
- Handles document creation and navigation to editor

**DocumentEditor.tsx**:

- Wraps TipTap editor for documents
- Handles auto-save
- Manages document state

### 5. Data Flow

#### 5.1 Application Page Data Flow

```
ApplicationPage
├── Fetch Application Data (API: /api/applications/[id])
├── Fetch Grant Data (API: /api/grants/[opportunityId])
├── Fetch Documents (API: /api/applications/[id]/documents)
└── Render Components
    ├── GrantInfoCard (grant data)
    ├── DocumentList (documents data)
    └── CreateDocumentButton
```

#### 5.2 Document Creation Flow

```
CreateDocumentButton
├── Click Button
├── Open CreateDocumentModal
├── Show Modal with Title Input
├── POST /api/applications/[id]/documents
├── Close Modal
├── Redirect to Document Editor
└── DocumentEditor
    ├── Load Document Data
    ├── Initialize TipTap Editor
    └── Auto-save on Changes
```

### 6. Schema Changes

#### 6.1 Prisma Schema Updates

Since you're using `prisma db push`, simply update the schema file and run `prisma db push` to apply changes:

```bash
# After updating schema.prisma
npx prisma db push
```

### 7. Implementation Phases

#### Phase 1: Database & API (Week 1)

- [ ] Update Prisma schema
- [ ] Run `prisma db push` to apply schema changes
- [ ] Implement API endpoints
- [ ] Add API tests

#### Phase 2: Core Components (Week 2)

- [ ] Create ApplicationPage component
- [ ] Create GrantInfoCard component
- [ ] Create DocumentList component
- [ ] Create DocumentCard component

#### Phase 3: Document Management (Week 3)

- [ ] Create DocumentEditor component
- [ ] Create CreateDocumentButton component
- [ ] Implement document CRUD operations
- [ ] Add auto-save functionality

#### Phase 4: Integration & Testing (Week 4)

- [ ] Update applications page
- [ ] Integrate all components
- [ ] Add error handling
- [ ] User testing and refinement

### 8. Technical Considerations

#### 8.1 Performance

- Implement pagination for documents list
- Use React Query for data fetching and caching
- Optimize TipTap editor loading
- Implement document content lazy loading

#### 8.2 User Experience

- Auto-save documents every 30 seconds
- Show unsaved changes indicator
- Implement keyboard shortcuts
- Add document templates

#### 8.3 Security

- Validate document access permissions
- Sanitize document content
- Implement rate limiting for document operations
- Add audit logging for document changes

#### 8.4 Error Handling

- Graceful handling of network errors
- Document recovery mechanisms
- User-friendly error messages
- Fallback UI states

## Conclusion

This implementation plan provides a comprehensive roadmap for enhancing the application management system with multi-document support. The plan leverages the existing database schema foundation while adding necessary enhancements for a robust document management system.

The phased approach ensures minimal disruption to existing functionality while providing a clear path to implementation. The modular component structure allows for future enhancements and maintains code maintainability.
