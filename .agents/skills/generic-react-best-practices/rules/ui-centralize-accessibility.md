---
title: Centralize Accessibility in Shared UI Primitives
impact: HIGH
tags: accessibility, architecture, design-system
---

## Centralize Accessibility in Shared UI Primitives

**Rule:** Centralize all ARIA wiring, keyboard navigation and focus behavior in shared UI primitives, and pass only semantic data, translated labels and business actions from domain and application code.

The design system owns accessibility implementation, including simple attributes such as `aria-label`, `aria-hidden` and `role`. Domain and application components own meaning and actions: labels, selected values, expansion state, business content and business callbacks. Moving behavior into a domain hook or helper does not establish a shared accessibility boundary.

### Applies When

- JSX supplies `aria-*`, `role`, `tabIndex`, `autoFocus`, or keyboard/focus handlers, including on another component.
- Code generates accessibility associations, moves or restores focus, inspects the active element, or registers keyboard/focus listeners.
- Code imports Radix or another accessibility primitive implementation directly into a feature.

**Incorrect:**
```tsx
<button aria-label={t("details")} aria-pressed={active} onClick={toggle}>
  <DetailsIcon />
</button>
```

**Correct:**
```tsx
<ToggleButton label={t("details")} active={active} onClick={toggle}>
  <DetailsIcon />
</ToggleButton>
```

`ToggleButton` and `DetailsIcon` implement their semantics in the shared UI layer. Add or extend a primitive when a capability is missing. Do not create a generic accessibility wrapper that accepts arbitrary roles or an ARIA property bag. Public primitive props describe capabilities (`label`, `active`, `expanded`, `value`, `onOpenChange`); compound components generate their IDs and associations internally. Compose rendered content through nested `children`.

Prefer native HTML for simple controls. Use focused, unstyled primitives such as Radix behind project wrappers for complex widgets; do not repeatedly implement tabs, tooltip dismissal or modal focus management. Preserve pointer and keyboard behavior, translated names, visible focus and nested overlay dismissal when migrating.

### Compose Caller Events

When a primitive adapts a caller's cancelable native event handler, invoke that
handler before built-in activation or other work. Honor the same event's
`defaultPrevented` after the caller returns. A callback reference alone does not
forward the event, and a guard before the caller cannot observe its cancellation.
Keep necessary propagation bookkeeping and read-only DOM metadata within the UI
boundary. Noncancelable value-change notifications do not gain a cancellation
contract from an `on...` name alone.

```tsx
<button onClick={event => {
  onClick?.(event)
  if (event.defaultPrevented) return
  activate()
}} />
```

Test the caller's observable cancellation as well as successful activation. For
reusable overlays, exercise supported sequences: outside dismissal followed by
keyboard reopening and Escape, available/unavailable focus targets, and Tab in
both directions for each supported modality. An isolated first-open test does not
establish the protocol across later openings or other modes.

Only files under `src/shared/ui`, including its internal hooks and helpers, may depend directly on external accessibility or headless UI libraries such as Radix. Domain code, application code and other shared modules must import project-owned UI primitives instead. Keep imports and library integration inside this boundary; do not bypass it through bare re-exports of third-party components.

### Exceptions

- Shared UI primitives and their internal hooks implement the wiring. They must not depend on business domains.
- Native HTML without custom ARIA or focus/keyboard wiring remains valid in domain code, including real buttons, labels, forms and normal `onClick`/`onChange` business actions.
- Domain labels remain translated data. For example, pass `label={t('delete')}` rather than hardcoding a name inside the primitive. A business preload callback may use `onIntent`; the primitive decides how pointer and focus events trigger it.
- External component contracts do not justify authored ARIA wiring in a domain wrapper. Optional external SVG/HTML types alone are not evidence that wiring was actually supplied.

### ESLint Enforcement

Use the custom ESLint rule `local/no-domain-accessibility` with type information for authored application code. Outside shared UI, check JSX attributes, explicitly supplied properties in resolvable spreads, direct accessibility-library imports/re-exports/dynamic imports and resolved DOM focus, keyboard-listener and ARIA APIs. Within shared UI, check public component contracts and compound slots for raw wiring props, including inherited HTML attributes, and reject bare third-party value re-exports, namespace exports and resolved import aliases. Type-only re-exports and internal primitive wiring remain valid. Exclude tests, generated files and isolated Storybook support.

Resolve declarations to avoid false positives from optional attributes inherited from external HTML/SVG types, such as chart renderer props. Static checks cannot prove runtime accessibility or reconstruct arbitrary dynamic property names, opaque objects or transitive helper behavior. Test reusable primitives by role and label, and verify keyboard navigation, relationships, dismissal and focus restoration.

Enable `local/no-overwritten-ui-props` at error level for shared UI. Check handlers
and refs replaced after a props spread. Native cancelable handlers extracted from
the public parameter object remain subject to the composition contract. Resolve
direct, named and immutable handler aliases; recognize invocation rather than
mere property reads. For supported synchronous branches and short-circuits,
check caller-first ordering and a guard on the same event after forwarding.
Keep direct forwarding, read-only DOM metadata, guarded built-in work and
noncancelable notifications valid. Preserve ref composition separately.

This bounded flow analysis does not prove arbitrary higher-order handlers,
asynchronous continuations, loops, exceptions, getter effects or transitive helper
semantics. Opaque composition needs review and executable behavior tests. Do not
approve a missing guard because the callback property appears in the function.

### References

- [Accessible names](ui-accessible-names.md) — naming and native semantics, implemented inside shared UI.
- [Tailwind: reusable controls and form components](../../tailwind-design-system/references/details.md) — examples of styling and ARIA inside primitives.
- [mandatory children composition](ui-required-children.md) — labels are data and rendered UI is composed through children.
- [Radix accessibility](https://www.radix-ui.com/primitives/docs/overview/accessibility) — roles, ARIA, keyboard navigation and focus management behind shared wrappers.
