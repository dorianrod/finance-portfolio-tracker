---
title: Extract Compound Component Calculations
summary: Extract compound numeric and layout calculations from React components into intent-named, categorized helpers.
impact: HIGH
tags:
  - components
  - helpers
  - presenters
  - calculations
patterns:
  - A component combines arithmetic operations or Math calls to derive coordinates, dimensions, chart geometry, or quantitative metrics.
  - A component contains a chain of dependent calculations before returning JSX or inside JSX, a local callback, or useMemo.
  - The request asks to keep nontrivial calculations out of React components or distinguish presenters from calculators.
---

## Extract Compound Component Calculations

**Rule:** Extract compound numeric and layout calculations from React components into intent-named, categorized helpers.

Components read hooks, call helpers and render the result. Naming intermediate values inside a component does not isolate the calculation. Move the whole derivation to a separate file so its inputs, output and boundary cases can be understood without rendering React.

### Applies When

- Several operations derive a position, size, bounded value, chart shape or numeric metric, whether before `return`, in JSX, or in a local callback.
- A series of dependent local variables implements one calculation, even if each individual expression looks simple.
- `useMemo` contains the calculation: memoization changes when it runs, not where it belongs.

Choose the helper category from its output. Coordinates, dimensions, styles, chart radii and other UI-specific results belong in `helpers/presenters/`. Quantitative business metrics belong in `helpers/calculators/`. A pure calculation needs no service or custom hook. Keep component-specific helpers in a named component directory; share them at page scope only when the page owns the reuse.

Pass browser measurements, such as viewport dimensions and an anchor rectangle, as inputs. Keep the presenter pure instead of having it read `window` or mutate the DOM. The component can call it directly during render.

### Incorrect

```tsx
export function FloatingPanel({ anchor }: Props) {
  const left = Math.max(8, Math.min(anchor.left, window.innerWidth - 320 - 8));
  return <div style={{ left }} />;
}
```

### Correct

```typescript
// FloatingPanel/helpers/presenters/getFloatingPanelStyle.ts
export function getFloatingPanelStyle(
  anchorLeft: number,
  viewportWidth: number,
) {
  const left = Math.max(8, Math.min(anchorLeft, viewportWidth - 320 - 8));
  return { left };
}
```

```tsx
// FloatingPanel/FloatingPanel.view.tsx
import { getFloatingPanelStyle } from "./helpers/presenters/getFloatingPanelStyle";

export function FloatingPanel({ anchor }: Props) {
  const style = getFloatingPanelStyle(anchor.left, window.innerWidth);
  return <div style={style} />;
}
```

### Enforcement

Enable `local/no-complex-component-calculation` at error level. It reports more than two arithmetic operations (`+`, `-`, `*`, `/`, `%`, `**`) or deterministic `Math` calls in one derivation inside a component, including callbacks and JSX. It follows immutable local variable initializers and aliases, counting each operation once. It also checks the returned fields of an inline `map`/`flatMap` object together, and groups computed geometry properties (`x`, `y`, `cx`, `cy`, `width`, `height`, `r`, `rx`, `ry`) of one JSX element. The `maxOperations` option retains a default of two.

Independent small expressions outside those explicit output groups remain independent. The rule does not trace reassigned variables, imported helper implementations or arbitrary interprocedural data flow. `local/no-component-data-pipeline` complements it by reporting inline reductions and compound collection predicates in application/domain components. Existing module-boundary and JSX-condition checks cover different patterns and do not replace these checks.

### Exceptions

- Hook calls, imported helper calls, destructuring and direct property reads remain in the component.
- Simple rendering decisions and event adapters remain local.
- Small, self-contained expressions such as `index + 1`, `row.depth * 20` or `(value / total) * 100` may remain local when they do not form part of a larger calculation pipeline.
- Tests and inert module configuration are outside this component-body lint check. Moving a calculation to a module-level helper in the same TSX file still violates the component module boundary.
