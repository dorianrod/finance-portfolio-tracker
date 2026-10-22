---
title: Pick useAtomValue, useSetAtom or useAtom by Need
impact: LOW
impactDescription: write-only consumers stop re-rendering on every change
tags: state, jotai, rerender, hooks
---

## Pick useAtomValue, useSetAtom or useAtom by Need

**Impact: LOW (write-only consumers stop re-rendering on every change)**

Subscribe only to what the component or hook uses: `useAtomValue` to read, `useSetAtom` to write, `useAtom` only when both are needed in the same place. A modal controller that only opens or closes a modal must not re-render its caller (often the whole page header) each time the atom changes.

**Incorrect (write-only hook subscribed to the value):**

```ts
export function useReminderModal() {
  const [, setModal] = useAtom(reminderModalAtom) // re-renders the caller on open/close
  const openAdd = useCallback(() => setModal({ mode: 'add' }), [setModal])
  const close = useCallback(() => setModal(null), [setModal])
  return { openAdd, close }
}
```

**Correct (setter for writers, value for readers):**

```ts
// pages/detail/services/actions/useReminderModal.ts — modal controller, writer only
export function useReminderModal() {
  const setModal = useSetAtom(reminderModalAtom)
  const openAdd = useCallback(() => setModal({ mode: 'add' }), [setModal])
  const close = useCallback(() => setModal(null), [setModal])
  return { openAdd, close }
}

// pages/detail/components/modals/ReminderModal.tsx — reader
const state = useAtomValue(reminderModalAtom)
```

Owner hooks that wrap a whole bundle of atoms (filters + search + sort) subscribe to their whole state by design; use them as they are rather than re-implementing them for a narrower subscription. This is a minor optimization: apply it to new hooks, do not churn existing code for it.
