---
title: Index Collections for Repeated Lookups
impact: MEDIUM
impactDescription: avoids repeated linear scans in data transformations
tags: helpers, map, set, collections, algorithms, vercel
---

## Index Collections for Repeated Lookups

**Impact: MEDIUM (avoids repeated linear scans in data transformations)**

When a transformation repeatedly checks membership or resolves records by the same key, build a `Set` or `Map` once for that input snapshot. Keep the transformation in the owning selector, mapper or aggregator rather than adding a data pipeline to JSX.

**Incorrect (each order scans the complete allowed-id list):**

```typescript
export function selectAllowedOrders(orders: readonly Order[], allowedIds: readonly string[]) {
  return orders.filter(order => allowedIds.includes(order.id))
}
```

**Correct (membership uses one index):**

```typescript
// helpers/selectors/selectAllowedOrders.ts
export function selectAllowedOrders(orders: readonly Order[], allowedIds: readonly string[]) {
  const allowed = new Set(allowedIds)
  return orders.filter(order => allowed.has(order.id))
}
```

### Preserve Semantics

- For record lookup, use a `Map` only with a unique key or an explicit duplicate policy. Replacing `.find()` with a map that keeps the last duplicate changes behavior.
- Keep order and duplicates when the output requires them. An existence check can stop at its first match; validation that promises every error must still collect every error.
- Find extrema in one pass when a sorted collection is unnecessary. Combine large repeated traversals only when it improves the measured path without obscuring separate responsibilities.
- Building an index for one lookup in a tiny array may add cost. Profile uncertain cases and prefer the clearest suitable algorithm. Rebuild or memoize by actual inputs; avoid an unbounded module cache of mutable business data.

### Sources

Adapted from Vercel's [index maps](https://github.com/vercel-labs/agent-skills/blob/main/skills/react-best-practices/rules/js-index-maps.md), [membership indexes](https://github.com/vercel-labs/agent-skills/blob/main/skills/react-best-practices/rules/js-set-map-lookups.md) and [single-pass extrema](https://github.com/vercel-labs/agent-skills/blob/main/skills/react-best-practices/rules/js-min-max-loop.md).
