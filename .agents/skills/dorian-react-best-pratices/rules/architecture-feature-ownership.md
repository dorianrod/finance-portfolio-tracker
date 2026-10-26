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

### Incorrect

```text
features/parent-capability/
├── services/useParentCapability.ts       # implements both children's logic
└── features/
    ├── first-capability/components/
    └── second-capability/components/
```

### Correct

```text
features/parent-capability/
├── components/ParentCapability.tsx       # composes the child features
├── services/useCommonInputs.ts           # prepares their common inputs
└── features/
    ├── first-capability/
    │   ├── components/
    │   └── services/useFirstCapability.ts
    └── second-capability/
        ├── components/
        └── services/useSecondCapability.ts
```

These schematic names stand for the application's own capabilities. Keep child-specific rules, operations and derived results in the child. Parent orchestration may load common inputs and coordinate shared context. Reuse an existing ancestor-owned data source rather than duplicating requests to make folders look independent.

Place code used by several capabilities in their nearest common ancestor's `shared/<role>/` only when it represents a concept owned by that common scope. Shared code never imports descendants; siblings never import one another. Check actual consumers before moving code into or out of shared folders.

### Exceptions

- Inputs, entities, filters and infrastructure used by other capabilities may remain at their common owning scope.
- Shared UI primitives retain generic appearance and accessibility behavior; transferring feature ownership does not move those concerns into business code.
- A parent may compose child entry components and coordinate their outputs without implementing their specific calculations.

### References

- [Feature hierarchy](architecture-feature-hierarchy.md) — identify the responsibility before extracting it.
- [Generic React: shared ownership](../../generic-react-best-practices/rules/arch-shared-no-domain-knowledge.md) — nearest common owner and dependency direction.
