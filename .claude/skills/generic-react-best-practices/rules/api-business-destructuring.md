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
