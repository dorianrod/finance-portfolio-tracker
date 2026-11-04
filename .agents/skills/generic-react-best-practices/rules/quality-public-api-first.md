---
title: Place the Public API First
impact: MEDIUM
tags: exports, ordering, formatting
---

## Place the Public API First

**Rule:** Declare exported functions and components immediately after imports and module directives, before types, constants and private declarations.

Expose the module's callable API before its implementation details. Keep directives such as `'use client'`, file headers and imports at the start. Public types and constants are also placed after the public function or component; the rule does not impose an order within the remaining declarations.

### Applies When

- A function declaration, function expression, arrow function, class declaration/expression or React component wrapped in `memo` or `forwardRef` is exported.
- A locally declared callable is exposed through an export list or a default identifier export: order the declaration itself, not just the export statement.

**Incorrect:**
```typescript
type Amount = { value: number };
const SCALE = 100;

export function toMinorUnits(amount: Amount) {
  return amount.value * SCALE;
}
```

**Correct:**
```typescript
export function toMinorUnits(amount: Amount) {
  return amount.value * SCALE;
}

type Amount = { value: number };
const SCALE = 100;
```

### Exceptions

- Headers, module directives and imports precede the public API.
- Modules exporting only constants or types have no callable API to reorder. Reexports do not require moving a declaration from another module.
- Tests, stories and Storybook support files, declaration files and tooling configurations are excluded.

### Safe Reordering

Keep imports at the start after headers and directives. A trailing import must
not hide earlier private declarations from the ordering check: report the late
import and review its move before ordering the public API. Verify a rejected
late type import and a valid import-first neighbor through the consuming
configuration.

Preserve initialization order when moving declarations. Hoisted functions may move across erased or hoisted declarations; function-valued initializers and classes must retain their runtime dependencies. Keep attached documentation and overload groups together, and preserve the relative order of the remaining code. Report an unsafe move for manual refactoring instead of introducing a temporal dead zone or crossing a lint suppression.
