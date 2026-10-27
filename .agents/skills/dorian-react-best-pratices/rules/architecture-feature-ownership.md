---
title: Move the Complete Responsibility Into Its Feature
summary: Keep each feature's specific UI, business logic, contracts and state inside that feature, leaving composition and common inputs to its parent.
impact: HIGH
tags:
  - architecture
  - features
  - ownership
patterns:
  - An extracted feature's specific calculations, state or types remain in a parent hook or an ancestor shared folder.
  - A parent hook combines the independent business logic of several child capabilities.
  - The request extracts a vertical feature or audits whether a folder move transferred its responsibility.
---

## Move the Complete Responsibility Into Its Feature

**Rule:** Keep each feature's specific UI, business logic, contracts and state inside that feature, leaving composition and common inputs to its parent.

Moving only the visible components leaves the business boundary incomplete. Review every layer used by the capability, including rules, transformations, validation, API orchestration and state hidden in parent hooks or broad service modules.

### Applies When

- Extracting or reviewing a vertical feature.
- A parent hook calculates several child-specific results or owns child-only interaction state.
- A scoped shared folder contains code used by only one capability.
- Code is moved into `shared/` only to make a forbidden import pass, or reuse is claimed from several files in the same feature.

### Incorrect

```text
features/parent-capability/
├── shared/services/useParentCapability.ts # implements both children's logic
└── features/
    ├── first-capability/components/
    └── second-capability/components/
```

### Correct

```text
features/parent-capability/
├── shared/
│   └── services/useCommonInputs.ts       # consumed by both child capabilities
└── features/
    ├── first-capability/
    │   ├── components/
    │   └── services/useFirstCapability.ts
    └── second-capability/
        ├── components/
        └── services/useSecondCapability.ts
```

These schematic names stand for the application's own capabilities. Keep child-specific rules, operations and derived results in the child. Parent orchestration may load common inputs and coordinate shared context. Reuse an existing ancestor-owned data source rather than duplicating requests to make folders look independent.

Place code used by several capabilities in their nearest common ancestor's `shared/<role>/` only when it represents a concept owned by that common scope. A parent with sub-features may contain only `features/` and genuinely shared role folders under `shared/`; the layout is not permission to hide a parent-specific feature in shared code. A leaf feature keeps its role folders directly at its root. Application pages compose sibling feature entry components. Shared code never imports descendants; siblings never import one another.

### Prove Sharing Before Promotion

Require production consumers from at least two distinct child features at the candidate shared scope. Several components, hooks or files in one feature count as one consumer. Follow indirect dependencies, including shared wrappers, re-exports and type-only contracts. Tests, stories, mocks and duplicate application wrappers do not create business consumers. If all users belong to one child branch, move the code down to that branch's actual owner; do not keep it at a broader shared scope.

A reusable business capability remains a feature even when several callers need it. File counts and import graphs are evidence of reuse, not evidence that a workflow has become a shared primitive. Recheck the capability map and compose the capability through its application entry point rather than weakening sibling-import rules or inventing consumers.

If the parent contains a cohesive responsibility with no shared consumers, model it as a named child capability. Keep screen composition and navigation in the application. Do not move feature logic into the application merely to silence shared-use diagnostics.

The dashboard's `local/shared-feature-usage` checks resolved production import graphs at error level. It reports exclusive one-feature ownership and missing production consumers. A separate `local/review-shared-feature-sharing` warning reports sharing that cannot be established because consumers also exist outside the owning feature tree. An indeterminate graph requests review rather than proving an invalid owner. `local/feature-folder-layout` owns layout diagnostics and `local/import-boundaries` owns forbidden dependencies; the usage rules do not duplicate those violations. The rules share the same business-scope parser and cached analysis.

When common inputs are distributed through application props, static imports may not prove all consumers. Inspect the actual feature inputs and record the evidence. A reviewed line-scoped suppression names `local/review-shared-feature-sharing` and retains its concrete rationale. It does not disable the proven ownership errors. Do not count application files as features, add fake imports or apply a blanket exception to all parent-owned code. No automatic folder move can decide whether a business capability is shared.

### Exceptions

- Inputs, entities, filters and infrastructure used by other capabilities may remain at their common owning scope.
- Shared UI primitives retain generic appearance and accessibility behavior; transferring feature ownership does not move those concerns into business code.
- Application composition may coordinate feature entry components and their outputs without implementing feature-specific calculations. It does not establish shared reuse by itself.

### References

- [Feature hierarchy](architecture-feature-hierarchy.md) — identify the responsibility before extracting it.
- [Generic React: shared ownership](../../generic-react-best-practices/rules/arch-shared-no-domain-knowledge.md) — nearest common owner and dependency direction.
