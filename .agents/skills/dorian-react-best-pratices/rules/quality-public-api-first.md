---
title: Place the Public API First
summary: Declare exported functions and components immediately after imports and module directives, before types, constants and private declarations.
impact: MEDIUM
tags:
  - exports
  - ordering
  - formatting
patterns:
  - An exported function, hook or component follows module-level types, constants, private helpers or private components.
  - The request asks to automatically move exported functions or components to the top of a file.
---

## Place the Public API First

**Rule:** Declare exported functions and components immediately after imports and module directives, before types, constants and private declarations.

Expose the module's callable API before its implementation details. Keep directives such as `'use client'`, file headers and imports at the start. Public types and constants are also placed after the public function or component; the rule does not impose an order within the remaining declarations.

### Applies When

- A function declaration, function expression, arrow function or React component wrapped in `memo` or `forwardRef` is exported.
- A locally declared callable is exposed through an export list or a default identifier export: order the declaration itself, not just the export statement.

### Incorrect

```typescript
type Amount = { value: number }
const SCALE = 100

export function toMinorUnits(amount: Amount) {
  return amount.value * SCALE
}
```

### Correct

```typescript
export function toMinorUnits(amount: Amount) {
  return amount.value * SCALE
}

type Amount = { value: number }
const SCALE = 100
```

### Enforcement

In this dashboard, enable `local/public-api-first` as a warning for the same production files as `local/single-public-export`. The existing `npm run format` command runs `eslint --fix`, which moves declarations with their attached documentation and preserves overload groups. No Prettier plugin is required.

Automatically move hoisted function declarations, or function-valued initializations across declarations that are erased or hoisted. Preserve the relative order of the remaining code. If a move could change initialization order, cross an ESLint suppression or break an overload group, report the issue without an autofix. Refactor dependencies manually when needed; do not introduce a temporal dead zone to satisfy ordering.

### Exceptions

- Headers, module directives and imports precede the public API.
- Modules exporting only constants or types have no callable API to reorder. Reexports do not require moving a declaration from another module.
- Tests, stories and Storybook support files, declaration files and tooling configurations are excluded.
