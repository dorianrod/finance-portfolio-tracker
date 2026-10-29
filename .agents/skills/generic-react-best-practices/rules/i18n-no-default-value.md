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

### Analysis aids

Use `local/i18n-consistency` or equivalent configured checks for fallback strings,
explicit `defaultValue` options and missing catalog entries in supported calls.
Opaque option objects and wrappers still require inspection. When replacing a
fallback with a catalog key, run the catalog usage check described by
`i18n-static-keys`; it complements call-site lint and does not detect defaults
by itself. Verify the key's presence and review its actual displayed text.
