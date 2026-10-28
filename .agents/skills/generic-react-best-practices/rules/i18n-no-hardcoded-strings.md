---
title: Translate Every User-Facing String with a Catalog Key
impact: MEDIUM
impactDescription: no untranslatable copy, no raw keys on screen
tags: i18n, hardcoded-strings, accessibility, toast, catalog
---

## Translate Every User-Facing String with a Catalog Key

**Impact: MEDIUM (no untranslatable copy, no raw keys on screen)**

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

### ESLint Enforcement

Enable `local/no-hardcoded-ui-strings` for production code. Check visible JSX and user-facing attributes directly, including interpolated templates. Presenter and formatter placement is only a signal: their return values can also be technical keys, CSS references or chart identifiers. In an implicit helper return, report recognizable natural-language copy rather than treating every template containing letters as translated text. Keep explicit UI text and attributes checked. Typed data fixtures under `mocks/` or in `*.mock.*` may carry raw entity names and source messages; do not treat those object values as product copy. Keep JSX text and attributes checked even in such a module.

This bounded syntax check cannot prove the meaning of every bare string, follow arbitrary adapters or identify all runtime-generated copy. Review ambiguous helper outputs and API-provided data at their display sites. Verify rejected copy, valid technical identifiers and explicit UI templates through the consuming application's actual configuration; do not add application-specific identifier allowlists.
