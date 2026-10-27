---
title: No any or Overly Wide Types in Domain Code
impact: LOW-MEDIUM
impactDescription: keeps type errors visible instead of silencing them
tags: types, any, unknown, record, narrowing
---

## No any or Overly Wide Types in Domain Code

**Impact: LOW-MEDIUM (keeps type errors visible instead of silencing them)**

Do not write `any`, `any[]`, `Record<string, any>` or `object` in domain types, hooks or helpers: a lint rule that only warns on `no-explicit-any` is not enough, so reviews must enforce it. Raw API data is `unknown` and becomes a domain type through a Yup schema; other untyped values (a caught error, a storage read) are narrowed with type guards or `instanceof`. `Record<string, unknown>` is fine as a generic constraint.

**Incorrect (wide types switch off checking downstream):**

```typescript
export type ContractDocument = {
  uuid: string
  metadata: Record<string, any>
  file: object
}

const parseItems = (data: any) => data.items
```

**Correct (dedicated types, `unknown` narrowed by a schema):**

```typescript
export type ContractDocument = {
  uuid: string
  name: string
  productUuids: string[]
  url: string
}

const RESPONSE_SCHEMA: yup.ObjectSchema<ContractDocumentList> = yup.object({
  items: yup.array().of(DOCUMENT_SCHEMA.required()).default([]).required(),
})

export function useGetContractDocumentsQuery(contractUuid: string) {
  return useSuspenseQuery({
    queryKey: ['contracts', contractUuid, 'documents'],
    queryFn: async () => {
      const { data } = await axios.get<unknown>(ENDPOINTS.contracts.documents(contractUuid))
      return RESPONSE_SCHEMA.validateSync(data) // unknown → ContractDocumentList
    },
  })
}

export const convertToFormData = <T extends Record<string, unknown>>(data: T): FormData => {
  /* ... */
}
```

Test files may relax `no-explicit-any`, but prefer real domain types and mocks there too.
