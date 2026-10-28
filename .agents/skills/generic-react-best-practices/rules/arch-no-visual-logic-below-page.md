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

### ESLint Enforcement

Enable `local/no-service-presentation` at error level for reusable domain/feature services. Reject value imports, reexports and literal dynamic imports of translation APIs (`i18next`, `react-i18next`), conventional `i18n` modules and `helpers/formatters` modules. Keep type-only dependencies and component/page-owned presentation services valid.

Apply the same dependency check to domain `helpers/calculators/`, including component- and page-owned calculators. A calculation returns quantitative values and semantic period identifiers; a formatter translates their labels at display time. Component ownership does not turn translation into a calculation. Verify an aliased translation import, a rejected reexport or dynamic import, and a neighboring valid numeric calculation through the application's configuration.

This check identifies explicit display dependencies. It does not infer presentation from arbitrary strings, inspect every transitive helper or decide ownership from a function's name. Presentation hidden behind an opaque adapter and chart geometry still require review. Move the display responsibility to its owning component/page instead of renaming imports to bypass the check.
