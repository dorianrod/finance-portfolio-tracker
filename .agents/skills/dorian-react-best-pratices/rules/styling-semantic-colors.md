---
title: Keep Colors Semantic in Business Components
summary: Never hardcode colors in business components; use semantic Tailwind classes or semantic color constants defined in a dedicated file.
impact: HIGH
tags:
  - react
  - tailwind
  - design-tokens
  - theming
  - maintainability
patterns:
  - A feature or domain component contains a literal CSS color in a class, inline style, or SVG attribute.
  - A feature or domain component uses a palette-specific Tailwind utility instead of a semantic utility.
  - A third-party UI or chart API requires a concrete color value from a business component.
---

## Keep Colors Semantic in Business Components

**Rule:** Never hardcode colors in business components; use semantic Tailwind classes or semantic color constants defined in a dedicated file.

Business components should express visual intent such as `positive`, `negative`, `warning`, or `muted`, without owning the concrete color that represents it. This keeps themes and visual changes centralized and prevents the same business meaning from drifting across the interface.

Hardcoded colors include:

- hexadecimal, `rgb()`, `hsl()`, `oklch()`, and concrete CSS color names such as `red`, `white`, or `black`;
- arbitrary Tailwind colors such as `text-[#b91c1c]`;
- palette-specific utilities such as `text-red-700` or `bg-emerald-100` when they encode a business meaning.

### Applies When

- A React component belongs to a feature or domain layer.
- A class, inline style, SVG attribute, or component prop selects a concrete color.
- A charting, canvas, mapping, or other third-party API requires a color value rather than a CSS class.

### Incorrect

```tsx
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

The semantic utilities must resolve to centrally defined theme tokens rather than colors declared by the business component.

### Correct: Centralized Semantic Constants

Use this option when an API requires a color value instead of a Tailwind class. Prefer a semantic CSS custom property; if the API cannot resolve CSS variables, keep the concrete fallback value in this dedicated file as well.

```typescript
// shared/theme/chart-colors.ts
export const chartColors = {
  positivePerformance: 'var(--color-positive)',
  negativePerformance: 'var(--color-negative)',
} as const
```

```tsx
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

- Theme, token, and design-system files may define the concrete values behind semantic names.
- Static brand assets may keep mandated brand colors in their dedicated asset or token definition.
- User-provided or data-driven colors are not hardcoded, but their validation and fallback colors must remain centralized.
- Structural CSS keywords such as `currentColor`, `transparent`, and `inherit` are allowed when they do not encode a business color.
