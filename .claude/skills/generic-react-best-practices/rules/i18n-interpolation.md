---
title: Inject Dynamic Values Through t() Options, Never Concatenation
impact: MEDIUM-HIGH
impactDescription: translatable sentences and checked placeholders
tags: i18n, interpolation, placeholders, concatenation
---

## Inject Dynamic Values Through t() Options, Never Concatenation

**Impact: MEDIUM-HIGH (translatable sentences and checked placeholders)**

Pass every dynamic value as an interpolation option — `t('key', { name, count })` — and let the catalog sentence place it. Never concatenate a translated string with variables, spaces, numbers or another `t()`: the sentence becomes untranslatable (word order, punctuation, plurals), and a translation check can no longer verify that code and catalog agree on the placeholders.

**Incorrect (sentence assembled in code):**

```tsx
<p>{t('common.delete') + ' "' + documentToDelete?.name + '"?'}</p>

const secondaryText = `${t('order.payment.upload.fileLabel')} (${maxFiles} max)`
```

**Correct (placeholders filled through options):**

```tsx
<p>
  {t('contract.modal.appendix.deleteQuestion', {
    name: documentToDelete?.name ?? '',
  })}
</p>

const secondaryText = t('order.shipping.upload.limits', {
  maxSize: MAX_FILE_SIZE_MB,
  maxFiles: MAX_FILES,
})
```

Option names must match the placeholders of the catalog value: a placeholder missing in code is an error, an unused one a warning. If no key holds the full sentence yet, add one rather than gluing fragments. For counts, use i18next plural keys (`count`) instead of branching in code.
