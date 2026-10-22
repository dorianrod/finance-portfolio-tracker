---
title: Never Build Hooks from Hooks (No createUseXxx Factories)
impact: MEDIUM
impactDescription: keeps hooks traceable, statically analyzable and Rules-of-Hooks safe
tags: quality, hooks, factory, generics
---

## Never Build Hooks from Hooks (No createUseXxx Factories)

**Impact: MEDIUM (keeps hooks traceable, statically analyzable and Rules-of-Hooks safe)**

Do not write a function that takes a hook as a parameter and returns a new hook (`createUseXxx(useOther)`), and do not write a hook whose parameter is itself a hook. Such factories hide which hook runs where, defeat "go to definition", and stop the hooks lint rules from checking the call order. Write one generic hook that takes the value (not the hook), and call the source hook at the call site. A few explicit duplicate wrappers are fine too.

**Incorrect (factory consumes a hook and returns a hook):**

```ts
export function createUseFormatStatusOptions(useFormatStatus: () => (status: string) => string) {
  return function useFormatStatusOptions() {
    const formatStatus = useFormatStatus()
    return useCallback(
      (statuses: string[]) => statuses.map(status => ({ value: status, label: formatStatus(status) })),
      [formatStatus],
    )
  }
}
export const useFormatInvoiceStatusOptions = createUseFormatStatusOptions(useFormatInvoiceStatus)
```

**Correct (generic hook takes a value, each wrapper calls the source hook explicitly):**

```ts
import { useFormatInvoiceStatus } from '@/domains/sales/invoices/helpers/formatters/useFormatInvoiceStatus'

type StatusOption<T extends string> = { value: T; label: string }

export function useStatusOptionsFormatter<T extends string>(formatStatus: (status: T) => string) {
  return useCallback(
    (statuses: T[]): StatusOption<T>[] =>
      statuses.map(status => ({ value: status, label: formatStatus(status) })),
    [formatStatus],
  )
}

export function useFormatInvoiceStatusOptions() {
  return useStatusOptionsFormatter(useFormatInvoiceStatus())
}
```

A hook that composes behavior from callbacks and atoms (not from hooks passed as parameters) is fine.
