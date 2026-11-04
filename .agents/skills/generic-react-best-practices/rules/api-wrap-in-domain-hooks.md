---
title: Wrap Every Endpoint in a Domain API Hook
impact: CRITICAL
impactDescription: single typed, validated entry point per endpoint
tags: api, react-query, hooks, architecture, components
---

## Wrap Every Endpoint in a Domain API Hook

**Impact: CRITICAL (single typed, validated entry point per endpoint)**

Each endpoint gets exactly one hook in `apis/queries/` (reads) or `apis/mutations/` (writes) of its owning feature. That hook owns the query key, the endpoint URL, the Yup validation and the TanStack Query call. Components and page hooks consume it; they never call `axios`, `useQuery` or `useMutation` directly. Inline calls duplicate keys and URLs and skip validation.

**Incorrect (endpoint, key and parsing inlined in a component):**

```tsx
export const RemindersTab: FC<RemindersTabProps> = ({ contractId }) => {
  const { data } = useSuspenseQuery({
    queryKey: ['contract-reminders', contractId],
    queryFn: async () => (await axios.get(`/contracts/${contractId}/reminders`)).data,
  })
  // ...
}
```

**Correct (one feature-owned hook per endpoint, consumed by the component):**

```tsx
// src/domains/contracts/features/detail/apis/queries/useGetContractRemindersQuery.ts
export function useGetContractRemindersQuery(contractId: string) {
  return useSuspenseQuery<ContractReminder[]>({
    queryKey: ['contracts', contractId, 'reminders'],
    queryFn: async () => {
      const { data } = await http.get(ENDPOINTS.contracts.reminders(contractId))
      return REMINDERS_SCHEMA.validate(data, { stripUnknown: true })
    },
  })
}

// src/domains/contracts/features/detail/pages/detail/components/RemindersTab/RemindersTab.tsx
export const RemindersTab: FC<RemindersTabProps> = ({ contractId }) => {
  const { data: reminders } = useGetContractRemindersQuery(contractId)
  const { mutateAsync: deleteReminder } = useDeleteReminder(contractId)
  // ...
}
```

Choose the TanStack hook by access pattern (`api-query-hook-choice`); optimistic writes stay in the mutation hook (`api-optimistic-update`).

Audit: `grep -rnwE "useQuery|useSuspenseQuery|useInfiniteQuery|useMutation|axios" src/domains --include="*.tsx"` must only hit tests, stories and comments.
