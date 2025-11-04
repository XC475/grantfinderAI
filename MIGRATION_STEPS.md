# Multi-User Organizations Migration Steps

This document outlines the remaining steps to complete the multi-user organizations migration.

## ✅ Completed

1. **Schema Migration**

   - ✅ Updated Prisma schema to add `role` to User model
   - ✅ Removed `role` from Organization model
   - ✅ Removed `@unique` constraint from User.organizationId
   - ✅ Changed Organization-User relationship to one-to-many
   - ✅ Generated Prisma client with new schema

2. **Database Trigger**

   - ✅ Updated `database-trigger.sql` to support optional organization creation
   - ✅ Added role assignment from user metadata
   - ✅ Added slug conflict resolution

3. **API Endpoints**

   - ✅ Created `/api/admin/organizations` endpoint for listing organizations
   - ✅ Rewrote `/api/admin/users` POST to support two modes (add_to_existing/create_new)
   - ✅ Updated `/api/admin/users` GET to return user.role
   - ✅ Updated `/api/admin/users/[userId]` PATCH to support role updates with owner validation
   - ✅ Updated application routes to use `users: { some: { id } }` pattern
   - ✅ Updated organization access checks

4. **UI Updates**

   - ✅ Redesigned admin users page with two-option interface
   - ✅ Added organization selection for existing orgs
   - ✅ Added school district and custom organization creation forms
   - ✅ Updated user list table to show user.role
   - ✅ Added role toggle functionality

5. **Code References**
   - ✅ Updated all API routes to use multi-user patterns
   - ✅ Updated lib/organization.ts utility functions
   - ✅ Fixed all organization access verification

## ⚠️ Remaining Steps

### 1. Database Migration

**CRITICAL**: Run the actual Prisma migration to update the database schema.

```bash
cd webapp
npx prisma migrate dev --name add_role_to_user_and_allow_multiple_users
```

This will:

- Add `role` column to app.users (default: MEMBER)
- Migrate existing organization.role values to user.role
- Remove `role` column from app.organizations
- Remove unique constraint on user.organizationId
- Add index on (organizationId, role)

**Data Migration Script** (if needed for existing data):

```sql
-- Migrate existing roles from organizations to users
UPDATE app.users u
SET role = o.role
FROM app.organizations o
WHERE u."organizationId" = o.id;

-- Set default ADMIN role for users without explicit org role mapping
UPDATE app.users
SET role = 'ADMIN'
WHERE role IS NULL;
```

### 2. Update Database Trigger

Execute the updated trigger in Supabase SQL Editor:

```sql
-- Copy contents from webapp/database-trigger.sql and execute
```

This replaces the old trigger with the new multi-user version.

### 3. Testing Checklist

Run these tests to verify everything works:

#### User Creation Tests:

- [ ] Create user in existing organization (as MEMBER)
- [ ] Create user in existing organization (as ADMIN)
- [ ] Create user in existing organization (as OWNER)
  - [ ] Verify only one OWNER allowed per org
- [ ] Create user with new school district organization
- [ ] Create user with new custom organization

#### User Management Tests:

- [ ] Toggle user role (MEMBER → ADMIN → OWNER → MEMBER)
- [ ] Verify owner constraint when changing roles
- [ ] Delete user from organization
- [ ] Update system admin status

#### Application Access Tests:

- [ ] Verify users can access applications in their organization
- [ ] Verify users cannot access applications in other organizations
- [ ] Verify ADMIN/OWNER can update organization settings
- [ ] Verify MEMBER cannot update organization settings

#### Data Integrity Tests:

- [ ] All existing users have a role assigned
- [ ] All existing organizations still accessible
- [ ] No orphaned data
- [ ] Organization slugs are unique

### 4. Deployment Checklist

Before deploying to production:

1. **Backup Database**

   ```bash
   # Create database backup before migration
   ```

2. **Test Migration on Staging**

   - Run migration on staging environment first
   - Verify all existing users and organizations work
   - Test all user creation flows

3. **Update Environment Variables**

   - Verify all required env vars are set
   - Check Supabase connection strings

4. **Deploy Steps**

   ```bash
   # 1. Deploy database migrations
   cd webapp
   npx prisma migrate deploy

   # 2. Update database trigger (run SQL manually)

   # 3. Deploy application code
   npm run build
   ```

5. **Post-Deployment Verification**
   - Check logs for errors
   - Test user creation flows
   - Verify existing users can still login
   - Test organization access

### 5. Rollback Plan

If issues occur:

1. **Database Rollback**

   ```sql
   -- Revert schema changes (if needed)
   -- Add back unique constraint
   ALTER TABLE app.users ADD CONSTRAINT users_organizationId_key UNIQUE ("organizationId");

   -- Add role back to organizations
   ALTER TABLE app.organizations ADD COLUMN role app."OrganizationRole" DEFAULT 'MEMBER';

   -- Migrate roles back
   UPDATE app.organizations o
   SET role = u.role
   FROM app.users u
   WHERE o.id = u."organizationId";

   -- Remove role from users
   ALTER TABLE app.users DROP COLUMN role;
   ```

2. **Restore Database Trigger**

   - Execute old trigger from version control

3. **Revert Code**
   ```bash
   git revert <commit-hash>
   git push
   ```

## 📝 Notes

- The migration preserves all existing data
- Existing users will keep their organization access
- The default role for newly created users is MEMBER
- System admins can create users in any organization
- Each organization can only have one OWNER
- ADMIN and MEMBER roles can be assigned to multiple users

## 🔒 Security Considerations

- Organization access now checks user membership via `users: { some: { id } }`
- Role-based permissions enforced at API level
- OWNER role required for certain organization operations
- System admin role separate from organization roles
