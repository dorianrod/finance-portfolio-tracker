---
title: Keep Visual Logic at the Component or Page Boundary
impact: HIGH
impactDescription: feature hooks stay reusable across pages and contexts
tags: arch, separation-of-concerns, toast, navigation, page-actions
---

## Keep Visual Logic at the Component or Page Boundary

**Impact: HIGH (feature hooks stay reusable across pages and contexts)**

Toasts, navigation, selection clearing, modal state and form state belong to page-level actions in `pages/[page]/services/actions/`. CSS classes, design-system tones, chart geometry and other display-ready values belong in component- or page-scoped `helpers/presenters/`. Feature-level `apis/`, `services/` and scoped shared helpers only fetch, mutate, transform and decide; they return UI-agnostic data or throw, and let the page decide what the user sees.

**Incorrect (a feature service shows the toast itself):**

```ts
// src/domains/contracts/features/detail/services/useResendDocument.ts
export function useResendDocument(contractId: string) {
  const { t } = useTranslation()
  const notify = useNotify()
  const { mutateAsync } = useResendDocumentMutation(contractId)

  return useCallback(
    async (documentId: string) => {
      await mutateAsync({ documentId })
      notify.success(t('contract.messages.resendSuccess'))
    },
    [mutateAsync, notify, t],
  )
}
```

**Correct (the service only acts and throws, while page-owned code controls feedback and presentation):**

```ts
// services/useResendDocument.ts: same hook, without notification nor translation

// pages/detail/services/actions/useResendDocumentAction.ts
// `useNotify` is the page-level notification hook of your app (toast library wrapper)
export function useResendDocumentAction(contractId: string, documentId: string) {
  const { t } = useTranslation()
  const notify = useNotify()
  const resendDocument = useResendDocument(contractId)
  const [isResending, setIsResending] = useState(false)

  const run = useCallback(async () => {
    setIsResending(true)
    try {
      await resendDocument(documentId)
      notify.success(t('contract.messages.resendSuccess'))
    } catch {
      notify.error(t('contract.messages.resendError'))
    } finally {
      setIsResending(false)
    }
  }, [resendDocument, documentId, notify, t])

  return [run, isResending] as const
}
```

```typescript
// pages/detail/helpers/presenters/getDocumentStatusTone.ts
export function getDocumentStatusTone(status: DocumentStatus): StatusTone {
  return status === 'failed' ? 'critical' : 'neutral'
}
```

How the page action gives feedback:

- Wrap the mutation call in one `try`/`catch`: success and error messages go through `t()`.
- Clear the selection, close the modal or `navigate(...)` only after the mutation succeeded, inside the same `try`.
- Prefer the backend's readable error message when there is one, falling back to a translated default. Run independent saves of one action with `Promise.all`.

Presenter helpers have no JSX, hooks or side effects. Keep them at the narrowest component or page scope; moving them to a domain helper would couple reusable business logic to a particular UI vocabulary.

See also: `arch-component-module-boundaries`, `helpers-categories`, `api-vercel-parallel-work`
