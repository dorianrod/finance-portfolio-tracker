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

The module suffix and exported identifier have separate roles. For example,
`stores/orderFilters.atoms.ts` may export `orderFiltersAtom`:
`orderFiltersAtom.ts` does not follow the module convention. A shorter concern
name such as `filters.atoms.ts` is valid when the owning folder supplies the
business scope. Do not require the filename to repeat the exported `Atom` suffix.
Apply the same module convention to generic atom modules owned by shared UI.
Keep exported identifier conventions in `state-atom-naming` and decide the owning
scope through `state-domain-vs-page-location`.

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

### Complementary script use

Inventory store barrels, for example with
`rg --files src/domains | rg '(^|/)stores/(.*/)?index\.ts$'`; the inventory must
be empty. Use the application's synchronous import-cycle checker when reviewing
store dependencies or changing their runtime imports. Resolve its invocation
through the application's documented [command bindings](../references/project-enforcement.md)
and run the same graph check in CI.

Resolve the application's configured aliases and follow synchronous value imports
and reexports. Erased type-only edges and deferred dynamic imports do not create
synchronous initialization cycles. Exercise a real aliased cycle, an acyclic
neighbor and type-only/deferred edges, then run the check against production
source in CI. This graph check does not prove that deferred module loading is
deadlock-free or that every business dependency has the correct owner.
Inspect store naming, concern boundaries and direct imports separately; an empty
cycle result does not prove any of those requirements. A store barrel violates
this rule even when its current graph is acyclic.

### ESLint Enforcement

Enable `local/atom-contract` at error level to check production variable exports
initialized directly by resolved Jotai `atom` or `atomWithStorage` constructors,
including aliases and separate export lists. Require a concern-owned module
under `stores/` ending in `.atoms.ts` or `.store.ts`. Keep private per-instance
atoms and factory implementations under their existing stability contract.
Custom factory outputs and opaque wrappers still require ownership review.

Verify a rejected legacy filename and valid `.atoms.ts` and `.store.ts` neighbors
through the consuming configuration. Use coordinated refactoring to rename files
and update their consumers as described by `arch-domain-first-layout`; the lint
diagnostic does not itself perform that migration.

See also: `quality-single-public-export`, `state-atom-naming`, `state-domain-vs-page-location`
