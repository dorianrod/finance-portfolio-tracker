---
title: Keep Colors Semantic Behind Shared UI
impact: HIGH
tags: react, tailwind, design-tokens, theming, maintainability
---

## Keep Colors Semantic Behind Shared UI

**Rule:** Use semantic color tokens inside shared UI primitives and expose semantic variants to business components.

The [shared UI boundary](ui-no-adhoc-styling.md) applies first:
replacing a raw color with `text-positive` or an imported color constant does not
authorize visual styling in a business component. The styling examples below
belong inside `shared/ui`; domains consume primitives through semantic variants
and nested children.

Semantic variants describe generic UI roles, not business entities, operations or
metrics. Follow [agnostic shared UI](arch-shared-no-domain-knowledge.md): domains
choose the role, and primitives apply its visual tokens without interpreting
business values.

Business components should express visual intent such as `positive`, `negative`, `warning`, or `muted`, without owning the concrete color that represents it. This keeps themes and visual changes centralized and prevents the same business meaning from drifting across the interface.

Hardcoded colors include:

- hexadecimal, `rgb()`, `hsl()`, `oklch()`, and concrete CSS color names such as `red`, `white`, or `black`;
- arbitrary Tailwind colors such as `text-[#b91c1c]`;
- palette-specific utilities such as `text-red-700` or `bg-emerald-100` when they encode a business meaning.

### Applies When

- A React component chooses a color, including inside shared UI primitives.
- A class, inline style, SVG attribute, or component prop selects a concrete color.
- A charting, canvas, mapping, or other third-party API requires a color value rather than a CSS class.

**Incorrect:**
```tsx
// shared/ui/StatusBadge.view.tsx
export function Badge({
  tone,
  children,
}: {
  tone: "positive" | "negative";
  children: React.ReactNode;
}) {
  return (
    <span
      className={
        tone === "positive"
          ? "bg-emerald-100 text-emerald-700"
          : "bg-[#fef2f2] text-[#b91c1c]"
      }
    >
      {children}
    </span>
  );
}
```

**Correct (Semantic Tailwind Classes):**
```tsx
// shared/ui/StatusBadge.view.tsx
export function Badge({
  tone,
  children,
}: {
  tone: "positive" | "negative";
  children: React.ReactNode;
}) {
  return (
    <span
      className={
        tone === "positive"
          ? "bg-positive-muted text-positive"
          : "bg-negative-muted text-negative"
      }
    >
      {children}
    </span>
  );
}
```

The semantic utilities must resolve to centrally defined theme tokens. Business
components use the primitive instead of applying its color classes themselves:

```tsx
export function Status({ isPositive }: { isPositive: boolean }) {
  return (
    <Badge tone={isPositive ? "positive" : "negative"}>
      {isPositive ? "Gain" : "Loss"}
    </Badge>
  );
}
```

**Correct (Centralized Semantic Constants):**
Use this option inside a shared UI wrapper when an API requires a color value
instead of a Tailwind class. Prefer a semantic CSS custom property; if the API
cannot resolve CSS variables, keep the concrete fallback value in this dedicated
theme file as well. Domains supply data and generic UI intent to the wrapper.

```typescript
// shared/theme/chart-colors.ts
export const chartColors = {
  positive: "var(--color-positive)",
  negative: "var(--color-negative)",
} as const;
```

```tsx
// shared/ui/SeriesBar.view.tsx
import { Bar } from "recharts";

import { chartColors } from "../theme/chart-colors";

export function SeriesBar({
  dataKey,
  tone,
}: {
  dataKey: string;
  tone: keyof typeof chartColors;
}) {
  return <Bar dataKey={dataKey} fill={chartColors[tone]} />;
}
```

The exported names describe generic UI roles rather than business metrics or hue
names such as `green500` or `red700`. A domain presenter may map a business metric
to one of these roles without owning its concrete color.

### ESLint Enforcement

Use the custom ESLint rule `local/no-hardcoded-colors` to check literal appearance values and palette utilities in shared UI and application/domain code. Follow immutable aliases and conditional values. Apply the token boundary to imperative style assignments, `setProperty`, SVG `setAttribute` and browser `theme-color` metadata. Dedicated theme and asset definitions may contain concrete values. This bounded check does not parse arbitrary CSS or infer every dynamic DOM target.

### Exceptions

- Global stylesheets, `shared/theme` and dedicated token definitions may define the concrete values behind semantic names.
- Static brand assets may keep mandated brand colors in their dedicated asset or token definition.
- User-provided or data-driven colors are not hardcoded, but their application, validation and fallback colors must remain in shared UI.
- Structural CSS keywords such as `currentColor`, `transparent`, and `inherit` may be used inside shared UI; they do not exempt domains from the shared UI boundary.
