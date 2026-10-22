---
title: Type API Hooks With the Domain Entity and Let the Return Type Infer
impact: HIGH
impactDescription: typed data everywhere without duplicated annotations
tags: api, typescript, generics, entities
---

## Type API Hooks With the Domain Entity and Let the Return Type Infer

**Impact: HIGH (typed data everywhere without duplicated annotations)**

Make the domain entity (from `types/[entity].type.ts`) the data type of the query or mutation: type the `queryFn` result (or the generic of `useQuery<Entity>` / `useSuspenseQuery<Entity>` / `useMutation<Entity, Error, Input>`). Never leave the hook untyped, never type it with an inline object, and do not annotate the hook's return type: it is inferred from TanStack Query.

**Incorrect (inline shape, manual return annotation):**

```tsx
export function useGetProjectDetailQuery(
  projectId: string,
): UseSuspenseQueryResult<{ id: string; title: string }> {
  return useSuspenseQuery<{ id: string; title: string }>({
    queryKey: ['projects', projectId],
    queryFn: async () => (await http.get(ENDPOINTS.projects.detail(projectId))).data,
  })
}
```

**Correct (domain entity, inferred return):**

```tsx
import type { ProjectDetail } from '@/domains/projects/types/projectDetail.type'

export function useGetProjectDetailQuery(projectId: string) {
  return useSuspenseQuery<ProjectDetail>({
    queryKey: ['projects', projectId],
    queryFn: async () => {
      const { data } = await http.get(ENDPOINTS.projects.detail(projectId))
      return PROJECT_DETAIL_SCHEMA.validate(data, { stripUnknown: true })
    },
  })
}
```

Search the domain `types/` folder and `src/shared/` before creating a new type. Raw API shapes, if needed at all, stay private to the hook file (see `types-entity-vs-response` and `types-consume-entity`).
