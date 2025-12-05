# Remove School Information from Organization Profiles

## Overview

Remove school-specific fields from organization profiles and rename all "district" terminology to generic "organization" terminology. The Urban Institute API integration will be removed entirely - users will only be able to create organizations using the current "custom organization" flow.

---

## Phase 1: Database Schema Changes

**File:** `prisma/schema.prisma`

Remove these fields from the `Organization` model:

```prisma
// REMOVE ALL OF THESE:
districtDataYear       Int?
enrollment             Int?
highestGrade           Int?
latitude               Float?
longitude              Float?
lowestGrade            Int?
numberOfSchools        Int?
leaId                  String?    @unique
stateLeaId             String?
urbanCentricLocale     Int?

// REMOVE these indexes:
@@index([leaId])
```

**Action:** Run `npx prisma migrate dev --name remove_school_fields`

### Also in Schema - Recommendation Model

Rename field in `Recommendation` model:

```prisma
// RENAME:
districtName   String  →  organizationName   String
```

---

## Phase 2: AI Type System (DistrictInfo → OrganizationInfo)

### File: `src/lib/ai/prompts/chat-assistant.ts`

- Rename interface `DistrictInfo` → `OrganizationInfo`
- Remove fields: `enrollment`, `numberOfSchools`, `lowestGrade`, `highestGrade`
- Rename local variable: `districtName` → `organizationName` (line 32)
- Rename function `buildDistrictContext()` → `buildOrganizationContext()`
- Update all prompt text: replace "district" → "organization" (~20 occurrences)
- Update greeting example to be generic (not K-12 specific)
- Update example prompts: remove K-12 and district-specific language

### File: `src/lib/ai/prompts/chat-editor.ts`

- Remove from `OrganizationInfo` interface: `enrollment`, `numberOfSchools`, `lowestGrade`, `highestGrade`

### File: `src/lib/ai/tools/grant-search-tool.ts`

- Update import: `DistrictInfo` → `OrganizationInfo` from `chat-assistant.ts`
- Update parameter name: `districtInfo` → `organizationInfo`
- Remove enrollment from tool description

### File: `src/lib/ai/prompts/tools/grantsVectorStore.ts`

- Update prompt text: remove "district" references (3 occurrences)

---

## Phase 3: Agent Files

### File: `src/lib/ai/chat-agent.ts`

- Update import: `DistrictInfo` → `OrganizationInfo`
- Rename parameter: `districtInfo` → `organizationInfo`

### File: `src/lib/ai/editor-agent.ts`

- Update import: `DistrictInfo` → `OrganizationInfo`
- Update `toDistrictInfo()` → `toOrganizationInfo()`
- Remove school fields from conversion function

---

## Phase 4: API Routes

### File: `src/app/api/ai/chat-assistant/route.ts`

- Update type usage and variable names

### File: `src/app/api/ai/editor-assistant/route.ts`

- Remove from Prisma select: `enrollment`, `numberOfSchools`, `lowestGrade`, `highestGrade`

### File: `src/app/api/ai/recommendations/route.ts`

**Major refactor needed:**

- Update import: `DistrictInfo` → `OrganizationInfo`
- Rename variable: `districtInfo` → `organizationInfo`
- Remove `organization.leaId` check (line 79) - always create organizationInfo
- Update `buildRecommendationsPrompt()` function:
  - Rename parameter: `districtInfo` → `organizationInfo`
  - Remove all school-specific field references: `enrollment`, `lowestGrade`, `highestGrade`, `numberOfSchools`
  - Replace 32+ "district" references with "organization"
  - Update K-12 specific language to be generic
- Update recommendation creation: `districtName` → `organizationName` (line 292)

### File: `src/app/api/organizations/route.ts`

- Remove from Prisma select: `enrollment`, `numberOfSchools`, `lowestGrade`, `highestGrade`

### File: `src/app/api/organizations/[id]/route.ts`

- Remove from Prisma select: `enrollment`, `numberOfSchools`, `lowestGrade`, `highestGrade`
- Remove from PATCH body handling: `enrollment`, `numberOfSchools`, `lowestGrade`, `highestGrade`

### File: `src/app/api/admin/users/route.ts`

**Major changes:**

- Remove `organizationType` logic (`school_district` vs `custom`)
- Remove `districtData` parameter and handling entirely (includes `latitude`, `longitude` - lines 100-101)
- Simplify to only use `customOrgData` for new organizations (rename to just `orgData`)
- Remove from response: `districtInfo` object
- Remove from GET select: `leaId`, `enrollment`

### File: `src/app/api/admin/organizations/route.ts`

- Remove from Prisma select: `leaId`

### DELETE File: `src/app/api/school-districts/route.ts`

