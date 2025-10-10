# ✅ COMPLETE Database Migration: Workspace → Organization

## All Changes Complete - No Backward Compatibility

This migration completely removes the old workspace/organization multi-tier model in favor of a simplified single-organization-per-user model.

---

## 📋 Schema Changes

### Removed Tables:
- ❌ `organization_members`
- ❌ `organization_invites`  
- ❌ Old `organizations` (had workspaceId FK)

### Removed Enums:
- ❌ `OrganizationRole` (OWNER, ADMIN, MEMBER)

### Renamed:
- ✅ `workspaces` table → `organizations` table
- ✅ `WorkspaceType` enum → `OrganizationType` enum
- ✅ `personalWorkspaceId` column → `organizationId` column

### Updated Foreign Keys (in all models):
- ✅ `workspaceId` → `organizationId` in:
  - `grant_bookmarks`
  - `grant_eligibility_analyses`
  - `applications`
  - `ai_chats`

---

## 🔄 Complete Routing Flow

### 1. **User Login**
```
/login/actions.ts
  → getUserOrganization(userId)
  → Gets { id, slug, name, type }
  → Redirects to: /private/{slug}/chat
```

### 2. **Layout Access Control**
```
/app/private/[slug]/layout.tsx
  → getOrganizationBySlug(slug)
  → verifyOrganizationAccess(userId, slug)
  → If valid: Renders page
  → If invalid: Redirects to /
```

### 3. **Organization Display**
```
AppSidebar → fetches /api/organizations
  → Returns: { id, name, slug, type }
  → TeamSwitcher displays organization name
  → No dropdown (single org only)
```

### 4. **API Calls**
```
Frontend pages use slug from URL params:
  - /api/applications?organizationSlug={slug}
  - /api/chat → organizationId in body
  - /api/grants/{id}/bookmark → getUserOrganizationId()
```

---

## 📁 Files Modified (Complete List)

### Database:
- `prisma/schema.prisma` ✅
- `database-trigger.sql` ✅ (NEW - must be applied)

### Backend Library:
- `src/lib/workspace.ts` ✅
  - No legacy exports
  - Pure organization functions

### API Routes:
1. `src/app/api/organizations/route.ts` ✅ (RENAMED from workspaces)
   - Returns single organization object (not array)
2. `src/app/api/admin/users/route.ts` ✅
3. `src/app/api/chat/route.ts` ✅
4. `src/app/api/applications/route.ts` ✅
5. `src/app/api/grants/[grantId]/bookmark/route.ts` ✅
6. `src/app/api/recommendations/route.ts` ✅

### Scripts:
- `src/scripts/create-first-admin.ts` ✅

### Frontend Components:
- `src/components/sidebar/app-sidebar.tsx` ✅
  - Variable: `organization` (not `workspaces` array)
  - API call: `/api/organizations`
- `src/components/sidebar/team-switcher.tsx` ✅
  - Simplified: No dropdown, displays single org
  - Props: `organization` (not `workspaces[]`)
- `src/components/sidebar/dynamic-breadcrumb.tsx` ✅
  - Props: `organizationSlug`
- `src/components/sidebar/nav-chats.tsx` ✅
  - Props: `organizationSlug`
- `src/components/sidebar/nav-settings.tsx` ✅
  - Props: `organizationSlug`
- `src/components/grants/GrantCard.tsx` ✅
  - Props: `organizationSlug`

### Frontend Pages:
- `src/app/page.tsx` ✅
  - Uses `getUserOrganization()`
- `src/app/login/actions.ts` ✅
  - Uses `getUserOrganization()`
- `src/app/private/[slug]/layout.tsx` ✅
  - Uses organization functions
  - Function renamed to `OrganizationLayout`
- `src/app/private/[slug]/grants/page.tsx` ✅
  - Uses `organizationSlug` in API calls
- `src/app/private/[slug]/applications/page.tsx` ✅
  - Interface updated: `organization` field
  - API param: `organizationSlug`
- `src/app/private/[slug]/bookmarks/page.tsx` ✅
  - Props: `organizationSlug`
- `src/app/private/[slug]/admin/users/page.tsx` ✅
  - Interface updated: `organization` field

### Email Templates:
- `src/lib/email.ts` ✅
  - Param: `organizationUrl` (not `workspaceUrl`)
  - Text: "Your Organization" (not "Your Workspace")

---

## 🚀 Deployment Steps

### Step 1: Apply Database Trigger
Run in Supabase SQL Editor:
```bash
# Copy contents of database-trigger.sql and execute
```

