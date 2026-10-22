---
title: Colocate a Test Next to Every File, Covering Errors
impact: MEDIUM
impactDescription: untested files and happy-path-only tests hide regressions in business logic
tags: test, colocation, error-cases, edge-cases
---

## Colocate a Test Next to Every File, Covering Errors

**Impact: MEDIUM (untested files and happy-path-only tests hide regressions in business logic)**

Every new hook, helper, service, store or component gets a sibling test file with the same base name: `useGetOrderDetailQuery.ts` → `useGetOrderDetailQuery.test.tsx`. Do not use `__tests__/` folders, a central test tree or Storybook `play` functions as the only test. Each test file covers the nominal path and at least one error or edge path (rejected schema, empty list, HTTP error, missing permission).

**Incorrect (test stored far from the code it covers):**

```tsx
// src/__tests__/order.test.tsx
describe('useGetOrderDetailQuery', () => {
  it('should parse the API payload', async () => { /* ... */ })

  it('should throw when the API answers 404', async () => { /* ... */ })
})
```

**Correct (sibling file, nominal and error cases):**

```tsx
// src/domains/sales/orders/apis/queries/useGetOrderDetailQuery.test.tsx
describe('useGetOrderDetailQuery', () => {
  it('should parse the API payload and strip unknown fields', async () => { /* ... */ })

  it('should default lines and attachments to [] when missing', async () => { /* ... */ })

  it('should throw when the API answers 404', async () => { /* ... */ })
})
```

A sibling file makes a missing test visible in the file tree, moves with the code when a folder is renamed, and keeps relative imports short (`./useGetOrderDetailQuery`).

Do not leave a silent `it.skip`: either fix the test or add a `// TODO:` comment that states why it is skipped. Run the tests of the folder you changed.
