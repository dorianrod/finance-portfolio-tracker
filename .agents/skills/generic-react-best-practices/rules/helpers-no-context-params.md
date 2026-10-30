---
title: Never Pass t, navigate or Stores to a Helper
impact: MEDIUM-HIGH
impactDescription: business-only signatures, no context threading through callers
tags: helpers, i18n, context, hooks, signatures
---

## Never Pass t, navigate or Stores to a Helper

**Impact: MEDIUM-HIGH (business-only signatures, no context threading through callers)**

A helper signature takes explicit data and configuration, never context clients or injected formatter functions. When it needs a React context dependency (`t`, `navigate`, a Jotai atom, the `queryClient`), keep business data acquisition at its API/service owner and pass the resulting data explicitly. For presentation context such as translation, use a formatter or presenter **hook** (`use…`) that reads the dependency internally and returns a memoized value or function. Passing `t` around forces every caller to own `useTranslation` and leaks UI plumbing into business signatures.

**Incorrect (context dependency threaded as a parameter):**

```ts
// sales/orders/pages/detail/helpers/presenters/getOrderStatusOptions.ts
export const getOrderStatusOptions = (t: TFunction) => [
  { value: 'DRAFT', label: t('order.orderStatus.DRAFT') },
  { value: 'CONFIRMED', label: t('order.orderStatus.CONFIRMED') },
  { value: 'SHIPPED', label: t('order.orderStatus.SHIPPED') },
]

// component
const { t } = useTranslation()
const statusOptions = getOrderStatusOptions(t)
```

**Correct (helper hook composing the existing formatter):**

```ts
// sales/orders/pages/detail/helpers/presenters/useOrderStatusOptions.ts
const ORDER_STATUSES = [
  'DRAFT',
  'CONFIRMED',
  'SHIPPED',
] as const satisfies readonly OrderStatus[]

export function useOrderStatusOptions() {
  const formatOrderStatus = useFormatOrderStatus() // helpers/formatters/
  return useMemo(
    () =>
      ORDER_STATUSES.map((status) => ({
        value: status,
        label: formatOrderStatus(status),
      })),
    [formatOrderStatus],
  )
}

// component
const statusOptions = useOrderStatusOptions()
```

The formatter itself follows the same pattern (see `arch-helpers-vs-services` and `helpers-formatter-hooks`). One explicit exception: a pure `build[Form]Schema(t)` exported next to its `use[Form]Schema` hook, to test the schema without rendering (see `yup-form-schema-hook`). A dependency that triggers a side effect (`navigate`, a mutation, a toast) does not belong in `helpers/` at all: it goes in a page action hook or a domain `services/` hook.

### ESLint Enforcement

Use the custom ESLint rule `local/no-helper-context-params` to prevent formatter and context dependencies from being threaded through helper APIs. Review the dependency's actual role and the form-schema exception rather than relying on its name alone.
