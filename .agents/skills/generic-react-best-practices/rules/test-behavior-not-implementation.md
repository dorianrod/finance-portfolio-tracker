---
title: Assert Behavior with Parametrized, Unconditional Tests
impact: MEDIUM
impactDescription: one failing case points at one input, and refactors stop breaking tests
tags: test, behavior, test-each, assertions, aria
---

## Assert Behavior with Parametrized, Unconditional Tests

**Impact: MEDIUM (one failing case points at one input, and refactors stop breaking tests)**

When cases differ only by their input, use `test.each` / `it.each` with typed rows so that every variant is reported on its own. Never wrap assertions in `if/else`, loops or `forEach`: a failure no longer says which input broke, and a branch can silently skip the assertion. Each case asserts one exact, observable outcome.

**Incorrect (loop with a conditional assertion; a failure does not say which status broke):**

```ts
it('should map the statuses', () => {
  const statuses = ['NOT_STARTED', 'STARTED', 'CLOSED', 'NOT_REQUIRED'] as const
  statuses.forEach(status => {
    if (status === 'CLOSED') {
      expect(getStatusBadgeType(status)).toBe('success')
    } else {
      expect(getStatusBadgeType(status)).not.toBe('success')
    }
  })
})
```

**Correct (one typed row per variant, one exact assertion):**

```ts
import type { BadgeType } from '../types/badge.type'
import type { OrderStatus } from '../types/order.type'

it.each<[OrderStatus, BadgeType]>([
  ['NOT_STARTED', 'error'],
  ['STARTED', 'info'],
  ['CLOSED', 'success'],
  ['NOT_REQUIRED', 'neutral'],
])('should map %s to the %s badge', (status, expected) => {
  expect(getStatusBadgeType(status)).toBe(expected)
})
```

Assert what the user or caller observes, not the implementation:

- Prefer ARIA and DOM state: `toBeDisabled()`, `toBeChecked()`, `toHaveAttribute('aria-selected', 'true')`, `toHaveAttribute('data-state', 'open')` for Radix components.
- A state class that is part of a component's public API (`toggle-disabled`) may be asserted only when no semantic equivalent exists.
- Never assert Tailwind utility classes (`px-3`, `opacity-50`, `cursor-not-allowed`), `tagName`, HTML structure or private calls: they change with any visual tweak.

Move repeated setup into `beforeEach` or a local `setup()` helper, not into a branch. Use `test.each` for the null, undefined and empty-string variants as well.
