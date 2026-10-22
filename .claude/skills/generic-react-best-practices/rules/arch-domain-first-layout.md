---
title: Follow the Domain-First Folder Layout
impact: CRITICAL
impactDescription: every file's role is obvious from its path
tags: arch, domain-first, folders, structure, imports
---

## Follow the Domain-First Folder Layout

**Impact: CRITICAL (every file's role is obvious from its path)**

Business code lives in `src/domains/[mainDomain]/[subDomain]/`, or directly in `src/domains/[mainDomain]/` when the main domain holds a single entity (`contracts/`, `projects/`). Each level uses the same fixed role folders. Reviewers and grep-based audits rely on this layout (`apis/queries` = reads, `pages/*/services/actions` = UI orchestration), so never invent a parallel structure or dump files at the domain root.

Never recreate catch-all root folders (`src/hooks/`, `src/components/`, `src/helpers/`, `src/utils/`, `src/types/`) outside `domains` and `shared`, nor aliases or re-exports that mimic them. Code goes either in its domain or in the matching `src/shared/` folder.

**Incorrect (ad-hoc folders, mixed responsibilities):**

```text
src/
├── hooks/useDebounce.ts             # catch-all root outside domains and shared
├── utils/formatAmount.ts            # catch-all root
└── domains/sales/orders/
    ├── hooks/useOrders.ts           # query + toast + navigation in one file
    ├── utils.ts                     # flat bag of helpers
    ├── OrderList.tsx                # page at the sub-domain root
    └── store/index.ts               # barrel store
```

**Correct (one role per folder):**

```text
src/domains/sales/                         # main domain with sub-domains
├── shared/                                # code shared by sibling sub-domains only
└── orders/                                # sub-domain (business entity)
    ├── apis/{queries,mutations}/          # TanStack Query hooks
    ├── services/                          # reusable domain hooks with side effects
    ├── helpers/{businessRules,formatters,mappers,…}/
    ├── components/                        # UI reused by several pages of the sub-domain
    ├── types/                             # order.type.ts, statuses.type.ts
    ├── mocks/                             # typed fixtures only (order.mock.ts)
    ├── stores/                            # filters.atoms.ts, selection.atoms.ts
    └── pages/list/
        ├── List.tsx
        ├── components/                    # page-only UI
        ├── helpers/
        ├── types/                         # page-only types (filters.type.ts)
        ├── stores/                        # page-local atoms
        └── services/{actions,forms,permissions}/

src/domains/contracts/                     # single-level main domain: same folders, no sub-domain
├── apis/ helpers/ types/ …
└── pages/detail/

src/shared/                                # generic code with no business knowledge
```

Create only the folders you need. Import across folders through one path alias (`@/` → `src/`) and reject deep relative paths (`../../*`) with ESLint; keep `./` for colocated files. Import shared components from their public entry, not from their internal files.
