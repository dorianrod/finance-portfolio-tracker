---
title: Return the TanStack Result As-Is From API Hooks
impact: HIGH
impactDescription: keeps isPending, refetch and mutateAsync available to callers
tags: api, react-query, hooks, mutations
---

## Return the TanStack Result As-Is From API Hooks

**Impact: HIGH (keeps isPending, refetch and mutateAsync available to callers)**

A domain API hook returns the object produced by `useQuery` / `useSuspenseQuery` / `useMutation` unchanged. Never return only `mutateAsync`, never rename keys, never reshape `data`. Reshaping belongs in the Yup response schema or in a page-level hook; wrapping drops `isPending`, `isFetching`, `refetch`, `error` and `reset` that other consumers need. Callers destructure what they use.

**Incorrect (hook reshapes and hides the result):**

```tsx
export function useGetContractDetailQuery(contractId: string) {
  const { data } = useSuspenseQuery(contractDetailOptions(contractId))
  return { contract: data, productNames: data.products.map(product => product.name) }
}

export function useCloseOrder(orderId: string) {
  const { mutateAsync } = useMutation({ mutationFn: () => http.put(ENDPOINTS.orders.close(orderId)) })
  return mutateAsync // no isPending, no error, no reset
}
```

**Correct (pass through; callers destructure):**

```tsx
export function useGetContractDetailQuery(contractId: string) {
  return useSuspenseQuery({
    queryKey: ['contracts', contractId],
    queryFn: async () => {
      const { data } = await http.get(ENDPOINTS.contracts.detail(contractId))
      return CONTRACT_DETAIL_SCHEMA.validate(data, { stripUnknown: true })
    },
  })
}

export function useCloseOrder(orderId: string) {
  return useMutation<void, Error, void>({ /* mutationFn, onSuccess */ })
}

// Callers
const { data: contract } = useGetContractDetailQuery(contractId)
const { mutateAsync: closeOrder, isPending: isClosing } = useCloseOrder(orderId)
```

Flattening infinite pages into a single `items` array is done by the page-level hook or by `select`, not by renaming the result of the API hook.