### Step 2: Migrate Existing Data (if you have any)
```sql
-- Rename table
ALTER TABLE app.workspaces RENAME TO organizations;

-- Rename user column
ALTER TABLE app.users RENAME COLUMN "personalWorkspaceId" TO "organizationId";

-- Rename foreign key columns
ALTER TABLE app.grant_bookmarks RENAME COLUMN "workspaceId" TO "organizationId";
ALTER TABLE app.grant_eligibility_analyses RENAME COLUMN "workspaceId" TO "organizationId";
ALTER TABLE app.applications RENAME COLUMN "workspaceId" TO "organizationId";
ALTER TABLE app.ai_chats RENAME COLUMN "workspaceId" TO "organizationId";

-- Rename enum
ALTER TYPE app."WorkspaceType" RENAME TO "OrganizationType";

-- Update unique constraints
ALTER TABLE app.grant_bookmarks 
  DROP CONSTRAINT IF EXISTS grant_bookmarks_userId_opportunityId_workspaceId_key;
ALTER TABLE app.grant_bookmarks 
  ADD CONSTRAINT grant_bookmarks_userId_opportunityId_organizationId_key 
  UNIQUE ("userId", "opportunityId", "organizationId");

ALTER TABLE app.grant_eligibility_analyses 
  DROP CONSTRAINT IF EXISTS grant_eligibility_analyses_opportunityId_workspaceId_key;
ALTER TABLE app.grant_eligibility_analyses 
  ADD CONSTRAINT grant_eligibility_analyses_opportunityId_organizationId_key 
  UNIQUE ("opportunityId", "organizationId");

ALTER TABLE app.applications 
  DROP CONSTRAINT IF EXISTS applications_opportunityId_workspaceId_key;
ALTER TABLE app.applications 
  ADD CONSTRAINT applications_opportunityId_organizationId_key 
  UNIQUE ("opportunityId", "organizationId");

-- Update indexes
DROP INDEX IF EXISTS app.applications_workspaceId_status_idx;
CREATE INDEX applications_organizationId_status_idx 
  ON app.applications ("organizationId", status);
```

### Step 3: Verify Prisma Client
```bash
cd grantfinderAI/webapp
npx prisma generate
```

### Step 4: Restart Application
```bash
npm run dev
```

---

## 🧪 Test Checklist

### Authentication & Routing:
- [ ] User can sign up (trigger creates organization)
- [ ] User can login → redirected to `/private/{slug}/chat`
- [ ] Layout verifies organization access
- [ ] Unauthorized users redirected to login

### Organization Display:
- [ ] Sidebar shows organization name
- [ ] TeamSwitcher displays "Personal Organization"
- [ ] Organization icon shows correctly (User icon for PERSONAL)

### Grant Features:
- [ ] Can browse grants at `/private/{slug}/grants`
- [ ] Can bookmark grants
- [ ] Can create applications
- [ ] Can view bookmarks at `/private/{slug}/bookmarks`

### Chat Features:
- [ ] Can create new chat
- [ ] Chat messages save with organizationId
- [ ] School district info sent to N8N correctly

### Admin Features:
- [ ] Can create new users
- [ ] Users get organization created via trigger
- [ ] Welcome email sent with organization URL
- [ ] User list shows organization and district info

---

## 🔍 What Changed (User-Facing)

### NO VISIBLE CHANGES:
- ✅ URLs identical: `/private/{slug}/...`
- ✅ Navigation identical
- ✅ User flow identical

### INTERNAL CHANGES:
- Database: `workspaces` → `organizations`
- API: `/api/workspaces` → `/api/organizations`
- API params: `workspaceId/workspaceSlug` → `organizationId/organizationSlug`
- Sidebar: Shows single organization (no switcher dropdown)

---

## 🎯 Benefits of This Refactoring

1. **Simpler Model**: One organization per user, no nested relationships
2. **Clearer Intent**: "Organization" better represents what it is
3. **Easier to Understand**: No confusion between Organization and Workspace
4. **Less Code**: Removed OrganizationMember, OrganizationInvite models
5. **Future-Proof**: Can add multi-user orgs later if needed

---

## ⚠️ Breaking Changes

### API Endpoints:
- ❌ `/api/workspaces` → ✅ `/api/organizations`
- ❌ Returns array `[{...}]` → ✅ Returns object `{...}`

### API Parameters:
- ❌ `workspaceId` → ✅ `organizationId`
- ❌ `workspaceSlug` → ✅ `organizationSlug`

### Prisma Model Names:
- ❌ `prisma.workspace` → ✅ `prisma.organization`
- ❌ `.personalWorkspace` → ✅ `.organization`
- ❌ `WorkspaceType` → ✅ `OrganizationType`

### Function Names:
- ❌ `getUserWorkspace()` → ✅ `getUserOrganization()`
- ❌ `getUserWorkspaceId()` → ✅ `getUserOrganizationId()`
- ❌ `getWorkspaceBySlug()` → ✅ `getOrganizationBySlug()`
- ❌ `verifyWorkspaceAccess()` → ✅ `verifyOrganizationAccess()`

---

## 📝 N8N Webhook Updates

Update your N8N workflows to expect:

**Before:**
```json
{
  "workspace_id": "ws_123",
  "workspace_info": {
    "id": "ws_123",
    "name": "John's Workspace",
    "type": "PERSONAL"
  }
}
```

**After:**
```json
{
  "organization_id": "org_123",
  "organization_info": {
    "id": "org_123",
    "name": "John's Organization",
    "type": "PERSONAL"
  }
}
```

---

## ✅ Migration Status: COMPLETE

All code updated, no backward compatibility, clean refactor complete!

**Next Steps:**
1. Apply `database-trigger.sql` in Supabase
2. Run data migration SQL (if you have existing data)
3. Test all features
4. Deploy to production

