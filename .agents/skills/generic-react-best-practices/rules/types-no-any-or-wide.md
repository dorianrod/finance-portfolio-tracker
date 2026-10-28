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


### Typed safety checks

`no-explicit-any` only prevents writing the keyword. Enable typed `@typescript-eslint/no-unsafe-assignment`, `no-unsafe-argument`, `no-unsafe-call`, `no-unsafe-member-access` and `no-unsafe-return` to catch `any` propagated by dependencies, generic defaults and parsing. Keep raw transform inputs `unknown`; preserve generic schema outputs and give untyped collections explicit element types. Narrow third-party callback contracts at the shared adapter boundary rather than asserting each consumer's input.

Use typed `await-thenable`, `no-floating-promises`, `no-misused-promises`, `prefer-promise-reject-errors`, `only-throw-error`, `no-base-to-string`, `restrict-plus-operands`, `restrict-template-expressions`, `no-misused-spread` and `unbound-method` for their respective runtime hazards. Use `switch-exhaustiveness-check` for closed unions, `no-unnecessary-type-assertion`, `no-duplicate-type-constituents` and `no-redundant-type-constituents` for misleading type declarations, and `consistent-type-imports` to expose erased dependencies. Apply these to tests and tooling too where the same hazards occur. An intentionally asynchronous mock is not a reason to enable `require-await` blindly.

Use `strict` in both browser and tooling TypeScript projects, plus `noImplicitReturns`, `noImplicitOverride` and `noPropertyAccessFromIndexSignature`. Evaluate `noUncheckedIndexedAccess` and `exactOptionalPropertyTypes` against the real project before migration: index access may be absent, and an omitted property differs from an explicit `undefined`. Correct the contracts and callers before enabling them; avoid assertions or blanket `| undefined` additions merely to silence diagnostics. These checks complement architecture rules; TypeScript does not infer business ownership.
