---
title: No Chained or Negated Ternaries
impact: LOW
impactDescription: branch logic stays readable and testable
tags: quality, ternary, readability, conditionals
---

## No Chained or Negated Ternaries

**Impact: LOW (branch logic stays readable and testable)**

A ternary has one positive condition and two outcomes. Never chain them (`a ? x : b ? y : z`) and never start one with a negation (`!a ? x : y`), because readers have to evaluate the branches in reverse. Turn multi-branch decisions into a small named function with early returns. A pure decision belongs in `helpers/`, where `test.each` can cover it. Enforce with the ESLint rules `no-nested-ternary` and `no-negated-condition`.

**Incorrect (chained and negated):**

```tsx
const badgeType: BadgeType = !order.closingDate
  ? order.globalStatus === 'NOT_STARTED' ? 'error' : 'info'
  : 'success'
```

**Correct (component-scoped presenter helper with early returns and positive conditions):**

```tsx
// OrderCard/helpers/presenters/getOrderBadgeType.ts
export const getOrderBadgeType = ({ closingDate, globalStatus }: OrderDetail): BadgeType => {
  if (closingDate) return 'success'
  if (globalStatus === 'NOT_STARTED') return 'error'
  return 'info'
}
```

```tsx
// OrderCard/OrderCard.view.tsx
import { getOrderBadgeType } from './helpers/presenters/getOrderBadgeType'

const badgeType = getOrderBadgeType(order)
```

A single positive ternary between two static i18n keys is fine: `t(isReadOnly ? 'common.close' : 'common.cancel')`. For JSX with three or more states, map each state to its content in a `Record<Status, ...>` or return early from a subcomponent.
