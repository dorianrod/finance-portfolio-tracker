---
title: Place Stores at Feature or Page Level by Reuse
impact: MEDIUM-HIGH
impactDescription: avoids cross-page coupling and orphan business state
tags: state, jotai, stores, location, architecture
---

## Place Stores at Feature or Page Level by Reuse

**Impact: MEDIUM-HIGH (avoids cross-page coupling and orphan business state)**

Put an atom in a feature's `stores/` only when several pages, components or services of that feature share it (list filters read by actions, selection read by bulk actions). Everything owned by one page (modal state, page filters, form/edit state, tabs) goes in the feature's `pages/[page]/stores/`. State shared by sibling features moves to their nearest common ancestor's `shared/stores/`. Persisted or app-level atoms live in their owning feature; the app-shell domain is reserved for session state, and `src/shared/stores/` only holds generic, business-agnostic atoms.

**Incorrect (page state promoted to the domain, business state in shared):**

```text
src/domains/contracts/features/detail/stores/reminderModal.atoms.ts   # used by one page only
src/shared/stores/orderFilters.atoms.ts                              # business state in global shared
src/domains/appShell/features/session/stores/invoiceTabs.store.ts    # invoice state in app shell
```

**Correct (scope follows the consumers):**

```text
src/domains/sales/orders/features/list/stores/filters.atoms.ts       # read across the list feature
src/domains/sales/orders/features/list/stores/selection.atoms.ts
src/domains/contracts/features/detail/pages/detail/stores/reminderModal.atoms.ts
src/domains/sales/invoices/features/detail/pages/detail/stores/uploadInvoiceFileModal.atoms.ts
src/domains/appShell/features/session/stores/auth.store.ts           # session only
src/shared/stores/confirmModal.atoms.ts                              # generic, no business
```

Start at page level; move an atom up to the feature only when another consumer in that feature needs it. Promote it to the nearest scoped `shared/stores/` only when sibling features need the same state.
