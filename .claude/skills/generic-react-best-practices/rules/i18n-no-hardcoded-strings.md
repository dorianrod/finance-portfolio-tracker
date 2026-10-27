---
title: Translate Every User-Facing String with a Catalog Key
impact: MEDIUM-HIGH
impactDescription: no untranslatable copy, no raw keys on screen
tags: i18n, hardcoded-strings, accessibility, toast, catalog
---

## Translate Every User-Facing String with a Catalog Key

**Impact: MEDIUM-HIGH (no untranslatable copy, no raw keys on screen)**

Every string a user can see or hear goes through `t()`: titles, labels, buttons, placeholders, empty states, toasts, tooltips and accessible labels. Domains pass translated semantic labels; shared UI implements any ARIA wiring (`ui-centralize-accessibility`). When you introduce a key, check that it exists in the reference translation catalog; if not, add it there (and have it created wherever the catalog is maintained) — otherwise the app renders the raw key. Then run the key extraction check.

**Incorrect (hardcoded copy in UI and notifications):**

```tsx
<h2>Delete document</h2>
<button onClick={handleConfirm}>Confirm</button>
<textarea name="message" placeholder="Optional message:" />

toast.success('Reminder added')
```

**Correct (keys resolved from the catalog):**

```tsx
const { t } = useTranslation()

<h2>{t('contract.modal.appendix.deleteTitle')}</h2>
<button onClick={handleConfirm}>{t('common.confirm')}</button>
<textarea name="message" placeholder={t('contract.form.reminder.message')} />

toast.success(t('contract.reminder.messages.addSuccess'))
```

Reuse shared keys (`common.cancel`, `common.confirm`, `common.close`, `common.delete`) before creating new ones. Not concerned: technical identifiers, CSS classes, test IDs, log messages and data coming from the API.
