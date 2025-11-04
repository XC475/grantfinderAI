# Real-time Collaboration Feature Documentation

## Overview

GrantWare AI includes a powerful real-time collaboration system that allows multiple users within an organization to simultaneously edit grant application documents. The system provides:

- **Conflict-free collaborative editing** using CRDT technology (Yjs)
- **Real-time cursor positions** and user presence indicators
- **Automatic document persistence** with intelligent debouncing
- **Secure access control** via organization-scoped authentication
- **Live user avatars** showing who's currently editing
- **Seamless synchronization** across all connected clients

## Architecture

### Technology Stack

- **Frontend**: Tiptap editor with Yjs collaboration extensions
- **WebSocket Server**: Hocuspocus (built on Yjs) running on Node.js
- **Authentication**: Supabase Auth with JWT tokens
- **Database**: PostgreSQL via Prisma
- **CRDT Library**: Yjs for conflict-free replication
- **Transport**: y-websocket for real-time synchronization

### System Components

```
┌─────────────────────────────────────────────────────────────────┐
│                        Client Browser                           │
│                                                                 │
│  ┌──────────────────┐         ┌──────────────────────────┐    │
│  │ Tiptap Editor    │────────▶│ Yjs Document (CRDT)      │    │
│  │ (React Component)│         │ (Local State)            │    │
│  └──────────────────┘         └──────────────────────────┘    │
│           │                              │                      │
│           │                              │                      │
│           ▼                              ▼                      │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │           WebSocket Provider (y-websocket)               │ │
│  └──────────────────────────────────────────────────────────┘ │
└────────────────────────────┬────────────────────────────────────┘
                            │
                            │ WebSocket Connection (ws://)
                            │ + JWT Auth Token
                            │
┌───────────────────────────▼────────────────────────────────────┐
│               Hocuspocus WebSocket Server                      │
│                    (Port 4000)                                 │
│                                                                │
│  ┌────────────────────┐  ┌──────────────────────────────┐    │
│  │  Auth Extension    │  │  Database Extension          │    │
│  │  - Verify JWT      │  │  - Load documents            │    │
│  │  - Check access    │  │  - Save changes (debounced)  │    │
│  └────────────────────┘  └──────────────────────────────┘    │
│                                                                │
└───────────────────┬────────────────────────────────────────────┘
                    │
                    │ HTTP API Calls
                    │
┌───────────────────▼────────────────────────────────────────────┐
│                   Next.js API Routes                           │
│                                                                │
│  ┌──────────────────────────────────────────────────────┐    │
│  │  /api/auth/token                                     │    │
│  │  - Returns JWT for WebSocket auth                    │    │
│  └──────────────────────────────────────────────────────┘    │
│  ┌──────────────────────────────────────────────────────┐    │
│  │  /api/applications/verify-document-access           │    │
│  │  - Validates user has access to document             │    │
│  └──────────────────────────────────────────────────────┘    │
│  ┌──────────────────────────────────────────────────────┐    │
│  │  /api/applications/documents/[id]/content           │    │
│  │  - Loads initial document content                    │    │
│  └──────────────────────────────────────────────────────┘    │
│  ┌──────────────────────────────────────────────────────┐    │
│  │  /api/applications/documents/[id]/collaboration     │    │
│  │  - Saves document changes to database                │    │
│  └──────────────────────────────────────────────────────┘    │
└────────────────────────┬───────────────────────────────────────┘
                         │
                         │ Prisma ORM
                         │
┌────────────────────────▼───────────────────────────────────────┐
│                    PostgreSQL Database                         │
│                                                                │
│  Tables: users, organizations, applications,                   │
│          application_documents                                 │
└────────────────────────────────────────────────────────────────┘
```

## How It Works

### 1. Connection Flow