- Delete entire file (Urban Institute API integration)
- Contains `latitude`, `longitude` in `UrbanAPIDistrict` interface and response mapping (lines 15-16, 103-104)

### File: `database-trigger.sql`

**Supabase database trigger - update variable names:**

- Rename variable: `v_district_name` → `v_organization_name` (line 11)
- Update meta data key: `districtName` → `organizationName` (line 11)
- Update all usages of the variable (lines 25-26, 32)

---

## Phase 5: Frontend Pages

### File: `src/app/private/[slug]/settings/profile/page.tsx`

**Major changes:**

- Remove `GRADE_OPTIONS` constant (lines 66-82)
- Remove from `Organization` interface: `enrollment`, `numberOfSchools`, `lowestGrade`, `highestGrade`
- Remove entire "School Information" section (lines 1171-1294)

### File: `src/app/private/[slug]/admin/users/page.tsx`

**Major changes - simplify to custom org only:**

- Remove `DistrictData` interface entirely (includes `latitude`, `longitude` - lines 78-79)
- Remove from `User` interface: `leaId`, `enrollment`
- Remove from `Organization` interface: `leaId`
- Remove state: `organizationType`, `districts`, `loadingDistricts`, `districtSearch`, `showDistrictDropdown`, `selectedStateFilter`
- Remove from `newUser`: `districtData`
- Remove function: `fetchDistricts()`, `handleSearchDistricts()`, `handleSelectDistrict()`
- Remove useEffect for district fetching
- Remove entire "School District" option from organization type selector
- Remove school district form UI (state filter, district search, dropdown)
- Keep only "Custom Organization" form
- Update table header: "District" → "Organization"
- Update table cell: remove `leaId` check and enrollment display

### File: `src/app/private/[slug]/grants/page.tsx`

- Rename interface field: `districtName` → `organizationName`

### File: `src/app/private/[slug]/settings/ai/page.tsx`

- Update text: "district information" → "organization information" (2 places)

### File: `src/components/chat/Chat.tsx`

- Update sample prompt: remove "district" wording

### File: `src/components/chat/prompt-suggestions.tsx`

- Update sample prompt: remove "district" wording

### File: `src/app/private/[slug]/onboarding/page.tsx`

- Update text: "tailored to your district's profile" → "tailored to your organization's profile"

---

## Phase 6: Documentation

### File: `src/lib/ai/README.md`

- Update all "district" references to "organization"
- Update type names in documentation

### File: `src/app/api/ai/README.md`

- Update any district references

### File: `webapp/WRITING_EDITOR_ANALYSIS.md`

- Update text: "enrollment" in organization context description (line 435) - optional/minor

---

## Summary of Files to Modify

| Category   | Files                                                                                 | Complexity  |
| ---------- | ------------------------------------------------------------------------------------- | ----------- |
| Schema     | `prisma/schema.prisma` (Organization + Recommendation models)                         | Low         |
| AI Types   | `chat-assistant.ts`, `chat-editor.ts`, `grant-search-tool.ts`, `grantsVectorStore.ts` | Medium      |
| Agents     | `chat-agent.ts`, `editor-agent.ts`                                                    | Low         |
| API Routes | 7 files + 1 delete (recommendations route is HIGH complexity)                         | Medium-High |
| DB Trigger | `database-trigger.sql`                                                                | Medium      |
| Frontend   | 7 files (added onboarding page)                                                       | High        |
| Docs       | 3 files                                                                               | Low         |

**Total: 25 files to modify, 1 file to delete**

### High Complexity Files (require careful review):

1. `src/app/api/ai/recommendations/route.ts` - 32+ district references, buildRecommendationsPrompt() function
2. `src/app/private/[slug]/admin/users/page.tsx` - Remove entire district lookup flow
3. `src/lib/ai/prompts/chat-assistant.ts` - 20+ prompt text changes

---

## Execution Order

1. **Schema** - Remove fields and run migration
2. **AI Types** - Update interfaces and prompts
3. **Agents** - Update imports and parameters
4. **API Routes** - Update Prisma selects and logic
5. **Database Trigger** - Update `database-trigger.sql` and apply to Supabase
6. **Frontend** - Simplify admin page, remove profile section
7. **Docs** - Update READMEs
8. **Test** - Verify all functionality works

---

## Breaking Changes

- Existing organizations with `leaId` data will lose that reference
- School enrollment/grade data will be deleted from all organizations
- Admin user creation will no longer have school district lookup option

## Post-Deployment Actions

1. **Apply Database Trigger** - After updating `database-trigger.sql`, run the SQL in Supabase SQL Editor to update the trigger function
2. **Verify Prisma Client** - Run `npx prisma generate` to regenerate client after schema changes
