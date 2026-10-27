---
title: Centralize Accessibility in Shared UI Primitives
impact: HIGH
tags: accessibility, architecture, design-system
---

## Centralize Accessibility in Shared UI Primitives

**Rule:** Centralize all ARIA wiring, keyboard navigation and focus behavior in shared UI primitives, and pass only semantic data, translated labels and business actions from domain and application code.

The design system owns accessibility implementation, including simple attributes such as `aria-label`, `aria-hidden` and `role`. Domain and application components own meaning and actions: labels, selected values, expansion state, financial content and business callbacks. Moving behavior into a domain hook or helper does not establish a shared accessibility boundary.

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

Only files under `src/shared/ui`, including its internal hooks and helpers, may depend directly on external accessibility or headless UI libraries such as Radix. Domain code, application code and other shared modules must import project-owned UI primitives instead. Keep imports and library integration inside this boundary; do not bypass it through bare re-exports of third-party components.

### Exceptions

- Shared UI primitives and their internal hooks implement the wiring. They must not depend on business domains.
- Native HTML without custom ARIA or focus/keyboard wiring remains valid in domain code, including real buttons, labels, forms and normal `onClick`/`onChange` business actions.
- Domain labels remain translated data. For example, pass `label={t('delete')}` rather than hardcoding a name inside the primitive. A business preload callback may use `onIntent`; the primitive decides how pointer and focus events trigger it.
- External component contracts do not justify authored ARIA wiring in a domain wrapper. Optional external SVG/HTML types alone are not evidence that wiring was actually supplied.

### References

- [Accessible names](ui-accessible-names.md) — naming and native semantics, implemented inside shared UI.
- [Tailwind: reusable controls and form components](../../tailwind-design-system/references/details.md) — examples of styling and ARIA inside primitives.
- [mandatory children composition](ui-required-children.md) — labels are data and rendered UI is composed through children.
- [Radix accessibility](https://www.radix-ui.com/primitives/docs/overview/accessibility) — roles, ARIA, keyboard navigation and focus management behind shared wrappers.
