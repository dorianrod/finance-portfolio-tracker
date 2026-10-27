---
title: Use One Query Key Convention per Domain
impact: HIGH
impactDescription: makes every invalidation predictable from the keys
tags: cache, query-keys, invalidation, prefix-match, react-query
---

## Use One Query Key Convention per Domain

**Impact: HIGH (makes every invalidation predictable from the keys)**

`queryClient.invalidateQueries({ queryKey })` matches keys by **array prefix**, element by element, never by string prefix. So every key of a domain starts with the domain name and follows one shape:

- list `['<domain>', params]`, count `['<domain>', 'count']`;
- detail `['<domain>', id]`, with no `'detail'` segment;
- sub-resource `['<domain>', id, '<sub>']`, so invalidating `['<domain>', id]` refreshes the item **and** its sub-resources.

A hyphenated key (`['orders-count']`) has another first element: `['orders']` never reaches it and it stays stale until `staleTime` expires or a remount. When the id is only known at call time, derive the key from the mutation variables: `onSuccess: (_data, { orderId }) => queryClient.invalidateQueries({ queryKey: ['orders', orderId] })`.

**Incorrect (three shapes in one domain, invalidations silently miss keys):**

```ts
['orders', params]              // list
['orders-count']                // isolated by a string: not under ['orders']
['orders', 'accesses', orderId] // sub-resource before the id: not under ['orders', orderId]

invalidateQueries({ queryKey: ['orders'] })          // does not refresh ['orders-count']
invalidateQueries({ queryKey: ['orders', orderId] }) // does not refresh the accesses
```

**Correct (shared first segment, sub-resources extend the item key):**

```ts
['orders', params]              // list
['orders', 'count']             // count
['orders', orderId]             // detail
['orders', orderId, 'accesses'] // sub-resource

export function useUpdateOrder() {
  const queryClient = useQueryClient()
  return useMutation<void, Error, UpdateOrderInput>({
    mutationFn: ({ orderId, ...body }) => http.put(ENDPOINTS.orders.update(orderId), body),
    // the item and its accesses
    onSuccess: (_data, { orderId }) => queryClient.invalidateQueries({ queryKey: ['orders', orderId] }),
  })
}
```

Never mix two shapes for the same resource (`['<domain>', '<sub>', id]` and `['<domain>', id, '<sub>']`): when you touch one, migrate every key and invalidation of that resource together. Keep an isolated namespace only when the query's lifecycle is fully disjoint from the domain; comment why above the query and list it explicitly in every mutation that affects it.
