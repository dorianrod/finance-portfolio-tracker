---
title: Declare Every React Component as a View or Feature
impact: CRITICAL
impactDescription: makes component ownership and data-flow boundaries explicit
tags: arch, components, boundaries, views, features, eslint
---

## Declare Every React Component as a View or Feature

**Impact: CRITICAL (makes component ownership and data-flow boundaries explicit)**

Classify every production React component module by responsibility:

- `*.view.tsx` renders display-ready data. It may format or clamp values for display, manage accessibility, and keep local visual state such as hover, tooltip or accordion state.
- `*.feature.tsx` owns business orchestration. It reads queries or atoms, invokes actions and pure business helpers, and supplies display-ready props to views.

The suffix is a controlled declaration, not proof that the implementation is correctly classified. During review, verify the imports and responsibilities. Split a file that mixes feature orchestration with reusable presentation components; every component left in a module inherits that module's role. Entrypoints and test modules may remain unsuffixed, while colocated tests should follow the classified source name.

A view may import React, visual libraries, other views, types, formatters, and colocalized purely visual logic. It must not import a feature or runtime dependencies from server-state hooks, client stores, APIs, services, or business helpers. If a deep component needs shared client state, classify it as a feature and let it read the atom directly.

### Choose the boundary by ownership

Create a feature only when the component owns an autonomous business responsibility. At least one of these must be true:

- it reads or updates server or shared client state;
- it invokes an action, mutation or navigation workflow;
- it applies a business rule or calculation for its own subtree;
- it transforms raw domain inputs into a display model for its own subtree;
- it coordinates business states such as availability, permissions, loading or errors;
- it exposes a self-contained use case that several parents can render.

Use a view when its complete behavior can be exercised with display-ready props and interaction callbacks, without installing business providers or mocking queries and stores.

Do not create a feature merely because a component receives raw props, and do not create a matching view for every feature. Split a feature from its view only when the visual part has an independent contract: it is reused with another data source, has meaningful visual variants or interactions, benefits from isolated rendering tests, or contains enough layout to obscure the orchestration. A feature with trivial markup may render that markup directly.

### Audit every feature boundary

An architecture audit is incomplete if it only verifies suffixes and import restrictions. For every `.feature.tsx`, inspect the component responsibilities and reach an explicit boundary decision:

1. Name the business responsibility that justifies the feature.
2. Identify the JSX and local components that only present display-ready data.
3. Decide whether that presentation has an independent visual contract and should move to a `.view.tsx` module.
4. If the feature remains unsplit, verify that its JSX is trivial, tightly coupled to its orchestration, or otherwise has no useful independent contract.

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

- Every production component module declares `.view.tsx` or `.feature.tsx`.
- A view has no runtime import of a feature, query, atom, API, service, store or business helper.
- Type-only imports do not create a runtime boundary violation.
- Every feature audit explicitly decides whether its presentation should be extracted to a view.
- An unsplit feature keeps only presentation that is trivial, tightly coupled or lacks an independent visual contract.
- A feature with a substantial or reusable display-only subtree is split into feature orchestration and a view.
- Every feature owns a named business responsibility; pass-through feature wrappers are removed.
- A separate view exists only when it has an independent visual contract, not by default for every feature.
- Calculations are passed to views, while features receive raw business inputs or read shared state directly.
- Mixed modules are split, and the chosen suffix matches actual responsibilities.

See also: `arch-no-prop-drilling`
