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
  it('should parse the API payload', async () => {
    /* ... */
  })

  it('should throw when the API answers 404', async () => {
    /* ... */
  })
})
```

**Correct (sibling file, nominal and error cases):**

```tsx
// src/domains/sales/orders/features/detail/apis/queries/useGetOrderDetailQuery.test.tsx
describe('useGetOrderDetailQuery', () => {
  it('should parse the API payload and strip unknown fields', async () => {
    /* ... */
  })

  it('should default lines and attachments to [] when missing', async () => {
    /* ... */
  })

  it('should throw when the API answers 404', async () => {
    /* ... */
  })
})
```

A sibling file makes a missing test visible in the file tree, moves with the code when a folder is renamed, and keeps relative imports short (`./useGetOrderDetailQuery`).

Do not leave a silent `it.skip`: either fix the test or add a `// TODO:` comment that states why it is skipped. Run the tests of the folder you changed.

### Introduced-code closure check

Newly extracted views, hooks and other independent runtime owners count as new
modules even when existing integration tests exercise them. Before implementation,
capture and compare the authored source inventory through the command bound in
project-enforcement, using the consuming root/source parameters:

```sh
react-best-practices-test-colocation --snapshot
react-best-practices-test-colocation --baseline snapshot.json
```

The command compares filesystem inventories, including untracked additions, and
checks same-base test/spec siblings for recognized new components, hooks, helpers,
services and stores. Type-only modules, fixtures, stories, assets and support
modules outside this contract receive explicit non-applicability. Opaque runtime
roles stay pending until a reasoned, content-fingerprinted role review is supplied.

A reviewed move map requires valid old/new source hashes and a reason. Moving an
unchanged legacy owner without a former sibling does not itself create a new-file
violation. A moved owner must retain an existing sibling; changed moves require
explicit same-contract review or are treated as introduced contracts. Renaming
is not a waiver for an extraction or a new responsibility.

A missing/invalid baseline is an unavailable check, never a clean empty result.
Keep this provenance-aware command separate from ordinary ESLint. Presence cannot
establish meaningful nominal/error/edge assertions: empty siblings do not satisfy
the complete rule. Review that remaining obligation before closing phase 2.
