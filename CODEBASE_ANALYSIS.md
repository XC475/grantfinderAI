# GrantWare AI - Comprehensive Codebase Analysis

**Generated:** November 25, 2025  
**Analyst:** Senior Full Stack Engineer  
**Version:** 1.0

---

## Executive Summary

GrantWare AI is a full-stack SaaS application designed to help organizations (primarily K-12 school districts) discover grant opportunities and manage grant applications through AI-powered tools. The system features a Next.js/React frontend with a Tiptap-based rich text editor, AI chat assistants using LangChain and RAG, PostgreSQL database with multi-tenancy, and a Python backend for grant scraping.

### Key Technology Stack
- **Frontend:** Next.js 15.5.3 (App Router), React 19, TypeScript, Tailwind CSS v4
- **Backend:** Next.js API Routes + Python Flask (grant scraping)
- **Database:** PostgreSQL with Prisma ORM (multi-schema: app + public)
- **Authentication:** Supabase Auth with session management
- **AI/ML:** OpenAI GPT-4, LangChain, RAG with Supabase Vector Store
- **Rich Text:** Tiptap editor with 40+ custom extensions
- **Styling:** Tailwind CSS v4, shadcn/ui components, SCSS modules

### Architecture Overview
- **Multi-tenant B2B SaaS** with organization-based data isolation
- **Role-Based Access Control (RBAC):** Owner, Admin, Member roles + System Admin
- **Server Components First:** Leverages Next.js App Router for optimal performance
- **AI-First Design:** RAG system, vector search, AI chat agents, document intelligence
- **Monorepo Structure:** Frontend (webapp/) and backend (backend/) services

---

## 1. Repository Structure & Organization

### Root Directory
```
grantfinderAI/
├── webapp/                 # Next.js frontend application
├── backend/                # Python Flask backend (grant scraping)
├── requirements.txt        # Python dependencies
├── package-lock.json       # Root package lock
├── README.md              # Project documentation
├── prompt.md              # AI agent prompt/role definition
└── *.md                   # Design documents & plans
```

### Webapp Structure (`/webapp`)
```
webapp/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API route handlers (67+ routes)
│   │   ├── private/[slug]/    # Organization-scoped pages
│   │   ├── login/             # Authentication pages
│   │   ├── register/          # Registration flow
│   │   └── layout.tsx         # Root layout with providers
│   ├── components/            # React components
│   │   ├── ui/               # shadcn/ui components (45+)
│   │   ├── tiptap-ui/        # Tiptap toolbar components (64+)
│   │   ├── tiptap-node/      # Custom Tiptap nodes (15+)
│   │   ├── applications/     # Application management
│   │   ├── folders/          # File system UI
│   │   └── sidebar/          # Navigation components
│   ├── lib/                   # Utility libraries
│   │   ├── ai/               # AI agent & vector store
│   │   ├── prisma.ts         # Database client
│   │   └── *.ts              # Helper functions
│   ├── hooks/                 # Custom React hooks (14)
│   ├── utils/                 # Utility functions
│   │   └── supabase/         # Supabase helpers
│   ├── contexts/             # React contexts (3)
│   ├── types/                # TypeScript type definitions
│   └── middleware.ts         # Auth & routing middleware
├── prisma/
│   └── schema.prisma         # Database schema (501 lines)
├── public/                    # Static assets
└── package.json              # Dependencies & scripts
```

### Backend Structure (`/backend`)
```
backend/
├── flask_server/         # Flask application
│   ├── __init__.py
│   ├── __main__.py
│   └── db.py            # SQLAlchemy database setup
├── scripts/             # Grant scraping scripts
│   ├── scraping_agent.py      # AI-powered scraper
│   ├── fetch_grants_*.py      # Source-specific scrapers
│   └── schemas/              # JSON schemas for extraction
├── models_sql/          # SQLAlchemy models
│   ├── opportunity.py        # Grant opportunity model
│   └── k12_education_opportunity.py
├── migrations/          # Alembic database migrations
└── docs/               # Backend documentation
```

---

## 2. Database Schema Deep Dive

### Multi-Schema Architecture
The database uses two PostgreSQL schemas:
- **`app` schema:** Application data (users, organizations, applications)
- **`public` schema:** Grant opportunities, vector embeddings

### Core Models (App Schema)

#### User Model
```typescript
model User {
  id: String (UUID)                    // Supabase auth ID
  email: String (unique)
  name: String?
  avatarUrl: String?
  organizationId: String               // Tenant isolation
  system_admin: Boolean (default: false)
  role: OrganizationRole (OWNER | ADMIN | MEMBER)
  onboardingCompleted: Boolean
  hasTemporaryPassword: Boolean
  googleAccessToken: String? (encrypted)
  googleDriveConnected: Boolean
  googleRefreshToken: String? (encrypted)
  googleTokenExpiry: DateTime?
  lastActiveAt: DateTime
  createdAt, updatedAt: DateTime
  
  // Relations
  organization: Organization
  aiChats: AiChat[]
  grantBookmarks: GrantBookmark[]
}
```

**Key Patterns:**
- UUID primary key matches Supabase Auth ID
- Multi-tenancy through `organizationId`
- RBAC with `role` field
- Google Drive OAuth token storage (encrypted)
- Temporary password support for admin-created accounts

#### Organization Model
```typescript
model Organization {
  id: String (CUID)
  slug: String (unique)               // URL-safe identifier
  name: String
  
  // Profile Fields
  logoUrl, website, email, phone
  missionStatement, strategicPlan
  address, city, state, zipCode
  annualOperatingBudget: Decimal
  fiscalYearEnd: String
  organizationLeaderName: String
  
  // K-12 Specific Fields
  leaId: String? (unique)            // NCES District ID
  stateLeaId: String?
  countyName: String?
  enrollment: Int?
  numberOfSchools: Int?
  lowestGrade, highestGrade: Int?
  latitude, longitude: Float?
  urbanCentricLocale: Int?
  districtDataYear: Int?
  
  // Service Categories
  services: opportunity_services_enum[] (default: [k12_education])
  
  // Relations
  users: User[]
  applications: Application[]
  documents: Document[]
  folders: Folder[]
  aiChats: AiChat[]
  customFields: CustomField[]
  knowledgeBase: KnowledgeBaseDocument[]
  grantBookmarks: GrantBookmark[]
  eligibilityAnalyses: GrantEligibilityAnalysis[]
  recommendations: Recommendation[]
}
```

**Key Patterns:**
- CUID for collision-resistant IDs
- Unique slug for URL routing (`/private/[slug]`)
- Rich K-12 district metadata
- Custom fields for extensibility
- Services array for filtering relevant grants

#### Application Model
```typescript
model Application {
  id: String (CUID)
  opportunityId: Int? (nullable)     // Can be outside opportunity
  organizationId: String
  status: ApplicationStatus (DRAFT | IN_PROGRESS | READY_TO_SUBMIT | ...)
  title: String?
  
  // Snapshot of Opportunity Data
  opportunityTitle: String?
  opportunityDescription: String?
  opportunityEligibility: String?
  opportunityAgency: String?
  opportunityCloseDate: DateTime?
  opportunityTotalFunding: BigInt?
  opportunityAwardMin: BigInt?
  opportunityAwardMax: BigInt?
  opportunityUrl: String?
  opportunityAttachments: Json?
  
  createdAt, updatedAt, submittedAt, lastEditedAt: DateTime
  
  // Relations
  organization: Organization
  documents: Document[]
  aiChats: AiChat[]
  folder: Folder? (1:1 relationship)
}
```

