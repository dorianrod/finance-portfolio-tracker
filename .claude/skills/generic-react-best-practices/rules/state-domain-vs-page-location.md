---
title: Place Stores at Domain or Page Level by Reuse
impact: MEDIUM-HIGH
impactDescription: avoids cross-page coupling and orphan business state
tags: state, jotai, stores, location, architecture
---

## Place Stores at Domain or Page Level by Reuse

**Impact: MEDIUM-HIGH (avoids cross-page coupling and orphan business state)**

Put an atom in the sub-domain `stores/` (`domains/[main]/[sub]/stores/`, or `domains/[domain]/stores/` for a single-level domain) only when several pages or domain hooks of the sub-domain share it (list filters read by actions, selection read by bulk actions). Everything owned by one page (modal state, page filters, form/edit state, tabs) goes in `domains/[main]/[sub]/pages/[page]/stores/`. Persisted or app-level atoms live in their owning domain; the app-shell domain is reserved for session state, and `src/shared/stores/` only holds generic, business-agnostic atoms.

**Incorrect (page state promoted to the domain, business state in shared):**

```text
src/domains/contracts/stores/reminderModal.atoms.ts   # used by the detail page only
src/shared/stores/orderFilters.atoms.ts               # business state in shared
src/domains/appShell/stores/invoiceTabs.store.ts      # domain state in the app shell
```

**Correct (scope follows the consumers):**

```text
src/domains/sales/orders/stores/filters.atoms.ts                  # read by list page + actions
src/domains/sales/orders/stores/selection.atoms.ts
src/domains/contracts/pages/detail/stores/reminderModal.atoms.ts
src/domains/sales/invoices/pages/detail/stores/uploadInvoiceFileModal.atoms.ts
src/domains/appShell/stores/auth.store.ts                         # session only
src/shared/stores/confirmModal.atoms.ts                           # generic, no business
```

Start at page level; move an atom up to the domain only when a second page needs it.
