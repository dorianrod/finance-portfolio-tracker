---
title: Import Other Domains Only Through Transverse Domains
impact: CRITICAL
impactDescription: keeps domains isolated and free of import cycles
tags: arch, imports, boundaries, transverse, circular-deps
---

## Import Other Domains Only Through Transverse Domains

**Impact: CRITICAL (keeps domains isolated and free of import cycles)**

A domain imports only from itself, from `src/shared`, and from an explicit short list of transverse domains (stable, generic, no business context: for example `appShell` or a `featureFlags` module). Sibling sub-domains (e.g. `orders` and `invoices`) and other business domains (`projects`, `contracts`, `directory`...) are forbidden: such imports couple release cycles and create import cycles. Enforce the allowed list with an ESLint restriction on import paths.

**Incorrect (orders reaches into its sibling invoices):**

```tsx
// src/domains/sales/orders/features/detail/pages/detail/components/InvoicesBlock.tsx
import { InvoiceCard } from '@/domains/sales/invoices/features/detail/components/InvoiceCard.feature'
```

**Correct (shared code is promoted, transverse domains are imported freely):**

```tsx
// Promoted once to the main domain's shared folder, used by both sub-domains
import { toOrderReference } from '@/domains/sales/shared/helpers/transformers/toOrderReference'
// Transverse domains from the explicit list are always allowed, through their public entry
import { Alert } from '@/domains/appShell/features/alerts/components/Alert.view'
import { useFlag } from '@/domains/featureFlags/features/registry/services/useFlag'
```

Escape hatches, in order of preference:

1. Move the code to the main domain's `shared/` (used by sibling sub-domains) or to `src/shared/` (generic, no domain vocabulary).
2. Reference the other entity by id or route (store `projectId`, link with a path string) instead of importing its hooks or components.
3. Add a domain to the transverse list only by an explicit architecture decision.

### Analysis aids

Enable `local/import-boundaries` at error level, or equivalent resolved import
restrictions, to detect forbidden domain dependencies. Inspect ownership and the
explicit transverse list manually; a valid import path alone does not establish
a justified business boundary.

Use the application's synchronous import-cycle checker when reviewing dependency
boundaries or changing runtime import paths, following the graph contract in
`arch-stores-no-index`. It complements the import restrictions: a forbidden
one-way domain import can be acyclic, and a cycle can exist inside one domain.
Assign each finding to the violated rule rather than treating every graph result
as a cross-domain violation.

See also: `arch-shared-no-domain-knowledge`, `arch-feature-flags`
