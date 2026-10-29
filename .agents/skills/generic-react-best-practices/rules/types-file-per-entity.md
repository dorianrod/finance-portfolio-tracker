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


### Enforcement and local support contracts

Enable `local/entity-type-files` at error level. In canonical entity files, reject independent exported object shapes that are not sub-shapes of the main entity; preserve derived variants and closed status unions. Follow references between local sub-shapes. Use type aliases except when a dependency explicitly requires interface merging.

Also inspect exported object aliases in domain implementation modules. An independent object exported beside an unrelated helper should not be hidden there merely because the file is outside `types/`. A local function's explicit input/output contract and its referenced sub-shapes may stay local. Private implementation shapes, dependency augmentations and dedicated colocated support-contract modules remain valid; neither a record's size nor its name alone establishes an entity.

This bounded check does not decide whether every return shape or colocated `*.types.ts` contract deserves entity status. Review those candidates by their actual consumers, lifetime and ownership. Reusable entities go to the nearest owning `types/[entity].type.ts`; small component props and helper configuration stay with their owner. Verify an incorrectly placed exported object and a valid helper signature through the application's configuration.

### Complementary script use

When reviewing entity placement, use an application architecture inventory that
enumerates exported object aliases outside canonical entity files, if available
through the documented [command bindings](../references/project-enforcement.md).
Inspect each candidate's actual consumers, lifetime and relation to its owning
function before moving it. A valid local helper contract can appear in the output.

Check the inventory's file and syntax limits; it may omit interfaces, reexports
or other type forms. Review eligible contracts beyond that output and keep
`local/entity-type-files` enabled. Apply this rule's MEDIUM impact to these
candidates even when the same command also emits critical component-role signals.
