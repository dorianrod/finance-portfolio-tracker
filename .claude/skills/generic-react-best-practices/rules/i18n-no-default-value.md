---
title: Never Use defaultValue in t()
impact: MEDIUM
impactDescription: missing keys surface instead of hardcoded fallbacks
tags: i18n, defaultValue, missing-keys, catalog
---

## Never Use defaultValue in t()

**Impact: MEDIUM (missing keys surface instead of hardcoded fallbacks)**

When translations are served from a catalog (a backend export or JSON files), a `defaultValue` hides a key that does not exist there: the English fallback ships as a hardcoded string, translators never see it, and the copy silently forks from the catalog. Every key must exist in the reference translation catalog; add the key instead of a fallback.

**Incorrect (fallback masks a missing key):**

```tsx
<h2>
  {t('contract.modal.appendix.deleteTitle', {
    defaultValue: 'Delete document',
  })}
</h2>

<button onClick={close}>{t('common.cancel', 'Cancel')}</button>
```

**Correct (plain key, present in the catalog):**

```tsx
<h2>{t('contract.modal.appendix.deleteTitle')}</h2>

<button onClick={close}>{t('common.cancel')}</button>
```

The second argument of `t()` is reserved for interpolation options (`{ name }`), never a default string. The only acceptable built-in fallbacks are the few boot-time keys of screens shown before the catalog loads; do not add feature keys there.
