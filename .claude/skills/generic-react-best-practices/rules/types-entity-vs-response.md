---
title: Separate the Domain Entity from the API Response
impact: HIGH
impactDescription: decouples the whole UI from the raw backend shape
tags: types, entity, response, yup
---

## Separate the Domain Entity from the API Response

**Impact: HIGH (decouples the whole UI from the raw backend shape)**

Export only the strict domain `Entity` from `types/[entity].type.ts`. The raw API shape (ISO strings, free strings, lax optionals) lives only in the query hook file: as its Yup schema or as a private `XxxResponse` type that is never exported. The hook's response schema is the single place where the response becomes an Entity. Components, helpers and other hooks never see the raw JSON, so a backend change touches one file.

**Incorrect (one exported type mixes API and domain shapes, consumers re-coerce):**

```tsx
// domains/sales/opportunities/types/opportunity.type.ts
export type OpportunityResponse = {
  uuid: string
  creationDate?: string // raw ISO string leaks to every consumer
}

// a component, far from the API
const created = opportunity.creationDate ? new Date(opportunity.creationDate) : null
```

**Correct (strict Entity exported, raw shape private to the hook):**

```typescript
// domains/sales/opportunities/types/opportunity.type.ts
export type Opportunity = {
  uuid: string
  opportunityCrmId: string
  account: OpportunityAccount | null
  status: string // display-only taxonomy owned by the API, shown as a badge
  creationDate: Date | null
}

// domains/sales/opportunities/apis/queries/useGetOpportunitiesQuery.ts
const ITEM_SCHEMA: yup.ObjectSchema<Opportunity> = yup.object({
  uuid: yup.string().required(),
  opportunityCrmId: yup.string().ensure(),
  account: ACCOUNT_SCHEMA.nullable().default(null),
  status: yup.string().ensure(), // tolerant: no logic branches on it
  creationDate: yup.date().nullable().default(null), // ISO string → Date, only here
})
```

If a second place needs the same raw data, write or reuse a hook that returns the Entity. Never export the Response type so another file can parse it again. When code branches on a field such as `status`, type it as a union instead (see `types-closed-values-not-string`). A `XxxListResponse` that already holds parsed Entities (`items: Order[]`) is a domain page type, not a raw Response.
