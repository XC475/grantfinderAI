# GrantWare AI

**AI-powered grant discovery and management platform for organizations to win more funding.**

GrantWare AI helps K-12 school districts, nonprofits, higher education institutions, and government agencies discover, evaluate, and manage grant opportunities using advanced AI assistants.

---

## 📋 Table of Contents

- [Technology Stack](#-technology-stack)
- [Architecture Overview](#-architecture-overview)
- [Project Structure](#-project-structure)
- [App Pages Structure](#-app-pages-structure)
- [API Endpoints Structure](#-api-endpoints-structure)
- [Database Schema](#-database-schema)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)

---

## 🛠 Technology Stack

| Layer | Technologies |
|-------|-------------|
| **Frontend** | Next.js 15 (App Router), React 19, TypeScript |
| **Styling** | Tailwind CSS 4, SCSS modules, shadcn/ui |
| **Animation** | Framer Motion, tw-animate-css |
| **Editor** | Tiptap with custom extensions |
| **Backend** | Next.js API Routes, Server Components |
| **Database** | PostgreSQL with Prisma ORM (multi-schema) |
| **Authentication** | Supabase Auth (SSR) |
| **AI/ML** | LangChain, OpenAI (GPT-4o-mini), RAG with pgvector |
| **Storage** | Supabase Storage |
| **Email** | Resend |

---

## 🏗 Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                           Client Browser                             │
├─────────────────────────────────────────────────────────────────────┤
│                    Next.js App Router (React 19)                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────┐   │
│  │ Server       │  │ Client       │  │ API Routes               │   │
│  │ Components   │  │ Components   │  │ /api/*                   │   │
│  └──────┬───────┘  └──────┬───────┘  └──────────┬───────────────┘   │
├─────────┴─────────────────┴─────────────────────┴───────────────────┤
│                         Middleware Layer                             │
│                    (Supabase Session Management)                     │
├─────────────────────────────────────────────────────────────────────┤
│                         Service Layer                                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────┐   │
│  │ Prisma ORM   │  │ Supabase     │  │ AI Services              │   │
│  │ (PostgreSQL) │  │ (Auth/Store) │  │ (LangChain/OpenAI)       │   │
│  └──────────────┘  └──────────────┘  └──────────────────────────┘   │
├─────────────────────────────────────────────────────────────────────┤
│                         Database Layer                               │
│  ┌─────────────────────────┐  ┌─────────────────────────────────┐   │
│  │ app schema              │  │ public schema                   │   │
│  │ - users                 │  │ - opportunities (grants)        │   │
│  │ - organizations         │  │ - k12_education_opportunities   │   │
│  │ - applications          │  │ - documents (vector store)      │   │
│  │ - documents             │  │                                 │   │
│  │ - document_vectors      │  │                                 │   │
│  │ - ai_chats              │  │                                 │   │
│  │ - folders               │  │                                 │   │
│  └─────────────────────────┘  └─────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

### Key Architectural Patterns

- **Server Components First**: Data fetching in Server Components, Client Components only for interactivity
- **Multi-tenancy**: Organization-based data isolation via URL slugs (`/private/[slug]/*`)
- **RBAC**: Role-based access control (OWNER, ADMIN, MEMBER)
- **RAG Pipeline**: Document vectorization with semantic search for AI context
- **Streaming Responses**: LangChain agent with real-time token streaming

---

## 📁 Project Structure

```
grantfinderAI/
├── webapp/                          # Main Next.js application
│   ├── prisma/
│   │   ├── schema.prisma            # Database schema (source of truth)
│   │   └── migrations/              # Database migrations
│   ├── public/                      # Static assets
│   ├── src/
│   │   ├── app/                     # Next.js App Router
│   │   │   ├── api/                 # API route handlers
│   │   │   ├── private/[slug]/      # Authenticated org pages
│   │   │   ├── login/               # Authentication pages
│   │   │   ├── register/
│   │   │   └── set-password/
│   │   ├── components/              # React components
│   │   │   ├── ui/                  # shadcn/ui primitives (47 components)
│   │   │   ├── chat/                # AI chat interface
│   │   │   ├── applications/        # Application management
│   │   │   ├── sidebar/             # Navigation
│   │   │   ├── tiptap-*/            # Editor components
│   │   │   └── knowledge-base/      # KB management
│   │   ├── lib/                     # Utility libraries
│   │   │   ├── ai/                  # AI agent, prompts, tools
│   │   │   ├── prisma.ts            # Prisma client singleton
│   │   │   └── organization.ts      # Org utilities
│   │   ├── hooks/                   # Custom React hooks
│   │   ├── contexts/                # React contexts
│   │   ├── utils/                   # Utility functions
│   │   │   └── supabase/            # Supabase client utilities
│   │   └── generated/               # Prisma generated types
│   ├── package.json
│   └── tsconfig.json
├── prompt.md                        # AI assistant system prompt
└── README.md                        # This file
```

---

## 📱 App Pages Structure

```
/                                    # Login page (redirect if authenticated)
├── /login                           # User login
├── /register                        # User registration
├── /set-password                    # Password setup (invited users)
│
└── /private/[slug]/                 # Authenticated organization routes
    ├── /dashboard                   # Main dashboard with activity & apps
    ├── /chat                        # AI assistant chat interface
    ├── /grants                      # Grant discovery & search
    │   └── /[grantId]               # Single grant detail view
    ├── /applications                # Application management
    │   └── /[applicationId]         # Single application workspace
    ├── /documents                   # Document browser & knowledge base
    │   └── /[[...folderPath]]       # Nested folder navigation
    ├── /editor/[documentId]         # Tiptap document editor
    ├── /file-viewer/[documentId]    # File preview (PDFs, etc.)
    ├── /onboarding                  # New user onboarding flow
    ├── /settings/
    │   ├── /account                 # User account settings
    │   ├── /ai                      # AI context & capabilities
    │   ├── /profile                 # Organization profile
    │   ├── /team                    # Team member management
    │   └── /documents               # Document settings
    └── /admin/
        └── /users                   # System admin: user management
```

---

## 🔌 API Endpoints Structure

### Authentication & User
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/user/me` | Get current authenticated user |
| PUT | `/api/user` | Update user profile |
| POST | `/api/user/set-password` | Set user password |

### Organizations
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/organizations` | Get user's organization |
| PUT | `/api/organizations/[id]` | Update organization |
| GET | `/api/organizations/members` | List org members |
| DELETE | `/api/organizations/members/[userId]` | Remove member |
| POST | `/api/organizations/invite-member` | Invite new member |
| POST | `/api/organizations/transfer-ownership` | Transfer ownership |

### Grants
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/grants` | List all grants |
| GET | `/api/grants/search` | Search grants with filters |
| GET | `/api/grants/filters` | Get available filter options |
| GET | `/api/grants/[grantId]` | Get single grant details |
| POST | `/api/grants/[grantId]/bookmark` | Toggle bookmark |
| POST | `/api/grants/vectorize` | Vectorize grants for AI |
| GET | `/api/grants/vectorize/status` | Check vectorization status |

### Applications
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/applications` | List user's applications |
| POST | `/api/applications` | Create new application |
| GET | `/api/applications/[id]` | Get application details |
| PUT | `/api/applications/[id]` | Update application |
| DELETE | `/api/applications/[id]` | Delete application |
| POST | `/api/applications/[id]/copy` | Duplicate application |
| GET | `/api/applications/[id]/documents` | List app documents |
| POST | `/api/applications/[id]/documents` | Add document to app |

### Documents
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/documents` | List documents (paginated) |
| POST | `/api/documents` | Create new document |
| GET | `/api/documents/[id]` | Get document |
| PUT | `/api/documents/[id]` | Update document |
| DELETE | `/api/documents/[id]` | Delete document |
| POST | `/api/documents/upload` | Upload file document |
| POST | `/api/documents/vectorize` | Trigger vectorization |
| POST | `/api/documents/[id]/move` | Move to folder |
| POST | `/api/documents/[id]/copy` | Copy document |
| POST | `/api/documents/[id]/export` | Export to file |
| POST | `/api/documents/bulk-update` | Bulk update docs |

### Document Tags
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/document-tags` | List org's document tags |
| POST | `/api/document-tags` | Create new tag |
| PUT | `/api/document-tags/[id]` | Update tag |
| DELETE | `/api/document-tags/[id]` | Delete tag |

### Folders
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/folders` | List folders |
| POST | `/api/folders` | Create folder |
| GET | `/api/folders/[id]` | Get folder |
| PUT | `/api/folders/[id]` | Update folder |
| DELETE | `/api/folders/[id]` | Delete folder |
| POST | `/api/folders/[id]/move` | Move folder |
| POST | `/api/folders/[id]/copy` | Copy folder |
| GET | `/api/folders/path/[id]` | Get folder breadcrumb |

### AI & Chat
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/ai/assistant-agent` | Stream AI assistant response |
| GET | `/api/ai/recommendations` | Get grant recommendations |
| GET | `/api/chats` | List user's chats |
| POST | `/api/chats` | Create new chat |
| GET | `/api/chats/[id]` | Get chat with messages |
| DELETE | `/api/chats/[id]` | Delete chat |
| PUT | `/api/chats/[id]/title` | Update chat title |
| POST | `/api/chat/upload` | Upload chat attachments |

### Google Drive Integration
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/google-drive/auth` | Initiate OAuth flow |
| GET | `/api/google-drive/callback` | OAuth callback |
| GET | `/api/google-drive/status` | Check connection status |
| POST | `/api/google-drive/disconnect` | Disconnect account |
| POST | `/api/google-drive/import` | Import from Drive |
| POST | `/api/google-drive/export` | Export to Drive |
| POST | `/api/google-drive/download` | Download file |

### Bookmarks
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/bookmarks` | List bookmarked grants |

### Admin (System Admins Only)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/users` | List all users |
| PUT | `/api/admin/users/[id]` | Update user |
| DELETE | `/api/admin/users/[id]` | Delete user |
| GET | `/api/admin/organizations` | List all organizations |

### Utilities
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/activity/recent` | Get recent activity |
| GET | `/api/school-districts` | Search school districts |
| POST | `/api/strategic-plan-summarize` | AI summarize strategic plan |
| POST | `/api/firecrawl` | Web scraping utility |
| POST | `/api/pdf-extract` | Extract text from PDF |

---

## 🗄 Database Schema

### Core Models (app schema)

| Model | Description |
|-------|-------------|
| `User` | User accounts with org membership, Google OAuth tokens |
| `Organization` | Multi-tenant orgs with profile, K-12/nonprofit data |
| `Application` | Grant applications with embedded opportunity data |
| `Document` | Documents with Tiptap content, vectorization status |
| `DocumentVector` | Chunked embeddings for RAG (pgvector) |
| `DocumentTag` | Custom document categorization |
| `Folder` | Hierarchical file organization |
| `AiChat` | Chat sessions by context type |
| `AiChatMessage` | Chat message history |
| `GrantBookmark` | Saved grants |
| `GrantEligibilityAnalysis` | AI-generated fit analysis |
| `CustomField` | Organization custom fields |

### Grant Models (public schema)

| Model | Description |
|-------|-------------|
| `opportunities` | Grant opportunities from external sources |
| `k12_education_opportunities` | K-12 specific grant metadata |
| `VectorDocument` | Legacy vector storage |

---

## 🚀 Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL 15+ with pgvector extension
- Supabase project (Auth + Storage)
- OpenAI API key

### Installation

```bash
# Clone and navigate
cd webapp

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your credentials

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Start development server
npm run dev
```

---

## 🔐 Environment Variables

```env
# Database
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."

# Supabase
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY="your-anon-key"

# OpenAI
OPENAI_API_KEY="sk-..."

# Google OAuth (optional)
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."

# Email (Resend)
RESEND_API_KEY="re_..."

# Internal
INTERNAL_API_KEY="your-internal-key"
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
```

---

## 📚 Additional Documentation

- **Frontend Setup**: See [`webapp/src/app/README.md`](webapp/src/app/README.md)
- **API Documentation**: See [`webapp/src/app/api/README.md`](webapp/src/app/api/README.md)
- **Codebase Analysis**: See [`webapp/CODEBASE_ANALYSIS.md`](webapp/CODEBASE_ANALYSIS.md)
- **Knowledge Base**: See [`webapp/KNOWLEDGE_BASE_DOCUMENTATION.md`](webapp/KNOWLEDGE_BASE_DOCUMENTATION.md)

---

## 📄 License

Proprietary - GrantWare AI © 2025
