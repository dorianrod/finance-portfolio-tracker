---
title: Never Cast Yup Output to the Entity
impact: HIGH
impactDescription: schema drift becomes a compile error instead of a runtime bug
tags: yup, typescript, casts, entities
---

## Never Cast Yup Output to the Entity

**Impact: HIGH (schema drift becomes a compile error instead of a runtime bug)**

Yup infers the output type from the schema, so the result of `validateSync` is already typed. Writing `RESPONSE_SCHEMA.validateSync(data) as ProjectListPage` silences TypeScript: a missing or mistyped field in the schema still compiles and surfaces as `undefined` in the UI. Tie the schema to the entity instead, and let the compiler compare them. Do not `as`-cast the output of schema validation; only `as const` is fine.

**Incorrect (cast hides a schema that no longer matches the entity):**

```tsx
const RESPONSE_SCHEMA = yup.object({
  items: yup.array().of(LIST_ITEM_SCHEMA.required()).default([]).required(),
  // metadata forgotten
})

queryFn: async () => RESPONSE_SCHEMA.validateSync(await fetchProjects()) as ProjectListPage, // compiles anyway
```

**Correct (schema typed against the entity, no cast):**

```tsx
const RESPONSE_SCHEMA: yup.ObjectSchema<ProjectDetail> = yup.object({
  uuid: yup.string().required(),
  title: yup.string().ensure(),
  startDate: yup.date().nullable().default(null),
  // ...a missing or wrongly typed field is a TS error here
})

export function useGetProjectDetailQuery(uuid: string) {
  return useSuspenseQuery({
    queryKey: ['projects', uuid],
    queryFn: async (): Promise<ProjectDetail> => {
      const { data } = await axios.get<unknown>(ENDPOINTS.projects.detail(uuid))
      return RESPONSE_SCHEMA.validateSync(data)
    },
  })
}
```

When the schema cannot be annotated (a generic schema builder, a schema reused for several entities), check the output where it is produced, without `as`:

- assign through an annotation, `const page: ProjectListPage = RESPONSE_SCHEMA.validateSync(data)`, or use `satisfies ProjectListPage` on an object literal;
- or type the `queryFn` return (`Promise<ProjectListPage>`), so the validated value must be assignable to it.
