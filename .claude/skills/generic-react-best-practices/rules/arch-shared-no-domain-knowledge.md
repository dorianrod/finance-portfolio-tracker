---
title: Keep Shared Code Within Its Ownership Boundary
impact: CRITICAL
impactDescription: keeps shared code reusable at its scope and prevents downward dependencies
tags: arch, shared, boundaries, ownership, dependencies
---

## Keep Shared Code Within Its Ownership Boundary

**Impact: CRITICAL (keeps shared code reusable at its scope and prevents downward dependencies)**

The meaning of `shared/` is relative to its owner. `src/shared/` has no business-domain knowledge. A scoped folder such as `src/domains/sales/shared/`, `src/domains/sales/orders/shared/` or `features/detail/shared/` may use the stable vocabulary of its enclosing scope, but its reusable contracts and non-UI code never import from or name a descendant sub-domain, feature or nested feature.

Place shared code at the nearest common ancestor of all its consumers. Reusable shared code may depend only on shared code at the same or an ancestor scope; it never depends downward on a descendant. This keeps reuse local, prevents cycles and avoids turning a high-level `shared/` folder into a business catch-all.

**Incorrect (main-domain shared code knows about a descendant entity):**

```tsx
// src/domains/sales/shared/types/invoiceAccess.type.ts
export interface InvoiceAccess {
  invoiceId: string
  recipientEmail: string
}
```

**Correct (entity vocabulary stays in the entity's own shared boundary):**

```tsx
// src/domains/sales/invoices/shared/types/invoiceAccess.type.ts
export interface InvoiceAccess {
  invoiceId: string
  recipientEmail: string
}
```

An entity-level `shared/` may contain entity types and components used by several of its features. The same requirement applies to a parent feature's `shared/`: require production consumers from at least two distinct immediate child capabilities. Several files within one feature count as one consumer. Resolve indirect usage through shared helpers, barrels and type-only contracts; tests, stories, mocks and application wrappers do not count as features.

The parent/leaf folder convention is not a sharing exception. A parent's cohesive business behavior belongs to a named child feature if it serves no other feature. Application pages compose features; shared code does not import descendant entry components or private implementation. A reusable business workflow remains a feature even when several callers use it. If all consumers belong to one branch, move the module to that branch's nearest owner instead of using shared code to evade a sibling-import restriction.

Static import graphs cannot always prove use of common inputs passed through application props. Flag missing evidence for review and inspect the actual consumers; do not add fake imports or broad exemptions. Keep genuine common source requests cached and avoid duplicating them merely to satisfy folder counts. A leaf feature owns role folders directly, without a `shared/` wrapper.

A reference or demo folder using business vocabulary is not shared code: forbid importing it from production code with ESLint.

See also: `arch-domain-first-layout`, `arch-feature-slice-layout`, `arch-transverse-only-imports`
