---
title: Keep Business Rules as Pure, Intent-Named Predicates
impact: MEDIUM-HIGH
impactDescription: decisions readable in JSX and testable without rendering
tags: helpers, business-rules, predicates, naming, pure-functions
---

## Keep Business Rules as Pure, Intent-Named Predicates

**Impact: MEDIUM-HIGH (decisions readable in JSX and testable without rendering)**

Any non-trivial condition (status sets, bypass flags, counts) goes in `helpers/transformers/` as a **pure function** `(entity/state) => boolean | closed decision union`: no React hook, no API call, no side effect. Classifications and structured diagnostics also belong in transformers; they need not return boolean. Name a predicate after **why** it is true: `isX` / `hasX` / `areXProvided` (business state), `canX` (business authorization), `shouldShowX` (display decision composing the others), never `isVisible` / `showBlock`.

**Incorrect (rule inlined in JSX, then wrapped in a hook with a meaningless name):**

```tsx
{paymentApprovers.length > 0 &&
  ['PENDING_SIGNATURE', 'AT_LEAST_ONE_APPROVER_FAILED', 'SIGNED'].includes(data.payment.status) &&
  !data.payment.isSignatureBypassed && <ApproversBlockSection section="payment" /* … */ />}

// services/useIsVisible.ts
export const useIsVisible = (payment: PaymentSection, count: number) =>
  useMemo(() => /* same condition */, [payment, count])
```

**Correct (pure predicate in helpers/transformers/, named by intent):**

```tsx
// pages/detail/helpers/transformers/arePaymentApproversProvided.ts
const PAYMENT_PROVIDED_STATUSES = new Set<PaymentSection['status']>([
  'PENDING_SIGNATURE',
  'AT_LEAST_ONE_APPROVER_FAILED',
  'SIGNED',
])

export const arePaymentApproversProvided = (
  payment: PaymentSection,
  paymentApproversCount: number,
): boolean =>
  PAYMENT_PROVIDED_STATUSES.has(payment.status) &&
  !payment.isSignatureBypassed &&
  paymentApproversCount > 0

// ApproversBlock.tsx
const showPaymentApprovers = arePaymentApproversProvided(
  data.payment,
  paymentApprovers.length,
)
{
  showPaymentApprovers && <ApproversBlockSection section="payment" /* … */ />
}
```

Call predicates directly during render, with no `useState`/`useEffect` to store their result. A predicate living in a hook file belongs in `helpers/transformers/`; a memoization-only composition may be a transformer hook, presentation belongs to a formatter/presenter, and acquisition or effects belong to a service. Predicates and classifications remain operations within transformers, not separate helper categories.

See also: `state-derived-atoms`
