---
title: Create a Sub-Domain Only for a Distinct Business Concept
impact: MEDIUM
impactDescription: avoids fragmented domains and forbidden sibling imports
tags: arch, domain-first, sub-domain, structure
---

## Create a Sub-Domain Only for a Distinct Business Concept

**Impact: MEDIUM (avoids fragmented domains and forbidden sibling imports)**

Sibling sub-domains cannot import each other, so splitting one entity's capabilities across sub-domains forces duplication or boundary violations. Create a sub-domain only for a distinct business entity or concept with its own vocabulary, rules and meaningful ownership; model a capability of an existing concept as a feature or one sub-feature level under that concept instead. Independent lifecycle, endpoints, permissions and several pages are supporting evidence, not mandatory conditions; meaningful business boundaries do not require CRUD or dedicated endpoints.

**Incorrect (a feature of the order split into its own sub-domain):**

```text
src/domains/sales/
├── orders/
└── orderAccesses/             # cannot exist without an order, same permissions,
    ├── apis/queries/          # single modal: needs @/domains/sales/orders/*
    └── components/            #   (sibling import, forbidden)
```

**Correct (the capability becomes a vertical feature of the owning entity):**

```text
src/domains/sales/orders/
└── features/
    └── access-management/
        ├── apis/queries/useGetOrderAccessesQuery.ts
        ├── apis/mutations/useResendAccessInvitation.ts
        ├── components/OrderAccessPanel.feature.tsx
        └── services/useResendOrderAccess.ts
```

Separate API resources (`/orders` vs `/invoices`), independent CRUD, distinct permissions and multiple views can confirm distinct ownership, but none establishes a sub-domain by itself. If two sub-domains need the same code, move genuinely common code to the main domain's `shared/` folder instead of merging them. A main domain with no distinct child concept stays single-level (`src/domains/contracts/`); it may use direct role folders while it remains one cohesive capability.

See also: `arch-domain-first-layout`, `arch-feature-slice-layout`, `arch-business-capability-boundaries`, `arch-feature-hierarchy`
