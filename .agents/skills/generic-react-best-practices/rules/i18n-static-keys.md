---
title: Use Literal Translation Keys Only
impact: MEDIUM
impactDescription: keys stay visible to i18next-scanner and the missing-key check
tags: i18n, translation-keys, i18next-scanner, static-analysis, mapping
---

## Use Literal Translation Keys Only

**Impact: MEDIUM (keys stay visible to i18next-scanner and the missing-key check)**

The key extraction check (typically `i18next-scanner` or `i18next-parser`, configured for `t` and `i18next.t`) only extracts **string literals passed directly to `t()`**, then compares them with the reference translation catalog. A key built or stored elsewhere (template literal, concatenation, constant, `Record` value) is invisible: a missing key ships unnoticed and the user sees the raw key. For a finite union, write one literal `t('…')` call per value inside a formatter hook.

**Incorrect (dynamic or indirect keys):**

```tsx
const label = t(`order.sectionStatus.${status}`) // template literal

const SECTION_STATUS_KEYS: Record<ShippingStatus, string> = {
  NOT_STARTED: 'order.sectionStatus.NOT_STARTED',
  VALIDATED: 'order.sectionStatus.VALIDATED',
}
const title = t(SECTION_STATUS_KEYS[status]) // invisible to the scanner
```

**Correct (one literal `t()` per value, exhaustive over the union):**

```tsx
export function useFormatShippingStatus() {
  const { t } = useTranslation()
  return useCallback(
    (status: ShippingStatus) => {
      const labels: Record<ShippingStatus, string> = {
        NOT_STARTED: t('order.sectionStatus.NOT_STARTED'),
        VALIDATED: t('order.sectionStatus.VALIDATED'),
      }
      return labels[status]
    },
    [t],
  )
}
```

A ternary of literals (`t(isEdit ? 'contract.modal.reminder.editTitle' : 'contract.modal.reminder.addTitle')`) is fine: the scanner reads both branches. Only the **value** may be dynamic, via interpolation options. A lint rule that only forbids template literals does not catch a `Record<Union, 'literal.key'>` mapper passed to `t()`: avoid that pattern too.

Unused-key extraction must recognize the same supported translation bindings as the configured key check: the i18n instance, imported `t`, and `t` obtained from `useTranslation`, including aliases. Resolve lexical bindings so unrelated or shadowed functions do not keep a catalog key alive. Exercise each supported binding and a neighboring unrelated call; matching only the text `i18n.t` wrongly reports valid hook-based translations as unused.

### ESLint and complementary script use

Enable `local/i18n-consistency` or an equivalent check to reject nonliteral keys
and missing reference-catalog entries for resolved translation calls, including
supported aliases and literal branches. Verify invalid and valid neighboring
calls through the actual configuration.

When reviewing translation calls or changing keys, run the application's catalog
usage check through its documented [command bindings](../references/project-enforcement.md).
Use it to find reference-catalog keys with no recognized call sites, including
supported plural variants. Inspect reported keys before removal: an unsupported
binding or an external consumer can make a key appear unused. The catalog check
and missing-key lint check cover opposite directions; neither proves that every
visible string is translated. Review that contract under `i18n-no-hardcoded-strings`.