```
User Opens Document
       │
       ├──▶ DocumentEditor fetches auth token from /api/auth/token
       │
       ├──▶ Creates Yjs document and WebSocket provider
       │
       ├──▶ Connects to ws://localhost:4000/doc-{documentId}
       │         │
       │         └──▶ Auth Extension validates JWT token
       │                    │
       │                    ├──▶ Verifies user via Supabase
       │                    │
       │                    └──▶ Checks document access via API
       │                              │
       │                              ├──▶ User in org? ✓
       │                              │
       │                              └──▶ Sets connection context
       │
       ├──▶ Database Extension loads document from API
       │         │
       │         └──▶ Converts Tiptap JSON to Yjs updates
       │
       └──▶ Connection established ✓
              Users can now see each other and collaborate!
```

### 2. Editing Flow

```
User Types in Editor
       │
       ├──▶ Tiptap triggers local update
       │
       ├──▶ Yjs applies change to local CRDT
       │
       ├──▶ WebSocket Provider broadcasts update to server
       │
       ├──▶ Hocuspocus Server receives update
       │         │
       │         ├──▶ Broadcasts to all connected clients
       │         │
       │         └──▶ Triggers debounced save (30s)
       │
       ├──▶ Other Clients receive update
       │         │
       │         └──▶ Yjs merges changes (conflict-free!)
       │                   │
       │                   └──▶ Tiptap editor updates display
       │
       └──▶ After 30s of inactivity
              │
              └──▶ Database Extension saves to PostgreSQL
```

### 3. Presence & Awareness

- Each user's cursor position is tracked via `CollaborationCaret`
- User metadata (name, color, avatar) is stored in connection context
- `CollaborationHeader` displays active users with avatars
- Real-time connection status indicator (Live/Offline)

## File Structure

```
websocket_server/
├── src/
│   ├── server.ts                    # Main Hocuspocus server
│   ├── extensions/
│   │   ├── auth-extension.ts        # JWT auth & access control
│   │   └── database-extension.ts    # Document load/save
│   └── types/
│       └── hocuspocus.d.ts          # TypeScript definitions
├── package.json
└── tsconfig.json

webapp/
├── src/
│   ├── app/api/
│   │   ├── auth/token/route.ts                              # Get JWT token
│   │   └── applications/
│   │       ├── verify-document-access/route.ts              # Verify access
│   │       └── documents/[documentId]/
│   │           ├── content/route.ts                         # Load doc
│   │           └── collaboration/route.ts                   # Save doc
│   ├── components/
│   │   ├── applications/
│   │   │   ├── DocumentEditor.tsx                           # Main editor
│   │   │   └── CollaborationHeader.tsx                      # User presence
│   │   └── tiptap-templates/simple/
│   │       └── simple-editor.tsx                            # Tiptap setup
│   └── lib/
│       └── user-colors.ts                                   # Color generation
```

## Setup & Configuration

### 1. Environment Variables

Create or update `.env` files:

#### WebSocket Server (`websocket_server/.env`)

```bash
# WebSocket Server Port
PORT=4000

# Supabase Configuration (for auth verification)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-anon-key

# API Configuration
DATABASE_API_URL=http://localhost:3000/api
WS_SERVER_SECRET=your-secure-random-secret-here

# Node Environment
NODE_ENV=development
```

#### Next.js App (`webapp/.env.local`)

```bash
# WebSocket Configuration
NEXT_PUBLIC_WS_URL=ws://localhost:4000

# WebSocket Server Secret (must match server)
WS_SERVER_SECRET=your-secure-random-secret-here

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Database
DATABASE_URL=postgresql://...
```

**Important**: The `WS_SERVER_SECRET` must be the same in both environments. Generate a secure random string:

