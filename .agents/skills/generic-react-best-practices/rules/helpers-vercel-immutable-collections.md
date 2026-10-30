---
title: Preserve Collection Inputs When Transforming
impact: MEDIUM-HIGH
impactDescription: prevents helpers from mutating props, atoms or cached entities
tags: helpers, arrays, immutability, sorting, vercel
---

## Preserve Collection Inputs When Transforming

**Impact: MEDIUM-HIGH (prevents helpers from mutating props, atoms or cached entities)**

All helper categories treat incoming collections as read-only. Sorting or changing a view of props, Jotai state or query data must produce a separate collection, leaving the original order and values intact.

**Incorrect (the selector reorders its caller's array):**

```typescript
export function sortOrders(orders: Order[]): Order[] {
  return orders.sort(
    (left, right) => left.createdAt.getTime() - right.createdAt.getTime(),
  )
}
```

**Correct (the selector returns a sorted copy):**

```typescript
// helpers/transformers/sortOrders.ts
export function sortOrders(orders: readonly Order[]): Order[] {
  return orders.toSorted(
    (left, right) => left.createdAt.getTime() - right.createdAt.getTime(),
  )
}
```

Use a copied array before `.sort()` when the target runtime lacks `toSorted`. Apply the same policy to reversing, splicing, `Map`/`Set` updates and nested objects. A shallow array copy does not make its elements independent: copy changed records as well.

### Exceptions

- A helper may mutate a fresh accumulator or collection it created itself. Do not deep-clone every input merely to claim purity.
- Use functional setters for state changes and TanStack Query cache APIs for server-state changes; mutating a shared reference bypasses those ownership boundaries (`state-vercel-functional-updates`).

### Sources

Adapted from Vercel's [immutable sorting](https://github.com/vercel-labs/agent-skills/blob/main/skills/react-best-practices/rules/js-tosorted-immutable.md), applied at the helper and state boundaries.
