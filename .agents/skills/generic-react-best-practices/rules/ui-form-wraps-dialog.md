---
title: Wrap the Whole Dialog in a Form Keyed on the Open Target
impact: HIGH
impactDescription: submit button inside the form, fresh values on each open
tags: ui, dialog, form, key, submit
---

## Wrap the Whole Dialog in a Form Keyed on the Open Target

**Impact: HIGH (submit button inside the form, fresh values on each open)**

A dialog's submit button lives in its footer, a sibling of the body. If the form (element or provider) only wraps the body, the footer button is outside it and cannot submit. Wrap the **whole** dialog (body and footer actions) in the form and **key** it on the open target: the form stays mounted while the dialog is closed, and the key resets `initialValues` on every open. Radix portals the dialog content out of the form's DOM subtree, so a native `type="submit"` button does not reach a wrapping `<form>`: submit through the form's `submit()` function, or give the button a `form="…"` attribute.

**Incorrect (form inside the body, footer button outside it):**

```tsx
<ConfirmDialog open={Boolean(target)} onOpenChange={open => !open && close()}>
  <ReminderFormProvider initialValues={initialValues} onSubmit={handleSubmit}>
    <ReminderFields />
  </ReminderFormProvider>
  <ConfirmDialog.Footer>
    <SubmitButton /> {/* useReminderForm() has no provider here */}
  </ConfirmDialog.Footer>
</ConfirmDialog>
```

**Correct (keyed form around the dialog, submit through the form context):**

```tsx
<ReminderFormProvider
  key={target?.id ?? 'closed'} // one key per open target
  initialValues={toInitialValues(target)}
  onSubmit={handleSubmit}
>
  <ConfirmDialog open={Boolean(target)} onOpenChange={open => !open && close()}>
    <ReminderFields />
    <ConfirmDialog.Footer>
      <button type="button" onClick={close}>{t('common.cancel')}</button>
      <SubmitButton />
    </ConfirmDialog.Footer>
  </ConfirmDialog>
</ReminderFormProvider>

function SubmitButton() {
  const { submit, isSubmitting } = useReminderForm()
  return (
    <button type="button" disabled={isSubmitting} onClick={submit}>
      {t('common.confirm')}
    </button>
  )
}
```

Do not let a generic "confirm" action close the dialog by itself: it would close even when validation fails. Close it from the submit handler on success.
