---
title: Use Literal Unions, Never TypeScript Enums
impact: HIGH
impactDescription: keeps types erasable and API values directly assignable
tags: types, enum, union, statuses
---

## Use Literal Unions, Never TypeScript Enums

**Impact: HIGH (keeps types erasable and API values directly assignable)**

Model a finite set of values as a string literal union. When you need to iterate over it (Yup `.oneOf`, filter options, tests), add an `ALL_[X]S` array typed with that union. Do not add a TypeScript `enum`. A union matches the raw API strings without casts, makes `Record<Union, T>` mappers exhaustive, and leaves nothing in the bundle. Enforce it with review or a lint rule such as `no-restricted-syntax` on `TSEnumDeclaration`.

**Incorrect (enum, values must be imported and cast everywhere):**

```typescript
// domains/contracts/types/statuses.type.ts
export enum ContractStatus {
  DRAFT = 'DRAFT',
  ONGOING = 'ONGOING',
  CANCELLED = 'CANCELLED',
}

const isDraft = contract.status === ContractStatus.DRAFT
```

**Correct (literal union plus an `ALL_` array for runtime use):**

```typescript
// domains/contracts/types/statuses.type.ts (excerpt)
export type ContractStatus = 'DRAFT' | 'WAITING_FOR_REVIEW' | 'ONGOING' | 'CLOSED' | 'CANCELLED'

export const ALL_CONTRACT_STATUSES: ContractStatus[] = [
  'DRAFT',
  'WAITING_FOR_REVIEW',
  'ONGOING',
  'CLOSED',
  'CANCELLED',
]

const isDraft = contract.status === 'DRAFT'
```
