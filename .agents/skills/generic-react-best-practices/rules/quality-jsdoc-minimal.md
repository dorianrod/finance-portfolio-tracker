---
title: Keep JSDoc for Non-Obvious Intent Only
impact: LOW
impactDescription: less noise, and comments that stay true
tags: quality, jsdoc, comments, documentation
---

## Keep JSDoc for Non-Obvious Intent Only

**Impact: LOW (less noise, and comments that stay true)**

Add JSDoc only when it explains something the name and types cannot: a business reason, an invariant, a call constraint (Suspense, "call once per page"), or a deliberate tolerance in a schema. Do not paraphrase the function name or restate parameter types. Paraphrase JSDoc drifts out of date and hides the comments that matter. Do not require an `@example` on every hook.

**Incorrect (restates the signature):**

```ts
/**
 * Hook to get the contacts selection.
 * @returns the contacts selection
 */
export function useContactsSelection() {
  // ...
}
```

**Correct (explains the why and the usage constraint):**

```ts
/**
 * Selection of the contacts list. It is cleared whenever the search or a filter changes: a
 * selection must not outlive the rows it was made on, a bulk action would hit contacts no longer
 * on screen.
 *
 * Call it once per page (the clearing is an effect).
 */
export function useContactsSelection() {
  // ...
}
```

A well-named function with explicit types needs no JSDoc at all. Use inline `// WHY:` comments for local surprises, such as a nullable field kept on purpose or an `eslint-disable`.
