# Admin User Management System

This application uses an **admin-controlled user creation system**. Public registration is disabled, and only administrators can create new user accounts.

## Overview

- **No public registration** - Users cannot create their own accounts
- **Admin-only user creation** - Administrators create user accounts
- **Role-based access** - Users can be `USER` or `ADMIN`
- **Admin interface** - Web UI for user management

## Initial Setup

### 1. Apply Database Migration

Run the Prisma migration to add user roles:

```bash
cd grantfinderAI/webapp
npx prisma migrate dev --name add_user_roles
npx prisma generate
```

### 2. Create First Admin User

You need to create your first admin user manually. You have two options:

#### Option A: Using the Script (Recommended)

1. Make sure you have your Supabase Service Role Key:

   - Go to Supabase Dashboard → Settings → API
   - Copy the `service_role` key (not the `anon` key)
   - Add to `.env.local`:
     ```
     SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
     ```

2. Run the script:

   ```bash
   npx tsx src/scripts/create-first-admin.ts
   ```

3. Follow the prompts to enter:
   - Admin email
   - Admin name
   - Admin password

#### Option B: Manual Database Update

1. Create a user via Supabase Dashboard:

   - Go to Authentication → Users → Add User
   - Enter email, password, and confirm email

2. Update the role in database:
   ```sql
   UPDATE app.users
   SET role = 'ADMIN'
   WHERE email = 'your-admin@email.com';
   ```

## Using the Admin System

### Accessing Admin Features

1. Login with your admin account
2. Navigate to: `/private/{workspace-slug}/admin/users`
3. Or look for "User Management" in the sidebar (if admin)

### Admin Capabilities

Administrators can:

- ✅ **Create new users** - Add USER or ADMIN accounts
- ✅ **View all users** - See complete user list
- ✅ **Change user roles** - Toggle between USER and ADMIN
- ✅ **Delete users** - Remove user accounts (except yourself)

### Creating New Users

1. Click "Add User" button
2. Fill in:
   - Full Name
   - Email
   - Password (min 6 characters)
   - Role (USER or ADMIN)
3. Click "Create User"

The system will:

- Create auth account in Supabase
- Auto-confirm their email
- Create workspace for them
- Set their role
- Send them credentials (you'll need to communicate this)

### User Roles

**USER:**

- Access to grants and features
- Can bookmark grants
- Can create projects
- Cannot access admin features

**ADMIN:**

- All USER permissions
- Access to User Management
- Can create/delete users
- Can change user roles

## API Endpoints

### Admin Routes (Authenticated Admin Only)

```
GET    /api/admin/users           - List all users
POST   /api/admin/users           - Create new user
DELETE /api/admin/users/[userId]  - Delete user
PATCH  /api/admin/users/[userId]  - Update user role
```

### Request Examples

**Create User:**

```json
POST /api/admin/users
{
  "email": "user@example.com",
  "name": "John Doe",
  "password": "secure123",
  "role": "USER"
}
```

**Update Role:**

```json
PATCH /api/admin/users/{userId}
{
  "role": "ADMIN"
}
```

## Security

- All admin routes check for `ADMIN` role
- Users cannot elevate their own privileges
- Admins cannot delete their own account
- Email confirmation is auto-completed for admin-created users
- Passwords must be min 6 characters

## Helper Functions

Located in `src/lib/admin.ts`:

```typescript
// Check if user is admin
await isAdmin(userId);

// Require admin access (throws if not)
await requireAdmin(userId);

// Get user role
await getUserRole(userId);
```

## Troubleshooting

### "Forbidden - Admin only" Error

- You're not logged in as an admin
- Check your user role in database:
  ```sql
  SELECT id, email, role FROM app.users WHERE email = 'your@email.com';
  ```

### Can't Create First Admin

- Ensure `SUPABASE_SERVICE_ROLE_KEY` is set
- Check the key is the service_role key (not anon key)
- Verify database trigger exists: `handle_new_user()`

### Users Can Still Register

- Check that `/app/register/page.tsx` redirects to `/login`
- Clear browser cache
- Check for other registration routes

## File Structure

```
webapp/
├── src/
│   ├── app/
│   │   ├── api/admin/users/           # Admin API routes
│   │   ├── private/[slug]/admin/users/ # Admin UI page
│   │   ├── login/page.tsx             # Login (no signup link)
│   │   └── register/page.tsx          # Redirects to login
│   ├── lib/
│   │   └── admin.ts                   # Admin helper functions
│   └── scripts/
│       └── create-first-admin.ts      # First admin script
├── prisma/
│   └── schema.prisma                  # User role enum added
└── ADMIN_SETUP.md                     # This file
```

## Next Steps

After setup:

1. ✅ Create your first admin user
2. ✅ Login and verify admin access
3. ✅ Navigate to User Management
4. ✅ Create additional user accounts
5. ✅ Distribute credentials to users (securely!)

## Support

For issues or questions:

- Check Supabase logs for auth errors
- Check Prisma logs for database errors
- Verify environment variables are set
- Check browser console for client errors
