---
title: Declare Yup Schemas at Module Level With Explicit Names
impact: LOW-MEDIUM
impactDescription: stable references and readable hooks
tags: yup, schemas, naming, module-level
---

## Declare Yup Schemas at Module Level With Explicit Names

**Impact: LOW-MEDIUM (stable references and readable hooks)**

API schemas do not depend on props or state, so declare them as module-level constants named by role (`REQUEST_SCHEMA`, `PAYLOAD_SCHEMA`, `RESPONSE_SCHEMA`, `LIST_ITEM_SCHEMA`) and use them directly in the hook. A schema built inline or in `useMemo(() => ..., [])` inside the hook adds noise, and an inline schema is a new object on every render, so anything that depends on it (a `useCallback`, an effect, a `queryFn` closure) is recreated each time. Never use an empty `yup.object({})` as a placeholder for a payload that has fields.

**Incorrect (schemas built inside the hook, vague names):**

```tsx
export function useGetOrdersQuery() {
  const schema1 = useMemo(() => yup.object({ search: yup.string().optional() }), [])
  const parse = useCallback((data: unknown) => yup.object({ items: yup.array() }).validateSync(data), [])
  // ...
}
```

**Correct (module-level constants, role-based names):**

```tsx
const REQUEST_SCHEMA = yup.object({
  search: yup.string().optional(),
  statuses: yup.array().of(yup.string().required()).optional(),
})

const RESPONSE_SCHEMA = yup.object({
  items: yup.array().of(LIST_ITEM_SCHEMA.required()).default([]).required(),
  metadata: METADATA_SCHEMA.required(),
})

export function useGetProjectsQuery(params: ProjectListQueryParams) {
  return useQuery({
    queryKey: ['projects', 'list', params],
    queryFn: async () => {
      const { data } = await axios.get<unknown>(ENDPOINTS.projects.list, {
        params: REQUEST_SCHEMA.validateSync(params),
      })
      return RESPONSE_SCHEMA.validateSync(data)
    },
  })
}
```

A schema shared across hooks of a sub-domain gets its own file in `helpers/schemas/`, named after its one public schema export (for example `orderPaymentSchema.ts` exporting `ORDER_PAYMENT_SCHEMA`); supporting sub-schemas stay private. Do not create plural schema grab bags. Form validation schemas that need `t()` are a different case: a `use[Form]Schema` hook with `useMemo(..., [t])` (see `yup-form-schema-hook`).
