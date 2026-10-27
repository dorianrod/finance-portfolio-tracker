---
title: Require Composition Through Nested Children
impact: HIGH
tags: react, composition, compound-components
---

## Require Composition Through Nested Children

**Rule:** Compose caller-supplied UI through nested children instead of component, element or render-function props, and extract renderers required by external APIs into module-level components.

Composition is mandatory for project-owned APIs, including shared UI, feature/view boundaries and wrappers. A caller must be able to see and arrange the UI structure without hiding elements or rendering functions in props. This convention is stricter than a preference for children, including when callbacks receive data or state.

### Applies When

- A prop such as `title`, `header`, `actions`, `footer`, `tooltip` or `positionsControl` carries rendered UI rather than data.
- A prop accepts JSX, a fragment, an array of elements, a JSX-valued variable, a component reference, or a render function, with or without arguments.
- A wrapper forwards such content through named props or a spread object.
- JSX uses `children={...}`; the `children` declaration/destructuring in a component's props remains necessary and valid.
- An external API requires a component, element or render function in a named prop.

**Incorrect:**
```tsx
<Panel title={<Title />} header={<Toolbar />} />
<Panel title={titleElement} />
<Panel header={Toolbar} />
<Panel renderHeader={() => <Toolbar />} />
<Panel renderItem={(item) => <Item item={item} />} />
<Panel children={<Content />} />
```

**Correct:**
```tsx
<Panel>
  <Panel.Title>
    <Title />
  </Panel.Title>
  <Panel.Header>
    <Toolbar />
  </Panel.Header>
  <Panel.Body>
    <Content />
  </Panel.Body>
</Panel>
```

Remove the old content props from the component's type and implementation, then migrate every caller. Slots must render their content. When a root discovers slots by inspecting child types, keep those slots as direct children; put extracted components or conditional content inside them. Add shared context only when the subcomponents need shared state, not for a purely structural layout.

### Exceptions

- Scalar data and configuration remain props, including string labels/descriptions, native `title`, numeric values, business event handlers and domain models; do not turn every data field into a slot. A string-only label prop must not be widened to ReactNode to smuggle UI through it. This exception does not permit ARIA or keyboard/focus wiring in domains or application code: follow [centralized accessibility](ui-centralize-accessibility.md) and pass semantic props to shared UI instead.
- External APIs outside the project's control, such as React `Suspense.fallback` or Recharts `shape`, `content`, `tick` and `label`, may retain their required named UI props at the external integration boundary. Pass a named module-level component reference or an element of that component, according to the installed library's contract. An inline render callback remains forbidden, including one that simply delegates to a component. Do not propagate the external API into project-owned wrappers.

```tsx
// Incorrect: external APIs do not justify an inline render function.
<Series shape={(props) => <SeriesShape {...props} selected={selected} />} />

// Correct: SeriesShape is defined at module scope or imported.
<Series shape={<SeriesShape selected={selected} />} />
// When the library accepts a component function and no extra props are needed:
<Series shape={SeriesShape} />
```

Move captured parent values into the extracted component's data/configuration props. Preserve the library-injected props and their types; do not define the extracted component inside its parent render.

### ESLint Enforcement

Use the custom ESLint rule `local/require-children-composition` with type information to check declared component contracts as well as JSX, `createElement` and `cloneElement`, including resolved factory aliases. Reject named UI props before a caller exists, including typed functions, classes, `memo`, `forwardRef` and public compound slots. Factory calls supply nested children positionally.

Resolve dependency declarations to distinguish external components from local imports and wrappers; do not rely on prop names or a blanket chart-library exemption. Reject external inline render functions and render-local component references. Private dependency renderers may receive inherited external contracts; locally declared UI props and inherited props on public project APIs remain checked. Data, event handlers and scalar formatters remain valid. Arbitrary runtime factories and reassigned element aliases are outside this bounded analysis. Changing a component API requires review and has no automatic fix.

### References

- [Direct, renderable compound slots](ui-compound-slots-direct-children.md) — preserve slot discovery during extraction and conditional rendering.
