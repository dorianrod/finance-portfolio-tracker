---
title: Declare Every React Component as a View, State Renderer or Feature
impact: CRITICAL
impactDescription: makes component ownership and data-flow boundaries explicit
tags: arch, components, boundaries, views, state-renderers, features, eslint
---

## Declare Every React Component as a View, State Renderer or Feature

**Impact: CRITICAL (makes component ownership and data-flow boundaries explicit)**

Classify every production React component module by responsibility:

- `*.view.tsx` renders display-ready data. It may format or clamp values for display, manage accessibility, and keep local visual state such as hover, tooltip or accordion state.
- `*.state.tsx` receives one resolved discriminated union and exhaustively maps its variants to UI. It may translate semantic state reasons and compose views, state renderers or features, but it does not build the union, call hooks or read business state at runtime.
- `*.feature.tsx` owns business orchestration. It reads queries or atoms, invokes actions and pure business helpers, and supplies display-ready props to views.

The suffix is a controlled declaration, not proof that the implementation is correctly classified. During review, verify the imports and responsibilities. Split a file that mixes feature orchestration with reusable presentation components; every component left in a module inherits that module's role. Entrypoints and test modules may remain unsuffixed, while colocated tests should follow the classified source name.

A view may import React, visual libraries, other views, types, formatters, and colocalized purely visual logic. It must not import a state renderer, feature or runtime dependencies from server-state hooks, client stores, APIs, services, or business helpers. If a deep component needs shared client state, classify it as a feature and let it read the atom directly.

A state renderer is a narrow composition boundary for states such as loading, error, empty, unavailable, degraded and ready. Its owning feature or a pure mapper resolves precedence and constructs the union before rendering. Each union variant carries only the data valid for that state, and the state renderer handles every variant exhaustively with a `never` check. Keep one-off optional sections and simple visual variants in their owning component instead of creating a state renderer.

### Choose the boundary by ownership

Create a feature only when the component owns an autonomous business responsibility. At least one of these must be true:

- it reads or updates server or shared client state;
- it invokes an action, mutation or navigation workflow;
- it applies a business rule or calculation for its own subtree;
- it transforms raw domain inputs into a display model for its own subtree;
- it coordinates business states such as availability, permissions, loading or errors;
- it exposes a self-contained use case that several parents can render.

Use a view when its complete behavior can be exercised with display-ready props and interaction callbacks, without installing business providers or mocking queries and stores.

Use a state renderer when a surface has multiple mutually exclusive UI states and naming the boundary removes boolean combinations or repeated fallback conditions from its parent. A state renderer may accept explicit interaction callbacks such as `onRetry`, but it never discovers those actions through hooks.

Do not create a feature merely because a component receives raw props, and do not create a matching view for every feature. Split a feature from its view only when the visual part has an independent contract: it is reused with another data source, has meaningful visual variants or interactions, benefits from isolated rendering tests, or contains enough layout to obscure the orchestration. A feature with trivial markup may render that markup directly.

### Audit every component boundary

An architecture audit is incomplete if it only verifies suffixes and import restrictions. For every `.feature.tsx`, inspect the component responsibilities and reach an explicit boundary decision:

1. Name the business responsibility that justifies the feature.
2. Identify the JSX and local components that only present display-ready data.
3. Decide whether that presentation has an independent visual contract and should move to a `.view.tsx` module.
4. If the feature remains unsplit, verify that its JSX is trivial, tightly coupled to its orchestration, or otherwise has no useful independent contract.

For every `.state.tsx`, verify that the discriminated union is constructed outside the component, its branches are exhaustive, and it contains no hooks or runtime business imports.

Flag the feature when its business orchestration is mixed with a substantial presentational subtree, reusable visual states, or local display-only components that could be rendered without business dependencies. Recommend a `feature + view` split and keep queries, atoms, actions and business transformations in the feature.

Also flag an unnecessary split when the feature is only a pass-through wrapper or the extracted view merely mirrors all of the feature's props without creating an independent visual contract. The audit must assess the semantic coherence of both the chosen role and the chosen component boundary; naming compliance alone is not sufficient.

**Incorrect (a declared view owns business state and decisions):**

```tsx
// OrderTotal.view.tsx
import { useAtomValue } from 'jotai'
import { activeOrderAtom } from '../stores/order.atoms'
import { calculateOrderTotal } from '../helpers/calculators/orderTotal'

export function OrderTotal() {
  const order = useAtomValue(activeOrderAtom)
  return <strong>{calculateOrderTotal(order)}</strong>
}
```

