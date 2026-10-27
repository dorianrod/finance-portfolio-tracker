---
title: Keep Caller Layout Outside Shared UI
summary: Keep caller layout around visual shared UI boundaries and let shared primitives own internal spacing and structure.
impact: HIGH
tags:
  - react
  - design-system
  - layout
  - spacing
patterns:
  - A visual shared UI component receives caller-authored children with layout classes or styles.
  - Padding, margins or other internal layout arrives through extracted children, spreads, React factories or descendant selectors.
---

## Keep Caller Layout Outside Shared UI

**Rule:** Keep caller layout outside visual shared UI boundaries and compose their internals through standardized shared UI.

The caller arranges siblings and positions the component in the page. The shared component owns its padding, gaps, internal margins and alignment. Removing `className` from its props is insufficient if a caller can inject a padded child.

### Incorrect

```tsx
<Button>
  <span className="px-3 py-2">Save</span>
</Button>
```

### Correct

```tsx
<div className="mt-3">
  <Button size="default">Save</Button>
</div>
```

- Apply this to all visual primitives, surfaces, cards, dialogs and slots. Fragments, JSX variables, extracted components and React factories preserve the boundary.
- Use shared UI structure primitives with closed spacing tokens for complex content. Do not hide arbitrary CSS strings behind a new prop, a renamed class prop or a descendant selector.
- Shared UI implementations may style their native elements and dependency primitives. Providers that render no visual box do not introduce a boundary.
- Keep compound slots direct children. Do not insert layout wrappers between a root and its slots.
- Geometry supplied as chart data is distinct from caller-authored CSS layout.

### Enforcement

`local/no-shared-ui-internal-layout` reports errors on injected classes and inline layout styles, including statically resolvable extracted components. `local/no-shared-ui-classname` continues to protect the public API. Neither rule supplies an autofix or permits suppressions to complete a migration. Tests and Storybook usages follow the same composition rules.
