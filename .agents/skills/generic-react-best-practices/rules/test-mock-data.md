---
title: Build Typed, Deterministic Mock Data in the Owning mocks Folder
impact: MEDIUM
impactDescription: reproducible tests that break when the domain type changes
tags: test, mocks, fixtures, dates, types
---

## Build Typed, Deterministic Mock Data in the Owning mocks Folder

**Impact: MEDIUM (reproducible tests that break when the domain type changes)**

Fixtures live in the owning feature's `mocks/<entity>.mock.ts`, or in the nearest scoped `shared/mocks/` when sibling features reuse them. They are annotated with the domain entity, never cast (`as Invoice[]` hides missing or renamed fields). They use fixed `Date` values (`new Date('2026-01-15T09:00:00.000Z')`, never `new Date()`), a unique id per item, and varied values that cover each state the UI branches on. A factory with `overrides` lets each test state only what it cares about.

A `mocks/` folder holds typed fixtures only. Network handlers (MSW) live in one shared mock-server folder and reuse these fixtures, so tests and the dev environment agree on the same data (see `test-mock-network-not-internals`).

**Incorrect (cast hides the missing required fields):**

```ts
export const mockInvoices = [
  {
    id: 'invoice-1',
    createdAt: new Date('2026-01-15T09:00:00.000Z'),
    status: 'DRAFT',
  },
  {
    id: 'invoice-2',
    createdAt: new Date('2026-02-01T09:00:00.000Z'),
    status: 'PAID',
  },
] as Invoice[]
```

**Correct (annotated factory with overrides, fixed dates, distinct ids and states):**

```ts
import type { Invoice } from '@/domains/sales/invoices/shared/types/invoice.type'

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
  makeInvoice({
    id: 'invoice-2',
    status: 'PAID',
    paidAt: new Date('2026-03-01T00:00:00.000Z'),
  }),
]
```

When fixtures from two domains have to agree (contacts → accounts), add a small `*.mock.test.ts` that checks the shared ids and their uniqueness.

### ESLint Enforcement

Enable `local/test-fixture-contract` at error level for tests and mock-data modules. With TypeScript information, reject object/array fixtures whose source shape is not assignable to the asserted type, including angle-bracket casts, immutable aliases and double casts through `unknown`. Preserve annotations, `satisfies`, `as const`, explicit partial contracts and DOM narrowing. A complete cast may remain assignable; prefer the annotation/factory convention during review.

In `mocks/` and `*.mock.*`, reject the live clock (`new Date()`, `Date()`, `Date.now()`) and `Math.random()`, including immutable aliases. Keep controlled-clock assertions in tests valid. Fixed dates and explicitly seeded generators remain valid.

The check does not prove unique IDs or fixture ownership, follow arbitrary factories or discover every nondeterministic source. Review those properties separately. It does not autofix missing fields, choose business defaults or invent dates.

### Fixture ownership detection

The configured `local/test-fixture-contract` check also rejects a statically
recognizable complete defaults factory inside a test: an explicit return type
resolves to a domain-owned `types/*.type.ts` entity, a direct returned object
supplies its required base fields, and at most one optional-field override
parameter is spread last. It follows imported entity aliases and supported union
variants, and handles function declarations, expressions and arrow functions.

**Incorrect (typed, deterministic defaults remain in a test):**

```ts
// order.test.ts
import type { Order } from './domains/orders/types/order.type'
function order(overrides: Partial<Order> = {}): Order {
  return { id: 'order-1', amount: 100, ...overrides }
}
```

**Correct (owning fixture plus test-specific overrides):**

```ts
// domains/orders/mocks/order.mock.ts
export function order(overrides: Partial<Order> = {}): Order {
  return { id: 'order-1', amount: 100, ...overrides }
}
// order.test.ts
const sample = order({ amount: 200 })
```

The detector deliberately leaves expected assertion values, raw validation input,
Partial arguments and existing-state updates alone. Inferred/opaque factories,
multiple-statement builders, local support contracts and the nearest business
owner need semantic review. An imported type or structural assignability alone
does not prove a fixture. Inventory complete sample baselines and factories,
including valid-looking typed ones, separately from cast/clock diagnostics.
Do not mark placement reviewed merely because typing and determinism pass.

### Complete sample inventory

When auditing fixture ownership, run the following from the consuming root (or
use its configured command alias):

```sh
react-best-practices-fixtures --project <config.json>
```

This inventory complements the existing ESLint check; it does not assign a violation
from a structural type match. Inspect every candidate's definition, consumers and
nearest owning mocks, retaining explicit case parameters and raw transport input
when they are not separately maintained fixture defaults.

The command enumerates test object literals against domain-owned canonical type
contracts using the actual TypeScript project. It includes inferred or annotated
values, generated rows, imported aliases, interfaces, mapped object contracts,
intersection inputs and object variants of unions. It has no minimum field count
and does not restrict types to the plain `Object` flag. A composed contextual
input can satisfy two contracts despite fresh-literal excess-property checks
against either constituent on its own.

The JSON records test/contract content hashes, locations, source expressions,
resolved contracts, contextual types, candidates and explicit exclusion reasons.
Supported expected assertion values (including aliases and named expected data),
typed `Partial` overrides, owning-mock consumers, parametrized case rows and
recognized Yup validation inputs are distinguished. Spreads composing existing
samples/state remain recorded for manual review. Arbitrary transport wrappers,
action inputs and scalar case data can remain candidates: their meanings are not
recoverable from assignability alone.

Inventory collection exits successfully even with candidates. Missing/invalid
project or source inputs fail rather than returning a clean empty result.
Computed fields, opaque builders, arbitrary dynamic aliases and noncanonical
local support contracts remain manual obligations. A zero candidate count is not
proof of correct ownership, unique IDs or complete determinism. Preserve the
normal full-project lint gate and inspect these remaining obligations separately.