```bash
# Generate a secure secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 2. Install Dependencies

#### WebSocket Server

```bash
cd websocket_server
npm install
```

Dependencies installed:

- `@hocuspocus/server` - WebSocket collaboration server
- `@hocuspocus/extension-logger` - Logging extension
- `@hocuspocus/extension-database` - Database integration
- `@hocuspocus/transformer` - Converts between Tiptap JSON and Yjs
- `@supabase/supabase-js` - Supabase client
- `express` - HTTP server
- `ws` - WebSocket library
- `dotenv` - Environment variables

#### Next.js App

```bash
cd webapp
npm install
```

Key collaboration dependencies:

- `@tiptap/extension-collaboration` - Yjs integration
- `@tiptap/extension-collaboration-caret` - Cursor tracking
- `yjs` - CRDT library
- `y-websocket` - WebSocket provider

### 3. Database Setup

The collaboration feature uses existing tables. Ensure you have:

```sql
-- application_documents table should have:
- id (uuid, primary key)
- applicationId (uuid, foreign key)
- title (text)
- content (jsonb or text) -- Stores Tiptap JSON
- contentType (text) -- Should be 'json'
- version (integer)
- createdAt (timestamp)
- updatedAt (timestamp)

-- organizations table (for access control)
-- users table (for authentication)
-- applications table (links documents to orgs)
```

## Running the Servers

### Development Mode

You need to run **both servers** simultaneously:

#### Terminal 1: WebSocket Server

```bash
cd websocket_server
npm run dev
```

You should see:

```
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║     GrantWare AI - Real-time Collaboration Server        ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝

🚀 Starting WebSocket server on port 4000...

✅ WebSocket server is running!

   HTTP:      http://localhost:4000
   WebSocket: ws://localhost:4000
   Health:    http://localhost:4000/health
   Status:    http://localhost:4000/status

🎯 Ready to accept real-time collaboration connections
```

#### Terminal 2: Next.js App

```bash
cd webapp
npm run dev
```

The app will run on `http://localhost:3000`

### Production Mode

#### WebSocket Server

```bash
cd websocket_server
npm run build
npm start
```

#### Next.js App

Deploy using your preferred method (Vercel, Docker, etc.)

**Important**: Update `NEXT_PUBLIC_WS_URL` to your production WebSocket URL:

```bash
NEXT_PUBLIC_WS_URL=wss://your-ws-server.com
```

## Testing the Collaboration Feature

### Test 1: Basic Connection Test

**Goal**: Verify the WebSocket server is running and accepting connections

1. Start the WebSocket server
2. Visit: `http://localhost:4000/health`
3. Expected response:
   ```json
   {
     "status": "healthy",
     "uptime": 123.456,
     "timestamp": "2025-11-04T...",
     "service": "grantware-websocket-server"
   }
   ```

### Test 2: Single User Editing

**Goal**: Test document loading and editing without collaboration

1. Start both servers (WebSocket + Next.js)
2. Log in to GrantWare AI
3. Navigate to an organization
4. Go to Applications → Select an application
5. Click on a document to open the editor
6. Check the collaboration header at the top:
   - Should show: ✅ "Live" (green dot)
   - Should show: "1 person editing"
   - Should show your avatar

**What to observe**:

- Console logs in browser dev tools showing connection
- WebSocket server logs showing authentication and connection
- Document content loads correctly
- Typing works smoothly

### Test 3: Multi-User Collaboration (Critical Test)

**Goal**: Test real-time synchronization between multiple users

#### Setup:

1. Have 2 users in the same organization (or use 2 different browsers)
2. Both users should open the **same document**

#### Steps:

**User 1** (e.g., Chrome):

1. Log in as User A
2. Navigate to a document
3. Observe collaboration header shows "1 person editing"

**User 2** (e.g., Firefox or Incognito):

1. Log in as User B (same organization)
2. Navigate to the **same document**
3. Observe collaboration header now shows "2 people editing"

**Testing Real-time Sync**:

1. **User 1**: Type "Hello from User 1"

   - **User 2** should see the text appear in real-time

2. **User 2**: Type " - and hello from User 2"

   - **User 1** should see the text appear

3. **Both users**: Type simultaneously at different positions

   - Text should merge without conflicts
   - No text should be lost

4. **Cursor Tracking**:

   - Each user should see colored cursor indicators for other users
   - Cursors should move in real-time as users type

5. **User Presence**:
   - Both users' avatars should appear in the collaboration header
   - Each user should have a different color

