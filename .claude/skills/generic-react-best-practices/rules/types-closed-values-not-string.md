---
title: Type Closed Value Sets as Unions, Not String
impact: HIGH
impactDescription: makes status-driven logic exhaustive and type-checked
tags: types, union, string, statuses, oneOf
---

## Type Closed Value Sets as Unions, Not String

**Impact: HIGH (makes status-driven logic exhaustive and type-checked)**

When a field holds one of a known set of values, such as a status, kind or customer type, and that value drives logic (permissions, actions, visible sections, filters), type it as a literal union or an existing domain type, never `string` or `string[]`. The Yup schema is the last place where a `string` may become the union. Every consumer after it gets the strict type, so typos and missing cases fail to compile.

**Incorrect (free string on a status that drives actions):**

```typescript
// domains/sales/orders/features/detail/types/orderDetail.type.ts
export type PaymentSection = {
  status: string
  isSignatureBypassed: boolean
}

// a typo compiles and silently hides the action
const canValidate = payment.status === 'FORM_TO_REVEIW'
```

**Correct (union from the domain, narrowed once in Yup):**

```typescript
// domains/sales/orders/features/detail/types/orderDetail.type.ts
export const ALL_PAYMENT_STATUSES = ['DRAFT', 'FORM_TO_REVIEW', 'PAID'] as const
export type PaymentStatus = (typeof ALL_PAYMENT_STATUSES)[number]

export type PaymentSection = {
  status: PaymentStatus
  isSignatureBypassed: boolean
}

// domains/sales/orders/features/detail/apis/queries/useGetOrderDetailQuery.ts
status: yup.string<PaymentStatus>().oneOf(ALL_PAYMENT_STATUSES).required(),
```

Exception: a display-only taxonomy owned by the API (for example a project `status` that is only shown as a badge) may stay `string`. In that case, parse it with a tolerant `yup.string()` and display it through a component- or page-scoped presenter with a fallback (see `yup-no-oneof-on-display-enums`). As soon as code branches on the value, switch to a union.
