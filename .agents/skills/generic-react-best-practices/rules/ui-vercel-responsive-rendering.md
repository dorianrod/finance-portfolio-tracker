---
title: Keep Inputs Responsive During Expensive Renders
impact: MEDIUM
impactDescription: separates immediate input feedback from slower result rendering
tags: ui, useDeferredValue, transitions, memo, vercel
---

## Keep Inputs Responsive During Expensive Renders

**Impact: MEDIUM (separates immediate input feedback from slower result rendering)**

Keep controlled input updates immediate. When profiling shows that an expensive results surface delays typing, pass a deferred value to that surface. Its unchanged props must let it skip the urgent render, through React Compiler optimization or an appropriate memoized component boundary.

**Incorrect (the expensive surface follows every input update immediately):**

```tsx
const query = useAtomValue(orderSearchAtom)
const setQuery = useSetAtom(orderSearchAtom)

return (
  <>
    <SearchField value={query} onValueChange={setQuery} />
    <ExpensiveOrderResults query={query} />
  </>
)
```

**Correct (the results surface follows a deferred query):**

```tsx
const query = useAtomValue(orderSearchAtom)
const setQuery = useSetAtom(orderSearchAtom)
const deferredQuery = useDeferredValue(query)

return (
  <>
    <SearchField value={query} onValueChange={setQuery} />
    <ExpensiveOrderResults query={deferredQuery} />
  </>
)
```

`ExpensiveOrderResults` owns the expensive work and provides the memoized boundary. The parent owns scheduling the visible results; the search field supplies its translated label through its normal UI contract. Use stable deferred inputs rather than creating a fresh object on every render.

### Limits

- Use transitions for eligible React-owned nonurgent updates. Keep controlled input state outside the transition. External-store writes do not become nonblocking merely because they are wrapped in `startTransition`.
- Keep TanStack Query request state in its query/mutation result. A transition's `isPending` does not replace network state or cancel requests, and deferral does not debounce them.
- Show stale-result feedback through shared UI when necessary. Deferral cannot interrupt one long synchronous calculation; reduce that work or move it to an appropriate background execution boundary.

### Sources

Adapted from Vercel's [deferred rendering](https://github.com/vercel-labs/agent-skills/blob/main/skills/react-best-practices/rules/rerender-use-deferred-value.md) and [transitions](https://github.com/vercel-labs/agent-skills/blob/main/skills/react-best-practices/rules/rerender-transitions.md). See [useDeferredValue](https://react.dev/reference/react/useDeferredValue) and [useTransition](https://react.dev/reference/react/useTransition) for their scheduling contracts.
