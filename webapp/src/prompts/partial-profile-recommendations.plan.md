# Allow Recommendations Without Full Organization Profile

## Overview

Remove the profile completeness requirement for generating recommendations. Only require organization name to exist. Show a non-blocking warning when profile is incomplete (missing mission statement or organization plan).

---

## Files to Modify

### 1. Backend: `src/app/api/ai/recommendations/route.ts`

**DELETE validation block (lines 63-76):**

```typescript
// REMOVE THIS ENTIRE BLOCK:
// 4. Validate organization profile completeness
if (
  !organization.missionStatement ||
  !organization.organizationPlan ||
  !organization.state
) {
  return NextResponse.json(
    {
      error:
        "Organization profile incomplete. Please complete your mission statement, organization plan, and location information.",
    },
    { status: 400 }
  );
}
```

The API will now proceed with whatever organization info is available.

---

### 2. Frontend: `src/app/private/[slug]/grants/page.tsx`

**Simplify `isProfileComplete` (lines 757-770):**

```typescript
// FROM (current - requires 9 fields):
const isProfileComplete = useMemo(() => {
  if (!organization) return false;
  return !!(
    organization.name &&
    organization.state &&
    organization.city &&
    organization.phone &&
    organization.email &&
    organization.missionStatement &&
    organization.organizationPlan &&
    organization.annualOperatingBudget &&
    organization.fiscalYearEnd
  );
}, [organization]);

// TO (simplified - only check name):
const isProfileComplete = useMemo(() => {
  return !!organization?.name;
}, [organization]);
```

**Update alert section (lines 1331-1350):**

```typescript
// FROM (current - blocking destructive alert):
{!isProfileComplete && (
  <Alert variant="destructive">
    <AlertCircle className="h-4 w-4" />
    <AlertTitle>Profile Incomplete</AlertTitle>
    <AlertDescription className="flex items-center justify-between">
      <span>
        Please complete all required fields in your organization
        profile to get personalized grant recommendations.
      </span>
      <Button
        variant="outline"
        size="sm"
        onClick={() => router.push(`/private/${slug}/settings/profile`)}
      >
        Go to Profile
      </Button>
    </AlertDescription>
  </Alert>
)}

// TO (warning - non-blocking):
{(!organization?.missionStatement || !organization?.organizationPlan) && (
  <Alert variant="default">
    <AlertCircle className="h-4 w-4" />
    <AlertTitle>Profile Incomplete</AlertTitle>
    <AlertDescription className="flex items-center justify-between">
      <span>
        Recommendations may be more general. Complete your mission statement
        and organization plan for better personalized results.
      </span>
      <Button
        variant="outline"
        size="sm"
        onClick={() => router.push(`/private/${slug}/settings/profile`)}
      >
        Go to Profile
      </Button>
    </AlertDescription>
  </Alert>
)}
```

---

## Summary

| File                                      | Change                                                        |
| ----------------------------------------- | ------------------------------------------------------------- |
| `src/app/api/ai/recommendations/route.ts` | Delete lines 63-76 (validation block)                         |
| `src/app/private/[slug]/grants/page.tsx`  | Simplify `isProfileComplete` to only check `name`             |
| `src/app/private/[slug]/grants/page.tsx`  | Change alert to warning style, show when missing mission/plan |

---

## Execution Order

1. Remove API validation block
2. Simplify frontend `isProfileComplete` check
3. Update alert UI to warning style
4. Test recommendations with incomplete profile