Renaming the file does not turn this component into a view: it still consumes state and performs a business calculation.

**Correct (the feature owns the decision; the view receives render-ready data):**

```tsx
// OrderTotal.feature.tsx
import { useAtomValue } from 'jotai'
import { activeOrderAtom } from '../stores/order.atoms'
import { calculateOrderTotal } from '../helpers/calculators/orderTotal'
import { OrderTotalView } from './OrderTotal.view'

export function OrderTotal() {
  const order = useAtomValue(activeOrderAtom)
  const total = calculateOrderTotal(order)
  return <OrderTotalView label="Total" formattedTotal={formatMoney(total)} />
}

// OrderTotal.view.tsx
export function OrderTotalView(props: { label: string; formattedTotal: string }) {
  return <p><span>{props.label}</span> <strong>{props.formattedTotal}</strong></p>
}
```

The split above is justified only if `OrderTotalView` has an independent visual contract. Otherwise the feature may render the small result directly.

**Incorrect (the component receives combinations that permit impossible states):**

```tsx
// OrdersState.feature.tsx
export function OrdersState({ loading, error, orders }: Props) {
  if (loading) return <Spinner />
  if (error) return <ErrorMessage error={error} />
  if (orders.length === 0) return <EmptyOrders />
  return <OrdersList orders={orders} />
}
```

**Correct (a mapper resolves one union before an exhaustive state renderer):**

```tsx
// OrdersState.state.tsx
type OrdersViewState =
  | { status: 'loading' }
  | { status: 'error'; error: unknown }
  | { status: 'empty' }
  | { status: 'ready'; orders: Order[] }

export function OrdersState({ state, onRetry }: {
  state: OrdersViewState
  onRetry: () => void
}) {
  switch (state.status) {
    case 'loading': return <Spinner />
    case 'error': return <ErrorMessage error={state.error} onRetry={onRetry} />
    case 'empty': return <EmptyOrders />
    case 'ready': return <OrdersList orders={state.orders} />
  }
  const exhaustiveState: never = state
  return exhaustiveState
}
```

**Incorrect (a feature exists only as a pass-through wrapper):**

```tsx
// OrderCard.feature.tsx
export function OrderCard(props: OrderCardViewProps) {
  return <OrderCardView {...props} />
}
```

This feature owns no query, state, action, decision or transformation. Keep only `OrderCard.view.tsx`.

**Correct (a feature with trivial markup does not need a separate view):**

```tsx
// DeleteOrderButton.feature.tsx
export function DeleteOrderButton({ orderId }: { orderId: string }) {
  const { deleteOrder, isDeleting } = useDeleteOrderAction(orderId)

  return (
    <Button onClick={deleteOrder} disabled={isDeleting}>
      Delete
    </Button>
  )
}
```

Use this review test: if removing the feature would leave no business responsibility to relocate, the feature is artificial. If extracting the view would only mirror every prop once and create no independent visual contract, keep the JSX in the feature.

Composition is valid: a feature may pass a calculated expression to a view. When the receiving component is another feature, prefer raw inputs so that it owns its business calculation. Treat lint findings as conservative signals and keep any justified suppression on the affected line.

### Review checklist

- Every production component module declares `.view.tsx`, `.state.tsx` or `.feature.tsx`.
- A view has no runtime import of a state renderer, feature, query, atom, API, service, store or business helper.
- A state renderer receives a resolved discriminated union, renders it exhaustively and has no hooks or runtime business imports.
- Enable `local/state-component-contract` to reject runtime business imports and hook calls in state renderers. Resolve imported/immutable hook aliases, React namespace calls and React 19 `use`; respect shadowing. Opaque wrappers still require manual review. Verify rejected and valid cases through the actual project configuration.
- Type-only imports do not create a runtime boundary violation.
- Every feature audit explicitly decides whether its presentation should be extracted to a view.
- An unsplit feature keeps only presentation that is trivial, tightly coupled or lacks an independent visual contract.
- A feature with a substantial or reusable display-only subtree is split into feature orchestration and a view.
- Every feature owns a named business responsibility; pass-through feature wrappers are removed.
- A separate view exists only when it has an independent visual contract, not by default for every feature.
- Calculations are passed to views, while features receive raw business inputs or read shared state directly.
- Mixed modules are split, and the chosen suffix matches actual responsibilities.

See also: `arch-no-prop-drilling`