**Key Patterns:**
- Denormalized opportunity data (snapshot pattern)
- Nullable `opportunityId` allows "outside opportunities"
- One-to-one relationship with folder
- BigInt for large funding amounts
- Status tracking through lifecycle

#### Document Model
```typescript
model Document {
  id: String (CUID)
  title: String
  content: String?                    // Tiptap JSON or text
  contentType: String (default: "json")
  metadata: Json?
  version: Int (default: 1)
  
  organizationId: String
  applicationId: String?
  folderId: String?
  
  // File Upload Fields
  fileSize: Int?
  fileType: String?
  fileUrl: String?                   // Supabase Storage URL
  
  createdAt, updatedAt: DateTime
  
  // Relations
  organization: Organization
  application: Application?
  folder: Folder?
}
```

**Key Patterns:**
- Supports both rich text (Tiptap) and file uploads
- Hierarchical organization through folders
- Metadata for extracted text from uploads

#### Folder Model
```typescript
model Folder {
  id: String (CUID)
  name: String
  organizationId: String
  parentFolderId: String? (nullable)
  applicationId: String? (unique, 1:1)
  
  createdAt, updatedAt: DateTime
  
  // Relations (self-referential tree)
  organization: Organization
  application: Application?
  parent: Folder?
  children: Folder[]
  documents: Document[]
}
```

**Key Patterns:**
- Self-referential tree structure
- Root folders have `parentFolderId: null`
- Application folders (`applicationId` set) are root-level
- Prevents circular references through validation

#### AI Chat Models
```typescript
model AiChat {
  id: String (CUID)
  title: String?
  context: AiChatContext (GENERAL | APPLICATION | GRANT_ANALYSIS | ...)
  metadata: Json?
  userId: String
  organizationId: String
  applicationId: String?
  createdAt, updatedAt: DateTime
  
  messages: AiChatMessage[]
}

model AiChatMessage {
  id: String (CUID)
  role: MessageRole (USER | ASSISTANT | SYSTEM)
  content: String (markdown)
  metadata: Json? (attachments, timestamps, model info)
  chatId: String
  createdAt: DateTime
}
```

**Key Patterns:**
- Context-based chat categorization
- Metadata stores attachments, file references
- Markdown content format

#### Knowledge Base Model
```typescript
model KnowledgeBaseDocument {
  id: String (CUID)
  fileName: String
  fileType: String
  fileSize: Int
  fileUrl: String?
  extractedText: String (TEXT)       // Full text extraction
  isActive: Boolean (default: true)
  organizationId: String
  createdAt, updatedAt: DateTime
}
```

**Key Patterns:**
- Organization-specific knowledge base
- Full text extraction for AI context
- Active/inactive toggle for versioning

### Public Schema Models

#### Opportunities (Grant Data)
```typescript
model opportunities {
  id: Int (autoincrement)
  source: String                     // "grants.gov", "mass_dese", etc.
  state_code: String?
  source_grant_id: String?
  status: opportunity_status_enum (forecasted | posted | closed | archive)
  
  // Core Grant Info
  title: String
  description: String?
  description_summary: String?
  agency: String?
  funding_instrument: String?
  funding_type: funding_type_enum? (state | federal | local | private)
  
  // Financial
  total_funding_amount: BigInt?
  award_min, award_max: BigInt?
  cost_sharing: Boolean?
  
  // Timeline
  fiscal_year: Int?
  post_date, close_date, archive_date: Date?
  
  // Categorization
  category: opportunity_category_enum[] (30+ categories)
  services: opportunity_services_enum[]
  
  // Details
  eligibility: String?
  eligibility_summary: String?
  application_instructions: String?
  contact_name, contact_email, contact_phone: String?
  url: String?
  rfp_url: String?
  attachments: Json?
  
  // Metadata
  relevance_score: Int?
  raw_text: String?                  // For vectorization
  content_hash: String?              // Change detection
  is_recurring: Boolean?
  last_updated: DateTime?
}
```

**Key Patterns:**
- Separate from app schema (ingestion pipeline)
- Rich categorization (30+ education categories)
- Content hashing for change detection
- Raw text stored for vector embeddings

#### Vector Store
```typescript
model VectorDocument {
  id: BigInt (autoincrement)
  content: String?
  metadata: Json?
  embedding: Unsupported("vector")?  // pgvector extension
}
```

**Key Patterns:**
- Uses pgvector extension
- Stores embeddings for semantic search
- Metadata links to opportunity records

### Enums

#### Application Status
```
DRAFT → IN_PROGRESS → READY_TO_SUBMIT → SUBMITTED → 
  UNDER_REVIEW → [AWARDED | REJECTED | WITHDRAWN]
```

#### Organization Roles
```
MEMBER < ADMIN < OWNER (+ system_admin flag)
```

#### AI Chat Contexts
```
GENERAL | APPLICATION | GRANT_ANALYSIS | DRAFTING | ELIGIBILITY
```

#### Opportunity Categories (30+)
```
STEM_Education, Math_and_Science_Education, Career_and_Technical_Education,
Special_Education, Early_Childhood_Education, Teacher_Professional_Development,
Digital_Literacy_and_Technology, Health_and_Wellness, Equity_and_Inclusion,
... (27 more)
```

### Database Indexes
```typescript
// User
@@index([organizationId, role])

// Organization
@@index([leaId])
@@index([state])

// Application
@@index([opportunityId, organizationId])
@@index([organizationId, status])
@@index([updatedAt])

// Document
@@index([applicationId])
@@index([updatedAt])
@@index([applicationId, createdAt])
@@index([folderId])

// Folder
@@index([organizationId])
@@index([parentFolderId])
@@index([applicationId])

// KnowledgeBaseDocument
@@index([organizationId])
@@index([organizationId, isActive])
```

### Cascade Behaviors
- **Organization deletion** → Cascades to all related data (users, applications, documents, folders)
- **Application deletion** → Cascades to documents and AI chats
- **Folder deletion** → Cascades to child folders and documents
- **User deletion** → Cascades to AI chats and bookmarks

---

## 3. Application Architecture

### Next.js App Router Architecture

#### Server Components (Default)
- **Purpose:** Data fetching, SEO, initial render
- **Used for:** Pages, layouts, static content
- **Pattern:** Async components that fetch data directly

```typescript
// Example: Server Component pattern
export default async function DashboardPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  // Direct database access in Server Components
  const organization = await prisma.organization.findUnique({
    where: { slug },
    include: { applications: true }
  });
  
  return <DashboardUI organization={organization} />;
}
```

#### Client Components
- **Directive:** `"use client"` at top of file
- **Purpose:** Interactivity, browser APIs, React hooks
- **Used for:** Forms, modals, editors, interactive UI

```typescript
"use client";

export function DocumentEditor({ document }: Props) {
  const [content, setContent] = useState(document.content);
  // Can use hooks, event handlers, browser APIs
  return <TiptapEditor content={content} onChange={setContent} />;
}
```

