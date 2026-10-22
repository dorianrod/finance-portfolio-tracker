---
title: Isolate Jotai State with a Fresh Store per Test
impact: MEDIUM-HIGH
impactDescription: prevents state leaking between tests through module-level atoms
tags: test, jotai, provider, createStore, hydrate
---

## Isolate Jotai State with a Fresh Store per Test

**Impact: MEDIUM-HIGH (prevents state leaking between tests through module-level atoms)**

Atoms declared in `stores/*.atoms.ts` are module singletons. Without a `Provider`, every test in the file writes to the same default Jotai store, so the outcome depends on test order. Give each test its own `createStore()` and wrap the render in `<Provider store={store}>`. Seed initial values with `store.set(atom, value)`: it is typed against the atom, and the store lets you read the result back.

**Incorrect (no Provider: every test writes to the shared default store):**

```tsx
it('should reset the filters when the contract changes', () => {
  const { rerender } = renderHook(({ id }) => useResetHistoryFilters(id), {
    initialProps: { id: 'contract-a' },
  })
  rerender({ id: 'contract-b' })
})
```

**Correct (one store per test, typed seeding, assertions on the store):**

```tsx
import { Provider, createStore } from 'jotai'

import {
  DEFAULT_HISTORY_FILTERS,
  historyFiltersAtom,
} from '@/domains/contracts/pages/histories/stores/filters.atoms'

it('should reset the filters when the contract changes', () => {
  const store = createStore()
  const wrapper = ({ children }: { children: ReactNode }) => (
    <Provider store={store}>{children}</Provider>
  )
  const { rerender } = renderHook(({ id }) => useResetHistoryFilters(id), {
    wrapper,
    initialProps: { id: 'contract-a' },
  })

  store.set(historyFiltersAtom, { statuses: ['ONGOING'], changeReasons: ['STATUS_CHANGED'] })
  rerender({ id: 'contract-b' })

  expect(store.get(historyFiltersAtom)).toEqual(DEFAULT_HISTORY_FILTERS)
})
```

If a component has to start from a hydrated value, write a small typed component, for example `HydrateUser({ user, children }: { user: CurrentUser; children: ReactNode })` that calls `useHydrateAtoms([[userAtom, user]])`. Do not write a generic `any` helper. Test atoms through their owner hooks rather than the internals of an atom factory.
