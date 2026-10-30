---
title: Sort Every Helper Into One of a Fixed Set of Categories
impact: MEDIUM-HIGH
impactDescription: predictable location, no grab-bag folders, no duplicated helpers
tags: helpers, categories, selectors, aggregators, calculators, mappers, presenters, quality
---

## Sort Every Helper Into One of a Fixed Set of Categories

**Impact: MEDIUM-HIGH (predictable location, no grab-bag folders, no duplicated helpers)**

`helpers/` is never flat and never holds a `utils.ts` or `*.logic.ts`. Each file lives in one category folder, is named after its single public helper export, and may keep private support functions. A helper is either a pure function or a hook that only **reads** context (`t`, an atom, a query client) to return a memoized value or function; anything with side effects or orchestration (effect, mutation, dialog, navigation, several queries) is a service, not a helper (see `arch-helpers-vs-services`). Pick the category by the **input and output** of the function:

| Category | Input → output | Examples |
| --- | --- | --- |
| `businessRules/` | entity/state → `boolean` (or a closed union) | `isContractClosed`, `canCancelOrder`, `shouldShowApprovers` |
| `formatters/` | entity/value → display text | `useFormatContact`, `useFormatOrderStatus` |
| `selectors/` | collection → same items filtered, ordered, indexed or selected | `selectVisibleOrders`, `findLatestInvoice`, `sortContacts` |
| `aggregators/` | many records → grouped or consolidated collection | `aggregateInvoicesByMonth`, `buildAccountHistory` |
| `calculators/` | values/entities → quantitative metric or metric summary | `getInvoiceTotal`, `computeOrderPerformance` |
| `mappers/` | one representation → another, without material selection or aggregation | `toContactOption`, `buildOrderViewModel` |
| `presenters/` | display data → UI class, tone, geometry or library-specific shape | `getOrderStatusTone`, `getChartDomain`, `computePopoverPosition` |
| `quality/` | data → coverage, reliability, missing-data or anomaly diagnostic | `computeInvoiceCoverage`, `assessContactCompleteness` |
| `validators/` | entity/items → list of business errors (never throws, no toast) | `validateOrdersForCancellation` |
| `payloads/` | domain values → API request body | `buildOrderPayload` |
| `forms/` | entity → form initial values, and form values → domain input | `getOrderFormInitialValues` |
| `filters/` | domain data → filter options and filter defaults | `useStatusFilterOptions` |
| `schemas/` | Yup schemas reused by several hooks (see `yup-module-level-schemas`) | `ORDER_LIST_ITEM_SCHEMA` |
| `links/` | ids → route or URL | `getContractDetailPath` |

Use these boundaries when neighboring categories look plausible:

- Same item shape with fewer, reordered or selected items → `selectors`.
- Several records grouped by a key into consolidated records → `aggregators`.
- Primarily numeric or statistical result, including a structured metric summary → `calculators`.
- Representation change without material selection or aggregation → `mappers`.
- CSS, design-system, charting or geometry vocabulary in the output → `presenters`.
- Completeness, reliability, coverage or anomaly evidence in the output → `quality`.
- A simple quality predicate still belongs in `businessRules/`; a quality label still belongs in `formatters/`.

Parsing and coercion of raw API values are not helper categories. They belong in the API hook's Yup schema so the domain never receives unvalidated wire values (see `yup-last-coercion-barrier`).

Decision path for the remaining categories: returns text → `formatters`; returns a boolean or a closed union → `businessRules`; returns a list of errors → `validators`; returns a request body → `payloads`; feeds a form → `forms`; defines filter options, defaults or filter-state transitions → `filters`; returns a route or URL → `links`.

When no category fits, the function is probably misplaced. A hook with side effects belongs to `services/`; component-only logic belongs in the named component directory; page-shared logic belongs under that page; feature-shared logic belongs under that feature; and only business-agnostic helpers go to `src/shared/`. Presenter helpers stay at component or page scope. Create a new category only when at least two helpers share it, then add it to this table.

**Incorrect (flat grab-bag, categories invented per file, text and rules mixed):**

```text
src/domains/sales/orders/features/list/helpers/
├── utils.ts                      # formatDate, isCancelable, buildBody, …
├── orderHelpers.ts
├── order.logic.ts                # selection, aggregation and display mixed together
├── responsiveness/useIsMobile.ts # not domain logic
└── lists/useOrderListData.ts     # page data orchestration, not a helper
```

**Correct (one category per file, file named after its export):**

```text
src/domains/sales/orders/features/list/helpers/
├── businessRules/isOrderCancelable.ts      # (order: Order) => boolean
├── formatters/useFormatOrderStatus.ts      # hook reading `t`, returns a memoized function
├── selectors/selectVisibleOrders.ts        # Order[] -> Order[]
├── aggregators/aggregateOrdersByMonth.ts    # Order[] -> MonthlyOrders[]
├── calculators/getOrderTotal.ts             # OrderLine[] -> number
├── mappers/toOrderOption.ts                 # Order -> SelectOption
├── quality/computeOrderCoverage.ts          # Order[] -> CoverageDiagnostic
├── validators/validateOrdersForCancellation.ts
├── payloads/buildOrderPayload.ts           # OrderFormValues -> OrderPayload
├── forms/getOrderFormInitialValues.ts      # Order -> OrderFormValues
└── filters/useOrderStatusFilterOptions.ts

src/domains/sales/orders/features/list/pages/list/components/OrdersChart/
├── OrdersChart.feature.tsx
└── helpers/presenters/getOrdersChartDomain.ts
```

Page-specific helpers follow the same categories under `pages/[page]/helpers/`; helpers shared by sibling features live once in their nearest common ancestor's `shared/helpers/`. Component-specific helpers use the same categories under the named component directory (see `arch-component-module-boundaries`).

See also: `arch-component-module-boundaries`, `arch-helpers-vs-services`, `yup-last-coercion-barrier`, `state-derived-atoms`

### ESLint Enforcement

Enable `local/helper-module-contract` at error level for authored production
helpers, including component-, page- and shared-owned modules. Reject flat or
undocumented categories and `*.logic.*` names. Match the filename stem to the
public callable export, including named default exports, local export aliases,
overloads and immutable callable aliases. Type-only exports, constants, private
support functions, tests, stories, fixtures and declaration files do not establish
a public helper naming violation.
Resolve business scopes before identifying the helper role; a domain or feature
named `helpers` is not itself a helper folder.

The check does not infer a function's category from its implementation or prove
that an opaque reexport or factory result is callable. Review those cases and
actual ownership manually. Verify mismatched and matching neighbors through the
consuming configuration. There is no autofix: a rename must update imports and
callers together, and choosing a category requires responsibility review.
