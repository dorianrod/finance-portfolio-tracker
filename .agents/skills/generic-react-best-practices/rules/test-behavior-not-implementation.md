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

### ESLint Enforcement

Enable `local/no-test-style-assertions` and `local/no-conditional-test-assertions` at error level in authored test files (`*.test.*`, `*.spec.*`, `__tests__/`), including tooling tests.

The style check recognizes Jest/Vitest assertions, import aliases and immutable aliases. Reject `toHaveClass`, class attributes, DOM `className`/`classList` reads and equivalent `getAttribute('class')` assertions. For HTML returned by React server rendering or DOM serialization, detect literal class attributes and recognizable Tailwind utility sequences, including static strings, regex literals, templates, aliases and statically available `test.each` tables. Preserve semantic attributes, visible text, ordinary data comparisons and public SVG drawing contracts. A permitted public state-class exception requires a narrow reviewed directive with its technical rationale.

The conditional-assertion check reports assertions lexically inside branches, loops, collection iteration, catch clauses and short-circuit right operands. Allow parametrized tests, unconditional aggregate assertions and polling callbacks such as `waitFor`. Follow the actual imported assertion binding and respect shadowing.

These are bounded checks: opaque helper results, reassigned aliases, arbitrary regex syntax, dynamic CSS generation and conditional execution hidden behind another function require review. Do not infer Tailwind classes from ordinary prose or attribute all properties named `className` to DOM nodes. There is no automatic conversion to a behavior test.
