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

See also: `vercel-react-best-practices` → `rerender-memo`, `rerender-simple-expression-in-memo`
