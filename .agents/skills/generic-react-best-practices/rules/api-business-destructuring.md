---
title: Destructure Query Data With a Business Name
impact: LOW-MEDIUM
impactDescription: self-documenting call sites with several queries
tags: api, naming, readability
---

## Destructure Query Data With a Business Name

**Impact: LOW-MEDIUM (self-documenting call sites with several queries)**

At every call site, rename `data` to the entity it holds (`const { data: order } = ...`). Components often read two or three queries; a bare `data` (or `result.data.x`) hides which resource is used and collides as soon as a second query is added.

**Incorrect (generic `data`):**

```tsx
export function OrderSidebar({ orderId }: Props) {
  const { data } = useGetOrderDetailQuery(orderId)
  const result = useGetOrderHistoryQuery(orderId)

  return <h2>{data.customerName}</h2>
}
```

**Correct (named after the entity):**

```tsx
export function OrderSidebar({ orderId }: Props) {
  const { data: order } = useGetOrderDetailQuery(orderId)
  const { data: history } = useGetOrderHistoryQuery(orderId)
  // ...
}

const { data: documents } = useGetContractDocumentsQuery(contractId)
// Mutations: rename mutateAsync after the business verb
const { mutateAsync: closeOrder } = useCloseOrder(orderId)
```

Use the singular for one entity (`order`, `contract`) and the plural for collections (`documents`, `reminders`). Other fields (`isPending`, `refetch`) keep their names.

A caller may retain the result object for status, errors, refetching or unchanged
forwarding. Destructure its data separately before consuming it:

```typescript
const orderQuery = useGetOrderDetailQuery(orderId)
const { data: order } = orderQuery
```

### ESLint Enforcement

Enable `local/api-business-destructuring` at error level with TypeScript information
for production consumers. Resolve the TanStack result type through direct hooks,
domain wrappers and aliases; do not classify an arbitrary object by a `data`
property or a `Query` suffix alone. Reject direct `data` and `mutateAsync` reads,
including optional/static computed access, and destructuring without a distinct
identifier alias. Allow named aliases with defaults, other result fields and
unchanged result returns. Do not choose the business name automatically.

Meaningful business vocabulary still requires review. Dynamic property names,
opaque untyped results and unrelated libraries are outside this bounded check.
