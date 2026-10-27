---
title: Update Client State From Its Previous Value
impact: MEDIUM
impactDescription: avoids stale closures and lost updates
tags: state, jotai, useState, closures, vercel
---

## Update Client State From Its Previous Value

**Impact: MEDIUM (avoids stale closures and lost updates)**

When the next value depends on the previous one, use the setter's functional update form. This applies to React local state and writable Jotai atoms accepting an updater. A write-only action should not subscribe to an atom merely to calculate its next value.

**Incorrect (the action captures a stale selection):**

```typescript
const selectedIds = useAtomValue(selectedOrderIdsAtom)
const setSelectedIds = useSetAtom(selectedOrderIdsAtom)
const selectOrder = useCallback((id: string) => {
  setSelectedIds(new Set([...selectedIds, id]))
}, [])
```

**Correct (the setter receives the current selection):**

```typescript
const setSelectedIds = useSetAtom(selectedOrderIdsAtom)
const selectOrder = useCallback((id: string) => {
  setSelectedIds(current => new Set([...current, id]))
}, [setSelectedIds])
```

### Scope

- Direct assignment remains appropriate when the next value comes entirely from an argument or a constant. Keep every other reactive dependency in the callback's dependency array.
- Updaters are pure: copy collections before changing them and keep requests, navigation and notifications outside the updater (`helpers-vercel-immutable-collections`).
- For expensive, genuinely local initial state, pass a pure initializer such as `useState(() => createInitialLayout())`. An initializer does not synchronize later prop changes; derive values when they should follow current inputs (`state-derived-atoms`).
- Shared client state remains in scoped atoms. This rule does not justify moving it into a new local-state facade (`arch-no-prop-drilling`).

### ESLint Enforcement

Keep `react-hooks/exhaustive-deps` enabled. Use functional updates to remove unnecessary state reads while retaining actual dependencies; do not suppress the diagnostic to preserve a stale closure.

### Sources

Adapted from Vercel's [functional updates](https://github.com/vercel-labs/agent-skills/blob/main/skills/react-best-practices/rules/rerender-functional-setstate.md) and [lazy initialization](https://github.com/vercel-labs/agent-skills/blob/main/skills/react-best-practices/rules/rerender-lazy-state-init.md), with Jotai ownership preserved.
