---
title: Decompose Hook-Heavy Components by Responsibility
impact: HIGH
impactDescription: hook count reveals components coordinating too many concerns
tags: arch, components, hooks, responsibilities, refactoring
---

## Decompose Hook-Heavy Components by Responsibility

**Impact: HIGH (hook count reveals components coordinating too many concerns)**

A component with many direct hook calls is a refactoring signal. Group related subscriptions, actions and derived values behind an intent-named custom hook when they form one responsibility; extract a child component when the concern also owns an independent rendered region. Keep pure calculations outside hooks.

Do not game a hook-count warning with a generic umbrella hook that merely returns every value. The extraction must create a cohesive boundary with a small interface, such as search state, selection actions or virtual-list measurement.

**Incorrect (the component coordinates unrelated concerns directly):**

```tsx
function OrdersWorkspace() {
  const { data: orders } = useOrdersQuery()
  const filters = useAtomValue(orderFiltersAtom)
  const selection = useAtomValue(orderSelectionAtom)
  const setSelection = useSetAtom(orderSelectionAtom)
  const formatMoney = useFormatMoney()
  const [panelOpen, setPanelOpen] = useState(false)
  const rows = useMemo(() => buildOrderRows(orders, filters), [orders, filters])
  // filtering, selection, panel actions and rendering continue here
}
```

**Correct (each extracted boundary owns one responsibility):**

```tsx
function OrdersWorkspace() {
  const { rows, selection, selectOrder } = useOrdersTable()
  const panel = useOrderDetailsPanel()

  return (
    <OrdersTable
      rows={rows}
      selection={selection}
      onSelect={selectOrder}
      onOpenDetails={panel.open}
    />
  )
}
```

The lint threshold is diagnostic, not a target for every component. When a component legitimately wires several facets of one cohesive primitive, document the narrow exception instead of inventing an artificial abstraction.

See also: `arch-thin-components`, `arch-helpers-vs-services`, `quality-usecallback-for-functions`
