---
title: Write Code, Comments and Tests in English
impact: MEDIUM
impactDescription: one language for a codebase reviewed by agents and mixed teams
tags: quality, english, comments, naming, tests
---

## Write Code, Comments and Tests in English

**Impact: MEDIUM (one language for a codebase reviewed by agents and mixed teams)**

Identifiers, comments, JSDoc, `describe`/`it` names, and test data labels are all in English. Other languages never belong in `.ts`/`.tsx`: user-facing copy lives in translation catalogs served through `react-i18next` (see `i18n-no-hardcoded-strings`). Mixed-language code is harder to grep, review and keep consistent with the English domain vocabulary (`order`, `invoice`, `contract`).

**Incorrect (non-English comments and test names, French here):**

```ts
// Retry uniquement sur les erreurs réseau/timeout (max 3 fois)
const isNetworkError = !error.response && !!error.code

it('affiche une erreur quand le champ est invalide', async () => {
  // Toucher le champ et le sortir du focus pour déclencher l'erreur
  await user.tab()
})
```

**Correct (English everywhere):**

```ts
// Retry only network/timeout errors (max 3 attempts)
const isNetworkError = !error.response && !!error.code

it('should display an error when the field is invalid', async () => {
  // Blur the field to mark it as touched
  await user.tab()
})
```

To find leftovers, grep for accented characters in source files (for example `grep -rn "[àâäéèêëïîôùûüÿæœç]" src --include="*.ts*"`). Matches in i18n fixtures or real data samples (names, addresses) are fine. Translate older comments when you touch them.
