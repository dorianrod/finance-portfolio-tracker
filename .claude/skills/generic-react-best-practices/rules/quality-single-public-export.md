---
title: Export One Public Value per File
impact: MEDIUM
tags: exports, modules, components, helpers
---

## Export One Public Value per File

**Rule:** Export at most one public value per production file and group related extracted files in a themed directory.

Give each public component, function, hook or constant a named file. When splitting related components or utilities, group them by theme within their existing owner and helper category; do not introduce a new business feature just to hold the files. Import files directly instead of recreating a multi-export barrel.

### Applies When

- A production module exports several values, whether with declarations, a default export, an export list or named reexports.
- Several names in one export statement count separately, including aliases of the same binding.
- An `export *` hides how many values the module exposes; replace it with an explicit single value export or direct imports. A namespace export (`export * as values`) exposes one value.

**Incorrect:**
```tsx
// actions/Actions.view.tsx
export function SaveAction() {
  return <button>Save</button>;
}
export function CancelAction() {
  return <button>Cancel</button>;
}
```

**Correct:**
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

### Exceptions

- Type-only exports do not count, including local interfaces or type aliases exported without an explicit `type` modifier. A value and its associated exported types may share a file.
- Private components and private helper functions remain allowed, subject to the other component and helper rules.
- A file may export no values. Function overload signatures belong to one public function, not separate exports.
- Tests, stories and Storybook support files, declaration files and tooling configurations are outside this production-module convention.

See also: `arch-component-module-boundaries`, `arch-helpers-vs-services`