**Expected Behavior**:

- ✅ Text appears instantly (< 100ms latency)
- ✅ No conflicts when typing simultaneously
- ✅ Cursors are visible and move correctly
- ✅ Connection status shows "Live" (green)
- ✅ User count is accurate

### Test 4: Connection Recovery

**Goal**: Test reconnection after network disruption

1. User opens a document (connected)
2. Stop the WebSocket server: `Ctrl+C`
3. Observe:
   - Connection status changes to "Offline" (gray)
   - User can still type (local changes stored)
4. Restart WebSocket server: `npm run dev`
5. Observe:
   - Connection automatically reconnects
   - Status changes back to "Live" (green)
   - Local changes are synced

### Test 5: Access Control

**Goal**: Verify users can only access documents in their organization

#### Test 5a: Valid Access

1. User A in Organization X opens a document from Organization X
2. Expected: ✅ Connection succeeds, document loads

#### Test 5b: Invalid Access (Security Test)

1. Get a document ID from Organization X
2. Log in as User B (from Organization Y)
3. Try to access the document via URL manipulation
4. Expected: ❌ Access denied (403 error)

**How to test**:

- Use browser dev tools Network tab
- Look for WebSocket connection errors
- Server logs should show "Access denied"

### Test 6: Document Persistence

**Goal**: Verify changes are saved to the database

1. User opens a document
2. Type some content: "Testing auto-save at [timestamp]"
3. Wait 30 seconds (debounce period)
4. Check WebSocket server logs:
   ```
   💾 [Database] Saving document: [documentId]
   ✅ [Database] Document [documentId] saved successfully
   ```
5. Close the browser completely
6. Reopen the document
7. Expected: Content from step 2 is still there

### Test 7: Multiple Documents

**Goal**: Test concurrent editing of different documents

1. Open Document A in Browser 1
2. Open Document B in Browser 2
3. Edit both simultaneously
4. Expected:
   - Each document syncs independently
   - No cross-document interference
   - Server handles both connections

### Test 8: Large Number of Users

**Goal**: Test scalability

1. Simulate multiple users on the same document
2. Use 3-5 different browsers/devices if possible
3. All users type simultaneously
4. Expected:
   - All changes sync correctly
   - No significant lag
   - Server remains stable

**Monitor**:

- WebSocket server CPU/memory usage
- Network traffic
- Latency in text synchronization

### Test 9: Disconnection Handling

**Goal**: Test what happens when users disconnect

1. User A and User B open same document
2. User B closes their browser
3. Expected:
   - User A's collaboration header updates to "1 person editing"
   - User B's avatar disappears
   - User B's cursor disappears

### Test 10: Server Status Endpoint

**Goal**: Monitor server health and connections

1. While users are connected, visit: `http://localhost:4000/status`
2. Expected response:
   ```json
   {
     "status": "running",
     "uptime": 456.789,
     "timestamp": "2025-11-04T...",
     "documents": 2,
     "connections": 5
   }
   ```

## Debugging & Troubleshooting

### Enable Detailed Logging

#### WebSocket Server

The server already has comprehensive logging. Watch the console:

```bash
📝 [Hocuspocus] ...           # Hocuspocus internal logs
🔐 [Auth] ...                  # Authentication events
📄 [Database] ...              # Document load/save
🔌 [Connect/Disconnect] ...    # Connection events
🔄 [Upgrade] ...               # WebSocket upgrades
```

#### Browser Console

Open dev tools and filter by:

- `[Collaboration]` - Client-side collaboration logs
- `WebSocket` - Connection status

### Common Issues

#### Issue 1: "Failed to connect to WebSocket"

**Symptoms**:

- Connection status shows "Offline"
- No cursor/presence indicators

**Checks**:

1. ✅ WebSocket server is running (`http://localhost:4000/health`)
2. ✅ `NEXT_PUBLIC_WS_URL` is set correctly in `.env.local`
3. ✅ Port 4000 is not blocked by firewall
4. ✅ No proxy/VPN interfering with WebSocket connections

