---
title: Type Amounts as number and Format Them at Display Time
impact: MEDIUM
impactDescription: keeps amounts computable and rendered by a single set of formatters
tags: types, amounts, money, currency, formatting, yup
---

## Type Amounts as number and Format Them at Display Time

**Impact: MEDIUM (keeps amounts computable and rendered by a single set of formatters)**

An amount is a `number` in the domain entity (`number | null` when it can be missing), with its currency in a separate field. It is never a `string`, whether a raw decimal (`'1250.50'`, which a decimal API field often sends) or an already formatted label (`'1,250.50 €'`). The response schema coerces it once with `yup.number()`, and formatting happens only at display time. Currency components built on `Intl.NumberFormat` typically only format values whose `typeof` is `'number'`, and render a string amount as empty or `-`.

**Incorrect (string amount, formatted by hand):**

```tsx
// domains/sales/orders/shared/types/order.type.ts
export type Order = {
  uuid: string
  amount: string // '1250.50' from the API
  currency: string
}

// component: parses, formats and concatenates locally
<span>{`${Number(order.amount).toFixed(2)} ${order.currency}`}</span>
```

**Correct (number in the entity, one formatter for display):**

```tsx
// domains/sales/orders/shared/types/order.type.ts
export type Order = {
  uuid: string
  amount: number
  currency: string
}

// domains/sales/orders/features/detail/apis/queries/useGetOrderDetailQuery.ts
amount: yup.number().required(), // '1250.50' → 1250.5

// domains/sales/shared/helpers/formatters/useFormatMoney.ts
export const useFormatMoney = () => {
  const { i18n } = useTranslation()
  return useCallback(
    (amount: number, currency: string) =>
      new Intl.NumberFormat(i18n.language, { style: 'currency', currency }).format(amount),
    [i18n.language],
  )
}

// anywhere (cell, KPI, sentence)
const formatMoney = useFormatMoney()
const label = formatMoney(order.amount, order.currency)
```

Totals and comparisons are computed on the numbers (`lines.reduce((sum, line) => sum + line.amount, 0)`), never on labels. Do not build a local money formatter per component: extend the shared formatter hook when a new format is needed (see `helpers-formatter-hooks`).