### Authentication & Session Management

#### Middleware Layer
```typescript
// src/middleware.ts
// Runs on Edge runtime for ALL requests
export async function middleware(request: NextRequest) {
  // 1. Check API key authentication (server-to-server)
  if (apiKey === process.env.INTERNAL_API_KEY) return NextResponse.next();
  
  // 2. Create Supabase client with cookie handlers
  const supabase = createServerClient(..., { cookies: { getAll, setAll } });
  
  // 3. CRITICAL: Call getUser() to refresh session
  const { data: { user } } = await supabase.auth.getUser();
  
  // 4. Redirect to /login if no user (except public routes)
  if (!user && !isPublicRoute) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  // 5. Organization access verification
  if (user && request.nextUrl.pathname.startsWith('/private/')) {
    const orgSlug = getSlugFromPath();
    const userOrgSlug = request.cookies.get('org-slug')?.value;
    if (userOrgSlug && userOrgSlug !== orgSlug) {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }
  
  return supabaseResponse; // MUST return this exact response
}
```

**Critical Patterns:**
- Edge runtime for performance
- Cookie-based session management
- `getUser()` call required to trigger refresh
- Organization-level access control
- API key bypass for internal services

#### Server-Side Auth
```typescript
// src/utils/supabase/server.ts
export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // setAll may fail in Server Components (refreshed by middleware)
          }
        }
      }
    }
  );
}
```

### Data Flow Architecture

```
User Request
    ↓
Middleware (Edge Runtime)
    ├─→ Auth check (Supabase)
    ├─→ Session refresh
    └─→ Organization access control
    ↓
Server Component / API Route
    ├─→ Supabase Auth (user context)
    ├─→ Prisma (database queries)
    ├─→ Business logic
    └─→ Response
    ↓
Client Component (if needed)
    ├─→ Hydration
    ├─→ Interactivity
    └─→ API calls for mutations
```

### Multi-Tenancy Pattern

**Organization Slug-Based Routing:**
```
/private/[slug]/dashboard
/private/[slug]/applications
/private/[slug]/grants
/private/[slug]/settings
```

**Data Isolation:**
- Every query filtered by `organizationId`
- Middleware validates slug matches user's organization
- Prisma queries use organization context

```typescript
// Pattern: Always filter by organization
const applications = await prisma.application.findMany({
  where: {
    organizationId: user.organizationId,
    // other filters...
  }
});
```

### State Management

**No Global State Library** - Uses:
1. **Server State:** Fetched in Server Components, passed as props
2. **URL State:** Search params, route params
3. **React Context:** Document editor state, header content
4. **Local State:** Component-level useState for UI

**React Contexts:**
- `DocumentContext` - Editor title, content, save status
- `HeaderContentContext` - Dynamic header content
- `HeaderActionsContext` - Header action buttons

### Error Handling Pattern

```typescript
// API Route Pattern
export async function POST(request: NextRequest) {
  try {
    // 1. Auth check
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    // 2. Authorization check
    const hasAccess = await verifyAccess(user.id, resourceId);
    if (!hasAccess) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    
    // 3. Business logic
    const result = await performOperation();
    
    // 4. Success response
    return NextResponse.json(result, { status: 200 });
    
  } catch (error) {
    console.error("Error in API route:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
```

---

## 4. API Routes & Endpoints

### API Route Organization

```
/api
├── activity/               # User activity tracking
│   └── recent/            # GET - Recent activity
├── admin/                 # System admin endpoints
│   ├── organizations/     # GET - List orgs, POST - Create org
│   └── users/
│       ├── /              # GET - List users
│       └── [userId]/      # PATCH - Update user, DELETE - Delete
├── ai/                    # AI agent endpoints
│   ├── assistant-agent/   # POST - Stream AI chat
│   └── recommendations/   # POST - Generate recommendations
├── applications/          # Application management
│   ├── /                  # GET - List, POST - Create
│   └── [applicationId]/
│       ├── /              # GET - Detail, PATCH - Update, DELETE
│       ├── copy/          # POST - Duplicate application
│       └── documents/     # GET - List documents
│           └── [documentId]/  # GET - Get document
├── bookmarks/             # Grant bookmarks
│   └── /                  # POST - Create, DELETE - Remove
├── chat/                  # Legacy chat (migrate to chats/)
│   ├── editor/            # POST - Editor AI chat
│   └── upload/            # POST - Upload chat attachment
├── chats/                 # AI chat management
│   ├── /                  # GET - List chats, POST - Create
│   ├── [chatId]/          # GET - Get chat, DELETE - Delete
│   │   └── title/         # PATCH - Update title
│   └── editor/            # Editor-specific chats
│       ├── /              # POST - Create editor chat
│       └── [chatId]/      # GET - Get, DELETE - Delete
│           └── title/     # PATCH - Update title
├── documents/             # Document management
│   ├── /                  # POST - Create document
│   ├── upload/            # POST - Upload file
│   └── [documentId]/
│       ├── /              # GET - Get, PATCH - Update, DELETE
│       ├── copy/          # POST - Duplicate document
│       ├── export/        # GET - Export (DOCX, PDF)
│       └── move/          # PATCH - Move to folder
├── firecrawl/             # Web scraping
│   └── scrape/            # POST - Scrape URL
├── folders/               # Folder management
│   ├── /                  # POST - Create folder
│   ├── [folderId]/
│   │   ├── /              # GET - Get, PATCH - Update, DELETE
│   │   ├── copy/          # POST - Duplicate folder tree
│   │   └── move/          # PATCH - Move folder
│   └── path/
│       └── [folderId]/    # GET - Get folder path (breadcrumbs)
├── google-drive/          # Google Drive integration
│   ├── auth/              # GET - OAuth URL
│   ├── callback/          # GET - OAuth callback
│   ├── status/            # GET - Connection status
│   ├── download/          # POST - Download from Drive
│   ├── import/            # POST - Import to system
│   └── export/            # POST - Export to Drive
├── grants/                # Grant opportunities
│   ├── /                  # GET - List grants
│   ├── search/            # POST - Search grants
│   ├── filters/           # GET - Available filters
│   ├── [grantId]/
│   │   ├── /              # GET - Grant detail
│   │   └── bookmark/      # POST - Bookmark, DELETE - Remove
│   └── vectorize/         # Vector embedding management
│       ├── /              # POST - Vectorize grants
│       ├── all/           # POST - Vectorize all
│       ├── estimate/      # POST - Estimate cost
│       └── status/        # GET - Vectorization status
├── organizations/         # Organization management
│   ├── /                  # POST - Create organization
│   ├── [id]/
│   │   ├── /              # PATCH - Update organization
│   │   ├── custom-fields/
│   │   │   ├── /          # GET - List, POST - Create
│   │   │   └── [fieldId]/ # PATCH - Update, DELETE - Remove
│   │   └── knowledge-base/
│   │       ├── /          # GET - List docs, POST - Upload
│   │       └── [docId]/   # GET - Get, PATCH - Update, DELETE
│   ├── invite-member/     # POST - Send invite
│   ├── members/
│   │   ├── /              # GET - List members
│   │   └── [userId]/      # PATCH - Update role, DELETE - Remove
│   └── transfer-ownership/  # POST - Transfer ownership
├── pdf-extract/           # PDF text extraction
│   └── /                  # POST - Extract text from PDF
├── school-districts/      # District lookup
│   └── /                  # GET - Search districts (NCES data)
├── strategic-plan-summarize/  # AI summarization
│   └── /                  # POST - Summarize strategic plan
└── user/                  # User management
    ├── /                  # PATCH - Update user
    ├── me/                # GET - Current user info
    └── set-password/      # POST - Set new password
```