**Solution**:

```bash
# Restart WebSocket server
cd websocket_server
npm run dev
```

#### Issue 2: "Authentication required" error

**Symptoms**:

- WebSocket connects but immediately disconnects
- Server logs: `❌ [Auth] No authentication token provided`

**Checks**:

1. ✅ User is logged in to Supabase
2. ✅ `/api/auth/token` endpoint is working
3. ✅ Supabase credentials are correct in WebSocket server `.env`

**Debug**:

```bash
# Test token endpoint
curl http://localhost:3000/api/auth/token \
  -H "Cookie: [your-auth-cookie]"
```

#### Issue 3: "Access denied to document"

**Symptoms**:

- WebSocket authenticates but then disconnects
- Server logs: `❌ [Auth] Access denied for document`

**Checks**:

1. ✅ User is member of the organization that owns the document
2. ✅ `WS_SERVER_SECRET` matches in both servers
3. ✅ Document exists in database

**Debug**:

```bash
# Check document ownership
# In your database:
SELECT
  d.id,
  d.title,
  a.organizationId,
  o.name as org_name
FROM application_documents d
JOIN applications a ON d.applicationId = a.id
JOIN organization o ON a.organizationId = o.id
WHERE d.id = '[document-id]';
```

#### Issue 4: Changes not syncing between users

**Symptoms**:

- Both users connected (green status)
- Typing doesn't appear on other user's screen

**Checks**:

1. ✅ Both users are on the **exact same document** (check URL)
2. ✅ WebSocket server is broadcasting updates (check logs)
3. ✅ No browser console errors

**Debug**:

- Open browser dev tools → Network → WS tab
- Verify WebSocket messages are being sent/received
- Look for frames like: `1[{"type":"..."}]`

#### Issue 5: Document not saving

**Symptoms**:

- Changes appear in editor
- After refresh, changes are lost
- No save logs in server

**Checks**:

1. ✅ WebSocket server can reach Next.js API (`DATABASE_API_URL`)
2. ✅ Database is accessible
3. ✅ Document ID exists in database

**Debug**:

- Wait 30 seconds after making changes (debounce period)
- Check WebSocket server logs for `💾 [Database] Saving document`
- If no log appears, check `onStoreDocument` is being called

#### Issue 6: Server crashes or high memory usage

**Symptoms**:

- Server exits unexpectedly
- Memory keeps increasing

**Checks**:

1. ✅ Save timers are being cleaned up properly
2. ✅ Old documents are being destroyed
3. ✅ No memory leaks in extensions

**Debug**:

```bash
# Monitor memory usage
node --max-old-space-size=4096 dist/server.js

# Enable Node.js heap profiling
node --inspect dist/server.js
```

### Testing Tools

#### 1. WebSocket Client (CLI)

Test raw WebSocket connection:

```bash
npm install -g wscat

# Test connection (requires token)
wscat -c "ws://localhost:4000/doc-test-123?token=YOUR_JWT_TOKEN"
```

#### 2. API Testing

Test the API endpoints:

```bash
# Health check
curl http://localhost:4000/health

# Status check
curl http://localhost:4000/status

# Get auth token
curl http://localhost:3000/api/auth/token \
  -H "Cookie: sb-[project]-auth-token=[token]"
```

#### 3. Browser Network Tab

1. Open browser DevTools → Network
2. Filter by "WS" (WebSocket)
3. Click on the WebSocket connection
4. View frames being sent/received

### Performance Monitoring

#### Metrics to Watch

1. **Latency**: Time from typing to remote display (< 100ms ideal)
2. **Memory**: Server memory should stay stable
3. **CPU**: Should be low when idle
4. **Connections**: Monitor via `/status` endpoint

#### Load Testing

Use multiple browser tabs to simulate users:

```bash
# In each tab, open the same document
# Type simultaneously
# Monitor server performance
```

## Security Considerations

### Authentication Flow

