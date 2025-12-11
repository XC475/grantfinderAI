# GrantWare AI - API Documentation

This document provides comprehensive documentation for all API endpoints in the GrantWare AI application.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Authentication](#authentication)
- [Response Format](#response-format)
- [Error Handling](#error-handling)
- [Endpoints](#endpoints)
  - [User & Auth](#user--auth)
  - [Organizations](#organizations)
  - [Grants](#grants)
  - [Applications](#applications)
  - [Documents](#documents)
  - [Document Tags](#document-tags)
  - [Folders](#folders)
  - [AI & Chat](#ai--chat)
  - [Bookmarks](#bookmarks)
  - [Google Drive](#google-drive)
  - [Admin](#admin)
  - [Utilities](#utilities)

---

## Overview

All API routes are built using Next.js 15 Route Handlers and follow RESTful conventions. The API uses:

- **Authentication**: Supabase SSR (cookie-based sessions)
- **Database**: Prisma ORM with PostgreSQL
- **Validation**: Zod schemas (where applicable)
- **Response Format**: JSON with consistent structure

### Base URL

```
Development: http://localhost:3000/api
Production: https://your-domain.com/api
```

---

## Authentication

### Session-Based (Default)

Most endpoints require a valid Supabase session cookie. The middleware handles session refresh automatically.

```typescript
// Server-side authentication pattern
const supabase = await createClient();
const { data: { user }, error } = await supabase.auth.getUser();

if (error || !user) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
```

### API Key (Server-to-Server)

For internal server-to-server requests, use the `x-api-key` header:

```bash
curl -H "x-api-key: YOUR_INTERNAL_API_KEY" \
  https://api.example.com/api/documents/vectorize
```

---

## Response Format

### Success Response

```typescript
// Single resource
{
  document: { id: "...", title: "...", ... }
}

// Collection with pagination
{
  data: [...],
  pagination: {
    total: 100,
    limit: 10,
    offset: 0,
    hasMore: true
  },
  meta: {
    requestId: "abc123",
    timestamp: "2025-01-01T00:00:00.000Z",
    processingTimeMs: 42
  }
}
```

### Error Response

```typescript
{
  error: "Human-readable error message",
  requestId?: "abc123",
  timestamp?: "2025-01-01T00:00:00.000Z"
}
```

---

## Error Handling

| Status Code | Meaning |
|-------------|---------|
| `200` | Success |
| `201` | Created |
| `400` | Bad Request (validation error) |
| `401` | Unauthorized (not authenticated) |
| `403` | Forbidden (no permission) |
| `404` | Not Found |
| `409` | Conflict (duplicate resource) |
| `500` | Internal Server Error |

---

## Endpoints

---

### User & Auth

#### `GET /api/user/me`

Get the current authenticated user's profile.

**Response:**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "name": "John Doe",
  "system_admin": false,
  "avatarUrl": "https://..."
}
```

---

#### `PUT /api/user`

Update the current user's profile.

**Request Body:**
```json
{
  "name": "New Name",
  "avatarUrl": "https://..."
}
```

---

#### `POST /api/user/set-password`

Set password for users with temporary passwords.

**Request Body:**
```json
{
  "password": "newSecurePassword123"
}
```

---

### Organizations

#### `GET /api/organizations`

Get the current user's organization.

**Response:**
```json
{
  "id": "cuid",
  "name": "Acme School District",
  "slug": "acme-sd",
  "logoUrl": "https://...",
  "website": "https://...",
  "missionStatement": "...",
  "strategicPlan": "...",
  "annualOperatingBudget": "5000000",
  "fiscalYearEnd": "June 30",
  "phone": "555-1234",
  "email": "info@acme.edu",
  "organizationLeaderName": "Dr. Smith",
  "address": "123 Main St",
  "city": "Springfield",
  "state": "CA",
  "zipCode": "90210",
  "enrollment": 5000,
  "numberOfSchools": 12,
  "lowestGrade": 0,
  "highestGrade": 12,
  "services": ["k12_education"]
}
```

---

#### `PUT /api/organizations/[id]`

Update organization profile.

**Request Body:**
```json
{
  "name": "Updated Name",
  "missionStatement": "New mission...",
  "services": ["k12_education", "non_profit"]
}
```

---

#### `GET /api/organizations/members`

List organization members.

**Response:**
```json
{
  "members": [
    {
      "id": "uuid",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "ADMIN",
      "createdAt": "2025-01-01T00:00:00.000Z"
    }
  ]
}
```

---

#### `POST /api/organizations/invite-member`

Invite a new member to the organization.

**Request Body:**
```json
{
  "email": "newuser@example.com",
  "name": "Jane Doe",
  "role": "MEMBER"
}
```

**Roles:** `OWNER`, `ADMIN`, `MEMBER`

---

#### `DELETE /api/organizations/members/[userId]`

Remove a member from the organization.

---

#### `POST /api/organizations/transfer-ownership`

Transfer organization ownership to another member.

**Request Body:**
```json
{
  "newOwnerId": "uuid"
}
```

---

### Grants

#### `GET /api/grants`

List all grant opportunities.

**Response:**
```json
[
  {
    "id": 1,
    "title": "Education Innovation Grant",
    "description": "...",
    "status": "posted",
    "agency": "Department of Education",
    "total_funding_amount": 500000,
    "award_min": 10000,
    "award_max": 50000,
    "close_date": "2025-06-30",
    "url": "https://..."
  }
]
```

---

#### `GET /api/grants/search`

Search grants with filters.

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `q` | string | Search query (title, description) |
| `status` | string | `posted`, `forecasted`, `closed` |
| `category` | string | Grant category filter |
| `stateCode` | string | State code (e.g., "CA") |
| `agency` | string | Funding agency |
| `minAmount` | number | Minimum funding amount |
| `maxAmount` | number | Maximum funding amount |
| `closeDateFrom` | date | Close date range start |
| `closeDateTo` | date | Close date range end |
| `organizationSlug` | string | Filter by org services, deprioritize bookmarked |
| `limit` | number | Results per page (max: 100) |
| `offset` | number | Pagination offset |

**Response:**
```json
{
  "data": [...],
  "pagination": {
    "total": 150,
    "limit": 50,
    "offset": 0,
    "hasMore": true
  },
  "searchParams": {
    "query": "education",
    "status": "posted"
  },
  "meta": {
    "requestId": "abc123",
    "timestamp": "...",
    "processingTimeMs": 45
  }
}
```

---

#### `GET /api/grants/[grantId]`

Get a single grant by ID.

**Response:**
```json
{
  "id": 1,
  "title": "Education Innovation Grant",
  "description": "Full description...",
  "description_summary": "Brief summary...",
  "eligibility": "K-12 districts...",
  "eligibility_summary": "...",
  "attachments": [...],
  ...
}
```

---

#### `POST /api/grants/[grantId]/bookmark`

Toggle bookmark status for a grant.

**Request Body:**
```json
{
  "organizationSlug": "acme-sd"
}
```

**Response:**
```json
{
  "bookmarked": true,
  "bookmark": { "id": "cuid", ... }
}
```

---

#### `GET /api/grants/filters`

Get available filter options for grants.

**Response:**
```json
{
  "statuses": ["posted", "forecasted", "closed"],
  "categories": ["STEM_Education", "Special_Education", ...],
  "agencies": ["Department of Education", ...],
  "states": ["CA", "NY", ...]
}
```

---

#### `POST /api/grants/vectorize`

Trigger vectorization of grants for AI search.

**Authentication:** Requires API key

---

### Applications

#### `GET /api/applications`

List applications for the organization.

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `organizationSlug` | string | Filter by organization |

**Response:**
```json
{
  "applications": [
    {
      "id": "cuid",
      "title": "STEM Grant Application",
      "status": "DRAFT",
      "opportunityId": 123,
      "opportunityTitle": "STEM Innovation Fund",
      "opportunityAgency": "NSF",
      "opportunityCloseDate": "2025-06-30",
      "opportunityAwardMax": "50000",
      "createdAt": "...",
      "updatedAt": "..."
    }
  ]
}
```

---

#### `POST /api/applications`

Create a new application.

**Request Body:**
```json
{
  "organizationSlug": "acme-sd",
  "opportunityId": 123,
  "title": "Custom Title (optional)",
  "alsoBookmark": true
}
```

For outside opportunities (no opportunityId):
```json
{
  "organizationSlug": "acme-sd",
  "opportunityTitle": "External Grant",
  "opportunityDescription": "...",
  "opportunityAgency": "Private Foundation",
  "opportunityCloseDate": "2025-12-31",
  "opportunityAwardMax": 100000
}
```

**Response:**
```json
{
  "application": { ... },
  "alsoBookmarked": true
}
```

---

#### `GET /api/applications/[applicationId]`

Get application details.

---

#### `PUT /api/applications/[applicationId]`

Update application.

**Request Body:**
```json
{
  "title": "Updated Title",
  "status": "IN_PROGRESS"
}
```

**Status Values:** `DRAFT`, `IN_PROGRESS`, `READY_TO_SUBMIT`, `SUBMITTED`, `UNDER_REVIEW`, `AWARDED`, `REJECTED`, `WITHDRAWN`

---

#### `DELETE /api/applications/[applicationId]`

Delete application and associated folder/documents.

---

#### `POST /api/applications/[applicationId]/copy`

Duplicate an application.

---

#### `GET /api/applications/[applicationId]/documents`

List documents in an application.

---

#### `POST /api/applications/[applicationId]/documents`

Create or upload document to application.

---

### Documents

#### `GET /api/documents`

List documents with pagination and filters.

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `limit` | number | Results per page (max: 100) |
| `offset` | number | Pagination offset |
| `withFolders` | boolean | Include folder info |
| `isKnowledgeBase` | boolean | Filter KB status |
| `fileTag` | string | Filter by tag name or ID |
| `vectorizationStatus` | string | Filter by status |

**Response:**
```json
{
  "data": [
    {
      "id": "cuid",
      "title": "Strategic Plan 2025",
      "contentType": "json",
      "fileUrl": null,
      "fileType": null,
      "isKnowledgeBase": true,
      "vectorizationStatus": "COMPLETED",
      "fileTag": { "id": "...", "name": "Strategic Plans" },
      "updatedAt": "..."
    }
  ],
  "pagination": { ... },
  "meta": { ... }
}
```

---

#### `POST /api/documents`

Create a new document.

**Request Body:**
```json
{
  "title": "New Document",
  "content": "{\"type\":\"doc\",...}",
  "contentType": "json",
  "folderId": "optional-folder-id",
  "fileTagId": "optional-tag-id"
}
```

---

#### `GET /api/documents/[documentId]`

Get document details.

---

#### `PUT /api/documents/[documentId]`

Update document.

**Request Body:**
```json
{
  "title": "Updated Title",
  "content": "{...}",
  "folderId": "new-folder-id",
  "fileTagId": "new-tag-id",
  "isKnowledgeBase": true,
  "metadata": { "custom": "data" }
}
```

---

#### `DELETE /api/documents/[documentId]`

Delete document (and associated file from storage).

---

#### `POST /api/documents/upload`

Upload a file document.

**Request:** `multipart/form-data`
- `file`: File to upload
- `folderId`: Optional folder ID
- `fileTagId`: Optional tag ID

**Response:**
```json
{
  "document": {
    "id": "cuid",
    "title": "uploaded-file.pdf",
    "fileUrl": "https://storage.../...",
    "fileType": "application/pdf",
    "fileSize": 102400,
    "vectorizationStatus": "PENDING"
  }
}
```

---

#### `POST /api/documents/vectorize`

Trigger document vectorization.

**Authentication:** Requires API key

Processes all documents with `vectorizationStatus: PENDING`.

---

#### `POST /api/documents/[documentId]/move`

Move document to different folder.

**Request Body:**
```json
{
  "folderId": "target-folder-id"
}
```

---

#### `POST /api/documents/[documentId]/copy`

Copy document.

**Request Body:**
```json
{
  "folderId": "target-folder-id"
}
```

---

#### `POST /api/documents/[documentId]/export`

Export document to file format.

**Request Body:**
```json
{
  "format": "docx"
}
```

---

#### `POST /api/documents/bulk-update`

Bulk update multiple documents.

**Request Body:**
```json
{
  "documentIds": ["id1", "id2", "id3"],
  "updates": {
    "isKnowledgeBase": true,
    "fileTagId": "new-tag-id"
  }
}
```

---

#### `POST /api/documents/toggle-tag`

Toggle document tag.

---

### Document Tags

#### `GET /api/document-tags`

List organization's document tags.

**Response:**
```json
{
  "tags": [
    {
      "id": "cuid",
      "name": "Strategic Plans",
      "organizationId": "...",
      "_count": { "documents": 5 }
    }
  ]
}
```

---

#### `POST /api/document-tags`

Create new tag.

**Request Body:**
```json
{
  "name": "Budgets"
}
```

---

#### `PUT /api/document-tags/[tagId]`

Update tag.

---

#### `DELETE /api/document-tags/[tagId]`

Delete tag.

---

### Folders

#### `GET /api/folders`

List folders.

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `parentFolderId` | string | Filter by parent (null for root) |
| `applicationId` | string | Filter by application |
| `all` | boolean | Get all folders (for move modal) |

**Response:**
```json
{
  "folders": [
    {
      "id": "cuid",
      "name": "Application Documents",
      "parentFolderId": null,
      "applicationId": "app-id",
      "documentCount": 5,
      "subfolderCount": 2
    }
  ]
}
```

---

#### `POST /api/folders`

Create folder.

**Request Body:**
```json
{
  "name": "New Folder",
  "parentFolderId": "optional-parent-id",
  "applicationId": "optional-app-id"
}
```

---

#### `GET /api/folders/[folderId]`

Get folder details.

---

#### `PUT /api/folders/[folderId]`

Update folder.

---

#### `DELETE /api/folders/[folderId]`

Delete folder and contents.

---

#### `POST /api/folders/[folderId]/move`

Move folder to new parent.

---

#### `POST /api/folders/[folderId]/copy`

Copy folder and contents.

---

#### `GET /api/folders/path/[folderId]`

Get folder breadcrumb path.

**Response:**
```json
{
  "path": [
    { "id": "root-id", "name": "Documents" },
    { "id": "parent-id", "name": "Applications" },
    { "id": "current-id", "name": "STEM Grant" }
  ]
}
```

---

### AI & Chat

#### `POST /api/ai/assistant-agent`

Stream AI assistant response.

**Request Body:**
```json
{
  "messages": [
    { "role": "user", "content": "Find grants for STEM education" }
  ],
  "chatId": "optional-existing-chat-id",
  "organizationId": "optional-org-id",
  "sourceDocumentIds": ["doc-id-1", "doc-id-2"]
}
```

**Response:** Streaming text/plain with token-by-token response

**Response Headers:**
- `X-Chat-Id`: Chat ID (for new chats)
- `Transfer-Encoding`: chunked

---

#### `GET /api/ai/recommendations`

Get AI-generated grant recommendations.

---

#### `GET /api/ai/recommendations/list`

List saved recommendations.

---

#### `GET /api/chats`

List user's chat history.

**Response:**
```json
{
  "chats": [
    {
      "id": "cuid",
      "title": "STEM Grant Search",
      "context": "GENERAL",
      "updatedAt": "...",
      "_count": { "messages": 12 }
    }
  ]
}
```

---

#### `POST /api/chats`

Create new chat session.

---

#### `GET /api/chats/[chatId]`

Get chat with messages.

**Response:**
```json
{
  "id": "cuid",
  "title": "Chat Title",
  "context": "GENERAL",
  "messages": [
    {
      "id": "msg-id",
      "role": "USER",
      "content": "Hello",
      "createdAt": "...",
      "metadata": { "attachments": [...] }
    },
    {
      "id": "msg-id-2",
      "role": "ASSISTANT",
      "content": "Hi! How can I help?",
      "createdAt": "..."
    }
  ]
}
```

---

#### `DELETE /api/chats/[chatId]`

Delete chat and all messages.

---

#### `PUT /api/chats/[chatId]/title`

Update chat title.

**Request Body:**
```json
{
  "title": "New Chat Title"
}
```

---

#### `POST /api/chat/upload`

Upload attachments for chat.

**Request:** `multipart/form-data`
- `files`: Files to upload

**Response:**
```json
{
  "files": [
    {
      "id": "file-id",
      "name": "document.pdf",
      "type": "application/pdf",
      "size": 102400,
      "url": "https://...",
      "extractedText": "Content from the PDF..."
    }
  ]
}
```

---

#### Editor-Specific Chat Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /api/chats/editor` | List editor-context chats |
| `POST /api/chats/editor` | Create editor chat |
| `GET /api/chats/editor/[chatId]` | Get editor chat |
| `PUT /api/chats/editor/[chatId]/title` | Update editor chat title |

---

### Bookmarks

#### `GET /api/bookmarks`

List user's bookmarked grants.

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `limit` | number | Results per page (max: 100) |
| `offset` | number | Pagination offset |

**Response:**
```json
{
  "data": [
    {
      "id": "cuid",
      "opportunityId": 123,
      "notes": "Good fit for our STEM program",
      "createdAt": "...",
      "opportunity": {
        "id": 123,
        "title": "STEM Innovation Grant",
        ...
      }
    }
  ],
  "pagination": { ... },
  "meta": { ... }
}
```

---

### Google Drive

#### `GET /api/google-drive/auth`

Initiate Google OAuth flow.

**Response:** Redirect to Google OAuth consent screen

---

#### `GET /api/google-drive/callback`

OAuth callback handler (internal).

---

#### `GET /api/google-drive/status`

Check Google Drive connection status.

**Response:**
```json
{
  "connected": true,
  "email": "user@gmail.com"
}
```

---

#### `POST /api/google-drive/disconnect`

Disconnect Google Drive account.

---

#### `POST /api/google-drive/import`

Import file from Google Drive.

**Request Body:**
```json
{
  "fileId": "google-drive-file-id",
  "folderId": "optional-target-folder"
}
```

---

#### `POST /api/google-drive/export`

Export document to Google Drive.

**Request Body:**
```json
{
  "documentId": "doc-id",
  "format": "docx"
}
```

---

#### `POST /api/google-drive/download`

Download file from Google Drive.

---

### Admin

> **Note:** Admin endpoints require `system_admin: true` on the user.

#### `GET /api/admin/users`

List all users in the system.

---

#### `PUT /api/admin/users/[userId]`

Update any user.

---

#### `DELETE /api/admin/users/[userId]`

Delete any user.

---

#### `GET /api/admin/organizations`

List all organizations.

---

### Utilities

#### `GET /api/activity/recent`

Get recent activity for the organization.

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `organizationSlug` | string | Organization slug |

**Response:**
```json
[
  {
    "id": "activity-id",
    "title": "Updated STEM Grant Application",
    "timestamp": "2025-01-01T12:00:00.000Z",
    "type": "application",
    "link": "/private/acme-sd/applications/app-id"
  }
]
```

---

#### `GET /api/school-districts`

Search school districts (for onboarding).

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `q` | string | Search query |
| `state` | string | State filter |

---

#### `POST /api/strategic-plan-summarize`

AI-summarize a strategic plan document.

**Request Body:**
```json
{
  "content": "Full strategic plan text..."
}
```

---

#### `POST /api/firecrawl`

Web scraping utility for grant pages.

---

#### `POST /api/pdf-extract`

Extract text from PDF file.

**Request:** `multipart/form-data`
- `file`: PDF file

**Response:**
```json
{
  "text": "Extracted text content...",
  "pages": 5
}
```

---

## API Directory Structure

```
src/app/api/
├── activity/
│   └── route.ts                    # Recent activity
├── admin/
│   ├── organizations/
│   │   └── route.ts                # List organizations
│   └── users/
│       ├── route.ts                # List users
│       └── [userId]/
│           └── route.ts            # User CRUD
├── ai/
│   ├── assistant-agent/
│   │   ├── route.ts                # Main AI endpoint
│   │   └── README.md               # Agent documentation
│   └── recommendations/
│       ├── route.ts                # Generate recommendations
│       └── list/
│           └── route.ts            # List recommendations
├── applications/
│   ├── route.ts                    # List/Create
│   └── [applicationId]/
│       ├── route.ts                # Get/Update/Delete
│       ├── copy/
│       │   └── route.ts            # Copy application
│       └── documents/
│           ├── route.ts            # List/Create docs
│           └── [documentId]/
│               └── route.ts        # Doc CRUD
├── bookmarks/
│   └── route.ts                    # List bookmarks
├── chat/
│   └── upload/
│       └── route.ts                # Upload attachments
├── chats/
│   ├── route.ts                    # List/Create chats
│   ├── editor/
│   │   ├── route.ts                # Editor chats
│   │   └── [chatId]/
│   │       ├── route.ts
│   │       └── title/
│   │           └── route.ts
│   └── [chatId]/
│       ├── route.ts                # Get/Delete chat
│       └── title/
│           └── route.ts            # Update title
├── custom-fields/
│   ├── route.ts                    # List/Create
│   └── [fieldId]/
│       └── route.ts                # CRUD
├── document-tags/
│   ├── route.ts                    # List/Create tags
│   └── [tagId]/
│       └── route.ts                # Tag CRUD
├── documents/
│   ├── route.ts                    # List/Create
│   ├── upload/
│   │   └── route.ts                # File upload
│   ├── vectorize/
│   │   └── route.ts                # Trigger vectorization
│   ├── bulk-update/
│   │   └── route.ts                # Bulk operations
│   ├── toggle-tag/
│   │   └── route.ts                # Toggle tag
│   └── [documentId]/
│       ├── route.ts                # Get/Update/Delete
│       ├── copy/
│       │   └── route.ts
│       ├── move/
│       │   └── route.ts
│       └── export/
│           └── route.ts
├── firecrawl/
│   └── route.ts                    # Web scraping
├── folders/
│   ├── route.ts                    # List/Create
│   ├── path/
│   │   └── [folderId]/
│   │       └── route.ts            # Get breadcrumb
│   └── [folderId]/
│       ├── route.ts                # CRUD
│       ├── copy/
│       │   └── route.ts
│       └── move/
│           └── route.ts
├── google-drive/
│   ├── auth/
│   │   └── route.ts                # OAuth init
│   ├── callback/
│   │   └── route.ts                # OAuth callback
│   ├── disconnect/
│   │   └── route.ts
│   ├── download/
│   │   └── route.ts
│   ├── export/
│   │   └── route.ts
│   ├── import/
│   │   └── route.ts
│   └── status/
│       └── route.ts
├── grants/
│   ├── route.ts                    # List all
│   ├── search/
│   │   └── route.ts                # Search with filters
│   ├── filters/
│   │   └── route.ts                # Get filter options
│   ├── vectorize/
│   │   ├── route.ts                # Trigger vectorization
│   │   ├── all/
│   │   │   └── route.ts            # Vectorize all
│   │   ├── estimate/
│   │   │   └── route.ts            # Estimate time
│   │   └── status/
│   │       └── route.ts            # Check status
│   └── [grantId]/
│       ├── route.ts                # Get grant
│       └── bookmark/
│           └── route.ts            # Toggle bookmark
├── organizations/
│   ├── route.ts                    # Get org
│   ├── invite-member/
│   │   └── route.ts
│   ├── transfer-ownership/
│   │   └── route.ts
│   ├── members/
│   │   ├── route.ts                # List members
│   │   └── [userId]/
│   │       └── route.ts            # Remove member
│   └── [id]/
│       └── route.ts                # Update org
├── pdf-extract/
│   └── route.ts                    # PDF text extraction
├── school-districts/
│   └── route.ts                    # Search districts
├── strategic-plan-summarize/
│   └── route.ts                    # AI summarization
└── user/
    ├── route.ts                    # Update user
    ├── me/
    │   └── route.ts                # Get current user
    └── set-password/
        └── route.ts                # Set password
```

---

## Related Documentation

- **Frontend Setup**: See [`../README.md`](../README.md)
- **Main README**: See [`../../../README.md`](../../../../README.md)
- **AI Agent Details**: See [`ai/assistant-agent/README.md`](./ai/assistant-agent/README.md)

