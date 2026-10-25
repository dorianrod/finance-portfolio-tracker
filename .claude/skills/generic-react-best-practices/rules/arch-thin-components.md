---
title: Keep Components Thin
impact: HIGH
impactDescription: logic becomes reusable and testable without rendering
tags: arch, components, hooks, business-logic, god-component
---

## Keep Components Thin

**Impact: HIGH (logic becomes reusable and testable without rendering)**

A component reads hooks and renders. Each kind of logic has a fixed home outside the JSX file:

| Logic | Home |
| --- | --- |
| User action (mutation + notification + redirect) | `pages/[page]/services/actions/use[Verb][Entity]Action.ts` |
| Modal open/close state | `pages/[page]/services/actions/use[Name]Modal.ts` + atom in `pages/[page]/stores/` |
| Reaction to a state change | a dedicated hook named after the reaction (`use[Action]On[Trigger]`) |
| Business predicate (`isX`, `canX`) | `helpers/businessRules/` (see `helpers-business-rules-pure`) |
| Compound numeric derivation or metric | `helpers/calculators/` |
| Positioning, dimensions, chart geometry or other display-specific derivation | component- or page-scoped `helpers/presenters/` |
| Side effect reused by several pages | domain `services/` |

`useState` stays acceptable for pure UI state (hover, open accordion).

Extract the whole calculation into an intent-named helper, including its dependent intermediate values. This applies before `return`, inside JSX and inside local callbacks; putting the same arithmetic in `useMemo` does not isolate it. Pass viewport dimensions and other browser measurements as inputs to pure presenters. Small self-contained expressions and simple render conditions can remain local.

A high number of direct hooks indicates that the component may be coordinating several responsibilities; split it according to `arch-decompose-hook-heavy-components`. Effects that remain after removing derived state and event-driven logic belong in an intent-named hook as described by `arch-isolate-effects-in-hooks`.

**Incorrect (the action is orchestrated inside the component):**

```tsx
export const DetailHeader: FC<DetailHeaderProps> = ({ contractId }) => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const notify = useNotify()
  const { mutateAsync: deleteContract } = useDeleteContractMutation(contractId)

  const handleDelete = async () => {
    try {
      await deleteContract()
      notify.success(t('contract.messages.deleteSuccess'))
      navigate('/contracts')
    } catch {
      notify.error(t('contract.messages.deleteError'))
    }
  }
  // ...render with handleDelete
}
```

**Correct (the component only wires page hooks):**

```tsx
import { useDeleteContractAction } from '@/domains/contracts/features/detail/pages/detail/services/actions/useDeleteContractAction'

export const DetailHeader: FC<DetailHeaderProps> = ({ contractId }) => {
  const [deleteContract, isDeleting] = useDeleteContractAction(contractId)
  return <Button onClick={deleteContract} loading={isDeleting}>{t('common.delete')}</Button>
}
```

See also: `arch-decompose-hook-heavy-components`, `arch-isolate-effects-in-hooks`; `vercel-react-best-practices` → `rerender-derived-state-no-effect`, `rerender-move-effect-to-event`
