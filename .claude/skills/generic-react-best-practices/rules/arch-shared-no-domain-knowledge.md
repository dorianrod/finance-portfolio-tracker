---
title: Keep Shared Code Within Its Ownership Boundary
impact: CRITICAL
impactDescription: keeps shared code reusable at its scope and prevents downward dependencies
tags: arch, shared, boundaries, ownership, dependencies
---

## Keep Shared Code Within Its Ownership Boundary

**Impact: CRITICAL (keeps shared code reusable at its scope and prevents downward dependencies)**

The meaning of `shared/` is relative to its owner. `src/shared/` has no business-domain knowledge. A scoped folder such as `src/domains/sales/shared/`, `src/domains/sales/orders/shared/` or `features/detail/shared/` may use the stable vocabulary of its enclosing scope, but it never imports from or names a descendant sub-domain, feature or nested feature.

Place shared code at the nearest common ancestor of all its consumers. It may depend only on shared code at the same or an ancestor scope; it never depends downward on a descendant. This keeps reuse local, prevents cycles and avoids turning a high-level `shared/` folder into a business catch-all.

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

An entity-level `shared/` may therefore contain entity types and components used by several of its features. A feature-level `shared/` may contain concepts common to its immediate sub-features. If only one feature consumes the code, keep it inside that feature instead of promoting it. Shared ownership does not justify adding another feature nesting level.

A reference or demo folder using business vocabulary is not shared code: forbid importing it from production code with ESLint.

See also: `arch-domain-first-layout`, `arch-feature-slice-layout`, `arch-transverse-only-imports`
