---
title: Require Composition Through Nested Children
summary: Compose caller-supplied UI through nested children and compound subcomponents instead of named content props or explicit children attributes.
impact: HIGH
tags:
  - react
  - composition
  - compound-components
patterns:
  - A component accepts or forwards named UI slots typed as ReactNode or ReactElement.
  - JSX, JSX-valued variables, or static render callbacks are passed through named props or spread objects.
  - JSX uses an explicit children attribute instead of nested content.
  - A request asks to enforce or audit mandatory component composition.
---

## Require Composition Through Nested Children

**Rule:** Compose caller-supplied UI through nested children and compound subcomponents instead of named content props or explicit children attributes.

Composition is mandatory for APIs owned by this project, including shared UI, feature/view boundaries and wrappers. A caller must be able to see and arrange the UI structure without hiding elements in props. This makes Vercel's preference for children a project requirement and also covers named ReactNode slots, beyond render callbacks.

### Applies When

- A prop such as `title`, `header`, `actions`, `footer`, `tooltip` or `positionsControl` carries rendered UI rather than data.
- A prop accepts JSX, a fragment, an array of elements, a JSX-valued variable, or a callback used only to return static UI.
- A wrapper forwards such content through named props or a spread object.
- JSX uses `children={...}`; the `children` declaration/destructuring in a component's props remains necessary and valid.

### Incorrect

```tsx
<Panel title={<Title />} header={<Toolbar />} />
<Panel title={titleElement} />
<Panel renderHeader={() => <Toolbar />} />
<Panel children={<Content />} />
```

### Correct

```tsx
<Panel>
  <Panel.Title><Title /></Panel.Title>
  <Panel.Header><Toolbar /></Panel.Header>
  <Panel.Body><Content /></Panel.Body>
</Panel>
```

Remove the old content props from the component's type and implementation, then migrate every caller. Slots must render their content. When a root discovers slots by inspecting child types, keep those slots as direct children; put extracted components or conditional content inside them. Add shared context only when the subcomponents need shared state, not for a purely structural layout.

### Exceptions

- Scalar data and configuration remain props, including string labels/descriptions, native `title`/ARIA attributes, numeric values, event handlers and domain models; do not turn every data field into a slot. A string-only label prop must not be widened to ReactNode to smuggle UI through it.
- External APIs that require named elements, such as React `Suspense.fallback` or Recharts `Tooltip.content` and axis `tick`, may retain them at the external integration boundary. Do not propagate that API into project-owned wrappers or use it to justify new content props.
- A render callback that actually receives parent-provided data/state (for example a table cell renderer) is allowed when that contract is needed; a zero-argument static render callback is not a substitute for composition.

### References

- [Vercel: children over render props](../../vercel-composition-patterns/rules/patterns-children-over-render-props.md) — baseline guidance and data-driven callback exception.
- [Vercel: compound components](../../vercel-composition-patterns/rules/architecture-compound-components.md) — named subcomponents and shared state where needed.
- [Generic React: direct, renderable compound slots](../../generic-react-best-practices/rules/ui-compound-slots-direct-children.md) — preserve slot discovery during extraction and conditional rendering.
