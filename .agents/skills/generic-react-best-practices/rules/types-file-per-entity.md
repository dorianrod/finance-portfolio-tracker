---
title: One Type File per Entity with Predictable Names
impact: MEDIUM
impactDescription: makes every entity and its variants easy to locate
tags: types, naming, files, type-alias, conventions
---

## One Type File per Entity with Predictable Names

**Impact: MEDIUM (makes every entity and its variants easy to locate)**

Give each main entity its own `types/[entity].type.ts` file, named in singular camelCase. Its statuses can live in a shared `statuses.type.ts`. Declare types with `type` aliases, not `interface`. Name the variants after the entity (`Entity`, `EntityStatus`, `EntityFilters`, `[Action]EntityPayload`) so that a type is found from its name alone and grep returns one definition.

Where each variant lives:

- **Filters** live next to the store that uses them: `types/[entity]Filters.type.ts` for a feature store, `pages/[page]/types/[entity]Filters.type.ts` for a page store.
- **Payloads** stay private in the mutation hook file. Move one to `types/[action][Entity]Payload.type.ts` only when several mutations share it.
- Sub-shapes that only exist inside an entity (`InvoiceRecipient`, `PaymentSection`) stay in that entity's file.

**Incorrect (catch-all file, plural name, interfaces, ad-hoc names):**

```typescript
// domains/sales/invoices/shared/types/types.ts
export interface Invoices {
  uuid: string
  globalStatus: string
}
export interface ListParams { /* ... */ }
export interface Body { /* ... */ }
```

**Correct (one file per entity, type aliases, entity-prefixed names):**

```typescript
// domains/sales/invoices/shared/types/invoice.type.ts
export type Invoice = {
  uuid: string
  globalStatus: GlobalStatus
  createdAt: Date
}

// domains/contracts/shared/types/statuses.type.ts (excerpt)
export type ContractStatus = 'DRAFT' | 'WAITING_FOR_REVIEW' | 'ONGOING' | 'CLOSED' | 'CANCELLED'

// domains/sales/invoices/features/list/pages/list/types/invoiceFilters.type.ts
export type InvoiceFilters = { /* ... */ }
```
