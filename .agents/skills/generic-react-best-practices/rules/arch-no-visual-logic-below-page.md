---
title: Keep Visual Logic at the Component or Page Boundary
impact: HIGH
impactDescription: feature hooks stay reusable across pages and contexts
tags: arch, separation-of-concerns, toast, navigation, page-actions
---

## Keep Visual Logic at the Component or Page Boundary

**Impact: HIGH (feature hooks stay reusable across pages and contexts)**

Toasts, navigation, selection clearing, modal state and form state belong to page-level actions in `pages/[page]/services/actions/`. CSS classes, design-system tones, chart geometry and other display-ready values belong in component- or page-scoped `helpers/presenters/`. Feature-level `apis/`, reusable `services/` and scoped shared transformers fetch, mutate, transform and decide; they return UI-independent data or throw, and let the page decide what the user sees. Reusable formatters may own display text at their nearest shared owner; structured visual contracts remain in component/page presenters.

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
export function useResendDocumentAction(
  contractId: string,
  documentId: string,
) {
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

Presenter helpers return UI configuration without JSX or side effects. They may be pure functions or read-only hooks composing formatters and pure transformers; they never acquire data or read business state. Keep them at the narrowest component or page scope; moving them to a domain helper would couple reusable business logic to a particular UI vocabulary.

See also: `arch-component-module-boundaries`, `helpers-categories`, `api-vercel-parallel-work`

### ESLint Enforcement

Enable `local/feature-folder-layout` at error level to reject production domain
`helpers/presenters/` outside component or page ownership. Resolve the domain,
sub-domain, feature and scoped shared boundary before interpreting role folders:
a business scope named `components`, or a `components/` folder inside another
helper, does not establish UI ownership. Keep application-wide infrastructure
outside this domain-specific path check. Exercise an invalid reusable presenter
and valid component/page neighbors through the consuming configuration.

This checks declared placement, not the meaning of an arbitrary function. Review
CSS, tones and geometry hidden in other helper categories manually; renaming a
presenter to bypass the path check does not make its result UI-agnostic.

Enable `local/no-service-presentation` at error level for reusable domain/feature services. Reject direct and indirect value imports, reexports and literal dynamic imports of translation APIs (`i18next`, `react-i18next`), conventional `i18n` modules and `helpers/formatters` modules. Keep type-only dependencies and component/page-owned presentation services valid.

Apply the same dependency check to all `helpers/transformers/`, including shared, component- and page-owned helpers. Reject formatter/presenter and known UI-library runtime dependencies as well as translation. Transformers return presentation-independent values, grouped records and semantic identifiers; a formatter translates labels at display time. Do not use translated labels as aggregation keys: a source can have the same name as a synthetic group. Keep source identity separate from display labels. Verify aliased imports, reexports, dynamic imports, an indirect dependency and a valid pure calculation through the application configuration.

Resolve project aliases and follow local runtime helper/service dependencies and reexport modules. A service importing a mapper that imports a formatter violates the same contract as a direct formatter import. Report the dependency path, ignore erased type-only edges and terminate on cycles. Preserve validation/API/store boundaries: schema validation diagnostics and API error normalization do not make every caller a display service. These boundaries are checked by their own contracts rather than treating every reachable translation as display formatting.

This is a bounded module dependency check, not a call-graph proof. Value imports and reexports evaluate their modules, including other runtime dependencies in a reexport module. External packages, computed dynamic imports, injected callbacks, arbitrary strings and chart geometry require review. Test the indirect failure and a numeric neighbor through the application configuration. Move the display responsibility to its owning component/page instead of renaming imports to bypass the check.
