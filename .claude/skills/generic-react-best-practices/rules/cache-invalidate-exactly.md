---
title: Invalidate Exactly What the Mutation Affects
impact: HIGH
impactDescription: no stale screens, no wasted refetches
tags: cache, invalidation, mutations, react-query
---

## Invalidate Exactly What the Mutation Affects

**Impact: HIGH (no stale screens, no wasted refetches)**

The `queryClient.invalidateQueries` calls of a mutation are a business decision: invalidate the keys whose backend data actually changes, no more (a blanket `['contracts']` refetches every list, detail and thread in cache) and no less (a missing key leaves a screen stale). Write the rationale in a comment when it is not obvious from the hook name, especially for backend side effects (cascades, recomputed statuses, counts).

**Incorrect (blanket invalidation picked from the hook name):**

```ts
export function useUpdateReminder() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ reminderId, ...body }: UpdateReminderInput) =>
      http.put(ENDPOINTS.contracts.modifyReminder(reminderId), body),
    // also refetches the list, every other detail, comments…
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['contracts'] }),
  })
}
```

**Correct (scoped key, rationale next to it):**

```ts
export function useAddContractReminder(contractId: string) {
  const queryClient = useQueryClient()
  return useMutation<ContractReminder, Error, AddReminderInput>({
    mutationFn: async input => {
      const body = await PAYLOAD_SCHEMA.validate(input, { stripUnknown: true })
      const { data } = await http.post(ENDPOINTS.contracts.reminders(contractId), body)
      return REMINDER_SCHEMA.validate(data, { stripUnknown: true })
    },
    // The backend recomputes the contract's next reminder date: refresh this contract
    // (detail + its reminders by prefix), not the list nor the other contracts.
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['contracts', contractId] }),
  })
}
```

Prefix matching does the rest: `['contracts', contractId]` already covers `['contracts', contractId, 'reminders']` (see `cache-one-key-convention`). Use the domain-wide key only when the mutation really changes the whole domain, e.g. a publish mutation that changes lists, details and counts at once: `['contracts']`. Return the promise from `onSuccess` so the mutation stays pending until the refetch finishes.