1. **JWT Token**: Issued by Supabase, validated by WebSocket server
2. **Organization Scope**: Users can only access documents in their org
3. **Server Secret**: `WS_SERVER_SECRET` prevents unauthorized API access
4. **HTTPS/WSS**: Use secure connections in production

### Access Control

The system implements **organization-level access control**:

```
User → Token → Organization → Application → Document
```

A user can access a document if:

1. ✅ Valid JWT token (authenticated)
2. ✅ User is member of organization
3. ✅ Organization owns the application
4. ✅ Document belongs to application

### Security Checklist

- [ ] `WS_SERVER_SECRET` is a strong random string (32+ chars)
- [ ] WebSocket server validates JWT on every connection
- [ ] API endpoints verify `X-WS-Server-Secret` header
- [ ] Production uses WSS (encrypted WebSocket)
- [ ] Supabase RLS policies are enabled
- [ ] CORS is properly configured
- [ ] Rate limiting is in place (if needed)

## Production Deployment

### WebSocket Server Deployment

#### Option 1: Same Server as Next.js

```bash
# In your production server
cd websocket_server
npm run build
pm2 start dist/server.js --name "grantware-ws"
```

#### Option 2: Separate Server (Recommended)

Deploy to a dedicated server or container:

```dockerfile
# Dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY dist ./dist
EXPOSE 4000
CMD ["node", "dist/server.js"]
```

```bash
# Build and run
docker build -t grantware-ws .
docker run -p 4000:4000 --env-file .env grantware-ws
```

### Environment Variables for Production

```bash
# WebSocket Server
PORT=4000
NODE_ENV=production
DATABASE_API_URL=https://your-app.com/api
WS_SERVER_SECRET=your-production-secret
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-key

# Next.js
NEXT_PUBLIC_WS_URL=wss://ws.your-app.com
```

### Scaling Considerations

For high traffic, consider:

1. **Load Balancing**: Use sticky sessions for WebSocket connections
2. **Redis Adapter**: Share state across multiple server instances
3. **Health Checks**: Monitor `/health` endpoint
4. **Auto-scaling**: Scale based on connection count

## Feature Flags

To enable/disable collaboration per document:

```typescript
<DocumentEditor
  document={document}
  applicationId={applicationId}
  organizationSlug={organizationSlug}
  onSave={handleSave}
  currentUser={currentUser}
  enableCollaboration={true} // Toggle here
/>
```

When `enableCollaboration={false}`:

- No WebSocket connection
- No user presence indicators
- Manual save button appears
- Changes saved via traditional API calls

## Future Enhancements

Potential improvements:

- [ ] **Version History**: Track document versions with restore capability
- [ ] **Comments**: Add inline comments and discussions
- [ ] **Mentions**: @mention team members in documents
- [ ] **Change Tracking**: Show who made what changes
- [ ] **Conflict Resolution UI**: Visual diff for conflicts
- [ ] **Offline Mode**: Better offline editing support
- [ ] **Mobile Optimization**: Touch-friendly collaboration
- [ ] **Analytics**: Track collaboration metrics
- [ ] **Video/Audio**: Integrate real-time communication

## Support & Resources

### Documentation Links

- [Tiptap Collaboration](https://tiptap.dev/docs/hocuspocus/getting-started)
- [Yjs Documentation](https://docs.yjs.dev/)
- [Hocuspocus Server](https://tiptap.dev/docs/hocuspocus/server/introduction)
- [y-websocket Provider](https://github.com/yjs/y-websocket)

### Related Files

- `websocket_server/src/server.ts` - Main server implementation
- `webapp/src/components/applications/DocumentEditor.tsx` - Client integration
- `webapp/src/lib/user-colors.ts` - User color generation

### Getting Help

If you encounter issues:

1. Check this documentation
2. Review server logs for error messages
3. Test with the provided test cases
4. Check browser console for client-side errors
5. Verify environment variables are set correctly

---

**Last Updated**: November 4, 2025  
**Version**: 1.0.0  
**Maintained by**: GrantWare AI Team