### API Patterns

#### Authentication Pattern
```typescript
// Every protected API route
const supabase = await createClient();
const { data: { user }, error: authError } = await supabase.auth.getUser();

if (authError || !user) {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
```

#### Authorization Pattern
```typescript
// Organization-level authorization
const organization = await prisma.organization.findFirst({
  where: {
    id: organizationId,
    users: { some: { id: user.id } }  // Verify membership
  }
});

if (!organization) {
  return NextResponse.json({ error: "Organization not found" }, { status: 404 });
}

// Role-based authorization
const organization = await prisma.organization.findUnique({
  where: { id },
  select: {
    id: true,
    users: {
      where: {
        id: user.id,
        role: { in: ["ADMIN", "OWNER"] }  // Require elevated role
      }
    }
  }
});

if (organization.users.length === 0) {
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}
```

#### BigInt Serialization Pattern
```typescript
// PostgreSQL BigInt fields cannot be JSON serialized directly
const application = await prisma.application.create({
  data: {
    opportunityTotalFunding: BigInt(1000000)
  }
});

// Serialize before returning
const serialized = {
  ...application,
  opportunityTotalFunding: application.opportunityTotalFunding?.toString() ?? null,
  opportunityAwardMin: application.opportunityAwardMin?.toString() ?? null,
  opportunityAwardMax: application.opportunityAwardMax?.toString() ?? null,
};

return NextResponse.json(serialized);
```

#### Streaming Response Pattern
```typescript
// AI chat endpoints use streaming
const stream = new ReadableStream({
  async start(controller) {
    for await (const chunk of aiResponse) {
      const text = extractContent(chunk);
      controller.enqueue(encoder.encode(text));
    }
    controller.close();
  }
});

return new Response(stream, {
  headers: {
    'Content-Type': 'text/plain; charset=utf-8',
    'Transfer-Encoding': 'chunked',
  }
});
```

---

## 5. Component Architecture

### UI Component Library (shadcn/ui)
**Location:** `src/components/ui/`  
**Count:** 45+ components

**Core Components:**
- **Form Controls:** Button, Input, Textarea, Select, Checkbox, Switch
- **Layout:** Card, Separator, Sheet, Tabs, Collapsible
- **Feedback:** Dialog, Alert, Tooltip, Toast (Sonner), Spinner, Skeleton
- **Data:** Table, Badge, Avatar
- **Navigation:** Breadcrumb, Dropdown Menu, Navigation Menu, Sidebar
- **Custom:** ChatMessage, MessageInput, MessageList, FilePreview, MarkdownRenderer

**Pattern:** All based on Radix UI primitives + Tailwind CSS

### Tiptap Editor Components

#### Tiptap UI Components (`src/components/tiptap-ui/`)
**Count:** 64 files (46 TSX, 17 TS, 1 SCSS)

**Toolbar Components:**
- Text formatting: Bold, Italic, Underline, Strikethrough, Code
- Alignment: Left, Center, Right, Justify
- Typography: Heading levels, Font family, Font size, Text color, Background color
- Lists: Bullet, Numbered, Task list
- Blocks: Blockquote, Code block, Horizontal rule, Page break
- Media: Image upload, Link management
- History: Undo/Redo

**Component Structure:**
```
component-name/
├── component-name.tsx      # UI component
├── use-component-name.ts   # Hook with editor commands
└── index.tsx              # Barrel export
```

**Example Pattern:**
```typescript
// use-bold.ts
export function useBold(editor: Editor | null) {
  const isBold = editor?.isActive('bold') ?? false;
  
  const toggleBold = useCallback(() => {
    if (editor) {
      editor.chain().focus().toggleBold().run();
    }
  }, [editor]);
  
  return { isBold, toggleBold, canToggleBold: editor?.can().toggleBold() };
}

// bold-button.tsx
export function BoldButton({ editor }: Props) {
  const { isBold, toggleBold } = useBold(editor);
  return (
    <Button 
      onClick={toggleBold} 
      variant={isBold ? "default" : "ghost"}
      size="sm"
    >
      <Bold className="w-4 h-4" />
    </Button>
  );
}
```

#### Tiptap Node Extensions (`src/components/tiptap-node/`)
**Custom Nodes:**
- `background-color-node` - Text background highlighting
- `blockquote-node` - Styled blockquotes
- `code-block-node` - Syntax-highlighted code blocks
- `heading-node` - H1-H6 with custom styles
- `horizontal-rule-node` - Page section dividers
- `image-node` - Inline images
- `image-upload-node` - Drag & drop image upload
- `list-node` - Custom list styling
- `page-break-node` - Print page breaks
- `paragraph-node` - Enhanced paragraphs

**Pattern:** Each node has:
- Extension definition (`.ts`)
- SCSS styling (`.scss`)
- React component wrapper (optional)

#### Tiptap Templates
**Simple Editor Template:** Complete editor implementation
- `simple-editor.tsx` - Main editor component
- `simple-menubar.tsx` - Top toolbar
- `simple.scss` - Editor styling
- `simple.json` - Default empty document

### Feature Components

#### Application Components (`src/components/applications/`)
**19 files** - Application management UI

**Key Components:**
- `ApplicationPage.tsx` - Main application view
- `ApplicationsTable.tsx` - Data table with sorting/filtering
- `DocumentEditor.tsx` - Rich text editor integration
- `DocumentList.tsx` - Application documents view
- `GrantInfoCard.tsx` - Grant details display
- `GrantSearchDialog.tsx` - Grant search modal
- `CreateDocumentModal.tsx` - New document creation
- `AddApplicationModal.tsx` - Application creation wizard
- `DocumentAssistantPanel.tsx` - AI assistant sidebar
- `DocumentChatSidebar.tsx` - Document-specific chat
- `StatusSelect.tsx` - Application status dropdown

**Pattern:** Feature-specific components co-located with related logic

#### Sidebar Components (`src/components/sidebar/`)
**11 files** - Application navigation

**Components:**
- `app-sidebar.tsx` - Main sidebar container (shadcn/ui)
- `team-switcher.tsx` - Organization selector
- `nav-main.tsx` - Primary navigation
- `nav-organization.tsx` - Organization links
- `nav-projects.tsx` - Applications/projects list
- `nav-chats.tsx` - AI chat history
- `nav-settings.tsx` - Settings navigation
- `nav-admin.tsx` - System admin panel
- `nav-user.tsx` - User menu
- `dynamic-breadcrumb.tsx` - Route-based breadcrumbs
- `search-chats-modal.tsx` - Chat search

#### Folder/File Management (`src/components/folders/`)
**9 files** - File system UI

