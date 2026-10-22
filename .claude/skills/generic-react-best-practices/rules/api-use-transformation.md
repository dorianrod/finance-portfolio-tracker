---
title: Validate Both Directions With Yup Inside Every API Hook
impact: CRITICAL
impactDescription: no unvalidated API data reaches the domain
tags: api, yup, validation, axios
---

## Validate Both Directions With Yup Inside Every API Hook

**Impact: CRITICAL (no unvalidated API data reaches the domain)**

Every API hook validates both directions with Yup, inside the domain hook: a request schema before sending (query params or body) and a response schema after receiving. Without it, `response.data` is trusted as `T` and nothing checks the shape, so a backend change surfaces as a crash far from the call. Declare schemas as module constants (see `yup-module-level-schemas`) and let `stripUnknown` drop fields the domain does not model.

**Incorrect (trusts the raw response and sends params untransformed):**

```tsx
export function useGetProjectsQuery(params: ProjectListQueryParams) {
  return useInfiniteQuery({
    queryKey: ['projects', params],
    queryFn: async ({ pageParam }) =>
      (await http.post<ProjectListPage>(ENDPOINTS.projects.list, { ...params, page: pageParam })).data,
    initialPageParam: 1,
    getNextPageParam: page => page.metadata.nextPage,
  })
}
```

**Correct (both directions go through Yup):**

```tsx
const REQUEST_SCHEMA = yup.object({
  search: yup.string().optional(),
  publishedOnStart: yup.date().optional(),
})
const RESPONSE_SCHEMA = yup.object({ items: PROJECT_ITEMS_SCHEMA, metadata: METADATA_SCHEMA })

export function useGetProjectsQuery(params: ProjectListQueryParams) {
  return useInfiniteQuery({
    queryKey: ['projects', params],
    queryFn: async ({ pageParam }) => {
      const body = await REQUEST_SCHEMA.validate(params, { stripUnknown: true })
      const { data } = await http.post(ENDPOINTS.projects.list, { ...body, page: pageParam })
      return RESPONSE_SCHEMA.validate(data, { stripUnknown: true })
    },
    initialPageParam: 1,
    getNextPageParam: page => page.metadata.nextPage,
  })
}
```

Mutations follow the same rule inside `mutationFn`. Endpoints with an empty body or empty response skip the placeholder schema (see `api-void-mutation`). Keep response schemas tolerant of harmless backend additions (see `yup-tolerant-response-schema`).
