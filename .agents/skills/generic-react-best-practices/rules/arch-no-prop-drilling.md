---
title: Share Client State Through Jotai, Not Prop Chains or Context
impact: CRITICAL
impactDescription: prevents prop drilling and oversized UI hooks
tags: arch, prop-drilling, jotai, hooks, state, single-responsibility
---

## Share Client State Through Jotai, Not Prop Chains or Context

**Impact: CRITICAL (prevents prop drilling and oversized UI hooks)**

State consumed below its owner must not be threaded through intermediate component props or moved into an application React Context. Put shared client state in page- or domain-scoped Jotai atoms. A component that needs a value reads the atom directly; a component that needs to change it calls a focused hook that owns the write operations.

Apply this rule together with `arch-component-roles`. A view may receive calculations and display-ready objects because rendering them is its declared responsibility. A feature should receive raw business inputs or read shared state itself; warn when a parent derives a value from its own props and passes that result to another feature. The warning is a review signal: move the calculation to the receiving feature when it owns the decision, classify a truly presentational child as a view, or suppress only the verified exception on the affected line with a reason.

Keep each stateful hook aligned with one concern. For example, split filters, sorting, selection and modal behavior into `useOrdersPageFilters`, `useOrdersPageSort`, `useOrdersPageSelection` and `useOrdersPageModal`. A `useOrdersPageUi` hook may compose these hooks as a thin facade for a caller that genuinely needs all of them, but it must not become the owner of several unrelated `useState` values or a mandatory gateway for deep consumers.

**Incorrect (one hook owns unrelated state, then drills values and actions):**

```tsx
function useOrdersPageUi() {
  const [filters, setFilters] = useState<OrdersPageFilters>(DEFAULT_ORDERS_PAGE_FILTERS)
  const [sort, setSort] = useState<OrdersPageSort>(DEFAULT_ORDERS_PAGE_SORT)
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  return { filters, setFilters, sort, setSort, selectedIds, setSelectedIds }
}

function OrdersPage() {
  const ordersPageUi = useOrdersPageUi()
  return <OrdersPageBody filters={ordersPageUi.filters} setFilters={ordersPageUi.setFilters} />
}

function OrdersPageBody(props: OrdersPageBodyProps) {
  return <OrdersPageToolbar filters={props.filters} setFilters={props.setFilters} />
}
```

Creating an `OrdersPageContext` and consuming it with `useContext` or `use(context)` is not an accepted fix: it hides the same broad dependency behind a provider and keeps unrelated responsibilities coupled.

**Correct (atoms own values; focused hooks own actions; consumers subscribe where needed):**

```tsx
// pages/orders/stores/ordersPageFilters.atoms.ts
export const ordersPageFiltersAtom = atom<OrdersPageFilters>(DEFAULT_ORDERS_PAGE_FILTERS)

// pages/orders/stores/ordersPageSort.atoms.ts
export const ordersPageSortAtom = atom<OrdersPageSort>(DEFAULT_ORDERS_PAGE_SORT)

// pages/orders/services/useOrdersPageFilters.ts
export function useOrdersPageFilters() {
  const setFilters = useSetAtom(ordersPageFiltersAtom)

  const setStatus = useCallback(
    (status: OrderStatus | null) => setFilters(current => ({ ...current, status })),
    [setFilters],
  )
  const resetFilters = useCallback(() => setFilters(DEFAULT_ORDERS_PAGE_FILTERS), [setFilters])

  return useMemo(() => ({ setStatus, resetFilters }), [setStatus, resetFilters])
}

// pages/orders/components/OrdersPageToolbar.tsx
function OrdersPageToolbar() {
  const filters = useAtomValue(ordersPageFiltersAtom)
  const { setStatus, resetFilters } = useOrdersPageFilters()

  return <Filters value={filters} onStatusChange={setStatus} onReset={resetFilters} />
}

// A different deep consumer reads only what it needs, without intermediary props.
function OrdersPageResults() {
  const sort = useAtomValue(ordersPageSortAtom)
  return <OrderList sort={sort} />
}
```

### How to detect the problem

Combine manual data-flow analysis with the project's lint output. Run the linter for the reviewed scope and inspect every warning emitted by a configured prop-drilling rule; the review is incomplete if either the code analysis or the associated warnings are skipped. Treat each warning as a lead rather than automatic proof: fix genuine forwarding chains, preserve legitimate direct parent-child APIs, and use a narrowly scoped suppression with a reason only for a verified false positive.

- A custom hook declares `useState` and returns that state. This means another consumer needs the value: move shared client state to an atom, unless the hook and its state are an intentionally self-contained reusable primitive.
- A UI hook owns several independent concerns such as filters, sorting, search, selection and modals. Split it into concern-specific atoms and hooks; retain an aggregate hook only as a thin optional facade.
- A prop is forwarded unchanged through one or more components that do not use it.
- A feature calculates, formats, combines or constructs a value from its props only to pass it to another feature. This includes calls, operations, conditions, templates, objects and arrays, even through aliases or destructuring. Passing the same expression to a view is expected.
- A component accepts both a state value and its setter only to pass them farther down the tree.
- A new `createContext`, `useContext` or `use(context)` exists primarily to avoid passing client UI state through props.

### Summary

- Keep truly local, unreturned UI state in `useState`, such as hover or one component's accordion state.
- Keep server state in TanStack Query, never in Jotai.
- Put shared client state in scoped atoms and read it directly with `useAtomValue`.
- Expose writes through small responsibility-specific hooks using `useSetAtom`; use `useAtom` only when one consumer genuinely reads and writes.
- Keep explicit props for a direct parent-child API. The smell is an intermediary that forwards props it does not use.
- Pass display-ready values to views. Pass raw inputs to features unless orchestration ownership makes a narrowly documented exception necessary.
- Do not create application React Contexts for state sharing, including inside project-owned compound UI components. Third-party providers and their consuming hooks required by a library remain outside this rule.

See also: `quality-usecallback-for-functions`
