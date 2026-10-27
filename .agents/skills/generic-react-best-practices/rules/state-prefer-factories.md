---
title: Reuse App Atom Factories Instead of Hand-Rolled Atoms
impact: MEDIUM-HIGH
impactDescription: keeps list behavior (URL sync, debounce, reset) consistent
tags: state, jotai, factories, filters, selection, sorting
---

## Reuse App Atom Factories Instead of Hand-Rolled Atoms

**Impact: MEDIUM-HIGH (keeps list behavior (URL sync, debounce, reset) consistent)**

When the app already provides an atom factory (and its owner hook) for a recurring kind of state — list filters, search and sort, multi-selection, modal `{ isOpen, data }`, edit mode — use it instead of declaring separate raw atoms. The owner hook carries the URL sync, debounce, reset or select-all logic that hand-rolled atoms silently lose. If no factory exists yet and several lists share one state shape, write one factory in the domain (or `src/shared/`) once, rather than copying atoms per list. Raw `atom<T>()` is for state with no factory (tabs, wizard answers, richer modal state).

**Incorrect (hand-rolled list state, copied for each list):**

```ts
export const invoiceSearchAtom = atom<string>('')
export const invoiceFiltersAtom = atom<InvoiceFilters>(DEFAULT_FILTERS)
export const invoiceSortAtom = atom<'asc' | 'desc' | null>('desc')
export const selectedInvoiceIdsAtom = atom<string[]>([])
```

**Correct (one locally defined factory + its owner hook, reused by every list):**

```ts
// src/shared/stores/createListAtoms.ts
export function createListAtoms<TFilters>(defaultFilters: TFilters) {
  const filtersAtom = atom<TFilters>(defaultFilters)
  const searchAtom = atom<string>('')
  const sortAtom = atom<'asc' | 'desc'>('desc')
  const selectedIdsAtom = atom<ReadonlySet<string>>(new Set<string>())
  const resetAtom = atom(null, (_get, set) => {
    set(filtersAtom, defaultFilters)
    set(searchAtom, '')
    set(selectedIdsAtom, new Set<string>())
  })
  return { filtersAtom, searchAtom, sortAtom, selectedIdsAtom, resetAtom }
}
export type ListAtoms<TFilters> = ReturnType<typeof createListAtoms<TFilters>>

// src/domains/sales/invoices/features/list/stores/list.atoms.ts
export const invoiceListAtoms = createListAtoms<InvoiceFilters>(DEFAULT_FILTERS)

// owner hook: the only place that knows how the atoms are combined
export function useListControls<TFilters>(atoms: ListAtoms<TFilters>) { /* read/write, debounce, reset */ }
```

Call the factory at module scope (see `state-module-level-atoms`) and consume it only through its owner hook.
