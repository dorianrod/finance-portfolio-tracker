---
title: Use Optimistic Updates Only Where Latency Is Visible, With Rollback
impact: MEDIUM
impactDescription: instant feedback with automatic rollback, no stale or lost state
tags: api, mutations, optimistic-update, react-query, cache
---

## Use Optimistic Updates Only Where Latency Is Visible, With Rollback

**Impact: MEDIUM (instant feedback with automatic rollback, no stale or lost state)**

Reserve optimistic updates for interactions where latency is visible (toggle, pin, reorder). Implement the full TanStack Query cycle in the mutation hook: `onMutate` cancels in-flight queries for the key, snapshots the cache and writes the optimistic value; `onError` restores the snapshot; `onSettled` invalidates so the server state wins. Skipping `cancelQueries` lets a late refetch overwrite the optimistic value; skipping the rollback leaves a lie on screen.

**Incorrect (optimistic write without cancel, snapshot or rollback):**

```ts
export function useToggleProjectPinned(projectId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ pinned }: ToggleProjectPinnedInput) =>
      http.patch(ENDPOINTS.projects.pin(projectId), { pinned }),
    onMutate: ({ pinned }) => {
      queryClient.setQueryData(['projects', projectId], (project: Project) => ({ ...project, pinned }))
    },
  })
}
```

**Correct (cancel, snapshot, rollback, settle):**

```ts
export function useToggleProjectPinned(projectId: string) {
  const queryClient = useQueryClient()
  const queryKey = ['projects', projectId] // the exact cached key

  return useMutation<void, Error, ToggleProjectPinnedInput, { previous?: Project }>({
    mutationFn: async ({ pinned }) => {
      await http.patch(ENDPOINTS.projects.pin(projectId), { pinned })
    },
    onMutate: async ({ pinned }) => {
      await queryClient.cancelQueries({ queryKey })
      const previous = queryClient.getQueryData<Project>(queryKey)
      queryClient.setQueryData<Project>(queryKey, project => project && { ...project, pinned })
      return { previous }
    },
    onError: (_error, _input, context) => {
      if (context?.previous) queryClient.setQueryData(queryKey, context.previous)
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey }),
  })
}
```

- `queryKey` must be the exact key used by the read hook, including the params segment (`['projects', params]` for a list).
- Callers use the `useMutation` result as-is; user feedback stays in the calling action.
