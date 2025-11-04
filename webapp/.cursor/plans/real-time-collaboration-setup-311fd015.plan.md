<!-- 311fd015-f626-4080-9dc1-eff32d281030 7e04978a-a61b-47b4-856a-75db471f4a23 -->
# Real-time Collaboration Implementation Plan

## Overview

Add Google Docs-style real-time collaboration to the document editor using Yjs/Hocuspocus for CRDTs, Express.js WebSocket server, and Tiptap Collaboration extension. All organization members can collaborate on documents with live cursors and presence avatars.

## Architecture

### Technology Stack

- **Yjs**: CRDT library for conflict-free real-time editing
- **Hocuspocus**: WebSocket server built on Yjs (handles sync, persistence, auth)
- **Express.js**: HTTP server for the WebSocket server
- **@tiptap/extension-collaboration**: Tiptap's Yjs integration
- **@tiptap/extension-collaboration-cursor**: User cursors and selections
- **y-websocket**: WebSocket provider for Yjs (client-side)

### Data Flow

1. User opens document → connects to WebSocket server
2. Real-time edits sync via Yjs CRDT protocol
3. Periodic auto-save (every 30s) to Postgres database
4. On disconnect, final save to database
5. On load, check if document exists in Yjs memory, otherwise load from database

## Implementation Steps

### 1. Install Dependencies

**Backend (WebSocket server):**

```bash
npm install @hocuspocus/server @hocuspocus/extension-database express ws
npm install -D @types/express @types/ws
```

**Frontend (Next.js):**

```bash
npm install yjs @tiptap/extension-collaboration @tiptap/extension-collaboration-cursor y-websocket
```

### 2. Create WebSocket Server (`websocket-server/`)

**File: `websocket-server/server.ts`**

- Set up Express.js server
- Initialize Hocuspocus server with extensions:
  - Authentication extension (verify JWT/session)
  - Database extension (persist to Postgres via API)
  - Logger extension
- Configure document naming: `doc-{documentId}`
- Implement user authentication by verifying Supabase session
- Listen on port 4000 (configurable via env)

**File: `websocket-server/extensions/database-extension.ts`**

- Custom Hocuspocus extension for Postgres persistence
- `onStoreDocument`: Save document HTML to database via API call
- `onLoadDocument`: Load initial document from database
- Debounce saves (only save after 30s of inactivity)

**File: `websocket-server/extensions/auth-extension.ts`**

- Verify user belongs to the organization that owns the document
- Extract user info from connection token
- Return user metadata (id, name, avatar) for presence

**File: `websocket-server/package.json`**

- Separate package.json for the WebSocket server
- Build script: `tsc --build`
- Start script: `node dist/server.js`

### 3. Update Tiptap Editor for Collaboration

**File: `src/components/tiptap-templates/simple/simple-editor.tsx`**

**Changes:**

- Accept optional `collaborationConfig` prop with:
  - `documentId`: string
  - `user`: { id, name, color, avatar }
  - `websocketUrl`: string
- Conditionally add collaboration extensions when config provided:
  ```typescript
  Collaboration.configure({
    document: ydoc,
  }),
  CollaborationCursor.configure({
    provider: provider,
    user: collaborationConfig.user,
  })
  ```

- Initialize Yjs document: `const ydoc = new Y.Doc()`
- Initialize WebSocket provider:
  ```typescript
  const provider = new WebsocketProvider(
    websocketUrl,
    `doc-${documentId}`,
    ydoc,
    {
      params: { token: authToken }
    }
  )
  ```

- Handle provider connection/disconnection events
- Cleanup provider on unmount

### 4. Add User Presence Display Component

**File: `src/components/applications/CollaborationHeader.tsx`**

**New component to display:**

- Avatar stack of active users (max 5 visible, "+3 more")
- User's own avatar (highlighted)
- Connection status indicator (green dot when connected)
- Online count tooltip
- Use `CollaborationCursor` awareness API to track users

**Styling:**

- Position: absolute, top of editor
- Avatars: overlapping circles with borders
- Colors: unique per user (generated from user ID)

### 5. Update DocumentEditor Component

**File: `src/components/applications/DocumentEditor.tsx`**

**Changes:**

- Fetch current user info (name, avatar)
- Generate unique color for user (hash user ID → color)
- Get auth token for WebSocket connection
- Pass collaboration config to SimpleEditor:
  ```typescript
  collaborationConfig={{
    documentId: document.id,
    user: {
      id: user.id,
      name: user.name,
      color: generateUserColor(user.id),
      avatar: user.avatarUrl
    },
    websocketUrl: process.env.NEXT_PUBLIC_WS_URL
  }}
  ```

