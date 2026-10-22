---
title: Pick the TanStack Query Hook by Access Pattern
impact: HIGH
impactDescription: no remount on key change, no hidden request waterfall
tags: api, react-query, suspense, infinite-query, keep-previous-data
---

## Pick the TanStack Query Hook by Access Pattern

**Impact: HIGH (no remount on key change, no hidden request waterfall)**

TanStack Query v5 hooks behave differently on loading, errors and key changes. Pick by access pattern, inside the domain query hook:

| Access pattern | Hook | Loading / errors |
| --- | --- | --- |
| One resource the screen needs to render (detail, form, dashboard) | `useSuspenseQuery` | suspends / throws (Suspense and error boundary required) |
| Paginated or infinite list | `useInfiniteQuery` | `isPending` / `isFetchingNextPage`, `data` undefined first |
| Data whose key changes while the component stays mounted (options of a select driven by another field, a filter above a table) | `useQuery` with `placeholderData: keepPreviousData` | `isPending` / `isPlaceholderData`; keeps the previous key's data while fetching |

**Incorrect (Suspense query whose key follows a form field):**

```tsx
export function useGetCityOptionsQuery(countryCode: string) {
  // every new countryCode suspends: the select unmounts and loses its state
  return useSuspenseQuery({
    queryKey: ['cities', countryCode],
    queryFn: () => fetchCityOptions(countryCode),
  })
}
```

**Correct (non-suspending query that keeps the previous options on screen):**

```tsx
import { keepPreviousData, useQuery } from '@tanstack/react-query'

export function useGetCityOptionsQuery(countryCode: string) {
  return useQuery({
    queryKey: ['cities', countryCode],
    queryFn: () => fetchCityOptions(countryCode),
    placeholderData: keepPreviousData,
  })
}

// caller: data is undefined at first, then the previous country's cities while isPlaceholderData
const { data: cities = [], isPlaceholderData } = useGetCityOptionsQuery(countryCode)
```

- Two `useSuspenseQuery` calls in the same component run one after the other (the first suspends before the second starts). Read independent resources in sibling components under the same boundary, or use `useSuspenseQueries`.
- `useQuery` does not throw: render its `error` yourself, and do not present placeholder data as the new key's result while `isPlaceholderData`.
- Use `useInfiniteQuery` with `getNextPageParam` for lists loaded by scroll or "load more" instead of page-number state.

See also: `vercel-react-best-practices` → `async-parallel`
