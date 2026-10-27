---
title: Name API Hooks After the Endpoint Intent
impact: LOW-MEDIUM
impactDescription: predictable, greppable hook and file names
tags: api, naming, conventions
---

## Name API Hooks After the Endpoint Intent

**Impact: LOW-MEDIUM (predictable, greppable hook and file names)**

Queries are `useGet<Entity>[Aspect]Query` (`useGetOrderDetailQuery`, `useGetProjectsQuery`, `useGetContractRemindersQuery`); plural entity for lists. Mutations are `use<Verb><Entity>[Aspect]` with the business verb of the endpoint (`useAddInternalComment`, `useDeleteReminder`, `usePublishProject`, `useValidateOrderPayment`). One hook per file, file named after the hook, in `apis/queries/` or `apis/mutations/`.

**Incorrect (generic or technical names):**

```text
apis/queries/order.ts               → export function useOrder(id)
apis/queries/useFetchProjects.ts    → export function useProjectsList(params)
apis/mutations/useOrderPut.ts       → export function useOrderPut()
apis/mutations/actions.ts           → several mutation hooks in one file
```

**Correct (intent in the name, one hook per file):**

```text
apis/queries/useGetOrderDetailQuery.ts        → useGetOrderDetailQuery(orderId)
apis/queries/useGetProjectsQuery.ts           → useGetProjectsQuery(params)
apis/mutations/useCloseOrder.ts               → useCloseOrder(orderId)
apis/mutations/useUpdateInternalComment.ts    → useUpdateInternalComment(contractId)
```

Hooks that orchestrate several API hooks for a page drop the `Query` suffix (`useGetProjects`), which distinguishes them from the pure domain query. The same "file = export" rule applies to helpers (`useFormatOrderStatus.ts`, not `useFormatStatus.ts`).
