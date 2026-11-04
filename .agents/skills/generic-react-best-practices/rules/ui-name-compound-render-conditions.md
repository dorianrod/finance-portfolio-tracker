---
title: Name Compound Render Conditions by Intent
impact: HIGH
impactDescription: display decisions become readable and reviewable at the JSX boundary
tags: ui, conditional-rendering, predicates, naming, jsx
---

## Name Compound Render Conditions by Intent

**Impact: HIGH (display decisions become readable and reviewable at the JSX boundary)**

Give every compound condition that controls whether a JSX subtree appears an intention-revealing name. Keep a presentation-only decision as a boolean derived during render. Move it to `helpers/transformers/` as a pure `shouldShowX`, `canX`, `hasX` or `isX` predicate when it expresses a business rule or deserves focused tests.

Simple flags and single comparisons do not require extraction. Conditions used only to choose a class, attribute or text value are also outside this rule.

For JSX gating, use a real boolean or an explicit ternary with `null`. A numeric left operand such as `{items.length && <Items />}` can render `0`; prefer `{items.length > 0 ? <Items /> : null}`. Boolean `&&` conditions remain valid and do not require a blanket rewrite.

**Incorrect (the reader must decode the display decision inside JSX):**

```tsx
{
  order.status === 'READY' && order.total != null && (
    <OrderTotal value={order.total} />
  )
}
```

**Correct (the JSX states why the subtree is rendered):**

```tsx
const shouldShowOrderTotal = order.status === 'READY' && order.total != null

return shouldShowOrderTotal ? <OrderTotal value={order.total} /> : null
```

Do not store the boolean in state or wrap a cheap condition in `useMemo`. Prefer a local name unless extracting a pure business predicate creates a meaningful reusable or testable boundary.

See also: `helpers-business-rules-pure`, `quality-usecallback-for-functions`
