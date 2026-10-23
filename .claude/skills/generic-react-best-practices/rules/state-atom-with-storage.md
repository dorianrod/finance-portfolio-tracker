---
title: Persist Atoms with atomWithStorage and a Unique Key
impact: MEDIUM
impactDescription: avoids key collisions, flashes and crashes on bad storage
tags: state, jotai, persistence, localStorage, atomWithStorage
---

## Persist Atoms with atomWithStorage and a Unique Key

**Impact: MEDIUM (avoids key collisions, flashes and crashes on bad storage)**

Persist client state only through `atomWithStorage<T>(key, default, storage?, options?)` from `jotai/utils`, in a `[name].store.ts` file of the owning feature, with a typed default and a key unique across the app. Never read/write `localStorage` by hand in an effect next to a plain atom.

- Export the key as a constant when anything else needs it (tests, cleanup). A single-use inline key is acceptable.
- Pass `{ getOnInit: true }` when the stored value drives the first render; otherwise the default renders first, then the subtree re-renders with the stored value.
- When the stored value is not a plain primitive, give a custom storage whose `getItem` validates the parsed value and falls back to the default: a stale or hand-edited entry must never throw at boot. Change the key (or version the value) when its shape changes.

**Incorrect (manual sync, generic key, unchecked parse):**

```ts
export const pinnedColumnsAtom = atom<Set<string>>(new Set())

useEffect(() => {
  setPinned(new Set(JSON.parse(localStorage.getItem('columns')!))) // throws on bad JSON, flashes
}, [setPinned])
useEffect(() => localStorage.setItem('columns', JSON.stringify([...pinned])), [pinned])
```

**Correct (atomWithStorage, exported key, defensive storage):**

```ts
// src/domains/sales/orders/features/list/stores/pinnedColumns.store.ts
export const PINNED_COLUMNS_STORAGE_KEY = 'orders.pinnedColumns'

export const pinnedColumnsAtom = atomWithStorage<Set<string>>(
  PINNED_COLUMNS_STORAGE_KEY,
  new Set<string>(),
  {
    getItem: (key, initialValue) => {
      try {
        const parsed: unknown = JSON.parse(localStorage.getItem(key) ?? 'null')
        return Array.isArray(parsed) ? new Set(parsed.filter(isOrderColumn)) : initialValue
      } catch {
        return initialValue
      }
    },
    setItem: (key, value) => localStorage.setItem(key, JSON.stringify([...value])),
    removeItem: key => localStorage.removeItem(key),
  },
  { getOnInit: true },
)
```

Persist UI preferences and session data only; never persist server data (see `state-server-state-in-react-query`).

See also: `vercel-react-best-practices` → `client-localstorage-schema`
