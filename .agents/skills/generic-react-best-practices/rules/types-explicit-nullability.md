---
title: Make Nullability Explicit and Justified
impact: HIGH
impactDescription: removes defensive code and surfaces backend laxity early
tags: types, nullability, optional, null, defensive-code
---

## Make Nullability Explicit and Justified

**Impact: HIGH (removes defensive code and surfaces backend laxity early)**

Use `| null` when a field is always present but can be null. Use `?` when the field can be missing. Use neither when the domain guarantees a value, and never combine them (`?: T | null`). For each nullable field, check that the business can really have no value, and leave a short comment saying why. If you cannot tell, ask in refinement rather than coding defensively. Default fields like lists in the Yup schema (`.default([])`) so that consumers never need `?? []`.

**Incorrect (lax optionals copied from the API, fallbacks at every use):**

```typescript
export type Order = {
  uuid: string
  deliveryDate?: Date | null
  lines?: OrderLine[] | null
  owners?: Contact[]
}

const total = (order.lines ?? []).length
const names = (order.owners ?? []).map(formatContact)
```

**Correct (guaranteed fields required, each nullable has a reason):**

```typescript
export type Opportunity = {
  uuid: string
  // Backend FK is `null=True`: opportunities created before the CRM link have no account.
  account: OpportunityAccount | null
  creationDate: Date | null
}

export type Order = {
  uuid: string
  deliveryDate: Date | null
  lines: OrderLine[] // schema: .transform(v => v ?? []).default([])
  owners: Contact[]
}

const total = order.lines.length
```
