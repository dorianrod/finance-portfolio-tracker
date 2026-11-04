---
title: Schedule Independent Async Work Concurrently
impact: HIGH
impactDescription: removes avoidable waits while preserving real ordering constraints
tags: api, async, promises, waterfalls, vercel
---

## Schedule Independent Async Work Concurrently

**Impact: HIGH (removes avoidable waits while preserving real ordering constraints)**

In page actions and orchestration services, start independent operations together. Check cheap synchronous preconditions before starting work needed only by a conditional branch. Each dependent operation waits for its own prerequisite rather than an unrelated batch.

**Incorrect (independent saves wait for each other):**

```typescript
// These functions come from the owning domain mutation hooks.
await saveOrder(orderInput)
await saveContact(contactInput)
```

**Correct (independent saves start together):**

```typescript
await Promise.all([
  saveOrder(orderInput),
  saveContact(contactInput),
])
```

For partial dependencies, chain the dependent work immediately:

```typescript
const orderPromise = createOrder(orderInput)
const attachmentPromise = orderPromise.then(order =>
  attachDocument({ orderId: order.id, documentId }),
)
await Promise.all([orderPromise, attachmentPromise, saveContact(contactInput)])
```

### Exceptions

- Keep required ordering, rate limits and transaction constraints explicit. `Promise.all` rejects on a failure but does not cancel other operations or make writes atomic. Preserve feedback and partial-failure behavior.
- Query hooks remain in `apis/`. Use sibling query consumers or `useSuspenseQueries` for independent Suspense reads (`api-query-hook-choice`); never call React hooks inside `Promise.all`.
- Keep intentionally optional work in the branch that needs it. Concurrency does not justify requests that should never start.

### Sources

Adapted from Vercel's [parallel operations](https://github.com/vercel-labs/agent-skills/blob/main/skills/react-best-practices/rules/async-parallel.md), [partial dependencies](https://github.com/vercel-labs/agent-skills/blob/main/skills/react-best-practices/rules/async-dependencies.md) and [deferred awaits](https://github.com/vercel-labs/agent-skills/blob/main/skills/react-best-practices/rules/async-defer-await.md), without adding an orchestration dependency.
