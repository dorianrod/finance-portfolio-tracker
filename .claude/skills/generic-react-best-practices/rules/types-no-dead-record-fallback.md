---
title: No Fallback After a Record Lookup on a Union Key
impact: LOW-MEDIUM
impactDescription: removes dead code that hides overly wide input types
tags: types, record, mapper, fallback, union
---

## No Fallback After a Record Lookup on a Union Key

**Impact: LOW-MEDIUM (removes dead code that hides overly wide input types)**

`Record<Union, T>` already forces a value for every member of the union. A `?? fallback` after `map[key]` with a correctly typed key can never run, and it hides that the key type is too wide. Trust the type. If values outside the union really reach the code, state that explicitly: take the raw `string` and narrow it with a type guard, or add `| 'UNKNOWN'` to the union and handle it as a normal case.

**Incorrect (unreachable fallback on a typed key):**

```typescript
const STATUS_BADGE_TYPE: Record<ContractStatus, BadgeType> = {
  DRAFT: 'neutral',
  ONGOING: 'info',
  // ...
}

export const getContractStatusBadgeType = (status: ContractStatus) =>
  STATUS_BADGE_TYPE[status] ?? 'neutral'
```

**Correct (rely on exhaustiveness; narrow raw strings explicitly):**

```typescript
type BadgeType = 'neutral' | 'info' | 'success' | 'danger'

export const getContractStatusBadgeType = (status: ContractStatus): BadgeType =>
  STATUS_BADGE_TYPE[status]

// The API may send a value outside the union: accept a string and narrow it
const isContractStatus = (value: string): value is ContractStatus =>
  Object.hasOwn(STATUS_BADGE_TYPE, value)

const badgeType = isContractStatus(status)
  ? getContractStatusBadgeType(status)
  : 'neutral'
```

Exception: a display-only taxonomy that the API owns can be typed as `string` at the mapper boundary, with a deliberate fallback that has a comment (for example a `getEmailStatusBadge` mapper). Keep the input typed `string` there, so the fallback is reachable and its intent is visible.
