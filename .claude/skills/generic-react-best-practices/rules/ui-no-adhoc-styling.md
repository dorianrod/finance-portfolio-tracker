---
title: Style with Design System Components, Utility Classes Only for Layout
impact: MEDIUM-HIGH
impactDescription: consistent visuals and themeable UI
tags: ui, tailwind, design-system, typography, layout
---

## Style with Design System Components, Utility Classes Only for Layout

**Impact: MEDIUM-HIGH (consistent visuals and themeable UI)**

Visual styling (text size, color, weight, background, border, radius, shadow, opacity, animations and interaction appearance) comes from design-system components (`Text`, `Badge`, `Separator`, `Card`…), not from Tailwind classes on a `<div>` or `<span>` in feature code. External containers may own display, flex/grid, alignment, order, margins, **padding**, gaps, dimensions, aspect ratio, overflow, position, offsets and z-index. Responsive and arbitrary utilities are allowed only when the underlying property is layout. Use a shared layout primitive when it fits. Do not inject layout classes or styles through children or extracted child components. Internal spacing and structure come from shared UI sizes, variants and structure primitives. Never pass `className` or `style` to a shared UI component, including for layout: follow `ui-no-classname-on-shared-ui`. Hand-styled markup drifts from the design tokens and breaks on every theme change.

**Incorrect (styled div/span with Tailwind):**

```tsx
<div className="flex items-center gap-2">
  <span className="text-sm font-medium text-gray-500">
    {t('contract.reminders.empty')}
  </span>
  <span className="rounded-full bg-green-100 px-2 py-1 text-green-800">{statusLabel}</span>
</div>
```

**Correct (design-system components carry the styling):**

```tsx
<Stack direction="row" gap="2" align="center">
  <Text variant="sm-medium" color="secondary">
    {t('contract.reminders.empty')}
  </Text>
  <Badge tone="positive">{statusLabel}</Badge>
</Stack>
```

If no design-system component fits, add or extend one in the shared UI layer instead of styling locally. Detection hint: search feature code for `className=` values containing `bg-`, `text-`, `border-`, `rounded-` or `shadow-`.

The same boundary covers SVG/Recharts appearance props, local stylesheet imports and imperative DOM style/class/attribute writes, including values supplied through constants, spreads, templates or element factories. A semantic class such as `text-positive` is still visual styling and belongs inside shared UI. Exporting visual class strings does not establish a primitive.

Global stylesheets, themes and token definitions remain design-system infrastructure. Shared UI consumes semantic tokens; domains supply data, actions and generic variants. Dynamic layout styles may remain on external containers. Chart geometry is data supplied to the owning UI primitive. Follow `ui-semantic-colors` for tokens and `arch-shared-no-domain-knowledge` for business adapters.
