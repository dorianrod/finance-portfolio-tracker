---
title: Keep Shared Code Free of Domain Knowledge
impact: CRITICAL
impactDescription: keeps shared/ reusable and cycle-free
tags: arch, shared, boundaries, naming, generic-props
---

## Keep Shared Code Free of Domain Knowledge

**Impact: CRITICAL (keeps shared/ reusable and cycle-free)**

`src/shared/` must never import from `src/domains/*`, and a main-domain `shared/` folder (e.g. `src/domains/sales/shared/`) must never import from one of its sub-domains. Neither may use a concrete entity's vocabulary in file, type, prop or function names: an `invoiceId` prop in shared code is a sign the extraction is incomplete.

**Incorrect (shared code knows about one sub-domain):**

```tsx
// src/domains/sales/shared/components/AccessesBlockItem.tsx
type AccessesBlockItemProps = {
  invoiceId: string
  onResend: (invoiceId: string) => void
}
```

**Correct (generic names, data and callbacks injected by the caller):**

```tsx
// src/domains/sales/shared/components/AccessesBlockItem.tsx
import type { Access } from '@/domains/sales/shared/types/access.type'

type AccessesBlockItemProps = {
  access: Access
  parentId: string
  onResend: (parentId: string) => void
}
```

Prefer injecting rendered content or data (`table: ReactNode`, `histories: History[]`) over passing an id that the shared component would use to fetch domain data itself. In `src/shared/`, operate on transverse types from `src/shared/types/` or on generics.

A reference or demo folder using business vocabulary is not shared code: forbid importing it from production code with ESLint.
