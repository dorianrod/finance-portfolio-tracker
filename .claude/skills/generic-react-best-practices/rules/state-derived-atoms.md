---
title: Derive Atoms Instead of Storing Duplicates
impact: MEDIUM
impactDescription: removes sync effects and out-of-date flags
tags: state, jotai, derived, atoms
---

## Derive Atoms Instead of Storing Duplicates

**Impact: MEDIUM (removes sync effects and out-of-date flags)**

When a value can be computed from other atoms (a role check, a count, a "has active filters" flag), expose a read-only derived atom `atom(get => …)` next to its source instead of a second writable atom kept in sync by an effect. Jotai recomputes it only when its dependencies change, and it can never disagree with its source.

**Incorrect (duplicated state synced by an effect):**

```ts
// stores/user.store.ts
export const userAtom = atom<CurrentUser | undefined>(undefined)
export const isAdminAtom = atom<boolean>(false)

// somewhere in the app shell
const user = useAtomValue(userAtom)
const setIsAdmin = useSetAtom(isAdminAtom)
useEffect(() => setIsAdmin(user?.role === 'admin'), [user, setIsAdmin])
```

**Correct (read-only derived atom):**

```ts
// stores/user.store.ts
export const userAtom = atom<CurrentUser | undefined>(undefined)
export const isAdminAtom = atom(get => get(userAtom)?.role === 'admin')

// src/domains/sales/invoices/features/list/stores/selection.atoms.ts
export const selectedInvoiceIdsAtom = atom<ReadonlySet<string>>(new Set<string>())
export const selectedInvoiceCountAtom = atom(get => get(selectedInvoiceIdsAtom).size)
```

Derivations that need server data are computed in the page hook (`useMemo` over the query result + atom), not in an atom (see `state-server-state-in-react-query`).

The same principle applies to props and query results: compute current values during render, using the appropriate pure helper, rather than copying them into local state through an effect. Memoize costly derivations when useful; cheap values need no cache. Reset an independently editable form through its explicit target/key contract (`ui-form-wraps-dialog`) rather than a general prop-to-state synchronization effect.

Subscribe to the derived atom actually needed by a consumer, such as `hasSelectionAtom`, when it only renders a boolean. Keep continuous or full-entity subscriptions for consumers that need those values. This narrows subscriptions without adding Context or a second writable copy (`state-hook-variants`).
