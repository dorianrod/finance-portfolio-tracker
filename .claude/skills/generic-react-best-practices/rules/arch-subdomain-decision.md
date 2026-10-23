---
title: Create a Sub-Domain Only for a Distinct Business Entity
impact: MEDIUM
impactDescription: avoids fragmented domains and forbidden sibling imports
tags: arch, domain-first, sub-domain, structure
---

## Create a Sub-Domain Only for a Distinct Business Entity

**Impact: MEDIUM (avoids fragmented domains and forbidden sibling imports)**

Sibling sub-domains cannot import each other, so splitting one entity's capabilities across sub-domains forces duplication or boundary violations. Create a sub-domain only for an entity with its own lifecycle, endpoints, permissions and several pages; model a capability of an existing entity as a feature or one sub-feature level under that entity instead.

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

Create a new sub-domain when the concept has its own API resource (`/orders` vs `/invoices`), independent CRUD, distinct permissions and multiple views. If two sub-domains need the same code, move it to the main domain's `shared/` folder instead of merging them. A main domain that holds a single entity stays single-level (`src/domains/contracts/`) until a second entity appears; it may use direct role folders while it remains one cohesive capability.

See also: `arch-domain-first-layout`, `arch-feature-slice-layout`