- Add `<CollaborationHeader />` above editor
- Show "Saving..." only for periodic DB saves, not on every keystroke
- Handle WebSocket connection errors gracefully

### 6. API Route for Document Persistence

**File: `src/app/api/applications/[applicationId]/documents/[documentId]/collaboration/route.ts`**

**New endpoint:**

- `POST /api/applications/{applicationId}/documents/{documentId}/collaboration`
- Called by Hocuspocus database extension
- Verifies request is from WebSocket server (shared secret)
- Updates document content in Postgres
- Returns success/error

### 7. Environment Configuration

**File: `.env.local`**

```
NEXT_PUBLIC_WS_URL=ws://localhost:4000
WS_SERVER_SECRET=generate-random-secret-key
```

**File: `websocket-server/.env`**

```
PORT=4000
DATABASE_API_URL=http://localhost:3000/api
WS_SERVER_SECRET=same-as-above
SUPABASE_URL=...
SUPABASE_KEY=...
```

### 8. Update Organization Access Control

**File: `src/lib/organization.ts`**

**Add function:**

- `verifyDocumentAccess(userId, documentId)`: Check if user's organization owns the document
- Used by both Next.js and WebSocket server for authorization

### 9. User Color Generation Utility

**File: `src/lib/user-colors.ts`**

**New utility:**

- `generateUserColor(userId: string): string`
- Deterministic color generation from user ID
- Returns hex color codes that are visually distinct
- Use HSL color space for better distribution

### 10. Development Scripts

**File: `package.json`**

**Add scripts:**

```json
{
  "scripts": {
    "ws:dev": "cd websocket-server && npm run dev",
    "ws:build": "cd websocket-server && npm run build",
    "dev:all": "concurrently \"npm run dev\" \"npm run ws:dev\""
  }
}
```

Install `concurrently` for running both servers: `npm install -D concurrently`

### 11. Deployment Configuration

**Considerations:**

- Deploy WebSocket server separately (Railway, Render, or same VPS)
- Use environment variable for production WebSocket URL
- Configure WebSocket server to connect to production database API
- Set up proper CORS for WebSocket connections
- Use wss:// (secure WebSocket) in production

## Key Files Modified

1. `src/components/tiptap-templates/simple/simple-editor.tsx` - Add Yjs/collaboration
2. `src/components/applications/DocumentEditor.tsx` - Pass collaboration config
3. `src/components/applications/CollaborationHeader.tsx` - NEW: User presence UI
4. `websocket-server/server.ts` - NEW: Express + Hocuspocus server
5. `websocket-server/extensions/database-extension.ts` - NEW: Postgres persistence
6. `websocket-server/extensions/auth-extension.ts` - NEW: User verification
7. `src/app/api/applications/[applicationId]/documents/[documentId]/collaboration/route.ts` - NEW: Save endpoint
8. `src/lib/user-colors.ts` - NEW: Color generation utility
9. `.env.local` and `websocket-server/.env` - Environment variables

## Testing Checklist

- [ ] Multiple users can edit same document simultaneously
- [ ] Changes appear in real-time for all users
- [ ] Cursors show other users' positions
- [ ] User avatars appear at top of document
- [ ] Document saves to database periodically
- [ ] Reconnection after network drop works
- [ ] No data loss during conflicts
- [ ] Organization access control enforced
- [ ] WebSocket server handles authentication correctly
- [ ] Performance acceptable with 5+ concurrent users

### To-dos

- [ ] Install all required npm packages for frontend (yjs, tiptap collaboration extensions) and WebSocket server (hocuspocus, express, ws)
- [ ] Create WebSocket server with Express.js and Hocuspocus, including server.ts, package.json, and tsconfig.json
- [ ] Implement authentication extension for WebSocket server to verify Supabase sessions and extract user info
- [ ] Implement database extension for Hocuspocus to handle document persistence with debouncing
- [ ] Create API route for WebSocket server to save documents to Postgres via Next.js API
- [ ] Create user color generation utility for deterministic, visually distinct colors
- [ ] Update SimpleEditor component to support Yjs collaboration with WebSocket provider and collaboration cursor
- [ ] Create CollaborationHeader component showing active user avatars with presence awareness
- [ ] Update DocumentEditor to initialize collaboration, fetch user info, and pass config to SimpleEditor
- [ ] Set up environment variables for WebSocket URL and server secrets in both Next.js and WebSocket server
- [ ] Add npm scripts for running WebSocket server and both servers concurrently during development
- [ ] Test real-time collaboration with multiple users, verify persistence, reconnection, and access control