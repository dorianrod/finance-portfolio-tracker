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
| Side effect reused by several pages | domain `services/` |

`useState` stays acceptable for pure UI state (hover, open accordion).

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
import { useDeleteContractAction } from '@/domains/contracts/pages/detail/services/actions/useDeleteContractAction'

export const DetailHeader: FC<DetailHeaderProps> = ({ contractId }) => {
  const [deleteContract, isDeleting] = useDeleteContractAction(contractId)
  return <Button onClick={deleteContract} loading={isDeleting}>{t('common.delete')}</Button>
}
```

See also: `vercel-react-best-practices` → `rerender-derived-state-no-effect`, `rerender-move-effect-to-event`
