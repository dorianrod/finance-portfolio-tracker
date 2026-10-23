---
title: Do Not Use oneOf on Display-Only API Enums
impact: HIGH
impactDescription: a new backend value must not break the screen
tags: yup, enums, oneOf, presenters
---

## Do Not Use oneOf on Display-Only API Enums

**Impact: HIGH (a new backend value must not break the screen)**

When the API owns a taxonomy that is only displayed (badge, label, colour), parse it as `yup.string()` and map it with a helper that falls back for unknown values. A strict `.oneOf` fails validation as soon as the backend adds a value, which breaks the whole query. Reserve `.oneOf` (typed literal unions) for values that drive logic such as permissions, branching or form submission.

**Incorrect (strict enum on a display field):**

```tsx
const EMAIL_TRACKING_SCHEMA = yup.object({
  uuid: yup.string().required(),
  status: yup.string().oneOf(ALL_CONTRACT_EMAIL_STATUSES).required(),
})
```

**Correct (tolerant string + component- or page-scoped presenter with fallback):**

```tsx
const EMAIL_TRACKING_SCHEMA = yup.object({
  uuid: yup.string().required(),
  status: yup.string().required(), // API owns this taxonomy
})

// pages/detail/helpers/presenters/getEmailStatusBadge.ts
const STATUS_BADGE: Record<ContractEmailStatus, EmailStatusBadge> = { /* SENT, OPENED… */ }
const UNKNOWN_STATUS_BADGE: EmailStatusBadge = { type: 'neutral', i18nKey: null }

const isKnownEmailStatus = (status: string): status is ContractEmailStatus =>
  Object.hasOwn(STATUS_BADGE, status)

export const getEmailStatusBadge = (status: string): EmailStatusBadge =>
  isKnownEmailStatus(status) ? STATUS_BADGE[status] : UNKNOWN_STATUS_BADGE
```

Logic-driving enums keep `.oneOf` with the domain union, e.g. `billingMethod: yup.string<ContractBillingMethod>().oneOf(ALL_CONTRACT_BILLING_METHODS)`. The entity types the display field as `string`, not as the union, and the presenter narrows it with a type guard rather than a cast.

See also: `types-closed-values-not-string`