**Components:**
- `DocumentsView.tsx` - Main documents view (grid/list)
- `FolderList.tsx` - Folder tree display
- `FolderBreadcrumb.tsx` - Navigation breadcrumbs
- `CreateMenu.tsx` - New folder/document menu
- `MoveModal.tsx` - Move files/folders
- `CopyDialog.tsx` - Copy operations
- `RenameDialog.tsx` - Rename dialog
- `DragDropProvider.tsx` - Drag & drop context
- `FolderIcon.tsx` - Folder icons

---

## 6. Utilities, Helpers & Hooks

### Library Functions (`src/lib/`)

#### Core Utilities
- **`prisma.ts`** - Prisma client singleton
- **`supabaseServer.ts`** - Server-side Supabase client
- **`utils.ts`** - General utilities (cn, formatting)
- **`admin.ts`** - Admin authorization checks
- **`organization.ts`** - Organization queries & access control

#### AI/ML Utilities
- **`ai/agent.ts`** - LangChain agent creation
- **`ai/vector-store.ts`** - Supabase vector search
- **`ai/tools/grant-search-tool.ts`** - LangChain tool for grants
- **`ai/prompts/grants-assistant.ts`** - System prompt builder

#### Document Processing
- **`document-converters.ts`** - Tiptap JSON ↔ DOCX/PDF conversion
- **`fileExtraction.ts`** - Text extraction (PDF, DOCX, TXT)
- **`documentContext.ts`** - Extract document text for AI context
- **`getOrgKnowledgeBase.ts`** - Load org knowledge base for AI
- **`tiptap-utils.ts`** - Tiptap helper functions

#### File Management
- **`folders.ts`** - Folder tree operations, circular reference checks
- **`google-drive.ts`** - Google Drive OAuth & API integration

#### Utilities
- **`email.ts`** - Transactional email sending (Resend)
- **`toast.ts`** - Toast notification helpers
- **`audio-utils.ts`** - Audio recording utilities
- **`token-encryption.ts`** - OAuth token encryption/decryption
- **`chatStorageCleanup.ts`** - Cleanup old chat data
- **`documentStorageCleanup.ts`** - Cleanup old document versions

### Custom Hooks (`src/hooks/`)

**14 React Hooks:**
- **`use-tiptap-editor.ts`** - Access Tiptap editor instance
- **`use-audio-recording.ts`** - Voice recording functionality
- **`use-auto-scroll.ts`** - Auto-scroll behavior
- **`use-autosize-textarea.ts`** - Auto-expanding textarea
- **`use-composed-ref.ts`** - Compose multiple refs
- **`use-copy-to-clipboard.ts`** - Copy text utility
- **`use-cursor-visibility.ts`** - Track cursor in/out of element
- **`use-element-rect.ts`** - Element dimensions/position
- **`use-menu-navigation.ts`** - Keyboard navigation for menus
- **`use-mobile.ts`** - Mobile device detection
- **`use-scrolling.ts`** - Scroll event handling
- **`use-throttled-callback.ts`** - Throttle callback execution
- **`use-unmount.ts`** - Cleanup on unmount
- **`use-window-size.ts`** - Window dimensions

**Hook Pattern:**
```typescript
export function useCustomHook() {
  const [state, setState] = useState();
  
  useEffect(() => {
    // Setup
    return () => {
      // Cleanup
    };
  }, []);
  
  const action = useCallback(() => {
    // Memoized action
  }, [dependencies]);
  
  return { state, action };
}
```

---

## 7. AI Integration & Features

### AI Architecture

#### LangChain Agent System
**Location:** `src/lib/ai/`

```typescript
// Agent Creation Flow
createGrantsAgent(districtInfo, baseUrl)
  ↓
ChatOpenAI (GPT-4o-mini)
  ↓
Tools: [GrantSearchTool]
  ↓
System Prompt (with district context)
  ↓
ReactAgent (invoke/stream methods)
```

**Grant Search Tool:**
```typescript
const tool = new DynamicStructuredTool({
  name: "search_grants",
  description: "Search for grants matching criteria...",
  schema: z.object({
    query: z.string(),
    stateCode: z.string().optional(),
    categories: z.array(z.string()).optional(),
  }),
  func: async ({ query, stateCode, categories }) => {
    // Calls vector store search
    const grants = await searchGrants(query, {
      stateCode,
      category: categories?.[0],
      services: districtInfo?.services
    });
    return JSON.stringify(grants);
  }
});
```

#### RAG System (Retrieval-Augmented Generation)

**Vector Store Setup:**
- **Embeddings:** OpenAI `text-embedding-3-small`
- **Storage:** Supabase Vector Store (pgvector extension)
- **Table:** `documents` table in `public` schema
- **Search:** `match_documents` RPC function

**Embedding Process:**
```typescript
// 1. Grant data is chunked and embedded
const chunks = [
  { content: grant.description, metadata: { opportunity_id, source_field: 'description' } },
  { content: grant.eligibility, metadata: { opportunity_id, source_field: 'eligibility' } }
];

// 2. Embedded and stored
for (const chunk of chunks) {
  const embedding = await embeddings.embed(chunk.content);
  await supabase.from('documents').insert({
    content: chunk.content,
    metadata: chunk.metadata,
    embedding
  });
}

// 3. Semantic search at query time
const results = await vectorStore.similaritySearch(query, topK=10, filters);
```

**Knowledge Base Integration:**
```typescript
// Assistant agent loads org knowledge base
const knowledgeBase = await getActiveKnowledgeBase(organizationId);

// Prepended to user message
const augmentedMessage = `
## Organization Knowledge Base
${knowledgeBase}

## User Question
${userMessage}
`;
```

#### AI Chat Flow

```
User Message
    ↓
Frontend (Chat Component)
    ↓
POST /api/ai/assistant-agent
    ↓
Auth + Fetch Org Data
    ↓
Load Knowledge Base + Source Documents
    ↓
Create LangChain Agent
    ↓
Convert Messages to LangChain Format
    ↓
Agent.stream() with Tools
    ↓
    ├─→ Model generates response
    ├─→ Tool calls (grant search)
    ├─→ Model continues with results
    └─→ Final response
    ↓
Stream to Frontend (SSE)
    ↓
Save to Database (on complete)
```

#### Document Intelligence

**Source Document Context:**
```typescript
// Documents can be attached to chats
const sourceContext = await getSourceDocumentContext(documentIds);

// Extracts text from Tiptap JSON or file metadata
function extractTextFromTipTap(node) {
  if (node.text) return node.text;
  if (node.content) return node.content.map(extractTextFromTipTap).join('');
  return '';
}

// Prepended to user message
const contextualMessage = `
SOURCE DOCUMENTS:

--- Document: Strategic Plan 2024 ---
[Extracted text...]

--- Document: Budget Report ---
[Extracted text...]

## User Question
${userMessage}
`;
```

**File Attachment Processing:**
```typescript
// Text extraction from uploads
const extractedText = await extractTextFromFile(file);

// Stored in document metadata
await prisma.document.create({
  data: {
    fileUrl,
    metadata: {
      extractedText,
      originalFilename: file.name,
      mimeType: file.type
    }
  }
});

// Available to AI in chat
if (message.attachments) {
  for (const attachment of message.attachments) {
    if (attachment.extractedText) {
      augmentedContent += `\n\n[Attached: ${attachment.name}]\n${attachment.extractedText}`;
    }
  }
}
```

