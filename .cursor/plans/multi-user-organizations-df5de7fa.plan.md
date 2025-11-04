<!-- df5de7fa-1906-4130-8010-8955a7271acd 049fa637-e74d-4c88-99d1-fcc79669dd63 -->
# Move Onboarding to Users

## Overview

Move `onboardingCompleted` from Organization model to User model, enabling per-user onboarding flows. Each user completes their own onboarding independently, starting with `onboardingCompleted: false` by default.

## Phase 1: Database Schema Changes

### 1.1 Update Prisma Schema

File: `webapp/prisma/schema.prisma`

- Remove `onboardingCompleted` field from Organization model (line 114)
- Add `onboardingCompleted Boolean @default(false)` to User model
- Run `npx prisma db push` to apply changes
```prisma
model User {
  id                 String           @id @db.Uuid
  email              String           @unique
  name               String?
  role               OrganizationRole @default(MEMBER)
  onboardingCompleted Boolean         @default(false)  // NEW
  // ... other fields
}

model Organization {
  // Remove: onboardingCompleted Boolean @default(false)
  // ... other fields remain unchanged
}
```


### 1.2 Update Database Trigger

File: `webapp/database-trigger.sql`

Update the `handle_new_user()` function to include `onboardingCompleted` field when creating users:

```sql
-- Create user with role and onboarding status
insert into app.users (id, email, name, role, "organizationId", system_admin, "onboardingCompleted", "createdAt", "updatedAt")
values (
  new.id,
  new.email,
  v_name,
  v_role::app."OrganizationRole",
  v_organization_id,
  false,
  false,  -- NEW: onboardingCompleted defaults to false
  now(),
  now()
)
on conflict (id) do nothing;
```

Execute this updated trigger in Supabase SQL Editor.

## Phase 2: API Updates

### 2.1 Create User Update Endpoint

File: `webapp/src/app/api/user/route.ts` (may already exist)

Add or update PATCH endpoint to allow users to update their own `onboardingCompleted` status:

```typescript
export async function PATCH(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { onboardingCompleted } = body;

  // Update user's onboarding status
  const updatedUser = await prisma.user.update({
    where: { id: user.id },
    data: { onboardingCompleted },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      onboardingCompleted: true,
    },
  });

  return NextResponse.json(updatedUser);
}
```

### 2.2 Update Organization Update API

File: `webapp/src/app/api/organizations/[id]/route.ts`

Remove `onboardingCompleted` from the organization update logic (lines 73-76, 95):

```typescript
// Remove from update data:
// onboardingCompleted: body.onboarding_completed !== undefined
//   ? body.onboarding_completed
//   : undefined,

// Remove from select:
// onboardingCompleted: true,
```

### 2.3 Update Organization GET API

File: `webapp/src/app/api/organizations/route.ts`

Remove `onboardingCompleted` from the organization select statement (line 40):

```typescript
// Remove: onboardingCompleted: true,
```

## Phase 3: Frontend Updates

### 3.1 Update Layout Onboarding Check

File: `webapp/src/app/private/[slug]/layout.tsx`

Change the onboarding check to use user's `onboardingCompleted` instead of organization's (lines 33-54):

```typescript
if (user) {
  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      onboardingCompleted: true,
      organization: {
        select: {
          slug: true,
        },
      },
    },
  });

  const isOnboardingPage = pathname.includes("/onboarding");

  if (
    dbUser &&
    !dbUser.onboardingCompleted &&
    !isOnboardingPage
  ) {
    redirect(`/private/${dbUser.organization.slug}/onboarding`);
  }
}
```

### 3.2 Update Onboarding Page

File: `webapp/src/app/private/[slug]/onboarding/page.tsx`

Update to call the user API instead of organization API for completing onboarding (lines 130-151, 153-173):

```typescript
const handleCompleteOnboarding = async () => {
  setSaving(true);
  try {
    // Save organization changes first (if any)
    if (Object.keys(formData).length > 0) {
      await fetch(`/api/organizations/${organization?.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
    }
    
    // Update user's onboarding status
    const response = await fetch(`/api/user`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ onboardingCompleted: true }),
    });

    if (!response.ok) throw new Error("Failed to complete onboarding");

    toast.success("Welcome to Grantware AI! 🎉");
    router.push(`/private/${slug}/dashboard`);
    router.refresh();
  } catch (error) {
    console.error("Error completing onboarding:", error);
    toast.error("Failed to complete onboarding");
  } finally {
    setSaving(false);
  }
};

const handleSkip = async () => {
  setSaving(true);
  try {
    const response = await fetch(`/api/user`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ onboardingCompleted: true }),
    });

    if (!response.ok) throw new Error("Failed to skip onboarding");

    toast.success("You can complete your profile anytime in settings");
    router.push(`/private/${slug}/dashboard`);
    router.refresh();
  } catch (error) {
    console.error("Error skipping onboarding:", error);
    toast.error("Failed to skip onboarding");
  } finally {
    setSaving(false);
  }
};
```

## Phase 4: Testing & Validation

### 4.1 Test Cases

- Existing users: all start with `onboardingCompleted: false`
- New user registration: redirects to onboarding
- Complete onboarding: updates user record, redirects to dashboard
- Skip onboarding: marks user as complete, redirects to dashboard
- Multiple users in same org: each has independent onboarding status
- User who completed onboarding: no redirect, goes directly to app

### 4.2 Manual Testing Steps

1. Apply database schema changes
2. Update database trigger in Supabase
3. Test new user creation flow
4. Test onboarding completion
5. Test onboarding skip
6. Verify existing users can access onboarding page

## Key Files to Modify

**Database:**

- `webapp/prisma/schema.prisma` - Move field from Organization to User
- `webapp/database-trigger.sql` - Add onboardingCompleted to user creation

**API Endpoints:**

- `webapp/src/app/api/user/route.ts` - Add/update PATCH endpoint for user updates
- `webapp/src/app/api/organizations/[id]/route.ts` - Remove onboardingCompleted
- `webapp/src/app/api/organizations/route.ts` - Remove onboardingCompleted from select

**Frontend:**

- `webapp/src/app/private/[slug]/layout.tsx` - Check user.onboardingCompleted
- `webapp/src/app/private/[slug]/onboarding/page.tsx` - Update user instead of org

**Generated (auto-updated):**

- `webapp/src/generated/prisma/*` - Regenerated after schema change

### To-dos

- [ ] Move onboardingCompleted field from Organization to User model in schema.prisma
- [ ] Update database trigger to set onboardingCompleted: false for new users
- [ ] Create/update user PATCH endpoint to handle onboarding status updates
- [ ] Remove onboardingCompleted from organization GET and PATCH APIs
- [ ] Update layout.tsx to check user.onboardingCompleted instead of organization.onboardingCompleted
- [ ] Update onboarding page to call user API instead of organization API
- [ ] Test complete onboarding flow for new and existing users