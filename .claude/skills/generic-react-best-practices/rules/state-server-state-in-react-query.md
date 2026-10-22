---
title: Keep Server Data in React Query, Not in Atoms
impact: MEDIUM-HIGH
impactDescription: avoids stale copies that miss cache invalidation
tags: state, jotai, react-query, server-state
---

## Keep Server Data in React Query, Not in Atoms

**Impact: MEDIUM-HIGH (avoids stale copies that miss cache invalidation)**

Atoms hold client-only state: filters, search, sort, selection, edit modes, tabs, modal state. Server data (entities, lists, counts, loading/error flags) stays in the TanStack Query hooks of `apis/`. A copy in an atom misses the invalidations of mutations, and the screen keeps showing old data after a save.

**Incorrect (query result mirrored into atoms):**

```ts
// stores/orders.atoms.ts
export const ordersAtom = atom<Order[]>([])
export const isOrdersLoadingAtom = atom<boolean>(false)

// page component
const result = useGetOrdersQuery(params)
const setOrders = useSetAtom(ordersAtom)
useEffect(() => {
  if (result.data) setOrders(result.data.pages.flatMap(page => page.items))
}, [result.data, setOrders])
```

**Correct (atoms hold the query inputs; the data comes from the query hook):**

```ts
// stores/list.atoms.ts — client-only state
export const orderFiltersAtom = atom<OrderFilters>(DEFAULT_FILTERS)
export const orderSearchAtom = atom<string>('')
export const selectedOrderIdsAtom = atom<ReadonlySet<string>>(new Set<string>())

// pages/list/services/actions/useGetOrders.ts — data orchestration hook
export function useGetOrders() {
  const filters = useAtomValue(orderFiltersAtom)
  const search = useAtomValue(orderSearchAtom)
  const params = useMemo(() => ({ ...filters, search }), [filters, search])
  const result = useInfiniteQuery(ordersInfiniteQueryOptions(params)) // the atoms are the query inputs
  const items = useMemo(() => result.data?.pages.flatMap(page => page.items) ?? [], [result.data])
  return { ...result, items }
}

// consumers derive what they need from the query + the atom
const { items } = useGetOrders()
const selectedIds = useAtomValue(selectedOrderIdsAtom)
```

Only exception: filter *options* published from the list metadata into an atom (they must survive filtering). Never extend it to entities.
