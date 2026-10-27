---
title: Define Boundaries Through Business Capabilities
impact: HIGH
tags: architecture, domains, capabilities
---

## Define Boundaries Through Business Capabilities

**Rule:** Define each domain and feature by its business scope and user outcome before choosing its folders.

A valid folder structure can still hide inconsistent responsibilities. Start from what the user needs to understand or accomplish, then identify the owner of its vocabulary, rules and state.

### Applies When

- Creating, reviewing or reorganizing domains and features.
- Distinguishing a business scope from a screen, delivery mechanism or reusable component.

Use these meanings:

| Boundary | Decision criterion |
| --- | --- |
| Domain | A coherent business scope with its own vocabulary and rules. |
| Sub-domain | A distinct business concept with meaningful ownership and evolution within that scope. |
| Feature | A cohesive capability serving an identifiable user outcome. |
| Sub-feature | A distinct responsibility that belongs to a broader capability. |
| Variant | A dimension, period or mode of the same capability. |

For an architecture review, write a short capability map before proposing moves: name each capability, its user outcome, its parent and the reason for that relationship, then identify the owners of its data, business rules and state. Derive those names and relationships from the application's users, vocabulary and workflows. The resulting tree must follow those decisions.

**Incorrect:**
```text
domains/example/features/
└── dashboard/                    # justified only by the screen name
    └── features/capability/
```

**Correct:**
```text
domains/example/features/
└── capability/                   # justified by an identifiable user outcome
```

The names in these trees are schematic; choose meaningful business names for the actual application. Routes and tabs may compose several capabilities; they do not automatically own them. Endpoint count, CRUD, permission differences and independent lifecycles can support a boundary, but are not mandatory conditions.

### Exceptions

- A small domain with one cohesive capability may keep its role folders directly; do not add empty feature wrappers.
- Preserve established business vocabulary when it describes a real responsibility, even if a route uses the same name.
- A reusable visual element without a distinct business outcome remains a component rather than becoming a feature.

### References

- [Feature hierarchy](arch-feature-hierarchy.md) — choose siblings, children and variants.
- [Feature ownership](arch-shared-no-domain-knowledge.md) — move the responsibility with its implementation.
- [domain layout](arch-domain-first-layout.md) — folder and import conventions.
