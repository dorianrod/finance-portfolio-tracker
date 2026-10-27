---
title: Keep Dialog Mounted and Drive It with a Boolean open
impact: HIGH
impactDescription: keeps close transitions and focus handling working
tags: ui, dialog, modal, controlled, radix
---

## Keep Dialog Mounted and Drive It with a Boolean open

**Impact: HIGH (keeps close transitions and focus handling working)**

A Radix dialog is controlled: keep it mounted and pass `open={Boolean(target)}` (`open` / `isOpen` depending on your wrapper). Radix then mounts and unmounts the content itself, plays the exit transition and restores focus to the trigger. Conditionally mounting the dialog with a hardcoded `open` kills the transition and the focus restoration. Guard data-dependent content with `?.` instead of an early return.

**Incorrect (conditional mount + hardcoded open):**

```tsx
const documentToDelete = useAtomValue(documentToDeleteAtom)
if (!documentToDelete) return null

return (
  <ConfirmDialog open onOpenChange={open => !open && cancelDelete()} variant="danger">
    {t('contract.modal.appendix.deleteQuestion', { name: documentToDelete.name })}
  </ConfirmDialog>
)
```

**Correct (always mounted, open derived from the target):**

```tsx
const documentToDelete = useAtomValue(documentToDeleteAtom)

return (
  <ConfirmDialog
    open={Boolean(documentToDelete)}
    onOpenChange={open => !open && cancelDelete()}
    variant="danger"
  >
    {t('contract.modal.appendix.deleteQuestion', { name: documentToDelete?.name ?? '' })}
  </ConfirmDialog>
)
```

While the exit transition plays, the target may already be `null`: keep the last displayed values (or render stable text) so the content does not flash empty during the close animation.
