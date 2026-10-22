---
title: Sort Every Helper Into One of a Fixed Set of Categories
impact: MEDIUM-HIGH
impactDescription: predictable location, no grab-bag folders, no duplicated helpers
tags: helpers, categories, formatters, mappers, payloads, validators
---

## Sort Every Helper Into One of a Fixed Set of Categories

**Impact: MEDIUM-HIGH (predictable location, no grab-bag folders, no duplicated helpers)**

`helpers/` is never flat and never holds a `utils.ts`: each file lives in one category folder, named after its export. A helper is either a pure function or a hook that only **reads** context (`t`, an atom, a query client) to return a memoized value or function; anything with side effects (mutation, dialog, navigation, several queries) is a service, not a helper (see `arch-helpers-vs-services`). Pick the category by the **input and output** of the function:

| Category | Input → output | Examples |
| --- | --- | --- |
| `businessRules/` | entity/state → `boolean` (or a closed union) | `isContractClosed`, `canCancelOrder`, `shouldShowApprovers` |
| `formatters/` | entity/value → display text | `useFormatContact`, `useFormatOrderStatus` |
| `mappers/` | one representation → another one, never text | `getOrderStatusBadgeType`, `toContactOption` |
| `calculators/` | entities/numbers → derived number | `getInvoiceTotal`, `getRemainingAmount` |
| `validators/` | entity/items → list of business errors (never throws, no toast) | `validateOrdersForCancellation` |
| `payloads/` | domain values → API request body | `buildOrderPayload` |
| `forms/` | entity → form initial values, and form values → domain input | `getOrderFormInitialValues` |
| `filters/` | domain data → filter options and filter defaults | `useStatusFilterOptions` |
| `schemas/` | Yup schemas reused by several hooks (see `yup-module-level-schemas`) | `ORDER_LIST_ITEM_SCHEMA` |
| `links/` | ids → route or URL | `getContractDetailPath` |

Decision path when adding a helper: returns text → `formatters`; returns a boolean or a closed union → `businessRules`; returns a number → `calculators`; returns a list of errors → `validators`; returns a request body → `payloads`; feeds a form → `forms`; feeds a select/filter → `filters`; returns a route or URL → `links`; otherwise a representation change → `mappers`.

When no category fits, the function is probably misplaced (a hook with side effects belongs to `services/`, a component-only function stays next to its component, an app-wide generic function goes to `src/shared/`). Create a new category only when at least two helpers share it, then add it to this table.

**Incorrect (flat grab-bag, categories invented per file, text and rules mixed):**

```text
src/domains/sales/orders/helpers/
├── utils.ts                      # formatDate, isCancelable, buildBody, …
├── orderHelpers.ts
├── responsiveness/useIsMobile.ts # not domain logic
└── lists/useOrderListData.ts     # page data orchestration, not a helper
```

**Correct (one category per file, file named after its export):**

```text
src/domains/sales/orders/helpers/
├── businessRules/isOrderCancelable.ts      # (order: Order) => boolean
├── formatters/useFormatOrderStatus.ts      # hook reading `t`, returns a memoized function
├── mappers/getOrderStatusBadgeType.ts      # OrderStatus -> BadgeType
├── calculators/getOrderTotal.ts            # (lines: OrderLine[]) => number
├── validators/validateOrdersForCancellation.ts
├── payloads/buildOrderPayload.ts           # OrderFormValues -> OrderPayload
├── forms/getOrderFormInitialValues.ts      # Order -> OrderFormValues
└── filters/useOrderStatusFilterOptions.ts
```

Page-specific helpers follow the same categories under `pages/[page]/helpers/`; helpers shared by sub-domains live once in `[domain]/shared/helpers/`.

See also: `vercel-react-best-practices` → `rerender-derived-state-no-effect`