#### AI Endpoints

**Assistant Agent** (`/api/ai/assistant-agent`)
- Streaming chat with grant search tool
- Context-aware (org profile, knowledge base, documents)
- Uses GPT-4o-mini via LangChain

**Editor Chat** (`/api/chat/editor`)
- Document-specific AI assistance
- Has access to document content
- Supports file attachments

**Recommendations** (`/api/ai/recommendations`)
- Generate grant recommendations for organization
- Analyzes org profile against grant database
- Returns ranked list with fit scores

**Strategic Plan Summarize** (`/api/strategic-plan-summarize`)
- Summarizes uploaded strategic plans
- Extracts key priorities and goals
- Stores in organization profile

### AI Models Used

| Purpose | Model | Provider | Location |
|---------|-------|----------|----------|
| Chat Assistant | GPT-4o-mini | OpenAI | LangChain agent |
| Embeddings | text-embedding-3-small | OpenAI | Vector store |
| Grant Scraping | Claude 3.5 Sonnet | Anthropic | OpenRouter (backend) |
| Document AI | GPT-4 | OpenAI | Direct API calls |

---

## 8. Authentication & Authorization

### Supabase Authentication

#### Auth Flow
```
1. User enters email/password
    ↓
2. POST /login (Server Action)
    ↓
3. supabase.auth.signInWithPassword()
    ↓
4. Supabase sets auth cookies
    ↓
5. Check Prisma for temp password
    ↓
6. Redirect to /set-password OR /private/[slug]/dashboard
```

#### Session Management
- **Storage:** HTTP-only cookies (automatic by Supabase)
- **Refresh:** Handled by middleware on every request
- **Expiry:** Configurable in Supabase (default: 7 days)
- **Invalidation:** `supabase.auth.signOut()`

#### Protected Routes
```typescript
// Middleware protects ALL routes except:
const publicRoutes = [
  '/login',
  '/register',
  '/auth/*',      // OAuth callbacks
  '/error',
  '/set-password',
  '/'             // Root (redirects if logged in)
];
```

### Role-Based Access Control (RBAC)

#### Role Hierarchy
```
SYSTEM_ADMIN (flag)
    ↓
OWNER > ADMIN > MEMBER
```

**Permissions Matrix:**

| Action | MEMBER | ADMIN | OWNER | SYSTEM_ADMIN |
|--------|--------|-------|-------|--------------|
| View applications | ✓ | ✓ | ✓ | ✓ |
| Create applications | ✓ | ✓ | ✓ | ✓ |
| Edit applications | ✓ | ✓ | ✓ | ✓ |
| Delete applications | ✗ | ✓ | ✓ | ✓ |
| View org profile | ✓ | ✓ | ✓ | ✓ |
| Edit org profile | ✗ | ✓ | ✓ | ✓ |
| Invite members | ✗ | ✓ | ✓ | ✓ |
| Remove members | ✗ | ✓ | ✓ | ✓ |
| Change member roles | ✗ | ✗ | ✓ | ✓ |
| Transfer ownership | ✗ | ✗ | ✓ | ✗ |
| Delete organization | ✗ | ✗ | ✓ | ✓ |
| View all orgs | ✗ | ✗ | ✗ | ✓ |
| Create orgs | ✗ | ✗ | ✗ | ✓ |

#### Authorization Patterns

**Organization Membership Check:**
```typescript
const organization = await prisma.organization.findFirst({
  where: {
    id: organizationId,
    users: {
      some: { id: user.id }
    }
  }
});

if (!organization) {
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}
```

**Role-Based Check:**
```typescript
const user = await prisma.user.findUnique({
  where: { id: userId },
  select: { role: true, organizationId: true }
});

if (!['ADMIN', 'OWNER'].includes(user.role)) {
  return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
}
```

**System Admin Check:**
```typescript
import { requireAdmin } from '@/lib/admin';

export async function DELETE(req: NextRequest) {
  await requireAdmin(); // Throws if not system admin
  // Admin-only logic
}
```

### Onboarding Flow

```
1. Admin creates user account
    ↓
2. User receives email with temp password
    ↓
3. User logs in → hasTemporaryPassword = true
    ↓
4. Redirect to /set-password
    ↓
5. User sets new password
    ↓
6. onboardingCompleted = false → Redirect to /onboarding
    ↓
7. User completes onboarding form
    ↓
8. onboardingCompleted = true → Access app
```

**Layout Guards:**
```typescript
// private/[slug]/layout.tsx
export default async function Layout({ children, params }) {
  const { slug } = await params;
  
  // Check onboarding status
  const user = await prisma.user.findUnique({
    where: { id: currentUserId },
    select: { onboardingCompleted: true }
  });
  
  if (!user.onboardingCompleted && !pathname.includes('/onboarding')) {
    redirect(`/private/${slug}/onboarding`);
  }
  
  return <ConditionalLayout>{children}</ConditionalLayout>;
}
```

### Security Measures

**Input Validation:**
- All API inputs validated with Zod schemas (where applicable)
- Prisma queries use parameterized inputs (SQL injection protection)
- File uploads validated for type and size

**Data Isolation:**
- All queries filtered by `organizationId`
- Middleware verifies organization slug matches user
- API routes verify membership before operations

**Token Security:**
- OAuth tokens encrypted at rest (Google tokens)
- Environment variables for secrets
- No credentials in client-side code

**CORS:**
- API routes use Next.js defaults (same-origin)
- Configured for Supabase domain in image config

---

## 9. Rich Text Editor (Tiptap)

### Editor Architecture

**Tiptap Version:** 3.7.2+  
**Extensions:** 40+ installed

#### Core Editor Setup
```typescript
const editor = useEditor({
  extensions: [
    StarterKit.configure({
      heading: { levels: [1, 2, 3, 4, 5, 6] },
      codeBlock: { HTMLAttributes: { class: 'code-block' } },
    }),
    Color,
    FontFamily,
    FontSize,
    Highlight,
    TextAlign.configure({ types: ['heading', 'paragraph'] }),
    Image,
    HorizontalRule,
    PageBreak,
    Subscript,
    Superscript,
    Typography,
    // Custom extensions...
  ],
  content: initialContent,
  editorProps: {
    attributes: {
      class: 'prose prose-sm max-w-none focus:outline-none'
    }
  },
  onUpdate: ({ editor }) => {
    const json = editor.getJSON();
    onChange(JSON.stringify(json));
  }
});
```

### Custom Extensions

#### Image Upload Extension
```typescript
// Drag & drop image upload
const ImageUpload = Node.create({
  name: 'imageUpload',
  
  addProseMirrorPlugins() {
    return [
      new Plugin({
        props: {
          handleDOMEvents: {
            drop(view, event) {
              const files = event.dataTransfer?.files;
              if (files && files.length > 0) {
                // Upload to Supabase Storage
                uploadImage(files[0]).then(url => {
                  // Insert image node
                  view.dispatch(insertImageNode(url));
                });
              }
            }
          }
        }
      })
    ];
  }
});
```

