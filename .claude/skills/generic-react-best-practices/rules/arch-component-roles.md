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

Composition is valid: a feature may pass a calculated expression to a view. When the receiving component is another feature, prefer raw inputs so that it owns its business calculation. Treat lint findings as conservative signals and keep any justified suppression on the affected line.

### Review checklist

- Every production component module declares `.view.tsx` or `.feature.tsx`.
- A view has no runtime import of a feature, query, atom, API, service, store or business helper.
- Type-only imports do not create a runtime boundary violation.
- Calculations are passed to views, while features receive raw business inputs or read shared state directly.
- Mixed modules are split, and the chosen suffix matches actual responsibilities.

See also: `arch-no-prop-drilling`
