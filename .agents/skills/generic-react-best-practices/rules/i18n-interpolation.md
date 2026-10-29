---
title: Inject Dynamic Values Through t() Options, Never Concatenation
impact: MEDIUM
impactDescription: translatable sentences and checked placeholders
tags: i18n, interpolation, placeholders, concatenation
---

## Inject Dynamic Values Through t() Options, Never Concatenation

**Impact: MEDIUM (translatable sentences and checked placeholders)**

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

Enable `local/no-ui-string-concat` for production code. Reject concatenated translations and decorated formatter results in display expressions, for both templates and `+`. Resolve imported formatter hooks and immutable aliases; preserve numeric arithmetic and technical keys, URLs, chart data keys and CSS expressions. For binary expressions, use a proven string operand before calling an operation concatenation. Implicit display text outside JSX/presentation helpers, opaque wrappers and reassigned aliases require manual review. Verify rejected and neighboring valid examples through the consuming application's configuration.

Use `local/i18n-consistency` or an equivalent check for required interpolation
options in supported calls. Inspect opaque options and sentence semantics
manually. When a correction adds or renames a full-sentence key, run the catalog
usage check described by `i18n-static-keys`; unused-key detection does not verify
interpolation values or sentence construction.
