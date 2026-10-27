---
title: Format Entities Through Formatter Hooks, Never Inline
impact: MEDIUM-HIGH
impactDescription: one display rule per entity, changeable in one place
tags: helpers, formatters, display, reuse
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
  return useCallback((contact: Contact) => `${contact.firstName} ${contact.lastName}`.trim(), [])
}

// domains/sales/shared/helpers/formatters/useFormatGlobalStatus.ts
export function useFormatGlobalStatus() {
  const { t } = useTranslation()
  return useCallback((status: GlobalStatus) => t(`sales.globalStatus.${status}`), [t])
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

### Missing Values and Zero

Numeric formatters own display fallbacks. Pass nullable values directly instead of guarding with `value == null ? '—' : formatNumber(value)`, checking numeric truthiness, or defaulting a formatter input with `??` or `||`. Extend the existing formatter's options rather than creating a wrapper solely for null or zero.

**Incorrect (the component owns a display fallback):**

```tsx
<span>{value == null ? '—' : formatNumber(value)}</span>
```

**Correct (the existing formatter owns the policy):**

```tsx
<span>{formatNumber(value)}</span>
```

Numeric formatters should accept `number | null | undefined`. A string fallback is display text; a numeric fallback uses the same precision, sign, currency and unit options as a regular value. Keep zero distinct from absence by default and opt into a zero placeholder explicitly. Preserve each caller's policy when migrating.

Conditions that select structure, loading or error states, permissions or comparability remain component/business logic. A calculation's numeric default belongs to that calculation. A domain formatter may add independent business meaning; a missing-value placeholder alone does not justify one.
