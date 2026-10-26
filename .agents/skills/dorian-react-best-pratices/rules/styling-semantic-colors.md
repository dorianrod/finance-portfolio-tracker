---
title: Keep Colors Semantic Behind Shared UI
summary: Use semantic color tokens inside shared UI primitives and expose semantic variants to business components.
impact: HIGH
tags:
  - react
  - tailwind
  - design-tokens
  - theming
  - maintainability
patterns:
  - A feature or domain component contains a literal CSS color in a class, inline style, or SVG attribute.
  - A shared UI primitive uses a palette-specific Tailwind utility instead of a semantic token.
  - A third-party UI or chart API requires a concrete color value from a business component.
---

## Keep Colors Semantic Behind Shared UI

**Rule:** Use semantic color tokens inside shared UI primitives and expose semantic variants to business components.

The [shared UI boundary](styling-centralize-in-shared-ui.md) applies first:
replacing a raw color with `text-positive` or an imported color constant does not
authorize visual styling in a business component. The styling examples below
belong inside `shared/ui`; domains consume primitives through semantic variants
and nested children.

Business components should express visual intent such as `positive`, `negative`, `warning`, or `muted`, without owning the concrete color that represents it. This keeps themes and visual changes centralized and prevents the same business meaning from drifting across the interface.

Hardcoded colors include:

- hexadecimal, `rgb()`, `hsl()`, `oklch()`, and concrete CSS color names such as `red`, `white`, or `black`;
- arbitrary Tailwind colors such as `text-[#b91c1c]`;
- palette-specific utilities such as `text-red-700` or `bg-emerald-100` when they encode a business meaning.

### Applies When

- A React component chooses a color, including inside shared UI primitives.
- A class, inline style, SVG attribute, or component prop selects a concrete color.
- A charting, canvas, mapping, or other third-party API requires a color value rather than a CSS class.

### Incorrect

```tsx
// shared/ui/StatusBadge.view.tsx
export function PerformanceBadge({ isPositive }: { isPositive: boolean }) {
  return (
    <span
      className={
        isPositive
          ? 'bg-emerald-100 text-emerald-700'
          : 'bg-[#fef2f2] text-[#b91c1c]'
      }
    >
      {isPositive ? 'Gain' : 'Loss'}
    </span>
  )
}
```

### Correct: Semantic Tailwind Classes

```tsx
// shared/ui/StatusBadge.view.tsx
export function PerformanceBadge({ isPositive }: { isPositive: boolean }) {
  return (
    <span
      className={
        isPositive
          ? 'bg-positive-muted text-positive'
          : 'bg-negative-muted text-negative'
      }
    >
      {isPositive ? 'Gain' : 'Loss'}
    </span>
  )
}
```

The semantic utilities must resolve to centrally defined theme tokens. Business
components use the primitive instead of applying its color classes themselves:

```tsx
import { Badge } from '@/shared/ui/Badge.view'

export function Status({ isPositive }: { isPositive: boolean }) {
  return (
    <Badge tone={isPositive ? 'positive' : 'negative'}>
      {isPositive ? 'Gain' : 'Loss'}
    </Badge>
  )
}
```

### Correct: Centralized Semantic Constants

Use this option inside a shared UI wrapper when an API requires a color value
instead of a Tailwind class. Prefer a semantic CSS custom property; if the API
cannot resolve CSS variables, keep the concrete fallback value in this dedicated
theme file as well. Domains supply data and semantic intent to the wrapper.

```typescript
// shared/theme/chart-colors.ts
export const chartColors = {
  positivePerformance: 'var(--color-positive)',
  negativePerformance: 'var(--color-negative)',
} as const
```

```tsx
// shared/ui/PerformanceBar.view.tsx
import { Bar } from 'recharts'

import { chartColors } from '@/shared/theme/chart-colors'

export function PerformanceBar({ value }: { value: number }) {
  return (
    <Bar
      dataKey="performance"
      fill={
        value >= 0
          ? chartColors.positivePerformance
          : chartColors.negativePerformance
      }
    />
  )
}
```

The exported names describe business or UI meaning, not hue names such as `green500` or `red700`.

### Exceptions

- `src/index.css`, `shared/theme` and dedicated token definitions may define the concrete values behind semantic names.
- Static brand assets may keep mandated brand colors in their dedicated asset or token definition.
- User-provided or data-driven colors are not hardcoded, but their application, validation and fallback colors must remain in shared UI.
- Structural CSS keywords such as `currentColor`, `transparent`, and `inherit` may be used inside shared UI; they do not exempt domains from the shared UI boundary.
