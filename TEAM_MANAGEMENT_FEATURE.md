# Team Management Feature Implementation

## Overview

Added comprehensive user management functionality to the `/private/[slug]/settings/team` page, including role management and member deletion with proper permission controls.

## ✅ Implemented Features

### 1. **API Endpoint** (`/api/organizations/members/[userId]/route.ts`)

Created new organization-scoped API endpoints for member management:

#### **PATCH** - Update Member Role

- **Permission**: Only OWNER can change roles
- **Allowed Roles**: ADMIN, MEMBER (cannot assign OWNER role)
- **Validations**:
  - User must be in same organization
  - Cannot change own role
  - Cannot change another OWNER's role
  - Only organization owner can perform this action

#### **DELETE** - Remove Member

- **Permissions**:
  - **OWNER**: Can delete both ADMIN and MEMBER roles
  - **ADMIN**: Can only delete MEMBER roles
  - **MEMBER**: Cannot delete anyone
- **Validations**:
  - Cannot delete yourself
  - Cannot delete the organization OWNER
  - User must be in same organization
  - Admins cannot delete other admins
- **Data Handling**: Cascading deletes remove all associated data (applications, chats, bookmarks)

---

### 2. **UI Enhancements** (Team Settings Page)

#### **Three-Dot Menu (⋮) Button**

- Added to the right side of each team member row
- Only visible for members the current user has permission to manage
- Shows contextual options based on permissions

#### **Dropdown Menu Options**

**For OWNERS:**

- **Change to Admin** / **Change to Member**: Toggle between roles
- **Remove from team**: Delete the member

**For ADMINS:**

- **Remove from team**: Only available for MEMBER roles

**For MEMBERS:**

- No menu displayed (view-only access)

#### **Role Change Dialog**

- Clean modal interface for changing roles
- Shows target member's name/email
- Dropdown selector with role descriptions:
  - **Member**: Can view and collaborate on grants
  - **Admin**: Can manage members and settings
- Loading state during update
- Success/error toast notifications

#### **Delete Confirmation Dialog**

- AlertDialog with strong warning
- Shows member name/email being deleted
- **Critical warning**: "All associated data including their applications, chats, and bookmarks will be deleted"
- Prevents accidental deletions
- Red destructive button styling
- Loading state during deletion

#### **UI Improvements**

