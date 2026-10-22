---
title: Style with Design System Components, Utility Classes Only for Layout
impact: MEDIUM-HIGH
impactDescription: consistent visuals and themeable UI
tags: ui, tailwind, design-system, typography, layout
---

## Style with Design System Components, Utility Classes Only for Layout

**Impact: MEDIUM-HIGH (consistent visuals and themeable UI)**

Visual styling (text size, color, weight, background, border, radius, shadow, padding) comes from design-system components (`Text`, `Badge`, `Separator`, `Card`…), not from Tailwind classes on a `<div>` or `<span>` in feature code. Utility classes are tolerated only for minimal layout (`flex`, `gap`, `grow`), and a layout primitive of the design system is preferable even there. Hand-styled markup drifts from the design tokens and breaks on every theme change.

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
  <Badge type="success" label={statusLabel} />
</Stack>
```

If no design-system component fits, add or extend one in the shared UI layer instead of styling locally. Detection hint: search feature code for `className=` values containing `bg-`, `text-`, `border-`, `rounded-` or `shadow-`.
