---
title: Separate Helpers from Services by Effects and Orchestration
impact: HIGH
impactDescription: predictable location, minimal test setup
tags: arch, helpers, services, business-rules, formatters, mappers
---

## Separate Helpers from Services by Effects and Orchestration

**Impact: HIGH (predictable location, minimal test setup)**

Place a function by what it depends on, not by its name. Helpers always live in a categorized subfolder (see `helpers-categories`), never flat in `helpers/`, and each file is named after its one public helper export:

| Needs | Folder | Examples |
| --- | --- | --- |
| Nothing, or read-only context (`useTranslation`, atom read) | `helpers/<category>/` at component, page or domain scope | `isContractClosed`, `useFormatOrderStatus`, `toOrderSummary` |
| Side effects or orchestration (effect, mutation, dialog, navigation, several queries) | `services/` at component, page or domain scope | `useOrderDocumentTitle`, `useResendInvoice` |

**Incorrect (flat logic file and a pure rule needlessly wrapped in a service hook):**

```text
src/domains/contracts/
├── helpers/
│   ├── utils.ts                          # flat grab-bag
│   └── contract.logic.ts                  # responsibility hidden by its suffix
└── services/
    └── useIsContractClosed.ts            # pure predicate needlessly made a hook
```

**Correct (categorized helpers, side effects in services/):**

```text
src/domains/contracts/
├── helpers/businessRules/isContractClosed.ts       # (status: ContractStatus) => boolean
├── helpers/formatters/getContractTypeLabel.ts
└── services/useCloseContract.ts                    # mutation + confirmation dialog

src/domains/contracts/components/ContractPanel/
├── ContractPanel.feature.tsx
└── services/useContractDocumentTitle.ts             # one component owns the effect

src/domains/sales/shared/
├── helpers/formatters/useFormatOrderStatus.ts      # hook only to read `t`
└── helpers/mappers/toOrderSummary.ts               # Order -> OrderSummary
```

A formatter that needs `t` is a hook returning a memoized function; it never receives `t` as a parameter. Page-specific helpers follow the same subfolders under `pages/[page]/helpers/`. Component-specific helpers and services require a named component directory (see `arch-component-module-boundaries`).