#### Page Break Extension
```typescript
const PageBreak = Node.create({
  name: 'pageBreak',
  group: 'block',
  
  parseHTML() {
    return [{ tag: 'div.page-break' }];
  },
  
  renderHTML() {
    return ['div', { class: 'page-break' }, '---'];
  },
  
  addCommands() {
    return {
      setPageBreak: () => ({ commands }) => {
        return commands.insertContent({ type: this.name });
      }
    };
  }
});
```

### Content Format

**Storage:** JSON (Tiptap native format)

```json
{
  "type": "doc",
  "content": [
    {
      "type": "heading",
      "attrs": { "level": 1 },
      "content": [{ "type": "text", "text": "Document Title" }]
    },
    {
      "type": "paragraph",
      "content": [
        { "type": "text", "text": "Regular text " },
        { 
          "type": "text", 
          "text": "bold text",
          "marks": [{ "type": "bold" }]
        }
      ]
    },
    {
      "type": "image",
      "attrs": {
        "src": "https://...",
        "alt": "Image description"
      }
    }
  ]
}
```

### Export Capabilities

#### DOCX Export
```typescript
import { Document, Packer, Paragraph, TextRun } from 'docx';

function convertTiptapToDocx(tiptapJson) {
  const doc = new Document({
    sections: [{
      children: tiptapJson.content.map(node => {
        if (node.type === 'heading') {
          return new Paragraph({
            text: extractText(node),
            heading: `Heading${node.attrs.level}`
          });
        }
        if (node.type === 'paragraph') {
          return new Paragraph({
            children: convertInlineContent(node.content)
          });
        }
        // ... other node types
      })
    }]
  });
  
  return Packer.toBlob(doc);
}
```

#### PDF Export
```typescript
import { PDFDocument } from 'pdf-lib';

async function convertTiptapToPdf(tiptapJson) {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage();
  
  let yPosition = page.getHeight() - 50;
  
  for (const node of tiptapJson.content) {
    const text = extractText(node);
    page.drawText(text, {
      x: 50,
      y: yPosition,
      size: getFontSize(node)
    });
    yPosition -= getLineHeight(node);
  }
  
  return pdfDoc.save();
}
```

### Auto-Save Implementation

```typescript
// DocumentEditor.tsx
const [content, setContent] = useState(initialContent);
const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
const lastSavedContentRef = useRef(content);

useEffect(() => {
  // Clear existing timeout
  if (autoSaveTimeoutRef.current) {
    clearTimeout(autoSaveTimeoutRef.current);
  }
  
  // Skip if no changes
  if (content === lastSavedContentRef.current) return;
  
  // Set unsaved status
  setSaveStatus('unsaved');
  
  // Auto-save after 2 seconds of inactivity (Google Docs pattern)
  autoSaveTimeoutRef.current = setTimeout(() => {
    handleSave();
  }, 2000);
  
  return () => {
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }
  };
}, [content]);

const handleSave = async () => {
  setSaveStatus('saving');
  await onSave(content);
  lastSavedContentRef.current = content;
  setSaveStatus('saved');
};
```

### Collaboration Features (Not Yet Implemented)
- Real-time collaboration (Yjs + Supabase Realtime)
- Comments and suggestions
- Version history
- Conflict resolution

---

## 10. Configuration & Environment

### Environment Variables Required

#### Supabase (Authentication & Database)
```bash
NEXT_PUBLIC_SUPABASE_URL=https://[project].supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=eyJhbGc...
DATABASE_URL=postgresql://postgres:[password]@[host]:5432/postgres
INTERNAL_API_KEY=[random-secret-key]
```

#### OpenAI (AI Features)
```bash
OPENAI_API_KEY=sk-...
```

#### Google Cloud (Drive Integration)
```bash
GOOGLE_CLOUD_CLIENT_ID=[client-id].apps.googleusercontent.com
GOOGLE_CLOUD_CLIENT_SECRET=[client-secret]
```

#### Email (Resend)
```bash
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=noreply@grantware.ai
```

#### Firecrawl (Web Scraping)
```bash
FIRECRAWL_API_KEY=fc-...
```

#### Python Backend
```bash
OPENROUTER_API_KEY=sk-or-...
OPENROUTER_MODEL=anthropic/claude-3.5-sonnet:beta
```

### Build Configuration

#### Next.js Config (`next.config.ts`)
```typescript
const nextConfig: NextConfig = {
  images: {
    domains: ["oetxbwjdxhcryqkdfdpr.supabase.co"],  // Supabase Storage
  },
};
```

#### TypeScript Config (`tsconfig.json`)
```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "strict": true,
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

#### Tailwind CSS Config (`tailwind.config.js`)
- Tailwind v4 (latest)
- Uses `@tailwindcss/postcss` plugin
- Configuration via CSS imports

#### Prisma Config
```prisma
generator client {
  provider      = "prisma-client-js"
  output        = "../src/generated/prisma"
  binaryTargets = ["native", "rhel-openssl-3.0.x"]  // For deployment
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  schemas  = ["app", "public"]
}
```

### Package Scripts

#### Webapp (`webapp/package.json`)
```json
{
  "scripts": {
    "dev": "next dev --turbopack",
    "build": "next build --turbopack",
    "start": "next start",
    "lint": "eslint"
  }
}
```

#### Backend (Python)
```bash
# Development
python -m backend.flask_server

# Database migrations
alembic upgrade head
alembic revision --autogenerate -m "description"

