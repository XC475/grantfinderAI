# GrantWare AI - Frontend Architecture

This document describes the frontend structure, routing patterns, and component organization for the GrantWare AI Next.js application.

---

## 📋 Table of Contents

- [Overview](#overview)
- [App Router Structure](#app-router-structure)
- [Page Hierarchy](#page-hierarchy)
- [Authentication Flow](#authentication-flow)
- [Layouts & Providers](#layouts--providers)
- [Component Architecture](#component-architecture)
- [Styling System](#styling-system)
- [State Management](#state-management)
- [Key Patterns](#key-patterns)

---

## Overview

GrantWare AI uses **Next.js 15 App Router** with React 19, following a Server Components-first architecture. The application is multi-tenant, with organizations accessed via URL slugs (`/private/[slug]/*`).

### Key Technologies

| Technology | Purpose |
|------------|---------|
| Next.js 15 | App Router, Server Components, API Routes |
| React 19 | UI library with concurrent features |
| TypeScript | Type safety throughout |
| Tailwind CSS 4 | Utility-first styling |
| shadcn/ui | UI component primitives |
| Tiptap | Rich text editor |
| Framer Motion | Animations |

---

## App Router Structure

```
src/app/
├── layout.tsx              # Root layout (fonts, providers, toaster)
├── page.tsx                # Home/Login page
├── globals.css             # Global styles & CSS variables
├── favicon.ico
│
├── login/
│   ├── page.tsx            # Login page
│   └── actions.ts          # Server actions for login
│
├── register/
│   ├── page.tsx            # Registration page
│   └── actions.ts          # Server actions for registration
│
├── set-password/
│   └── page.tsx            # Password setup (invited users)
│
├── auth/
│   └── confirm/
│       └── route.ts        # Email confirmation handler
│
├── simple/
│   └── page.tsx            # Simple/minimal page template
│
├── private/[slug]/         # 🔒 AUTHENTICATED ROUTES
│   ├── layout.tsx          # Organization layout with sidebar
│   │
│   ├── dashboard/
│   │   └── page.tsx        # Main dashboard
│   │
│   ├── chat/
│   │   └── page.tsx        # AI assistant chat
│   │
│   ├── grants/
│   │   ├── page.tsx        # Grant search & discovery
│   │   └── [grantId]/
│   │       └── page.tsx    # Grant detail view
│   │
│   ├── applications/
│   │   ├── page.tsx        # Applications list
│   │   └── [applicationId]/
│   │       └── page.tsx    # Application workspace
│   │
│   ├── documents/
│   │   └── [[...folderPath]]/
│   │       └── page.tsx    # Document browser (catch-all)
│   │
│   ├── editor/
│   │   └── [documentId]/
│   │       └── page.tsx    # Tiptap document editor
│   │
│   ├── file-viewer/
│   │   └── [documentId]/
│   │       └── page.tsx    # File preview (PDFs, images)
│   │
│   ├── onboarding/
│   │   └── page.tsx        # New user onboarding
│   │
│   ├── settings/
│   │   ├── page.tsx        # Settings overview
│   │   ├── account/
│   │   │   └── page.tsx    # User account settings
│   │   ├── ai/
│   │   │   └── page.tsx    # AI context settings
│   │   ├── profile/
│   │   │   └── page.tsx    # Organization profile
│   │   ├── team/
│   │   │   └── page.tsx    # Team management
│   │   └── documents/
│   │       └── page.tsx    # Document/KB settings
│   │
│   └── admin/
│       └── users/
│           └── page.tsx    # System admin: users
│
└── api/                    # API routes (see api/README.md)
```

---

## Page Hierarchy

### Public Pages (Unauthenticated)

| Route | Component | Description |
|-------|-----------|-------------|
| `/` | `page.tsx` | Home page (redirects to dashboard if logged in) |
| `/login` | `login/page.tsx` | User login form |
| `/register` | `register/page.tsx` | User registration |
| `/set-password` | `set-password/page.tsx` | Password setup for invited users |

### Private Pages (Authenticated)

All routes under `/private/[slug]/` require authentication and organization access.

| Route | Component | Features |
|-------|-----------|----------|
| `/dashboard` | Dashboard with feature cards, recent activity, applications table |
| `/chat` | AI assistant with streaming responses, file attachments, source documents |
| `/grants` | Grant search with filters, pagination, bookmarking |
| `/grants/[id]` | Grant detail with eligibility analysis, apply action |
| `/applications` | Applications table with status filters, bulk actions |
| `/applications/[id]` | Application workspace with documents, AI chat |
| `/documents` | File browser with folders, tags, knowledge base toggle |
| `/editor/[id]` | Tiptap editor with auto-save, outline, AI assistance |
| `/settings/*` | User and organization settings |
| `/admin/users` | System admin user management (system_admin only) |

---

## Authentication Flow

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   middleware.ts │ ──► │  updateSession  │ ──► │  Route Handler  │
│  (all requests) │     │ (Supabase SSR)  │     │  or Page        │
└─────────────────┘     └─────────────────┘     └─────────────────┘
         │                      │                        │
         ▼                      ▼                        ▼
  Check API key         Refresh cookies          Verify org access
  (server-to-server)    Get user session         Render content
```

### Middleware (`src/middleware.ts`)

```typescript
// Key responsibilities:
// 1. API key auth for server-to-server requests
// 2. Supabase session refresh on every request
// 3. Redirect unauthenticated users to /login
// 4. Verify organization slug access for /private/[slug]/*
```

### Protected Routes

The middleware automatically protects all routes except:
- `/login`
- `/register`
- `/auth/*`
- `/error`
- `/set-password`
- `/` (root)

---

## Layouts & Providers

### Root Layout (`layout.tsx`)

```tsx
// Provides:
// - Google fonts (Source Serif 4, Geist Mono)
// - Theme provider (next-themes)
// - Toast notifications (Sonner)
// - Toast handler for URL-based toasts

<html>
  <body>
    <Providers>
      <ToastHandler />
      {children}
      <Toaster />
    </Providers>
  </body>
</html>
```

### Organization Layout (`private/[slug]/layout.tsx`)

```tsx
// Provides:
// - Supabase session verification
// - Onboarding redirect check
// - ConditionalLayout with sidebar
// - Organization context

<ConditionalLayout organizationSlug={slug}>
  {children}
</ConditionalLayout>
```

### Context Providers

| Context | Location | Purpose |
|---------|----------|---------|
| `ThemeProvider` | `providers.tsx` | Dark/light mode |
| `DocumentContext` | `contexts/` | Document title, content, save status |
| `EditorInstanceContext` | `contexts/` | Tiptap editor instance sharing |
| `HeaderContentContext` | `contexts/` | Dynamic header content |
| `OutlineContext` | `contexts/` | Document outline state |

---

## Component Architecture

### Component Organization

```
src/components/
├── ui/                     # shadcn/ui primitives (47 components)
│   ├── button.tsx
│   ├── card.tsx
│   ├── chat.tsx            # Chat container & forms
│   ├── chat-message.tsx    # Message rendering
│   ├── message-input.tsx   # Chat input with attachments
│   ├── sidebar.tsx         # Sidebar primitives
│   └── ...
│
├── chat/                   # Chat feature components
│   ├── Chat.tsx            # Main chat component
│   ├── ChatGreeting.tsx    # Welcome message
│   └── SourcesModal.tsx    # Document sources picker
│
├── applications/           # Application management
│   ├── ApplicationsTable.tsx
│   ├── AddApplicationModal.tsx
│   ├── DocumentEditor.tsx  # Tiptap wrapper
│   └── ...
│
├── sidebar/                # Navigation
│   ├── app-sidebar.tsx     # Main sidebar component
│   ├── nav-main.tsx        # Main navigation
│   ├── nav-chats.tsx       # Chat history
│   ├── nav-settings.tsx    # Settings navigation
│   └── nav-user.tsx        # User menu
│
├── knowledge-base/         # KB management
│   ├── KnowledgeBase.tsx
│   ├── KnowledgeBaseTagList.tsx
│   └── AddDocumentsModal.tsx
│
├── tiptap-*/               # Editor ecosystem
│   ├── tiptap-templates/   # Editor templates
│   ├── tiptap-ui/          # Editor UI components
│   ├── tiptap-ui-primitive/# Low-level editor UI
│   ├── tiptap-node/        # Custom node extensions
│   ├── tiptap-extensions/  # Tiptap extensions
│   └── tiptap-icons/       # Editor icons
│
├── grants/                 # Grant components
│   └── GrantCard.tsx
│
├── folders/                # Folder management
│   └── ...
│
└── dashboard/              # Dashboard components
    └── FeatureCards.tsx
```

### Server vs Client Components

**Server Components (default)**:
- Data fetching with Prisma
- Static rendering
- No client-side interactivity

**Client Components (`'use client'`)**:
- Interactive UI (forms, modals)
- Browser APIs
- React hooks (useState, useEffect)
- Event handlers

```tsx
// Pattern: Server Component with Client child
// page.tsx (Server)
export default async function Page() {
  const data = await prisma.query();  // Server-side fetch
  return <ClientComponent data={data} />;
}

// ClientComponent.tsx
'use client';
export function ClientComponent({ data }) {
  const [state, setState] = useState();  // Client-side state
  // ...
}
```

---

## Styling System

### Tailwind CSS 4 Configuration

```css
/* globals.css */
@import "tailwindcss";
@import "tw-animate-css";

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --font-sans: var(--font-source-serif);
  /* ... CSS variable mappings */
}
```

### Color Palette

The app uses OKLCH color space for perceptually uniform colors:

```css
:root {
  /* Warm oatmeal/off-white backgrounds (Claude/Perplexity inspired) */
  --background: oklch(0.975 0.005 85);
  --foreground: oklch(0.2 0.01 60);
  --card: oklch(0.995 0.003 85);
  --primary: oklch(0.25 0.015 60);
  /* ... */
}

.dark {
  --background: oklch(0.145 0 0);
  --foreground: oklch(0.985 0 0);
  /* ... */
}
```

### Typography

- **Primary**: Source Serif 4 (body text, headings)
- **Monospace**: Geist Mono (code blocks)

---

## State Management

### URL State

```tsx
// Search params for filters, pagination
const searchParams = useSearchParams();
const page = searchParams.get('page');
const filter = searchParams.get('filter');
```

### React Context

```tsx
// Document editing state
const { documentTitle, setDocumentTitle, saveStatus } = useDocument();

// Editor instance sharing
const { editor, setEditor } = useEditorInstance();
```

### Custom Events

```tsx
// Cross-component communication
window.dispatchEvent(new CustomEvent('chatCreated', { detail: { chatId } }));
window.dispatchEvent(new CustomEvent('knowledge-base-refresh'));
```

### Server State (API)

```tsx
// Data fetching pattern
const [data, setData] = useState([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  fetch('/api/endpoint')
    .then(res => res.json())
    .then(setData)
    .finally(() => setLoading(false));
}, []);
```

---

## Key Patterns

### Dynamic Route Params (Next.js 15)

```tsx
// New async params pattern
interface PageProps {
  params: Promise<{ slug: string; documentId: string }>;
}

export default async function Page({ params }: PageProps) {
  const { slug, documentId } = await params;
  // ...
}
```

### Auto-Save Pattern

```tsx
// DocumentEditor.tsx
const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

useEffect(() => {
  if (content === lastSavedContentRef.current) return;
  
  if (autoSaveTimeoutRef.current) clearTimeout(autoSaveTimeoutRef.current);
  
  setSaveStatus('unsaved');
  autoSaveTimeoutRef.current = setTimeout(() => {
    handleSave();
  }, 2000); // 2 second debounce
  
  return () => {
    if (autoSaveTimeoutRef.current) clearTimeout(autoSaveTimeoutRef.current);
  };
}, [content]);
```

### Streaming AI Responses

```tsx
// Chat component handles streaming
const response = await fetch('/api/ai/assistant-agent', {
  method: 'POST',
  body: JSON.stringify({ messages, chatId }),
});

const reader = response.body?.getReader();
let fullContent = '';

while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  
  fullContent += new TextDecoder().decode(value);
  setMessages(prev => updateLastMessage(prev, fullContent));
}
```

### Protected API Calls

```tsx
// Pattern for authenticated API calls
const fetchData = async () => {
  const response = await fetch('/api/endpoint');
  
  if (response.status === 401) {
    router.push('/login');
    return;
  }
  
  if (!response.ok) {
    toast.error('Failed to load data');
    return;
  }
  
  const data = await response.json();
  setData(data);
};
```

---

## File Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Pages | `page.tsx` | `dashboard/page.tsx` |
| Layouts | `layout.tsx` | `private/[slug]/layout.tsx` |
| Components | PascalCase | `ApplicationsTable.tsx` |
| Hooks | camelCase with `use-` | `use-auto-scroll.ts` |
| Utilities | camelCase | `textExtraction.ts` |
| Actions | `actions.ts` | `login/actions.ts` |
| API Routes | `route.ts` | `api/grants/route.ts` |

---

## Related Documentation

- **API Documentation**: See [`api/README.md`](./api/README.md)
- **Main README**: See [`../../README.md`](../../../README.md)
- **Codebase Analysis**: See [`../../CODEBASE_ANALYSIS.md`](../../CODEBASE_ANALYSIS.md)

