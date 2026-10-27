---
title: Export One Public Value per File
summary: Export at most one public value per production file and group related extracted files in a themed directory.
impact: MEDIUM
tags:
  - exports
  - modules
  - components
  - helpers
patterns:
  - A production module exports multiple components, functions, hooks or constants, including through an export list or reexports.
  - The request asks to enforce one public export per file or organize related extracted components and utilities.
---

## Export One Public Value per File

**Rule:** Export at most one public value per production file and group related extracted files in a themed directory.

Give each public component, function, hook or constant a named file. When splitting related components or utilities, group them by theme within their existing owner and helper category; do not introduce a new business feature just to hold the files. Import files directly instead of recreating a multi-export barrel.

### Applies When

- A production module exports several values, whether with declarations, a default export, an export list or named reexports.
- Several names in one export statement count separately, including aliases of the same binding.
- An `export *` hides how many values the module exposes; replace it with an explicit single value export or direct imports. A namespace export (`export * as values`) exposes one value.

### Incorrect

```tsx
// actions/Actions.view.tsx
export function SaveAction() {
  return <button>Save</button>;
}
export function CancelAction() {
  return <button>Cancel</button>;
}
```

### Correct

```tsx
// actions/SaveAction.view.tsx
export function SaveAction() {
  return <button>Save</button>;
}

// actions/CancelAction.view.tsx
export function CancelAction() {
  return <button>Cancel</button>;
}
```

The same split applies to helpers: put `sumAmounts.ts` and `averageAmount.ts` in an `amounts/` directory under the appropriate helper category when they previously shared a public module. Keep private support functions in the public helper's file when they serve only that helper.

### Enforcement

In this dashboard, enable `local/single-public-export` at error level for production `.ts` and `.tsx` files under `src`, including shared UI. Splitting files and choosing a meaningful themed directory require review and have no ESLint autofix.

This Dorian rule overrides the generic `arch-component-module-boundaries` allowance for multiple exported components with the same role. Its other ownership and component-module restrictions still apply.

### Exceptions

- Type-only exports do not count, including local interfaces or type aliases exported without an explicit `type` modifier. A value and its associated exported types may share a file.
- Private components and private helper functions remain allowed, subject to the other component and helper rules.
- A file may export no values. Function overload signatures belong to one public function, not separate exports.
- Tests, stories and Storybook support files, declaration files and tooling configurations are outside this production-module convention.
