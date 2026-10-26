---
title: Organize Every Domain into Vertical Feature Slices
impact: CRITICAL
impactDescription: keeps each business capability cohesive and prevents overlapping technical buckets
tags: arch, feature-slices, folders, boundaries, shared
---

## Organize Every Domain into Vertical Feature Slices

**Impact: CRITICAL (keeps each business capability cohesive and prevents overlapping technical buckets)**

Use `features/` when a domain or entity contains several distinct business capabilities. A small domain that already represents one cohesive capability may own its role folders directly; do not add a feature wrapper merely to satisfy a template. Conversely, once several capabilities coexist, move them into named vertical slices instead of scattering them across domain-level role folders.

Name a feature after a cohesive business capability or user-facing responsibility. Never introduce a generic wrapper such as `dashboard`, `main`, `workspace` or a repetition of the domain name when its only purpose is to contain all the real features. A feature owns only the role folders it needs among `apis/`, `components/`, `constants/`, `helpers/`, `mocks/`, `pages/`, `services/`, `stores` and `types/`; do not group code by implementation technique in catch-all folders such as `charts/`, `cards/`, `modals/`, `common/` or `misc/`.

Before reorganizing slices, identify their user outcomes and business owners. Capabilities of equal business scope belong at the same level; nesting requires a meaningful business parent, not just a shared tab, route or dataset. Dimensions, periods and display modes of the same capability normally remain parameters or components within it. Different file counts do not require matching folder structures.

Allow at most two feature levels below a domain: `features/<feature>/` and, when a genuinely distinct responsibility needs it, `features/<feature>/features/<subfeature>/`. Do not nest a third feature level. Promote an overgrown sub-feature to the domain's first level or introduce a real sub-domain when it has an independent business lifecycle. A sub-feature must express a responsibility, not merely isolate one file or technical category.

**Incorrect (technical buckets and a redundant screen wrapper obscure ownership):**

```text
src/domains/sales/orders/
└── features/
    └── dashboard/                         # generic wrapper with no business responsibility
        └── features/
            └── detail/
                └── features/
                    └── access-management/ # third feature level
```

**Correct (the capability and its nested responsibility own complete vertical slices):**

```text
src/domains/sales/orders/
├── features/
│   └── detail/
│       ├── components/OrderDetail.feature.tsx
│       ├── pages/detail/OrderDetailPage.tsx
│       ├── shared/
│       │   └── types/detailSection.type.ts
│       └── features/
│           └── access-management/
│               ├── apis/queries/useOrderAccessesQuery.ts
│               ├── components/OrderAccessPanel.feature.tsx
│               ├── helpers/mappers/toOrderAccessRows.ts
│               ├── services/useResendOrderAccess.ts
│               └── types/orderAccess.type.ts
└── shared/
    └── types/orderSummary.type.ts
```

A parent feature may compose its sub-features. Sibling features never import each other directly: move code they both need to the nearest common ancestor's `shared/<role>/` folder. A sub-feature may depend on `shared/` folders owned by its ancestors, while shared code never depends on a descendant feature. Apply this direction at both supported feature levels and keep promotion local instead of turning domain-wide shared folders into catch-alls.

Extract the complete responsibility: feature-specific calculations, types and state move with the components. A parent may coordinate common inputs and compose child features, while child-specific logic belongs to the child. Code with a single consumer stays with that consumer; inspect actual reuse before promoting code into scoped shared folders.

See also: `arch-domain-first-layout`, `arch-shared-no-domain-knowledge`, `arch-subdomain-decision`
