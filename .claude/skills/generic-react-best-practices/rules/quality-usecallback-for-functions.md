---
title: useMemo for Data, useCallback for Functions
impact: MEDIUM
impactDescription: stable references for returned functions, and the memo hook states what is returned
tags: quality, hooks, usecallback, usememo, formatters
---

## useMemo for Data, useCallback for Functions

**Impact: MEDIUM (stable references for returned functions, and the memo hook states what is returned)**

When the React Compiler is not enabled, manual memoization is required whenever a hook returns a function or an object that callers put in dependency arrays or pass to memoized children. When the compiler is enabled, it handles most of this and manual memoization becomes unnecessary.

When a hook returns a function (formatters, option builders, action handlers), memoize it with `useCallback`. Use `useMemo` only for computed data. Never write `useMemo(() => () => ...)`.

**Incorrect (useMemo returning a function):**

```ts
export function useFormatCustomerTypeOptions() {
  const { t } = useTranslation()
  return useMemo(
    () => (customerTypes: CustomerType[]) => {
      const labels: Record<CustomerType, string> = {
        LEGAL_ENTITY: t('order.customerType.LEGAL_ENTITY'),
        PRIVATE_INDIVIDUAL: t('order.customerType.PRIVATE_INDIVIDUAL'),
      }
      return customerTypes.map(item => ({ value: item, label: labels[item] }))
    },
    [t],
  )
}
```

**Correct (useCallback for the returned function):**

```ts
export function useFormatCustomerTypeOptions() {
  const { t } = useTranslation()
  return useCallback(
    (customerTypes: CustomerType[]) => {
      const labels: Record<CustomerType, string> = {
        LEGAL_ENTITY: t('order.customerType.LEGAL_ENTITY'),
        PRIVATE_INDIVIDUAL: t('order.customerType.PRIVATE_INDIVIDUAL'),
      }
      return customerTypes.map(item => ({ value: item, label: labels[item] }))
    },
    [t],
  )
}
```

When a hook exposes several methods (a modal controller), memoize each one with `useCallback` and return an object literal of them: `const open = useCallback(() => setOpen(true), [setOpen])`. Memoize the whole object with `useMemo` only when a caller needs the object itself to be stable. Skip memoization for cheap primitive values computed inline.

When a hook derives one cohesive data result from the same inputs, prefer constructing that result inside one `useMemo`. Keep intermediate values local to its callback when they do not need an independent cache or reference lifetime. A stable public result does not require a separate memo for each field and another memo just to assemble them.

**Incorrect (intermediate caches with no independent invalidation benefit):**

```ts
export function useOpenOrdersSummary(orders: Order[]) {
  const openOrders = useMemo(
    () => orders.filter(order => order.status === 'open'),
    [orders],
  )
  const total = useMemo(
    () => openOrders.reduce((sum, order) => sum + order.amount, 0),
    [openOrders],
  )
  return useMemo(() => ({ openOrders, total }), [openOrders, total])
}
```

**Correct (derive and return the cohesive result in one memo):**

```ts
export function useOpenOrdersSummary(orders: Order[]) {
  return useMemo(() => {
    const openOrders = orders.filter(order => order.status === 'open')
    const total = openOrders.reduce((sum, order) => sum + order.amount, 0)
    return { openOrders, total }
  }, [orders])
}
```

Keep separate memos when computations have independently changing inputs and merging would repeat meaningful work, or when callers need one returned object's reference to survive changes to unrelated fields. For example, putting an expensive order summary and a request's loading/error state in one memo recomputes the summary and recreates its reference on request-state changes. A final assembly memo, when needed, should compose independently cached results without pulling those calculations into its callback. Keep hooks at the hook's top level; only move pure calculations into a memo callback.

Choose memo boundaries by invalidation and consumer needs, rather than imposing one memo per hook or one memo per field. Use profiling to decide uncertain performance tradeoffs; memo count alone does not establish a speedup.

Skip `useMemo` for cheap primitive expressions. Extract a costly rendered region behind its own component boundary when this lets a loading/visibility branch avoid the work entirely; add manual `memo` only when unchanged props and measured render cost justify it. Keep calculations in their owning helpers and preserve `arch-component-roles`.

When a default array or object becomes an effect dependency or a memoized child's prop, use an immutable shared default if reference stability matters. Do not share mutable per-instance state through that constant. Avoid caching every field, global unbounded result maps or JSX variables solely to make a memo count smaller. With React Compiler, review the compiler's coverage before adding manual caches; neither compiler optimization nor memoization replaces correct state and effect semantics.
