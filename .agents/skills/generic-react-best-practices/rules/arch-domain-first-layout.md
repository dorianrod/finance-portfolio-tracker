---
title: Follow the Domain-First Folder Layout
impact: CRITICAL
impactDescription: every file's role is obvious from its path
tags: arch, domain-first, folders, structure, imports
---

## Follow the Domain-First Folder Layout

**Impact: CRITICAL (every file's role is obvious from its path)**

Business code lives in `src/domains/[mainDomain]/[subDomain]/`, or directly in `src/domains/[mainDomain]/` when no distinct sub-domain is needed (`contracts/`, `projects/`). A domain represents a coherent business scope with its own vocabulary and rules; it need not mirror an API entity. Pick the smallest structure that keeps ownership explicit: a cohesive domain may own role folders directly, while a domain with several capabilities uses `features/` for vertical slices. Either shape may contain `shared/` for code owned jointly by multiple children.

When a feature contains `features/`, place all its own role folders inside `shared/` alongside `features/`. A feature without children owns its role folders directly. This distinction is structural and does not grant shared ownership: `shared/` must actually serve several child features. Give parent-only business behavior its own child feature, compose entry components in the application, and keep leaf role folders directly at their root.

Each feature uses the same fixed role folders, so paths keep both ownership and responsibility explicit (`features/detail/apis/queries` = reads owned by order detail, `features/detail/services/actions` = its UI orchestration). Do not mix the compact and feature-sliced layouts for separate capabilities, invent a generic feature wrapper around the whole domain, or dump files directly at the domain root. Feature nesting stops after one sub-feature level.

Never recreate catch-all root folders (`src/hooks/`, `src/components/`, `src/helpers/`, `src/utils/`, `src/types/`) outside `domains` and `shared`, nor aliases or re-exports that mimic them. Code goes either in its domain or in the matching `src/shared/` folder.

**Incorrect (ad-hoc roots and a redundant wrapper):**

```text
src/
├── hooks/useDebounce.ts                       # catch-all root outside domains and shared
├── utils/formatAmount.ts                      # catch-all root
└── domains/sales/orders/
    └── features/screen/features/           # delivery wrapper, not a business capability
        ├── list/
        └── detail/
```

**Correct (one role per folder):**

```text
src/domains/sales/                              # main domain with entity sub-domains
├── shared/                                     # code owned jointly by those entities
└── orders/                                     # sub-domain (business entity)
    ├── features/
    │   ├── list/
    │   │   ├── apis/{queries,mutations}/       # TanStack Query hooks owned by the list
    │   │   ├── components/                     # list UI
    │   │   ├── helpers/{transformers,formatters,presenters}/
    │   │   ├── pages/list/
    │   │   ├── services/{actions,forms}/
    │   │   ├── stores/
    │   │   └── types/
    │   └── detail/
    │       └── features/                       # explicit nested feature boundary
    │           └── access-management/...
    └── shared/                                 # order code used by several order features

src/domains/contracts/                          # cohesive single-capability domain
├── apis/queries/
├── components/
├── services/
└── types/

src/shared/                                # generic code with no business knowledge
```

Create only the role folders you need inside each feature or scoped `shared/` folder. Import across folders through one path alias (`@/` → `src/`) and reject deep relative paths (`../../*`) with ESLint; keep `./` for colocated files.

### Enforcement and coordinated renames

Treat observable filename and folder conventions as deterministic enforcement
requirements during ordinary changes as well as audits. Use the owning rules:
`arch-component-roles` for component suffixes and runtime role boundaries,
`arch-component-module-boundaries` for component support modules,
`arch-feature-slice-layout` and `arch-feature-hierarchy` for folder shape and depth,
and `arch-stores-no-index` for store filenames. Import direction is governed by
`arch-transverse-only-imports` and `arch-shared-no-domain-knowledge`.

Inspect the consuming application's effective configuration and the detector's
analysis limits. Prefer an existing check; implement or strengthen generic
enforcement for an uncovered deterministic convention. Prove a rejected example
and a valid neighbor through that configuration, including aliases or indirection
when relevant. Business capability names, actual shared ownership and the choice
between view and feature require the responsibility reviews in their owning rules.

Coordinate file moves through IDE refactoring or a codemod. Update static imports,
reexports, literal dynamic imports and affected tests and stories, then run the
relevant lint, type and behavior checks. ESLint rules report violations and may
offer safe edits within the inspected file; they must not rename files or mutate
other files from rule visitors. Preserve the declared responsibility when only
normalizing a filename, and reassess ownership before changing its folder or role.

See also: `arch-feature-slice-layout`, `arch-shared-no-domain-knowledge`, `arch-subdomain-decision`
