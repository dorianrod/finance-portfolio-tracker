---
title: Type Atoms Explicitly with DEFAULT_* Constants
impact: MEDIUM
impactDescription: prevents widened or never[] atom types and drifting resets
tags: state, jotai, typescript, defaults
---

## Type Atoms Explicitly with DEFAULT_* Constants

**Impact: MEDIUM (prevents widened or never[] atom types and drifting resets)**

Give every raw atom an explicit type parameter (`atom<T>(…)`) and pass factories their generics. Declare non-trivial initial values as exported, typed `DEFAULT_*` constants (`DEFAULT_FILTERS: OrderFilters`) so that resets, tests and URL sync compare against the same reference. Inference from `[]`, `null` or `''` gives `never[]`, `null` or `string` and lets invalid values in.

**Incorrect (inferred types, inline defaults):**

```ts
export const reminderModalAtom = atom(null) // PrimitiveAtom<null>: can never be opened
export const deletedAtom = atom('active') // string instead of ContactDeletedFilter
export const orderFiltersAtom = atom({ account: [], deliveryDateFrom: null }) // never[] / null
```

**Correct (explicit type parameters, typed constants):**

```ts
export const reminderModalAtom = atom<ReminderModalState | null>(null)
export const deletedAtom = atom<ContactDeletedFilter>(DEFAULT_CONTACT_DELETED_FILTER)

export const DEFAULT_FILTERS: OrderFilters = {
  account: [],
  deliveryDateFrom: null,
  // ...every key of OrderFilters
}
export const orderFiltersAtom = atom<OrderFilters>(DEFAULT_FILTERS)
export const resetOrderFiltersAtom = atom(null, (_get, set) => set(orderFiltersAtom, DEFAULT_FILTERS))
```

A plain boolean flag may rely on inference (`atom(false)`), but `atom<boolean>(false)` is preferred for consistency.

### ESLint Enforcement

Enable `local/atom-contract` at error level. For raw `atom` and `atomWithStorage` declarations, require explicit generics except for plain boolean flags, and report inline object, array and constructed defaults. With type information, also check calls that produce object defaults. Preserve derived read atoms and named defaults. Resolve imported constructors, namespace access and immutable aliases while respecting shadowing. Named defaults still require manual review for their type, exported `DEFAULT_*` name, ownership and safe reset semantics; arbitrary atom factories and mutable aliases are outside this bounded check.
