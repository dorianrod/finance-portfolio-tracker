---
title: Share Client State Through Jotai, Not Prop Chains or Context
impact: CRITICAL
impactDescription: prevents prop drilling and oversized UI hooks
tags: arch, prop-drilling, jotai, hooks, state, single-responsibility
---

## Share Client State Through Jotai, Not Prop Chains or Context

**Impact: CRITICAL (prevents prop drilling and oversized UI hooks)**

State consumed below its owner must not be threaded through intermediate component props or moved into an application React Context. Put shared client state in page- or domain-scoped Jotai atoms. A component that needs a value reads the atom directly; a component that needs to change it calls a focused hook that owns the write operations.

Keep each stateful hook aligned with one concern. For example, split filters, sorting, selection and modal behavior into `useDashboardFilters`, `useDashboardSort`, `useDashboardSelection` and `useDashboardModal`. A `useDashboardUi` hook may compose these hooks as a thin facade for a caller that genuinely needs all of them, but it must not become the owner of several unrelated `useState` values or a mandatory gateway for deep consumers.

**Incorrect (one hook owns unrelated state, then drills values and actions):**

```tsx
function useDashboardUi() {
  const [filters, setFilters] = useState<DashboardFilters>(DEFAULT_DASHBOARD_FILTERS)
  const [sort, setSort] = useState<DashboardSort>(DEFAULT_DASHBOARD_SORT)
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  return { filters, setFilters, sort, setSort, selectedIds, setSelectedIds }
}

function Dashboard() {
  const dashboardUi = useDashboardUi()
  return <DashboardBody filters={dashboardUi.filters} setFilters={dashboardUi.setFilters} />
}

function DashboardBody(props: DashboardBodyProps) {
  return <DashboardToolbar filters={props.filters} setFilters={props.setFilters} />
}
```

Creating a `DashboardContext` and consuming it with `useContext` is not an accepted fix: it hides the same broad dependency behind a provider and keeps unrelated responsibilities coupled.

**Correct (atoms own values; focused hooks own actions; consumers subscribe where needed):**

```tsx
// pages/dashboard/stores/dashboardFilters.atoms.ts
export const dashboardFiltersAtom = atom<DashboardFilters>(DEFAULT_DASHBOARD_FILTERS)

// pages/dashboard/stores/dashboardSort.atoms.ts
export const dashboardSortAtom = atom<DashboardSort>(DEFAULT_DASHBOARD_SORT)

// pages/dashboard/services/useDashboardFilters.ts
export function useDashboardFilters() {
  const setFilters = useSetAtom(dashboardFiltersAtom)

  const setStatus = useCallback(
    (status: OrderStatus | null) => setFilters(current => ({ ...current, status })),
    [setFilters],
  )
  const resetFilters = useCallback(() => setFilters(DEFAULT_DASHBOARD_FILTERS), [setFilters])

  return useMemo(() => ({ setStatus, resetFilters }), [setStatus, resetFilters])
}

// pages/dashboard/components/DashboardToolbar.tsx
function DashboardToolbar() {
  const filters = useAtomValue(dashboardFiltersAtom)
  const { setStatus, resetFilters } = useDashboardFilters()

  return <Filters value={filters} onStatusChange={setStatus} onReset={resetFilters} />
}

// A different deep consumer reads only what it needs, without intermediary props.
function DashboardResults() {
  const sort = useAtomValue(dashboardSortAtom)
  return <OrderList sort={sort} />
}
```

### How to detect the problem

- A custom hook declares `useState` and returns that state. This means another consumer needs the value: move shared client state to an atom, unless the hook and its state are an intentionally self-contained reusable primitive.
- A UI hook owns several independent concerns such as filters, sorting, search, selection and modals. Split it into concern-specific atoms and hooks; retain an aggregate hook only as a thin optional facade.
- A prop is forwarded unchanged through one or more components that do not use it.
- A component accepts both a state value and its setter only to pass them farther down the tree.
- A new `createContext` or `useContext` exists primarily to avoid passing client UI state through props.

### Summary

- Keep truly local, unreturned UI state in `useState`, such as hover or one component's accordion state.
- Keep server state in TanStack Query, never in Jotai.
- Put shared client state in scoped atoms and read it directly with `useAtomValue`.
- Expose writes through small responsibility-specific hooks using `useSetAtom`; use `useAtom` only when one consumer genuinely reads and writes.
- Keep explicit props for a direct parent-child API. The smell is an intermediary that forwards props it does not use.
- Do not create application React Contexts for state sharing. Third-party providers required by a library are outside this rule.

See also: `vercel-react-best-practices` → `rerender-split-combined-hooks`
