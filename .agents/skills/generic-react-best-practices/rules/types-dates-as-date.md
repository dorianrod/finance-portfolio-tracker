---
title: Type Domain Dates as Date and Convert Them in Yup
impact: HIGH
impactDescription: removes ad-hoc date parsing from components and helpers
tags: types, dates, yup, serialization, mocks
---

## Type Domain Dates as Date and Convert Them in Yup

**Impact: HIGH (removes ad-hoc date parsing from components and helpers)**

In a domain type, a date is `Date`, or `Date | null` when it can be empty, never an ISO `string`. ISO strings exist only on the wire, and both conversions live in the hook's Yup schemas:

- response: `yup.date().nullable().default(null)` turns the ISO string into a `Date`;
- request: a `transform` on the request schema turns a `Date` back into a **date-only** `YYYY-MM-DD` string, and an empty value into `undefined`.

Formatters and sorting then work on real dates, and nobody calls `new Date(str)` or `.toISOString().split('T')[0]` in a component or a page hook.

**Incorrect (ISO string in the entity, parsing scattered in consumers):**

```tsx
// domains/projects/features/list/types/projectListItem.type.ts
export type ProjectListItem = {
  uuid: string
  publishedOn: string | null
}

// a cell component
const date = item.publishedOn ? new Date(item.publishedOn) : null
```

**Correct (Date in the entity, conversions in the hook's schemas):**

```typescript
// domains/projects/features/list/types/projectListItem.type.ts
export type ProjectListItem = {
  uuid: string
  publishedOn: Date | null
}

// domains/projects/features/list/apis/queries/useGetProjectsQuery.ts
const LIST_ITEM_SCHEMA = yup.object({
  uuid: yup.string().required(),
  publishedOn: yup.date().nullable().default(null), // ISO string → Date | null
})

const toDateOnly = (value: Date | null | undefined) =>
  value ? value.toISOString().slice(0, 10) : undefined

const REQUEST_SCHEMA = yup.object({
  publishedOnStart: yup.date().optional().transform(toDateOnly), // Date → '2025-01-15'
})
```

Define the date-only conversion once in a shared Yup helper rather than per hook. The page hook passes `Date` filter values straight into the query params. A date-only conversion drops the time part: when an endpoint needs a full timestamp, serialize it explicitly in that mutation's request schema. Mocks use fixed dates (`new Date('2025-01-15T10:00:00Z')`), never `new Date()` with no argument, so tests stay reproducible.
