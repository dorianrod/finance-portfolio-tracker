---
title: Prefix Atoms with Their Entity
impact: LOW-MEDIUM
impactDescription: avoids ambiguous imports across lists and pages
tags: state, jotai, naming
---

## Prefix Atoms with Their Entity

**Impact: LOW-MEDIUM (avoids ambiguous imports across lists and pages)**

Name atoms `[entity][Purpose]Atom` so that two lists or modals never export the same `filtersAtom` / `selectedIdsAtom`. The suffix tells the shape:

- bundles of several atoms returned by a factory take a plural `Atoms` suffix (`orderListAtoms`);
- selection atoms are `selected[Entity]IdsAtom`;
- modal atoms are `[feature]ModalAtom`, edit-mode atoms `[block]EditingAtom`.

**Incorrect (generic names that collide between domains):**

```ts
export const filtersAtom = atom<OrderFilters>(DEFAULT_ORDER_FILTERS)
export const selectedIdsAtom = atom<ReadonlySet<string>>(new Set())
export const dataAtoms = createListAtoms<InvoiceFilters>(DEFAULT_INVOICE_FILTERS)
export const modalAtom = atom<ReminderModalState | null>(null)
```

**Correct (entity-prefixed, suffix tells the shape):**

```ts
export const orderListAtoms = createListAtoms<OrderFilters>(DEFAULT_ORDER_FILTERS)
export const selectedOrderIdsAtom = atom<ReadonlySet<string>>(new Set())
export const contactTypeFilterAtom = atom<ContactTypeFilter>(DEFAULT_CONTACT_TYPE_FILTER)
export const reminderModalAtom = atom<ReminderModalState | null>(null)
export const projectOverviewEditingAtom = atom<boolean>(false)
```

Pick one naming scheme per kind of atom and keep it across the app. Raw atoms follow `state-explicit-types-defaults` (explicit type parameter, typed default).
