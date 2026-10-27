---
title: Keep Display Fallbacks in Existing Formatters
summary: Pass nullable numeric values directly to existing formatters and configure their missing-value or zero fallback there.
impact: MEDIUM
tags:
  - components
  - formatters
  - fallbacks
patterns:
  - A component chooses between a text placeholder and formatting the same value based on null, undefined, zero, or numeric truthiness.
  - A numeric formatter call defaults its input inline with nullish coalescing or a logical OR.
  - The request asks to reuse existing formatters for missing-value or zero display instead of extracting another formatter.
---

## Keep Display Fallbacks in Existing Formatters

**Rule:** Pass nullable numeric values directly to existing formatters and configure their missing-value or zero fallback there.

A guard that only chooses a placeholder is part of formatting. Extend the existing formatter's options when necessary; do not extract a wrapper formatter just to handle `null` or zero. Keep precision, signs and units in the existing options.

### Applies When

- A component renders `value == null ? '—' : formatNumber(value)`, including local labels, JSX and translation interpolation.
- A component checks zero or numeric truthiness solely to choose a display placeholder.
- A formatter receives a directly defaulted input such as `formatMoney(value ?? 0)`.

### Incorrect

```tsx
const formatNumber = useFormatNumber();
return <span>{value == null ? "—" : formatNumber(value)}</span>;
```

### Correct

```tsx
const formatNumber = useFormatNumber();
return <span>{formatNumber(value)}</span>;
```

In this dashboard, `useFormatNumber`, `useFormatMoney` and `useFormatPercentage` accept `number | null | undefined`:

```typescript
formatNumber(value); // null or undefined → '—'; zero stays formatted
formatMoney(value, { fallback: 0 }); // missing amount → formatted zero
formatPercentage(value, { fallback: "", zeroAsFallback: true });
```

`fallback` defaults to `'—'`. A string is returned as display text; a numeric fallback goes through the same precision, sign, currency and unit options as a regular value. `zeroAsFallback` defaults to `false`; enable it explicitly when zero needs the same placeholder as a missing value. Preserve each caller's current display policy when migrating it.

### Enforcement

Enable `local/no-inline-format-fallback` at error level. It checks production TS and TSX, including domain formatter wrappers, for guards on the same stable value passed to a numeric formatter, plus direct `??` and `||` input defaults with a string or numeric literal. It follows immutable boolean aliases and guards nested in `&&`/`||` conditions. A query-state condition can remain while the numeric formatter owns the missing-value placeholder. Imported numeric hooks are resolved through import/local aliases, relative paths and numeric functions destructured from formatter bundles.

The check is deliberately bounded: it does not follow reassigned aliases, arbitrary providers, helper parameters, structural JSX branches with several children or fallback expressions nested inside calculations. Shared numeric formatter implementations and tests are excluded. There is no automatic fix: preserve the guard's business conditions and the difference between an absent value and zero. `local/no-helper-context-params` separately prevents passing formatter/context dependencies through helper APIs.

### Exceptions

- Conditions that select UI structure, loading/error states, permissions or comparability remain component or business logic.
- A domain formatter that adds independent business meaning may remain; a null/zero placeholder alone does not justify one.
- Defaults needed for calculations before formatting belong to the calculation, rather than the formatter's display fallback.
