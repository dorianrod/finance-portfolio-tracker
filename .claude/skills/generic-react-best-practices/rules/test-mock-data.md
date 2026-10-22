---
title: Build Typed, Deterministic Mock Data in the Domain mocks Folder
impact: MEDIUM
impactDescription: reproducible tests that break when the domain type changes
tags: test, mocks, fixtures, dates, types
---

## Build Typed, Deterministic Mock Data in the Domain mocks Folder

**Impact: MEDIUM (reproducible tests that break when the domain type changes)**

Domain fixtures live in `src/domains/<domain>/<subDomain>/mocks/<entity>.mock.ts` and are annotated with the domain entity, never cast (`as Invoice[]` hides missing or renamed fields). They use fixed `Date` values (`new Date('2026-01-15T09:00:00.000Z')`, never `new Date()`), a unique id per item, and varied values that cover each state the UI branches on. A factory with `overrides` lets each test state only what it cares about.

A domain `mocks/` folder holds typed fixtures only. Network handlers (MSW) live in one shared mock-server folder and reuse these fixtures, so tests and the dev environment agree on the same data (see `test-mock-network-not-internals`).

**Incorrect (cast hides the missing required fields):**

```ts
export const mockInvoices = [
  { id: 'invoice-1', createdAt: new Date('2026-01-15T09:00:00.000Z'), status: 'DRAFT' },
  { id: 'invoice-2', createdAt: new Date('2026-02-01T09:00:00.000Z'), status: 'PAID' },
] as Invoice[]
```

**Correct (annotated factory with overrides, fixed dates, distinct ids and states):**

```ts
import type { Invoice } from '@/domains/sales/invoices/types/invoice.type'

export const makeInvoice = (overrides: Partial<Invoice> = {}): Invoice => ({
  id: 'invoice-1',
  createdAt: new Date('2026-01-15T09:00:00.000Z'),
  status: 'DRAFT',
  amount: 1250.5,
  paidAt: null,
  // ...every other required field of Invoice
  ...overrides,
})

export const mockInvoices: Invoice[] = [
  makeInvoice(),
  makeInvoice({ id: 'invoice-2', status: 'PAID', paidAt: new Date('2026-03-01T00:00:00.000Z') }),
]
```

When fixtures from two domains have to agree (contacts → accounts), add a small `*.mock.test.ts` that checks the shared ids and their uniqueness.
