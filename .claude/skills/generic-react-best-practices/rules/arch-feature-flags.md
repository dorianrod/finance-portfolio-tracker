---
title: Gate Experimental Features With a Typed Flag Registry
impact: HIGH
impactDescription: unfinished features never reach production users
tags: arch, feature-flags, feature-toggle, release
---

## Gate Experimental Features With a Typed Flag Registry

**Impact: HIGH (unfinished features never reach production users)**

Every experimental or unfinished feature is gated by a flag declared in one typed registry and read through one hook exposed by a transverse module. Never gate with an ad-hoc env check, a query param or a hand-read `localStorage` key: they are untyped, scattered, impossible to list and easy to forget. Production must always serve the flag-off version unless the flag is explicitly enabled by your flag source.

**Incorrect (ad-hoc switch, readable and writable by anyone):**

```tsx
export const OrdersToolbar: FC = () => {
  const showExportV2 = localStorage.getItem('exportV2') === 'true'
  return <div>{showExportV2 && <ExportAction />}</div>
}
```

**Correct (one registry, typed key, one reading hook):**

```tsx
// src/domains/featureFlags/features/registry/constants/flags.ts
export const FLAGS = {
  ordersExportV2: { description: 'New export dialog on the orders list' },
} as const satisfies Record<string, { description: string }>

export type FlagKey = keyof typeof FLAGS

// src/domains/featureFlags/features/registry/services/useFlag.ts
export const useFlag = (key: FlagKey): boolean => useAtomValue(flagsAtom)[key] ?? false

// src/domains/sales/orders/features/list/pages/list/components/OrdersToolbar.tsx
export const OrdersToolbar: FC = () => {
  const isExportV2Enabled = useFlag('ordersExportV2')
  return <div>{isExportV2Enabled && <ExportAction />}</div>
}
```

- Gate at the highest meaningful level (an action, a tab, a route element) so the flag-off path stays the untouched existing behavior.
- The key type is derived from the registry, so an unknown key fails type-checking.
- Remove the flag and its branch once the feature ships.
- A flag never replaces a permission: hide by permission first, then by flag.
- Import the flag hook from the module's public entry, never its internal files.
