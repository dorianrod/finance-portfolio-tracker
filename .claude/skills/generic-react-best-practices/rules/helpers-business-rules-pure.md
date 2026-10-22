---
title: Keep Business Rules as Pure, Intent-Named Predicates
impact: MEDIUM-HIGH
impactDescription: decisions readable in JSX and testable without rendering
tags: helpers, business-rules, predicates, naming, pure-functions
---

## Keep Business Rules as Pure, Intent-Named Predicates

**Impact: MEDIUM-HIGH (decisions readable in JSX and testable without rendering)**

Any non-trivial condition (status sets, bypass flags, counts) goes in `helpers/businessRules/` as a **pure function** `(entity/state) => boolean | string | union`: no React hook, no API call, no side effect. Name it after **why** it is true: `isX` / `hasX` / `areXProvided` (business state), `canX` (business authorization), `shouldShowX` (display decision composing the others), never `isVisible` / `showBlock`.

**Incorrect (rule inlined in JSX, then wrapped in a hook with a meaningless name):**

```tsx
{paymentApprovers.length > 0 &&
  ['PENDING_SIGNATURE', 'AT_LEAST_ONE_APPROVER_FAILED', 'SIGNED'].includes(data.payment.status) &&
  !data.payment.isSignatureBypassed && <ApproversBlockSection section="payment" /* … */ />}

// services/useIsVisible.ts
export const useIsVisible = (payment: PaymentSection, count: number) =>
  useMemo(() => /* same condition */, [payment, count])
```

**Correct (pure predicate in helpers/businessRules/, named by intent):**

```tsx
// pages/detail/helpers/businessRules/arePaymentApproversProvided.ts
const PAYMENT_PROVIDED_STATUSES = new Set<PaymentSection['status']>([
  'PENDING_SIGNATURE',
  'AT_LEAST_ONE_APPROVER_FAILED',
  'SIGNED',
])

export const arePaymentApproversProvided = (payment: PaymentSection, paymentApproversCount: number): boolean =>
  PAYMENT_PROVIDED_STATUSES.has(payment.status) && !payment.isSignatureBypassed && paymentApproversCount > 0

// ApproversBlock.tsx
const showPaymentApprovers = arePaymentApproversProvided(data.payment, paymentApprovers.length)
{showPaymentApprovers && <ApproversBlockSection section="payment" /* … */ />}
```

Call predicates directly during render, with no `useState`/`useEffect` to store their result. A predicate living in a hook file belongs in `helpers/businessRules/`; anything that really needs a hook is a formatter, a mapper or a service instead.

See also: `vercel-react-best-practices` → `rerender-derived-state-no-effect`
