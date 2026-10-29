---
title: Create Atoms at Module Scope, Never During Render
impact: MEDIUM-HIGH
impactDescription: prevents state reset on every render
tags: state, jotai, atoms, factories, render
---

## Create Atoms at Module Scope, Never During Render

**Impact: MEDIUM-HIGH (prevents state reset on every render)**

An atom's identity is its state key: calling `atom()` or an atom factory inside a component or hook body creates a new atom on every render, so the edit mode, selection or filters reset immediately and every effect depending on the atom re-runs. Declare atoms and factory bundles once, at module scope, in a concern-owned `stores/*.atoms.ts` or `stores/*.store.ts` module according to `arch-stores-no-index`. Exported identifiers follow `state-atom-naming`.

**Incorrect (new atom on each render):**

```tsx
export const OverviewBlock = () => {
  const isEditingAtom = atom<boolean>(false) // new atom each render
  const [isEditing, setIsEditing] = useAtom(isEditingAtom) // always false after a re-render

  return <EditButton active={isEditing} onClick={() => setIsEditing(true)} />
}
```

**Correct (module-level declaration in the page store):**

```tsx
// pages/detail/stores/form.atoms.ts
export const overviewEditingAtom = atom<boolean>(false)

// OverviewBlock.tsx
export const OverviewBlock = () => {
  const [isEditing, setIsEditing] = useAtom(overviewEditingAtom)
  return <EditButton active={isEditing} onClick={() => setIsEditing(true)} />
}
```

Only exception: one atom per repeated item (each card of a list) — create it once per instance with `useMemo(() => atom<boolean>(false), [])`, e.g. in an `AttachmentCard` rendered once per attachment.

### ESLint Enforcement

Enable `local/atom-contract` at error level. Resolve Jotai constructor imports, namespace access and immutable aliases; report constructors lexically inside components or hooks unless the nearest function is a `useMemo` callback with an empty dependency array. A memo returning a factory does not stabilize atoms created later by that factory. Preserve pure module-level atom factories and unrelated or shadowed names. This bounded check does not follow custom factory calls into render; review their call sites and the business justification for per-instance atoms manually.
