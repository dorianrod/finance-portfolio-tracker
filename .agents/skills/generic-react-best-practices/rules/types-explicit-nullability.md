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

### ESLint Enforcement

Enable `local/explicit-nullability` for production domain code to reject an optional property whose direct type union also contains `null`. Preserve required nullable properties, optional non-nullable properties, nullable collection items and nullable function results. Dependency module augmentation follows the external contract and is outside this convention. Check rejected and neighboring valid examples through the consuming application's actual configuration.

This syntax-level check does not resolve nullability hidden in named aliases, imported types or mapped types. Review those contracts and the business reason for each nullable field manually; a diagnostic cannot decide which absence representation is appropriate. Do not autofix the choice between a missing property and an explicit null.
