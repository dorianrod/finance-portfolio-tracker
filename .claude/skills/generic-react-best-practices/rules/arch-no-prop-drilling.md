---
title: Share State Through Jotai or Context, Not Prop Chains
impact: MEDIUM
impactDescription: decouples deep components from their ancestors
tags: arch, prop-drilling, jotai, context, state
---

## Share State Through Jotai or Context, Not Prop Chains

**Impact: MEDIUM (decouples deep components from their ancestors)**

When intermediate components only forward a value, move it out of the props. Page-wide dynamic state (modal target, edit mode, filters, selection) goes in a Jotai atom in `pages/[page]/stores/` (or the domain `stores/`), exposed through a page hook. A value bound to one instance of a compound component (the entity rendered by a card) goes in a React Context owned by that component.

**Incorrect (modal state threaded through three levels):**

```tsx
const Detail: FC = () => {
  const [reminderToDelete, setReminderToDelete] = useState<ContractReminder | null>(null)
  return <RemindersTab onRequestDelete={setReminderToDelete} reminderToDelete={reminderToDelete} />
}
// RemindersTab -> ReminderBlock -> ReminderActions all forward onRequestDelete
```

**Correct (page atom + modal controller, consumed where needed):**

```tsx
// pages/detail/stores/reminderModal.atoms.ts
export const reminderToDeleteAtom = atom<ContractReminder | null>(null)

// pages/detail/services/actions/useReminderModal.ts: modal controller
export function useReminderModal() {
  const setReminderToDelete = useSetAtom(reminderToDeleteAtom)
  return useMemo(
    () => ({ openDelete: setReminderToDelete, close: () => setReminderToDelete(null) }),
    [setReminderToDelete],
  )
}

// deep component
const { openDelete } = useReminderModal()
```

Modal controllers (`use[Name]Modal`) are the only page hooks that return an object of handlers; other action hooks return a single callback. Keep filters, selection and edit-mode atoms in `stores/` behind a small factory rather than redefining raw atoms on every page.
