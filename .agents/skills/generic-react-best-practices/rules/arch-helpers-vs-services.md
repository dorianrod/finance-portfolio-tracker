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
| Nothing, or read-only context (`useTranslation`, atom read) | `helpers/<category>/` at component, page or feature scope | `isContractClosed`, `useFormatOrderStatus`, `toOrderSummary` |
| Side effects or orchestration (effect, mutation, dialog, navigation, several queries) | `services/` at component, page or feature scope | `useOrderDocumentTitle`, `useResendInvoice` |

**Incorrect (flat logic file and a pure rule needlessly wrapped in a service hook):**

```text
src/domains/contracts/features/detail/
├── helpers/
│   ├── utils.ts                          # flat grab-bag
│   └── contract.logic.ts                  # responsibility hidden by its suffix
└── services/
    └── useIsContractClosed.ts            # pure predicate needlessly made a hook
```

**Correct (categorized helpers, side effects in services/):**

```text
src/domains/contracts/features/detail/
├── helpers/businessRules/isContractClosed.ts       # (status: ContractStatus) => boolean
├── helpers/formatters/useFormatContractType.ts
└── services/useCloseContract.ts                    # mutation + confirmation dialog

src/domains/contracts/features/detail/components/ContractPanel/
├── ContractPanel.feature.tsx
└── services/useContractDocumentTitle.ts             # one component owns the effect

src/domains/sales/orders/shared/
├── helpers/formatters/useFormatOrderStatus.ts      # hook only to read `t`
└── helpers/mappers/toOrderSummary.ts               # Order -> OrderSummary
```

A value-to-text formatter is a `useFormatXxx` hook returning a memoized function, including a pure label formatter. It reads translation context when needed and never receives `t` as a parameter. Read-only query subscriptions, atom reads and translation context do not by themselves turn a categorized helper into a service; effects and orchestration decide that boundary. Page-specific helpers follow the same subfolders under `pages/[page]/helpers/`. Component-specific helpers and services require a named component directory (see `arch-component-module-boundaries`).

### ESLint Enforcement

Enable `local/no-memo-only-service` at error level for production domain services,
including component- and page-owned services. Reject an exported hook whose only
statement returns React `useMemo` around a direct call to an imported categorized
helper, with data-only arguments and dependencies. Resolve React and helper
import aliases, immutable aliases, namespace access and local export lists;
respect lexical shadowing. Preserve services with effects, additional statements,
effectful argument evaluation or opaque callbacks.

This deliberately bounded check identifies a memoized helper adapter, rather
than proving arbitrary code pure. Review other service implementations, helper
categories and read-only query subscriptions manually. There is no automatic
folder move: choose the category and nearest owner from the actual inputs,
outputs and consumers. Verify rejected and neighboring valid cases through the
consuming application's configuration.
