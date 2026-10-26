---
title: Keep Shared UI Agnostic of Business Domains
summary: Keep shared/ui primitives and their dependencies free of business knowledge, and let domain components translate business meaning into generic UI data, actions and variants.
impact: HIGH
tags:
  - architecture
  - design-system
  - boundaries
patterns:
  - A shared/ui component, prop, helper or variant names a business entity, operation, metric or feature.
  - Shared UI interprets domain values, selects business labels or units, or resolves appearance through business-aware shared dependencies.
  - The request asks to audit or keep shared/ui agnostic of business domains.
---

## Keep Shared UI Agnostic of Business Domains

**Rule:** Keep shared/ui primitives and their dependencies free of business knowledge, and let domain components translate business meaning into generic UI data, actions and variants.

`src/shared/ui` is a reusable design system. An import-free component still violates this boundary when it understands an order status, an account category or a business operation. Moving that knowledge into `shared/theme`, a local helper, or a generic-sounding prop does not make it agnostic.

### Applies When

- A primitive or its public API names business concepts, including feature-specific `variant` keys.
- Shared UI branches on domain values, derives business status or thresholds, chooses a currency, or supplies business labels.
- A UI dependency maps domain categories or metrics to presentation, including type-only contracts and indirect imports.
- Shared UI reads a domain API, store or service, or implements a business action rather than invoking an opaque callback supplied by its caller.

### Incorrect

```tsx
// shared/ui/OrderBadge.view.tsx
export function OrderBadge({ status }: { status: "paid" | "overdue" }) {
  return (
    <Badge tone={status === "paid" ? "positive" : "warning"}>{status}</Badge>
  );
}
```

### Correct

```tsx
// domains/sales/orders/shared/components/OrderBadge.view.tsx
import { Badge } from "@/shared/ui/Badge.view";

export function OrderBadge({ status }: { status: "paid" | "overdue" }) {
  return (
    <Badge tone={status === "paid" ? "positive" : "warning"}>{status}</Badge>
  );
}
```

Reuse or extend an agnostic primitive (`Badge`, `TableRow`, `ChartMarker`) and keep the business adapter in its owning domain or feature. A shared badge receives a UI tone and nested content; it never receives an order status to interpret. Likewise, a chart receives generic series data and UI palette roles, not an account-category registry to resolve internally. Keep concrete styling and accessibility implementation inside shared UI; moving business decisions out does not authorize domain CSS or ARIA wiring.

### Enforcement and Audit

The dashboard's `local/import-boundaries` checks resolved imports, re-exports, dynamic imports and type imports from global shared code into `app` or `domains`. It also prevents production consumers from importing Storybook modules. These checks do not detect business knowledge declared locally or hidden in another shared module. Review public names, literal unions, branches, defaults and transitive dependencies as well as import paths; do not treat a passing lint as proof of domain independence.

### Exceptions

- UI state and behavior (`selected`, `expanded`, focus, dismissal), generic table/chart geometry, temporal visualization and generic numeric formatting remain UI concerns when they do not interpret business data.
- Generic semantic roles such as `positive`, `warning`, `muted` and `accent` are valid. The domain decides which role applies; shared UI owns its visual implementation. Tokens named after business operations or metrics are not generic roles.
- Arbitrary labels, values and nested content supplied by callers may contain business vocabulary; shared UI must render them without interpreting it.
- Domain-scoped `shared/components` may know their owning business scope; this rule concerns global `src/shared/ui` and does not require every reusable business component to become a design-system primitive.
- Tests and isolated Storybook examples may use realistic business data. They must not introduce business contracts into production primitives or be imported by production code.

### References

- [Generic React: shared ownership](../../generic-react-best-practices/rules/arch-shared-no-domain-knowledge.md) — ownership at every shared scope; this rule details the global UI API and indirect dependency boundary.
- [Dorian: styling boundary](styling-centralize-in-shared-ui.md) — appearance stays in shared UI.
- [Dorian: accessibility boundary](architecture-centralize-accessibility.md) — accessibility implementation stays in shared UI.
- [Dorian: semantic colors](styling-semantic-colors.md) — generic UI roles rather than business color policies.
