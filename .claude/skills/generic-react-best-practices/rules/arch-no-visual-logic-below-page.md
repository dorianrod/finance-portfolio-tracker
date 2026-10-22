---
title: Keep Visual Logic Out of apis/, services/ and helpers/
impact: HIGH
impactDescription: domain hooks stay reusable across pages and contexts
tags: arch, separation-of-concerns, toast, navigation, page-actions
---

## Keep Visual Logic Out of apis/, services/ and helpers/

**Impact: HIGH (domain hooks stay reusable across pages and contexts)**

Toasts, navigation, selection clearing, modal state and form state belong to page-level actions in `pages/[page]/services/actions/`. Domain `apis/`, `services/` and `helpers/` only fetch, mutate, transform and decide; they return data or throw, and let the page decide what the user sees. The same mutation can then be reused by a bulk action, a modal and a detail page with different feedback.

**Incorrect (a domain service shows the toast itself):**

```ts
// src/domains/contracts/services/useResendDocument.ts
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

**Correct (the service only acts and throws, the page action owns the feedback):**

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

How the page action gives feedback:

- Wrap the mutation call in one `try`/`catch`: success and error messages go through `t()`.
- Clear the selection, close the modal or `navigate(...)` only after the mutation succeeded, inside the same `try`.
- Prefer the backend's readable error message when there is one, falling back to a translated default. Run independent saves of one action with `Promise.all`.

See also: `vercel-react-best-practices` → `async-parallel`