# Grant scraping
python backend/scripts/scraping_agent.py
python backend/scripts/fetch_all_grants.sh
```

---

## 11. Critical Insights

### System Strengths

1. **Well-Structured Multi-Tenancy**
   - Clean organization-based data isolation
   - Slug-based routing for excellent UX
   - Proper access control at all layers

2. **Modern Stack Choices**
   - Next.js 15 with App Router (cutting edge)
   - Prisma ORM (type-safe database access)
   - Supabase Auth (robust, scalable)
   - Tailwind v4 (latest styling)

3. **Comprehensive AI Integration**
   - LangChain agents with tools
   - RAG system with vector search
   - Document intelligence
   - Organization-specific context

4. **Rich Text Editor**
   - 40+ Tiptap extensions
   - Custom nodes for specialized content
   - Export to DOCX/PDF
   - Auto-save implementation

5. **Feature Completeness**
   - Full CRUD for all entities
   - Google Drive integration
   - File management system
   - AI chat with context

### Areas for Improvement

#### Performance
1. **Database Query Optimization**
   - Some queries lack proper indexes
   - N+1 query patterns in some list views
   - Consider pagination for large datasets

2. **Bundle Size**
   - Large Tiptap bundle (consider code splitting)
   - Many dependencies (regular audit needed)

3. **Caching Strategy**
   - Opportunity for React Query or SWR
   - Static page generation where possible
   - Edge caching for public content

#### Code Quality
1. **Type Safety**
   - Some `any` types in utility functions
   - API response types could be more strict
   - Consider Zod for runtime validation

2. **Error Handling**
   - Inconsistent error handling patterns
   - Some try-catch blocks swallow errors
   - Need global error boundary

3. **Testing**
   - No test suite found
   - Critical paths should have integration tests
   - API endpoints need contract tests

#### Architecture
1. **API Layer**
   - Some business logic in API routes (should be in lib/)
   - Consider service layer abstraction
   - API response formatting could be standardized

2. **State Management**
   - Document context could be more robust
   - Consider using React Query for server state
   - Some prop drilling in deep component trees

3. **Documentation**
   - API documentation needed (OpenAPI/Swagger)
   - Component Storybook would help
   - Inline documentation is good but inconsistent

#### Security
1. **Input Validation**
   - Not all API endpoints validate inputs thoroughly
   - Need consistent validation library (Zod)
   - File upload validation could be stricter

2. **Rate Limiting**
   - No rate limiting on API endpoints
   - AI endpoints could be expensive to abuse
   - Consider implementing rate limiting middleware

3. **Audit Logging**
   - No audit trail for sensitive operations
   - Should log org changes, role changes, etc.
   - Compliance requirement for some industries

### Technical Debt

1. **Legacy Code**
   - `/api/chat/editor` vs `/api/chats/editor` (duplicate endpoints)
   - Some unused dependencies in package.json
   - Old migration files could be squashed

2. **Inconsistencies**
   - Mix of `function` and arrow function declarations
   - Inconsistent async/await vs Promise.then()
   - File naming conventions vary

3. **Scalability Concerns**
   - Vector search could be slow with 100K+ grants
   - No job queue for background tasks
   - File uploads directly to Supabase (consider CDN)

### Recommended Next Steps

#### Short Term (1-2 weeks)
1. Add comprehensive error boundaries
2. Implement input validation with Zod
3. Add indexes to frequently queried fields
4. Set up basic integration tests
5. Document API endpoints

#### Medium Term (1-2 months)
1. Refactor API routes to use service layer
2. Implement rate limiting
3. Add audit logging
4. Optimize bundle size (code splitting)
5. Add React Query for server state
6. Implement pagination for large lists

#### Long Term (3-6 months)
1. Build comprehensive test suite
2. Add real-time collaboration features
3. Implement job queue (Bull/BullMQ)
4. Add observability (DataDog, Sentry)
5. Build admin dashboard analytics
6. Consider microservices for grant scraping

---

## 12. Integration Points

### External Service Dependencies

```
GrantWare AI
    │
    ├─→ Supabase
    │   ├─ Auth (user management)
    │   ├─ PostgreSQL (database)
    │   ├─ Storage (file uploads)
    │   └─ Vector Store (pgvector)
    │
    ├─→ OpenAI
    │   ├─ GPT-4o-mini (chat)
    │   ├─ GPT-4 (document AI)
    │   └─ text-embedding-3-small (embeddings)
    │
    ├─→ Anthropic (via OpenRouter)
    │   └─ Claude 3.5 Sonnet (grant scraping)
    │
    ├─→ Google Cloud
    │   ├─ OAuth 2.0 (authentication)
    │   ├─ Drive API (file access)
    │   └─ Docs API (document export)
    │
    ├─→ Firecrawl
    │   └─ Web scraping service
    │
    └─→ Resend
        └─ Transactional email
```

### Internal Data Flow

```
User Action (Browser)
    ↓
Next.js Frontend
    ↓
Middleware (Auth Check)
    ↓
API Route / Server Component
    │
    ├─→ Supabase Auth (user context)
    │
    ├─→ Prisma ORM
    │   └─→ PostgreSQL
    │       ├─ app schema (application data)
    │       └─ public schema (grants, vectors)
    │
    ├─→ AI Services (when needed)
    │   ├─ LangChain Agent
    │   ├─ Vector Store Search
    │   └─ OpenAI API
    │
    └─→ External APIs (when needed)
        ├─ Google Drive
        ├─ Firecrawl
        └─ Resend
    ↓
Response (JSON/Stream)
    ↓
Frontend Update
```

### Backend Integration

```
Python Backend (Flask)
    │
    ├─ Grant Scraping Scripts
    │   ├─ Fetch from sources
    │   ├─ AI extraction (Claude)
    │   └─ Insert to PostgreSQL (public.opportunities)
    │
    └─ Connected to:
        ├─ PostgreSQL (direct, via SQLAlchemy)
        ├─ OpenRouter (Claude API)
        └─ Various grant websites
```

**Communication:**
- Backend is independent service
- Writes directly to `public.opportunities` table
- Frontend reads from same database
- No direct API communication between services

---

## 13. Key Patterns & Conventions

### Naming Conventions

**Files:**
- Components: PascalCase (`DocumentEditor.tsx`)
- Utilities: camelCase (`getOrgKnowledgeBase.ts`)
- API routes: kebab-case directories (`/api/grant-bookmarks`)
- Hooks: camelCase with `use` prefix (`useAutoScroll.ts`)
- Types: PascalCase (`Application.ts`)

**Variables:**
- Components: PascalCase
- Functions: camelCase
- Constants: UPPER_SNAKE_CASE
- Database fields: camelCase (Prisma), snake_case (SQL)

### Code Organization

**Co-location Pattern:**
```
features/applications/
├── ApplicationPage.tsx
├── ApplicationsTable.tsx
├── columns.tsx          # Table column definitions
├── StatusSelect.tsx
└── editor-overrides.css # Feature-specific styles
```

**Barrel Exports:**
```typescript
// components/ui/index.ts
export * from './button';
export * from './input';
export * from './card';
```

### Async/Await Pattern
```typescript
// Preferred pattern throughout codebase
export async function createApplication(data: CreateApplicationData) {
  try {
    const application = await prisma.application.create({ data });
    return { success: true, application };
  } catch (error) {
    console.error("Error creating application:", error);
    return { success: false, error: "Failed to create application" };
  }
}
```

### API Response Pattern
```typescript
// Success
return NextResponse.json({ data: result }, { status: 200 });

// Error
return NextResponse.json({ error: "Error message" }, { status: 400 });

// Created
return NextResponse.json({ data: created }, { status: 201 });
```

### Component Pattern
```typescript
// Server Component (default)
export default async function Page({ params }: Props) {
  const data = await fetchData(params.id);
  return <UI data={data} />;
}

// Client Component
"use client";

export function InteractiveComponent({ initialData }: Props) {
  const [data, setData] = useState(initialData);
  
  const handleAction = async () => {
    const response = await fetch('/api/endpoint', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    const result = await response.json();
    setData(result);
  };
  
  return <button onClick={handleAction}>Action</button>;
}
```

---

## Conclusion

GrantWare AI is a sophisticated, well-architected SaaS application that effectively combines modern web technologies with advanced AI capabilities. The codebase demonstrates:

- **Strong foundations** in Next.js App Router, Prisma, and Supabase
- **Comprehensive AI integration** with RAG, vector search, and LangChain agents
- **Rich feature set** including document editing, file management, and collaboration tools
- **Multi-tenant architecture** with proper data isolation and RBAC

The system is production-ready with room for optimization in performance, testing, and scalability. The modular architecture and clear patterns make it maintainable and extensible for future development.

**This analysis serves as the definitive technical reference for all future development work on the GrantWare AI platform.**

---

**Document Version:** 1.0  
**Last Updated:** November 25, 2025  
**Next Review:** As needed for major architectural changes

