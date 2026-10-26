---
title: Justify Feature Hierarchy Through Business Scope
summary: Place capabilities of equal business scope at the same level, and nest a capability only when its responsibility belongs to the parent.
impact: HIGH
tags:
  - architecture
  - features
  - hierarchy
patterns:
  - The request chooses between sibling features and sub-features or reviews an inconsistent feature hierarchy.
  - One responsibility has a sub-feature while a comparable responsibility remains implicit in the parent.
  - Separate feature folders are proposed for dimensions, periods or display modes of the same capability.
---

## Justify Feature Hierarchy Through Business Scope

**Rule:** Place capabilities of equal business scope at the same level, and nest a capability only when its responsibility belongs to the parent.

Answer why a child belongs to its parent in business terms. Sharing a screen, dataset or component implementation does not establish that relationship. A parent must describe a meaningful capability rather than serve as a generic container.

### Applies When

- Comparing responsibilities to decide whether they are peers or parent and child.
- A parent contains both an explicit child capability and the implementation of another comparable capability.
- Considering a split by dimension, current versus historical view, or display mode.

### Incorrect

```text
features/parent-capability/
├── services/useParentCapability.ts   # implements two distinct responsibilities
├── components/SecondCapability.tsx   # one remains implicit in the parent
└── features/first-capability/
```

### Correct

```text
features/parent-capability/
├── components/ParentCapability.tsx   # composes the peer capabilities
└── features/
    ├── first-capability/
    └── second-capability/
```

These schematic children represent distinct user outcomes within the parent's business scope. A filter, dimension, period or display mode normally remains a parameter or component within its capability. Split it only when it introduces distinct business rules, workflows or ownership, rather than merely different rendering.

If the proposed parent has no business responsibility beyond grouping its children on a screen, place the capabilities at the owning domain level and let the page compose them. Keep the existing limit of two feature levels below a domain.

### Exceptions

- Peer responsibilities may have different file counts, implementation sizes and internal layouts; symmetry alone does not justify extraction.
- A parent may have its own cohesive behavior alongside a child; extract a sibling only when the remaining behavior represents a distinct capability.
- A technical extraction or a small variant can remain a component, helper or parameter.

### References

- [Business boundaries](architecture-business-capability-boundaries.md) — define the capability map first.
- [Generic React: feature slices](../../generic-react-best-practices/rules/arch-feature-slice-layout.md) — supported layout and dependency direction.
