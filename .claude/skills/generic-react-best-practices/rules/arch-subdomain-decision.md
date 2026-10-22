---
title: Create a Sub-Domain Only for a Distinct Business Entity
impact: MEDIUM
impactDescription: avoids fragmented domains and forbidden sibling imports
tags: arch, domain-first, sub-domain, structure
---

## Create a Sub-Domain Only for a Distinct Business Entity

**Impact: MEDIUM (avoids fragmented domains and forbidden sibling imports)**

Sibling sub-domains cannot import each other, so splitting an entity's features across sub-domains forces duplication or boundary violations. Create a sub-domain only for an entity with its own lifecycle, endpoints, permissions and several pages; otherwise extend the parent sub-domain (new page, new mutation, new section).

**Incorrect (a feature of the order split into its own sub-domain):**

```text
src/domains/sales/
├── orders/
└── orderAccesses/             # cannot exist without an order, same permissions,
    ├── apis/queries/          # single modal: needs @/domains/sales/orders/*
    └── components/            #   (sibling import, forbidden)
```

**Correct (the feature extends the owning sub-domain):**

```text
src/domains/sales/orders/
├── apis/queries/useGetOrderAccessesQuery.ts
├── apis/mutations/useResendAccessInvitation.ts
└── pages/detail/...
```

Create a new sub-domain when the concept has its own API resource (`/orders` vs `/invoices`), independent CRUD, distinct permissions and multiple views. If two sub-domains need the same code, move it to the main domain's `shared/` folder instead of merging them. A main domain that holds a single entity stays single-level (`src/domains/contracts/apis/…`) until a second entity appears.
