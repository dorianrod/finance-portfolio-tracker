---
title: Format Entities Through Formatter Hooks, Never Inline
impact: MEDIUM-HIGH
impactDescription: one display rule per entity, changeable in one place
tags: helpers, formatters, display, reuse, fallback, nullability
---

## Format Entities Through Formatter Hooks, Never Inline

**Impact: MEDIUM-HIGH (one display rule per entity, changeable in one place)**

Turning an entity into display text (name, address, status label, date, amount) is a domain rule. Never concatenate fields, map statuses or call `.toFixed()` / `.toLocaleString()` in a component or another hook: call a `useFormatXxx` hook from `helpers/formatters/`. Before writing one, search for an existing formatter: duplicated formatting is how the same entity ends up displayed three different ways.

**Incorrect (formatting inline in the component):**

```tsx
export const OrderAccessRow: FC<Props> = ({ access, order }) => {
  const { t } = useTranslation()
  return (
    <>
      <p>{`${access.contact.firstName} ${access.contact.lastName}`}</p>
      <span className="badge">
        {order.globalStatus === 'CLOSED' ? t('sales.globalStatus.CLOSED') : t('sales.globalStatus.STARTED')}
      </span>
      <p>{`${order.amount.toFixed(2)} ${order.currency}`}</p>
    </>
  )
}
```

**Correct (dedicated formatter hooks, existing ones reused):**

```tsx
// domains/sales/shared/helpers/formatters/useFormatContact.ts
export function useFormatContact() {
  return useCallback(
    (contact: Contact | null | undefined, { fallback = '—' }: { fallback?: string } = {}) => {
      if (contact == null) return fallback
      return `${contact.firstName} ${contact.lastName}`.trim()
    },
    [],
  )
}

// domains/sales/shared/helpers/formatters/useFormatGlobalStatus.ts
export function useFormatGlobalStatus() {
  const { t } = useTranslation()
  return useCallback(
    (status: GlobalStatus | null | undefined, { fallback = '—' }: { fallback?: string } = {}) => {
      if (status == null) return fallback
      return t(`sales.globalStatus.${status}`)
    },
    [t],
  )
}

// component
const formatContact = useFormatContact()
const formatGlobalStatus = useFormatGlobalStatus()
const formatMoney = useFormatMoney()

<p>{formatContact(access.contact)}</p>
<Badge>{formatGlobalStatus(order.globalStatus)}</Badge>
<p>{formatMoney(order.amount, order.currency)}</p>
```

Where to look first: the app-wide formatters in `src/shared/helpers/formatters/` (money, dates, addresses), then the domain's and its main domain's `shared/helpers/formatters/`. A formatter used by several sub-domains lives once in `[domain]/shared/helpers/formatters/`, one hook per file named after it. A formatter hook returns a `useCallback`-wrapped function taking the entity (see `arch-helpers-vs-services` for its shape). Lint the raw locale calls (`toLocaleDateString`, `toLocaleTimeString`) with `no-restricted-properties` so that dates also go through the shared formatters.

### Missing Values in Every Formatter

Every value-to-text formatter owns display fallbacks: dates, numbers, money, percentages, entity names and status labels. Its value parameter accepts the normal input type plus `null | undefined`, its return type stays `string`, and its options expose a configurable `fallback`. Use the application's default placeholder when no fallback is supplied; allow an empty string when the caller needs blank text.

Pass nullable values directly instead of guarding with `value == null ? '' : formatDate(value)`, checking truthiness, or defaulting a formatter input with `??` or `||`. Extend the existing formatter's options rather than creating a wrapper solely for a missing-value placeholder. Resolve absence inside the formatter before property access, lookups or date conversion; never turn a missing date into the Unix epoch or today's date.

**Incorrect (the component owns a display fallback):**

```tsx
<span>{value == null ? '—' : formatNumber(value)}</span>
<span>{publishedOn == null ? '' : formatDate(publishedOn)}</span>
<span>{contact == null ? '—' : formatContact(contact)}</span>
```

**Correct (the existing formatter owns the policy):**

```tsx
<span>{formatNumber(value)}</span>
<span>{formatDate(publishedOn, { fallback: '' })}</span>
<span>{formatContact(contact)}</span>
```

**Correct (the date formatter handles absence before formatting):**

```typescript
export function useFormatDate() {
  const { i18n } = useTranslation()
  const dateFormatter = useMemo(
    () => new Intl.DateTimeFormat(i18n.language),
    [i18n.language],
  )

  return useCallback(
    (value: Date | null | undefined, { fallback = '—' }: { fallback?: string } = {}): string => {
      if (value == null) return fallback
      return dateFormatter.format(value)
    },
    [dateFormatter],
  )
}
```

A display fallback does not change the entity's nullability or replace API parsing and validation (see `types-explicit-nullability` and `yup-last-coercion-barrier`). Preserve each caller's placeholder and existing format options when migrating; replace the empty-string date guard with `{ fallback: '' }` rather than changing its output to the default placeholder.

### Numeric Fallbacks and Zero

Numeric formatters accept `number | null | undefined`. A string fallback is display text; a numeric fallback uses the same precision, sign, currency and unit options as a regular value. Keep zero distinct from absence by default and opt into a zero placeholder explicitly. Do not add numeric fallback or zero-handling options to non-numeric formatters.

Conditions that select structure, loading or error states, permissions or comparability remain component/business logic. A calculation's numeric default belongs to that calculation. A domain formatter may add independent business meaning; a missing-value placeholder alone does not justify one.

### ESLint Enforcement

Use the custom ESLint rule `local/no-inline-format-fallback` for production TS and TSX, including domain formatter wrappers. Detect guards on the formatter's first argument and direct `??`/`||` input defaults with string or numeric literals. Cover both ternary branches, either operand order for `==`, `===`, `!=` and `!==`, null/undefined/zero/empty-string tests, `typeof`, truthiness, negation, `Boolean`, immutable boolean aliases, return-only `if` guards and `&&`/`||` short-circuits that directly return a formatter call. Keep query-state conditions and conditional mounting when they select UI structure rather than a text fallback.

Resolve formatter identity from `helpers/formatters/` imports rather than local names alone: `useFormatXxx` hook results, imported `formatXxx` functions, namespaces, relative imports and immutable aliases. Support destructured aliases and member calls from `use…Formatters` bundles without a registry per formatter. Compare stable member accesses across dot/bracket notation and optional access.

The check does not follow reassigned aliases, arbitrary providers, helper parameters, dynamic property keys, multi-child structural JSX branches or fallback expressions nested inside calculations. Exclude global shared formatter implementations and tests; keep domain shared wrappers checked. Do not autofix: preserve business conditions and the distinction between absence and zero.
