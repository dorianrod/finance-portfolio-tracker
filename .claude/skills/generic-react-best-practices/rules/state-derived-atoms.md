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

// src/domains/sales/invoices/stores/selection.atoms.ts
export const selectedInvoiceIdsAtom = atom<ReadonlySet<string>>(new Set<string>())
export const selectedInvoiceCountAtom = atom(get => get(selectedInvoiceIdsAtom).size)
```

Derivations that need server data are computed in the page hook (`useMemo` over the query result + atom), not in an atom (see `state-server-state-in-react-query`).

See also: `vercel-react-best-practices` → `rerender-derived-state`