- Added "You" badge to current user's row
- Shows three-dot menu only for manageable members
- Disabled menu for:
  - Current user (can't manage yourself)
  - OWNER role (protected)
  - Members you don't have permission to manage

---

## 🔐 Permission Matrix

| Current Role | Can Delete MEMBER | Can Delete ADMIN | Can Change Roles         |
| ------------ | ----------------- | ---------------- | ------------------------ |
| **OWNER**    | ✅ Yes            | ✅ Yes           | ✅ Yes (to ADMIN/MEMBER) |
| **ADMIN**    | ✅ Yes            | ❌ No            | ❌ No                    |
| **MEMBER**   | ❌ No             | ❌ No            | ❌ No                    |

**Special Rules:**

- No one can delete or modify the OWNER
- Users cannot delete or change their own role
- Only one OWNER per organization (enforced)
- Members can only view the team list

---

## 📁 Files Created/Modified

### **New Files:**

1. `/webapp/src/app/api/organizations/members/[userId]/route.ts`
   - PATCH endpoint for role updates
   - DELETE endpoint for member removal
   - Organization-scoped permissions

### **Modified Files:**

1. `/webapp/src/app/private/[slug]/settings/team/page.tsx`
   - Added dropdown menu with three-dot button
   - Added delete confirmation dialog (AlertDialog)
   - Added role change dialog
   - Implemented permission checking functions
   - Added state management for dialogs
   - Integrated API calls for delete/update

---

## 🎨 UI Components Used

- **DropdownMenu**: Three-dot menu with options
- **AlertDialog**: Delete confirmation with warning
- **Dialog**: Role change modal
- **Button**: Various actions (ghost, destructive variants)
- **Select**: Role picker dropdown
- **Badge**: Role indicators and "You" badge
- **Icons**: MoreVertical, Trash2, ShieldCheck, User, Loader2

---

## 🔄 User Flows

### **As an OWNER - Change Member Role:**

1. Click three-dot menu (⋮) next to member
2. Select "Change to Admin" or "Change to Member"
3. Dialog opens with role selector
4. Confirm by clicking "Update role"
5. Toast notification confirms success
6. Member list refreshes with new role

### **As an OWNER - Delete Member:**

1. Click three-dot menu (⋮) next to member
2. Select "Remove from team"
3. Confirmation dialog shows warning about data deletion
4. Click "Delete member" button (red/destructive)
5. Toast notification confirms deletion
6. Member removed from list

### **As an ADMIN - Delete Member:**

1. Click three-dot menu (⋮) next to MEMBER role only
2. Select "Remove from team"
3. Same deletion flow as owner
4. Note: Cannot delete other admins

### **As a MEMBER:**

1. View team members
2. No three-dot menu displayed
3. Read-only access to team list

---

## 🛡️ Security Features

1. **Server-Side Validation**: All permissions checked in API routes
2. **Organization Scoping**: Users can only manage members in their org
3. **Role Protection**: OWNER role cannot be deleted or modified
4. **Self-Protection**: Users cannot delete or modify themselves
5. **Cascading Deletes**: Prisma handles related data cleanup
6. **Auth Cleanup**: Deletes user from Supabase Auth
7. **Error Handling**: Proper error messages for permission violations

---

## 🧪 Testing Scenarios

### **Test as OWNER:**

- ✅ Change ADMIN to MEMBER
- ✅ Change MEMBER to ADMIN
- ✅ Delete ADMIN
- ✅ Delete MEMBER
- ✅ Cannot delete yourself
- ✅ Cannot delete or modify OWNER

### **Test as ADMIN:**

- ✅ Delete MEMBER
- ✅ Cannot delete ADMIN
- ✅ Cannot delete OWNER
- ✅ Cannot change roles
- ✅ Cannot delete yourself

### **Test as MEMBER:**

- ✅ View team members
- ✅ No management options visible
- ✅ See own "You" badge

### **Error Cases:**

- ✅ Attempting to delete non-existent user
- ✅ Attempting to manage user from different org
- ✅ Invalid role assignment
- ✅ Network errors handled gracefully

---

## 📊 Data Impact

### **When Deleting a User:**

The following data is **automatically deleted** via Prisma cascade:

- User account (app.users)
- AI Chats (ai_chats)
- Chat Messages (ai_chat_messages)
- Grant Bookmarks (grant_bookmarks)
- Applications (applications) - if user created them
- Application Documents (application_documents) - via applications
- Supabase Auth account

**Note**: Organization data, opportunities, and other users remain intact.

---

## 🎯 Key Implementation Details

### **Permission Check Functions:**

```typescript
canManageMember(member): boolean
  - Can't manage yourself
  - Can't manage OWNER
  - OWNER can manage everyone else
  - ADMIN can only manage MEMBER roles

canDeleteMember(member): boolean
  - Same as canManageMember

canChangeRole(member): boolean
  - Only OWNER can change roles
  - Can't change own role
  - Can't change OWNER role
```

### **State Management:**

- `currentUserId`: Tracks current user to prevent self-management
- `currentUserRole`: Determines available actions
- `memberToDelete`: Holds member pending deletion
- `memberToChangeRole`: Holds member pending role change
- Dialog states for confirmation flows

---

## 🚀 Future Enhancements

Potential improvements:

1. **Bulk Operations**: Select and delete/update multiple members
2. **Activity Logs**: Track who made changes and when
3. **Role Descriptions**: More detailed permission explanations
4. **Transfer Ownership**: Allow OWNER to transfer role to another user
5. **Soft Delete**: Archive users instead of permanent deletion
6. **Email Notifications**: Notify users of role changes
7. **Audit Trail**: Keep history of role changes and deletions

---

## 📝 Notes

- All functionality follows the existing codebase patterns
- Uses established UI components from shadcn/ui
- Consistent with organization-based multi-tenancy architecture
- Proper TypeScript typing throughout
- Toast notifications for user feedback
- Loading states for better UX
- No linting errors

---

## ✅ Checklist Completed

- [x] Create API endpoint for role updates (OWNER only)
- [x] Create API endpoint for member deletion (OWNER/ADMIN with rules)
- [x] Add three-dot menu button to team member rows
- [x] Implement role change dialog
- [x] Implement delete confirmation dialog
- [x] Add permission checking logic
- [x] Add "You" badge for current user
- [x] Handle loading states
- [x] Toast notifications for all actions
- [x] Error handling for edge cases
- [x] Server-side permission validation
- [x] Prevent self-management
- [x] Protect OWNER role
- [x] Test all permission scenarios
