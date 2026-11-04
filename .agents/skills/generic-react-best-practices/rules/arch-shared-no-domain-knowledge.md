---
title: Keep Shared Code Within Its Ownership Boundary
impact: CRITICAL
impactDescription: keeps shared code reusable at its scope and prevents downward dependencies
tags: arch, shared, boundaries, ownership, dependencies
---

## Keep Shared Code Within Its Ownership Boundary

**Impact: CRITICAL (keeps shared code reusable at its scope and prevents downward dependencies)**

The meaning of `shared/` is relative to its owner. `src/shared/` has no business-domain knowledge. A scoped folder such as `src/domains/sales/shared/`, `src/domains/sales/orders/shared/` or `features/detail/shared/` may use the stable vocabulary of its enclosing scope, but its reusable contracts and non-UI code never import from or name a descendant sub-domain, feature or nested feature.

Place shared code at the nearest common ancestor of all its consumers. Reusable shared code may depend only on shared code at the same or an ancestor scope; it never depends downward on a descendant. This keeps reuse local, prevents cycles and avoids turning a high-level `shared/` folder into a business catch-all.

**Incorrect (main-domain shared code knows about a descendant entity):**

```tsx
// src/domains/sales/shared/types/invoiceAccess.type.ts
export interface InvoiceAccess {
  invoiceId: string
  recipientEmail: string
}
```

**Correct (entity vocabulary stays in the entity's own shared boundary):**

```tsx
// src/domains/sales/invoices/shared/types/invoiceAccess.type.ts
export interface InvoiceAccess {
  invoiceId: string
  recipientEmail: string
}
```

An entity-level `shared/` may contain entity types and components used by several of its features. The same requirement applies to a parent feature's `shared/`: require production consumers from at least two distinct immediate child capabilities. Several files within one feature count as one consumer. Resolve indirect usage through shared helpers, barrels and type-only contracts; tests, stories, mocks and application wrappers do not count as features.

The parent/leaf folder convention is not a sharing exception. A parent's cohesive business behavior belongs to a named child feature if it serves no other feature. Application pages compose features; shared code does not import descendant entry components or private implementation. A reusable business workflow remains a feature even when several callers use it. If all consumers belong to one branch, move the module to that branch's nearest owner instead of using shared code to evade a sibling-import restriction.

Static import graphs cannot always prove use of common inputs passed through application props. Flag missing evidence for review and inspect the actual consumers; do not add fake imports or broad exemptions. Keep genuine common source requests cached and avoid duplicating them merely to satisfy folder counts. A leaf feature owns role folders directly, without a `shared/` wrapper.

A reference or demo folder using business vocabulary is not shared code: forbid importing it from production code with ESLint.

See also: `arch-domain-first-layout`, `arch-feature-slice-layout`, `arch-transverse-only-imports`

### Shared UI APIs and Indirect Dependencies

Global `shared/ui` primitives render generic UI roles without interpreting business entities, operations or metrics. An import-free primitive still violates ownership when its props name an order status, its variants encode a business operation, or its defaults choose a business currency, label or threshold. Moving the lookup into a theme module or a generic-sounding helper does not remove the business dependency.

Keep adapters in the owning domain: the domain maps an order status to `positive` or `warning` and supplies labels and actions; a shared badge renders that generic tone and nested content. Charts receive generic series and UI palette roles rather than a business category registry. Inspect public names, literal unions, defaults, branches, type-only contracts and transitive dependencies; passing import lint is not proof of domain independence.

UI selection, expansion, dismissal, generic chart geometry and generic numeric formatting remain shared UI concerns. Caller-provided labels may contain business vocabulary when the primitive renders them without interpretation. Domain-scoped shared components may know their own business scope. Tests and isolated stories may use realistic fixtures without introducing business contracts into production primitives.

See also: `ui-no-adhoc-styling`, `ui-centralize-accessibility`, `ui-semantic-colors`

### ESLint Enforcement

Use the custom ESLint rule `local/shared-feature-usage` to report exclusive one-feature ownership and missing production consumers in resolved import graphs. Use a separate `local/review-shared-feature-sharing` warning when consumers outside the owning feature tree prevent proving reuse. An indeterminate graph requests review rather than establishing an invalid owner. Keep layout diagnostics in `local/feature-folder-layout` and forbidden dependencies in `local/import-boundaries`; these ESLint rules should share the same business-scope interpretation without duplicating diagnostics.

When application props distribute common inputs, inspect actual feature consumers. A reviewed line-scoped suppression may address `local/review-shared-feature-sharing` with concrete evidence; it must not disable proven ownership errors. Do not count application wrappers as features, add fake imports or exempt all parent-owned code. Folder moves require a business ownership decision and have no automatic fix.

Import-boundary checks should resolve imports, re-exports, dynamic imports and type imports from global shared code into application or domain modules, and prevent production imports of Storybook modules. They cannot detect business knowledge declared locally or hidden in another shared module. Review names, literal unions, branches, defaults and transitive dependencies even when lint passes.
