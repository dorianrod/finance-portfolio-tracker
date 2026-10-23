---
title: No index.ts in stores/, One File per Concern
impact: HIGH
impactDescription: prevents circular imports and keeps atoms discoverable
tags: arch, stores, jotai, barrel, circular-deps, naming
---

## No index.ts in stores/, One File per Concern

**Impact: HIGH (prevents circular imports and keeps atoms discoverable)**

Never add an `index.ts` barrel to a state or store folder (feature or page level), and import each store file directly. Atoms are imported by queries, page actions and components at the same time; a barrel ties all of them to every atom file, is the typical source of circular imports, and defeats tree-shaking.

Give each file one concern and a name that says it:

- `<concern>.atoms.ts` for feature and page atoms: `filters.atoms.ts`, `selection.atoms.ts`, `form.atoms.ts`, or a feature name (`reminderModal.atoms.ts`). Never a generic `atoms.ts` / `state.ts` mixing filters, selection, modals and tabs.
- `<name>.store.ts` for app-level stores (session, user, flags) and for shared modules that pair a factory with its hook.

**Incorrect (barrel re-export):**

```ts
// src/domains/sales/orders/features/list/stores/index.ts
export * from './filters.atoms'
export * from './selection.atoms'

// consumer
import { ordersFiltersAtom, selectedOrderIdsAtom } from '@/domains/sales/orders/features/list/stores'
```

**Correct (explicit file per concern, direct imports):**

```ts
// src/domains/sales/orders/features/list/stores/
//   filters.atoms.ts     selection.atoms.ts
// src/domains/sales/orders/features/detail/pages/detail/stores/
//   reminderModal.atoms.ts     form.atoms.ts

import { ordersFiltersAtom } from '@/domains/sales/orders/features/list/stores/filters.atoms'
import { selectedOrderIdsAtom } from '@/domains/sales/orders/features/list/stores/selection.atoms'
```

Audit: `find src/domains -path "*stores*" -name index.ts` must return nothing. Detect cycles with a circular-dependency checker in CI.

See also: `vercel-react-best-practices` → `bundle-barrel-imports`
