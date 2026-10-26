---
title: Centralize Visual Styling in Shared UI
summary: Centralize visual styling in shared/ui primitives and keep only layout styles in domain and application code.
impact: HIGH
tags:
  - react
  - tailwind
  - design-system
  - maintainability
patterns:
  - Source code outside shared/ui supplies non-layout classes or inline styles, directly or through constants, functions or spreads.
  - Domain or application code sets visual SVG or Recharts properties or imports a local stylesheet outside the design system.
  - The request asks to detect or centralize visual styling outside the design system.
---

## Centralize Visual Styling in Shared UI

**Rule:** Centralize visual styling in shared/ui primitives and keep only layout styles in domain and application code.

Business code supplies semantic data, actions and variants; shared UI owns how
they look. Semantic colors and imported class constants do not exempt a caller
from this boundary: `className="text-positive"` still applies visual styling.

### Applies When

- Any TypeScript source outside `src/shared/ui` applies classes or styles,
  including application components, domain helpers and shared utilities.
- Styles arrive through constants, templates, conditionals, assembled arrays,
  JSX spreads or React `createElement`/`cloneElement` props.
- Native/SVG or Recharts props choose appearance, including `fill`, `stroke`,
  typography and objects supplied to `tick`, `dot`, `activeDot` or `*Style`.

### Allowed Layout

- Display, flex/grid, container alignment and order.
- Margins, **padding**, gap and spacing between children.
- Dimensions, aspect ratio and overflow.
- Position, offsets and z-index.

Padding is explicitly allowed in this project, including `p-*`, `px-*` and
logical CSS padding properties. Responsive variants and arbitrary values are
allowed only when the underlying utility/property belongs to layout.

Colors, backgrounds, borders, radii, shadows, opacity, typography, text
decoration, transitions, animations and interaction styling belong in shared UI.

### Incorrect

```tsx
export function StatusSummary({ isPositive }: { isPositive: boolean }) {
  return (
    <div className="flex items-center gap-2 p-4">
      <span className={isPositive ? 'text-positive font-semibold' : 'text-danger font-semibold'}>
        {isPositive ? 'Gain' : 'Loss'}
      </span>
    </div>
  )
}
```

### Correct

```tsx
import { Badge } from '@/shared/ui/Badge.view'

export function StatusSummary({ isPositive }: { isPositive: boolean }) {
  return (
    <div className="flex items-center gap-2 p-4">
      <Badge tone={isPositive ? 'positive' : 'negative'}>
        {isPositive ? 'Gain' : 'Loss'}
      </Badge>
    </div>
  )
}
```

Reuse a suitable primitive first; extend or create one in `shared/ui` when needed.
Keep its API semantic (`tone`, `variant`, data) and compose content through nested
children. Move the visual implementation there, then replace the caller's
classes/style props with that API. Do the same for third-party chart wrappers:
domains provide data and labels, while shared UI applies chart colors and styles.
Do not merely export a string of visual classes and apply it from the domain.

### ESLint Diagnostics

`local/no-domain-styling` runs as a warning during the migration:

- `nonLayoutClass` and `nonLayoutStyle` identify concrete non-layout choices;
  move them into a primitive without changing the business behavior.
- `unverifiableStyle` means a value could not be analyzed statically; inspect its
  origin before deciding whether to retain layout or extract visual styling.
- `outsideStylesheet` identifies a local stylesheet outside the permitted roots.

Diagnostics aggregate the classes/properties for an individual usage and include
this rule's identifier. There is no autofix: selecting or designing a primitive
requires a composition decision. Do not suppress warnings to complete a migration.

### Exceptions and Limits

- `src/index.css` and `src/shared/theme` remain authorized design-system
  infrastructure for global CSS, tokens and themes. Their existence does not
  authorize domain components to apply visual tokens themselves.
- Shared UI primitives may own visual styles and consume semantic tokens; the
  [semantic color rule](styling-semantic-colors.md) still applies there.
- Tests and generated files are exempt from the ESLint rule.
- The lint check covers React/SVG/Recharts styling sinks and local stylesheet
  imports; it does not parse CSS contents or analyze imperative DOM mutations.
- Semantic primitive props such as `tone` and `variant`, and dynamic values of
  known layout properties such as `style={{ width: measuredWidth }}`, are allowed.

### References

- [ESLint implementation](../../../../packages/dashboard/eslint-rules/no-domain-styling.js)
