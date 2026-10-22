<!-- GENERATED FILE — do not edit. Run: node scripts/build.mjs -->

# Generic React Best Practices

**Version 1.0.0**  
Frontend Engineering  
October 2026

> **Note:**  
> This document is mainly for agents and LLMs to follow when maintaining,  
> generating, or refactoring React code. It is a delta on top of `vercel-react-best-practices`: apply both.

---

## Abstract

Opinionated React/TypeScript guidelines for any front-end app (React 19, TanStack Query v5, Jotai, Yup, react-i18next, Jest + React Testing Library), designed for AI agents and LLMs. It is the author's own take on a best-practices guide, complementary to vercel-react-best-practices: domain-first architecture and import boundaries, API hooks and server state, query keys and cache invalidation, domain types, Yup schemas, UI composition and accessibility, Jotai client state, helpers, i18n, testing and code quality. Each rule includes a rationale and incorrect vs. correct examples using generic business vocabulary.

---

## Table of Contents

1. [Architecture & Boundaries](#1-architecture--boundaries) — **CRITICAL**
   - 1.1 [Declare Every React Component as a View or Feature](#11-declare-every-react-component-as-a-view-or-feature)
   - 1.2 [Follow the Domain-First Folder Layout](#12-follow-the-domain-first-folder-layout)
   - 1.3 [Import Other Domains Only Through Transverse Domains](#13-import-other-domains-only-through-transverse-domains)
   - 1.4 [Keep Shared Code Free of Domain Knowledge](#14-keep-shared-code-free-of-domain-knowledge)
   - 1.5 [Share Client State Through Jotai, Not Prop Chains or Context](#15-share-client-state-through-jotai-not-prop-chains-or-context)
   - 1.6 [Choose helpers/ or services/ by Asking "Does It Need a Hook?"](#16-choose-helpers-or-services-by-asking-does-it-need-a-hook)
   - 1.7 [Gate Experimental Features With a Typed Flag Registry](#17-gate-experimental-features-with-a-typed-flag-registry)
   - 1.8 [Keep Components Thin](#18-keep-components-thin)
   - 1.9 [Keep Visual Logic Out of apis/, services/ and helpers/](#19-keep-visual-logic-out-of-apis-services-and-helpers)
   - 1.10 [No index.ts in stores/, One File per Concern](#110-no-indexts-in-stores-one-file-per-concern)
   - 1.11 [Create a Sub-Domain Only for a Distinct Business Entity](#111-create-a-sub-domain-only-for-a-distinct-business-entity)
2. [API Hooks & Server State](#2-api-hooks--server-state) — **CRITICAL**
   - 2.1 [Validate Both Directions With Yup Inside Every API Hook](#21-validate-both-directions-with-yup-inside-every-api-hook)
   - 2.2 [Wrap Every Endpoint in a Domain API Hook](#22-wrap-every-endpoint-in-a-domain-api-hook)
   - 2.3 [Declare Every Endpoint in One Registry, Never Inline URLs](#23-declare-every-endpoint-in-one-registry-never-inline-urls)
   - 2.4 [Model Mutations as Input, Payload and Response](#24-model-mutations-as-input-payload-and-response)
   - 2.5 [Normalize API Errors Centrally and Translate Known Keys Before Display](#25-normalize-api-errors-centrally-and-translate-known-keys-before-display)
   - 2.6 [Pair Every Suspense Query With an Error Boundary and Handle 404 Separately](#26-pair-every-suspense-query-with-an-error-boundary-and-handle-404-separately)
   - 2.7 [Pick the TanStack Query Hook by Access Pattern](#27-pick-the-tanstack-query-hook-by-access-pattern)
   - 2.8 [Return the TanStack Result As-Is From API Hooks](#28-return-the-tanstack-result-as-is-from-api-hooks)
   - 2.9 [Type API Hooks With the Domain Entity and Let the Return Type Infer](#29-type-api-hooks-with-the-domain-entity-and-let-the-return-type-infer)
   - 2.10 [Use Optimistic Updates Only Where Latency Is Visible, With Rollback](#210-use-optimistic-updates-only-where-latency-is-visible-with-rollback)
   - 2.11 [Use TData = void for Body-less or Response-less Mutations](#211-use-tdata--void-for-body-less-or-response-less-mutations)
   - 2.12 [Destructure Query Data With a Business Name](#212-destructure-query-data-with-a-business-name)
   - 2.13 [Name API Hooks After the Endpoint Intent](#213-name-api-hooks-after-the-endpoint-intent)
3. [Security](#3-security) — **CRITICAL**
   - 3.1 [Clear the Query Cache on Logout](#31-clear-the-query-cache-on-logout)
   - 3.2 [Open External Links with noopener and noreferrer](#32-open-external-links-with-noopener-and-noreferrer)
   - 3.3 [Read Protected Files Only Through the Authorized File Primitive](#33-read-protected-files-only-through-the-authorized-file-primitive)
4. [Query Keys & Cache](#4-query-keys--cache) — **HIGH**
   - 4.1 [Invalidate Exactly What the Mutation Affects](#41-invalidate-exactly-what-the-mutation-affects)
   - 4.2 [Use One Query Key Convention per Domain](#42-use-one-query-key-convention-per-domain)
5. [Domain Types](#5-domain-types) — **HIGH**
   - 5.1 [Consume Domain Entities, Never Redefine Them Locally](#51-consume-domain-entities-never-redefine-them-locally)
   - 5.2 [Make Nullability Explicit and Justified](#52-make-nullability-explicit-and-justified)
   - 5.3 [Separate the Domain Entity from the API Response](#53-separate-the-domain-entity-from-the-api-response)
   - 5.4 [Type Closed Value Sets as Unions, Not String](#54-type-closed-value-sets-as-unions-not-string)
   - 5.5 [Type Domain Dates as Date and Convert Them in Yup](#55-type-domain-dates-as-date-and-convert-them-in-yup)
   - 5.6 [Use Literal Unions, Never TypeScript Enums](#56-use-literal-unions-never-typescript-enums)
   - 5.7 [Compose Transverse Types, Reference Foreign Entities by ID](#57-compose-transverse-types-reference-foreign-entities-by-id)
   - 5.8 [One Type File per Entity with Predictable Names](#58-one-type-file-per-entity-with-predictable-names)
   - 5.9 [Type Amounts as number and Format Them at Display Time](#59-type-amounts-as-number-and-format-them-at-display-time)
   - 5.10 [No any or Overly Wide Types in Domain Code](#510-no-any-or-overly-wide-types-in-domain-code)
   - 5.11 [No Fallback After a Record Lookup on a Union Key](#511-no-fallback-after-a-record-lookup-on-a-union-key)
6. [Yup Schemas](#6-yup-schemas) — **HIGH**
   - 6.1 [Do Not Use oneOf on Display-Only API Enums](#61-do-not-use-oneof-on-display-only-api-enums)
   - 6.2 [Make Yup the Last Coercion Point](#62-make-yup-the-last-coercion-point)
   - 6.3 [Never Cast Yup Output to the Entity](#63-never-cast-yup-output-to-the-entity)
   - 6.4 [Write Tolerant Response Schemas](#64-write-tolerant-response-schemas)
   - 6.5 [Build Translated Form Validation Schemas in a use[Form]Schema Hook](#65-build-translated-form-validation-schemas-in-a-useformschema-hook)
   - 6.6 [Declare Yup Schemas at Module Level With Explicit Names](#66-declare-yup-schemas-at-module-level-with-explicit-names)
7. [UI Composition & Accessibility](#7-ui-composition--accessibility) — **HIGH**
   - 7.1 [Delegate Mapped JSX to a Component](#71-delegate-mapped-jsx-to-a-component)
   - 7.2 [Keep Compound Component Slots as Direct, Renderable Children](#72-keep-compound-component-slots-as-direct-renderable-children)
   - 7.3 [Keep Dialog Mounted and Drive It with a Boolean open](#73-keep-dialog-mounted-and-drive-it-with-a-boolean-open)
   - 7.4 [Never Nest a form Inside a form](#74-never-nest-a-form-inside-a-form)
   - 7.5 [Wrap the Whole Dialog in a Form Keyed on the Open Target](#75-wrap-the-whole-dialog-in-a-form-keyed-on-the-open-target)
   - 7.6 [Style with Design System Components, Utility Classes Only for Layout](#76-style-with-design-system-components-utility-classes-only-for-layout)
   - 7.7 [Give Icon-Only Buttons and Custom Controls an Accessible Name](#77-give-icon-only-buttons-and-custom-controls-an-accessible-name)
8. [Jotai Client State](#8-jotai-client-state) — **MEDIUM-HIGH**
   - 8.1 [Create Atoms at Module Scope, Never During Render](#81-create-atoms-at-module-scope-never-during-render)
   - 8.2 [Keep Server Data in React Query, Not in Atoms](#82-keep-server-data-in-react-query-not-in-atoms)
   - 8.3 [Place Stores at Domain or Page Level by Reuse](#83-place-stores-at-domain-or-page-level-by-reuse)
   - 8.4 [Reuse App Atom Factories Instead of Hand-Rolled Atoms](#84-reuse-app-atom-factories-instead-of-hand-rolled-atoms)
   - 8.5 [Derive Atoms Instead of Storing Duplicates](#85-derive-atoms-instead-of-storing-duplicates)
   - 8.6 [Persist Atoms with atomWithStorage and a Unique Key](#86-persist-atoms-with-atomwithstorage-and-a-unique-key)
   - 8.7 [Type Atoms Explicitly with DEFAULT_* Constants](#87-type-atoms-explicitly-with-default-constants)
   - 8.8 [Prefix Atoms with Their Entity](#88-prefix-atoms-with-their-entity)
   - 8.9 [Pick useAtomValue, useSetAtom or useAtom by Need](#89-pick-useatomvalue-usesetatom-or-useatom-by-need)
9. [Helpers](#9-helpers) — **MEDIUM-HIGH**
   - 9.1 [Format Entities Through Formatter Hooks, Never Inline](#91-format-entities-through-formatter-hooks-never-inline)
   - 9.2 [Keep Business Rules as Pure, Intent-Named Predicates](#92-keep-business-rules-as-pure-intent-named-predicates)
   - 9.3 [Never Pass t, navigate or Stores to a Helper](#93-never-pass-t-navigate-or-stores-to-a-helper)
   - 9.4 [Sort Every Helper Into One of a Fixed Set of Categories](#94-sort-every-helper-into-one-of-a-fixed-set-of-categories)
10. [Internationalization](#10-internationalization) — **MEDIUM-HIGH**
   - 10.1 [Inject Dynamic Values Through t() Options, Never Concatenation](#101-inject-dynamic-values-through-t-options-never-concatenation)
   - 10.2 [Translate Every User-Facing String with a Catalog Key](#102-translate-every-user-facing-string-with-a-catalog-key)
   - 10.3 [Use Literal Translation Keys Only](#103-use-literal-translation-keys-only)
   - 10.4 [Never Use defaultValue in t()](#104-never-use-defaultvalue-in-t)
11. [Testing](#11-testing) — **MEDIUM-HIGH**
   - 11.1 [Isolate Jotai State with a Fresh Store per Test](#111-isolate-jotai-state-with-a-fresh-store-per-test)
   - 11.2 [Mock the Network Boundary, Never Internal Modules](#112-mock-the-network-boundary-never-internal-modules)
   - 11.3 [Assert Behavior with Parametrized, Unconditional Tests](#113-assert-behavior-with-parametrized-unconditional-tests)
   - 11.4 [Build Typed, Deterministic Mock Data in the Domain mocks Folder](#114-build-typed-deterministic-mock-data-in-the-domain-mocks-folder)
   - 11.5 [Colocate a Test Next to Every File, Covering Errors](#115-colocate-a-test-next-to-every-file-covering-errors)
   - 11.6 [Query by Role and Label, Interact with userEvent](#116-query-by-role-and-label-interact-with-userevent)
   - 11.7 [Test API Hooks with renderHook and a Per-Test Query Wrapper](#117-test-api-hooks-with-renderhook-and-a-per-test-query-wrapper)
12. [Code Quality](#12-code-quality) — **MEDIUM**
   - 12.1 [Never Build Hooks from Hooks (No createUseXxx Factories)](#121-never-build-hooks-from-hooks-no-createusexxx-factories)
   - 12.2 [No Clickable No-Op Links or Actions](#122-no-clickable-no-op-links-or-actions)
   - 12.3 [useMemo for Data, useCallback for Functions](#123-usememo-for-data-usecallback-for-functions)
   - 12.4 [Write Code, Comments and Tests in English](#124-write-code-comments-and-tests-in-english)
   - 12.5 [Scope eslint-disable to the Offending Line with a Reason](#125-scope-eslint-disable-to-the-offending-line-with-a-reason)
   - 12.6 [Keep JSDoc for Non-Obvious Intent Only](#126-keep-jsdoc-for-non-obvious-intent-only)
   - 12.7 [No Chained or Negated Ternaries](#127-no-chained-or-negated-ternaries)

---

## 1. Architecture & Boundaries

**Impact: CRITICAL**

A domain-first layout and strict import boundaries keep features isolated, prevent circular dependencies and make every file's responsibility obvious from its location.

### 1.1 Declare Every React Component as a View or Feature

**Impact: CRITICAL (makes component ownership and data-flow boundaries explicit)**

Classify every production React component module by responsibility:

- `*.view.tsx` renders display-ready data. It may format or clamp values for display, manage accessibility, and keep local visual state such as hover, tooltip or accordion state.
- `*.feature.tsx` owns business orchestration. It reads queries or atoms, invokes actions and pure business helpers, and supplies display-ready props to views.

The suffix is a controlled declaration, not proof that the implementation is correctly classified. During review, verify the imports and responsibilities. Split a file that mixes feature orchestration with reusable presentation components; every component left in a module inherits that module's role. Entrypoints and test modules may remain unsuffixed, while colocated tests should follow the classified source name.

A view may import React, visual libraries, other views, types, formatters, and colocalized purely visual logic. It must not import a feature or runtime dependencies from server-state hooks, client stores, APIs, services, or business helpers. If a deep component needs shared client state, classify it as a feature and let it read the atom directly.

### Choose the boundary by ownership

Create a feature only when the component owns an autonomous business responsibility. At least one of these must be true:

- it reads or updates server or shared client state;
- it invokes an action, mutation or navigation workflow;
- it applies a business rule or calculation for its own subtree;
- it transforms raw domain inputs into a display model for its own subtree;
- it coordinates business states such as availability, permissions, loading or errors;
- it exposes a self-contained use case that several parents can render.

Use a view when its complete behavior can be exercised with display-ready props and interaction callbacks, without installing business providers or mocking queries and stores.

Do not create a feature merely because a component receives raw props, and do not create a matching view for every feature. Split a feature from its view only when the visual part has an independent contract: it is reused with another data source, has meaningful visual variants or interactions, benefits from isolated rendering tests, or contains enough layout to obscure the orchestration. A feature with trivial markup may render that markup directly.

### Audit every feature boundary

An architecture audit is incomplete if it only verifies suffixes and import restrictions. For every `.feature.tsx`, inspect the component responsibilities and reach an explicit boundary decision:

1. Name the business responsibility that justifies the feature.
2. Identify the JSX and local components that only present display-ready data.
3. Decide whether that presentation has an independent visual contract and should move to a `.view.tsx` module.
4. If the feature remains unsplit, verify that its JSX is trivial, tightly coupled to its orchestration, or otherwise has no useful independent contract.

Flag the feature when its business orchestration is mixed with a substantial presentational subtree, reusable visual states, or local display-only components that could be rendered without business dependencies. Recommend a `feature + view` split and keep queries, atoms, actions and business transformations in the feature.

Also flag an unnecessary split when the feature is only a pass-through wrapper or the extracted view merely mirrors all of the feature's props without creating an independent visual contract. The audit must assess the semantic coherence of both the chosen role and the chosen component boundary; naming compliance alone is not sufficient.

**Incorrect (a declared view owns business state and decisions):**

```tsx
// OrderTotal.view.tsx
import { useAtomValue } from 'jotai'
import { activeOrderAtom } from '../stores/order.atoms'
import { calculateOrderTotal } from '../helpers/calculators/orderTotal'

export function OrderTotal() {
  const order = useAtomValue(activeOrderAtom)
  return <strong>{calculateOrderTotal(order)}</strong>
}
```

Renaming the file does not turn this component into a view: it still consumes state and performs a business calculation.

**Correct (the feature owns the decision; the view receives render-ready data):**

```tsx
// OrderTotal.feature.tsx
import { useAtomValue } from 'jotai'
import { activeOrderAtom } from '../stores/order.atoms'
import { calculateOrderTotal } from '../helpers/calculators/orderTotal'
import { OrderTotalView } from './OrderTotal.view'

export function OrderTotal() {
  const order = useAtomValue(activeOrderAtom)
  const total = calculateOrderTotal(order)
  return <OrderTotalView label="Total" formattedTotal={formatMoney(total)} />
}

// OrderTotal.view.tsx
export function OrderTotalView(props: { label: string; formattedTotal: string }) {
  return <p><span>{props.label}</span> <strong>{props.formattedTotal}</strong></p>
}
```

The split above is justified only if `OrderTotalView` has an independent visual contract. Otherwise the feature may render the small result directly.

**Incorrect (a feature exists only as a pass-through wrapper):**

```tsx
// OrderCard.feature.tsx
export function OrderCard(props: OrderCardViewProps) {
  return <OrderCardView {...props} />
}
```

This feature owns no query, state, action, decision or transformation. Keep only `OrderCard.view.tsx`.

**Correct (a feature with trivial markup does not need a separate view):**

```tsx
// DeleteOrderButton.feature.tsx
export function DeleteOrderButton({ orderId }: { orderId: string }) {
  const { deleteOrder, isDeleting } = useDeleteOrderAction(orderId)

  return (
    <Button onClick={deleteOrder} disabled={isDeleting}>
      Delete
    </Button>
  )
}
```

Use this review test: if removing the feature would leave no business responsibility to relocate, the feature is artificial. If extracting the view would only mirror every prop once and create no independent visual contract, keep the JSX in the feature.

Composition is valid: a feature may pass a calculated expression to a view. When the receiving component is another feature, prefer raw inputs so that it owns its business calculation. Treat lint findings as conservative signals and keep any justified suppression on the affected line.

### Review checklist

- Every production component module declares `.view.tsx` or `.feature.tsx`.
- A view has no runtime import of a feature, query, atom, API, service, store or business helper.
- Type-only imports do not create a runtime boundary violation.
- Every feature audit explicitly decides whether its presentation should be extracted to a view.
- An unsplit feature keeps only presentation that is trivial, tightly coupled or lacks an independent visual contract.
- A feature with a substantial or reusable display-only subtree is split into feature orchestration and a view.
- Every feature owns a named business responsibility; pass-through feature wrappers are removed.
- A separate view exists only when it has an independent visual contract, not by default for every feature.
- Calculations are passed to views, while features receive raw business inputs or read shared state directly.
- Mixed modules are split, and the chosen suffix matches actual responsibilities.

See also: `arch-no-prop-drilling`

### 1.2 Follow the Domain-First Folder Layout

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

### 1.3 Import Other Domains Only Through Transverse Domains

**Impact: CRITICAL (keeps domains isolated and free of import cycles)**

A domain imports only from itself, from `src/shared`, and from an explicit short list of transverse domains (stable, generic, no business context: for example `appShell` or a `featureFlags` module). Sibling sub-domains (e.g. `orders` and `invoices`) and other business domains (`projects`, `contracts`, `directory`...) are forbidden: such imports couple release cycles and create import cycles. Enforce the allowed list with an ESLint restriction on import paths.

**Incorrect (orders reaches into its sibling invoices):**

```tsx
// src/domains/sales/orders/pages/detail/components/InvoicesBlock.tsx
import { InvoiceCard } from '@/domains/sales/invoices/components/InvoiceCard'
```

**Correct (shared code is promoted, transverse domains are imported freely):**

```tsx
// Promoted once to the main domain's shared folder, used by both sub-domains
import { getStatusBadgeType } from '@/domains/sales/shared/helpers/mappers/getStatusBadgeType'
// Transverse domains from the explicit list are always allowed, through their public entry
import { Alert } from '@/domains/appShell/alert'
import { useFlag } from '@/domains/featureFlags'
```

Escape hatches, in order of preference:

1. Move the code to the main domain's `shared/` (used by sibling sub-domains) or to `src/shared/` (generic, no domain vocabulary).
2. Reference the other entity by id or route (store `projectId`, link with a path string) instead of importing its hooks or components.
3. Add a domain to the transverse list only by an explicit architecture decision.

See also: `arch-shared-no-domain-knowledge`, `arch-feature-flags`

### 1.4 Keep Shared Code Free of Domain Knowledge

**Impact: CRITICAL (keeps shared/ reusable and cycle-free)**

`src/shared/` must never import from `src/domains/*`, and a main-domain `shared/` folder (e.g. `src/domains/sales/shared/`) must never import from one of its sub-domains. Neither may use a concrete entity's vocabulary in file, type, prop or function names: an `invoiceId` prop in shared code is a sign the extraction is incomplete.

**Incorrect (shared code knows about one sub-domain):**

```tsx
// src/domains/sales/shared/components/AccessesBlockItem.tsx
type AccessesBlockItemProps = {
  invoiceId: string
  onResend: (invoiceId: string) => void
}
```

**Correct (generic names, data and callbacks injected by the caller):**

```tsx
// src/domains/sales/shared/components/AccessesBlockItem.tsx
import type { Access } from '@/domains/sales/shared/types/access.type'

type AccessesBlockItemProps = {
  access: Access
  parentId: string
  onResend: (parentId: string) => void
}
```

Prefer injecting rendered content or data (`table: ReactNode`, `histories: History[]`) over passing an id that the shared component would use to fetch domain data itself. In `src/shared/`, operate on transverse types from `src/shared/types/` or on generics.

A reference or demo folder using business vocabulary is not shared code: forbid importing it from production code with ESLint.

### 1.5 Share Client State Through Jotai, Not Prop Chains or Context

**Impact: CRITICAL (prevents prop drilling and oversized UI hooks)**

State consumed below its owner must not be threaded through intermediate component props or moved into an application React Context. Put shared client state in page- or domain-scoped Jotai atoms. A component that needs a value reads the atom directly; a component that needs to change it calls a focused hook that owns the write operations.

Apply this rule together with `arch-component-roles`. A view may receive calculations and display-ready objects because rendering them is its declared responsibility. A feature should receive raw business inputs or read shared state itself; warn when a parent derives a value from its own props and passes that result to another feature. The warning is a review signal: move the calculation to the receiving feature when it owns the decision, classify a truly presentational child as a view, or suppress only the verified exception on the affected line with a reason.

Keep each stateful hook aligned with one concern. For example, split filters, sorting, selection and modal behavior into `useDashboardFilters`, `useDashboardSort`, `useDashboardSelection` and `useDashboardModal`. A `useDashboardUi` hook may compose these hooks as a thin facade for a caller that genuinely needs all of them, but it must not become the owner of several unrelated `useState` values or a mandatory gateway for deep consumers.

**Incorrect (one hook owns unrelated state, then drills values and actions):**

```tsx
function useDashboardUi() {
  const [filters, setFilters] = useState<DashboardFilters>(DEFAULT_DASHBOARD_FILTERS)
  const [sort, setSort] = useState<DashboardSort>(DEFAULT_DASHBOARD_SORT)
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  return { filters, setFilters, sort, setSort, selectedIds, setSelectedIds }
}

function Dashboard() {
  const dashboardUi = useDashboardUi()
  return <DashboardBody filters={dashboardUi.filters} setFilters={dashboardUi.setFilters} />
}

function DashboardBody(props: DashboardBodyProps) {
  return <DashboardToolbar filters={props.filters} setFilters={props.setFilters} />
}
```

Creating a `DashboardContext` and consuming it with `useContext` is not an accepted fix: it hides the same broad dependency behind a provider and keeps unrelated responsibilities coupled.

**Correct (atoms own values; focused hooks own actions; consumers subscribe where needed):**

```tsx
// pages/dashboard/stores/dashboardFilters.atoms.ts
export const dashboardFiltersAtom = atom<DashboardFilters>(DEFAULT_DASHBOARD_FILTERS)

// pages/dashboard/stores/dashboardSort.atoms.ts
export const dashboardSortAtom = atom<DashboardSort>(DEFAULT_DASHBOARD_SORT)

// pages/dashboard/services/useDashboardFilters.ts
export function useDashboardFilters() {
  const setFilters = useSetAtom(dashboardFiltersAtom)

  const setStatus = useCallback(
    (status: OrderStatus | null) => setFilters(current => ({ ...current, status })),
    [setFilters],
  )
  const resetFilters = useCallback(() => setFilters(DEFAULT_DASHBOARD_FILTERS), [setFilters])

  return useMemo(() => ({ setStatus, resetFilters }), [setStatus, resetFilters])
}

// pages/dashboard/components/DashboardToolbar.tsx
function DashboardToolbar() {
  const filters = useAtomValue(dashboardFiltersAtom)
  const { setStatus, resetFilters } = useDashboardFilters()

  return <Filters value={filters} onStatusChange={setStatus} onReset={resetFilters} />
}

// A different deep consumer reads only what it needs, without intermediary props.
function DashboardResults() {
  const sort = useAtomValue(dashboardSortAtom)
  return <OrderList sort={sort} />
}
```

### How to detect the problem

Combine manual data-flow analysis with the project's lint output. Run the linter for the reviewed scope and inspect every warning emitted by a configured prop-drilling rule; the review is incomplete if either the code analysis or the associated warnings are skipped. Treat each warning as a lead rather than automatic proof: fix genuine forwarding chains, preserve legitimate direct parent-child APIs, and use a narrowly scoped suppression with a reason only for a verified false positive.

- A custom hook declares `useState` and returns that state. This means another consumer needs the value: move shared client state to an atom, unless the hook and its state are an intentionally self-contained reusable primitive.
- A UI hook owns several independent concerns such as filters, sorting, search, selection and modals. Split it into concern-specific atoms and hooks; retain an aggregate hook only as a thin optional facade.
- A prop is forwarded unchanged through one or more components that do not use it.
- A feature calculates, formats, combines or constructs a value from its props only to pass it to another feature. This includes calls, operations, conditions, templates, objects and arrays, even through aliases or destructuring. Passing the same expression to a view is expected.
- A component accepts both a state value and its setter only to pass them farther down the tree.
- A new `createContext` or `useContext` exists primarily to avoid passing client UI state through props.

### Summary

- Keep truly local, unreturned UI state in `useState`, such as hover or one component's accordion state.
- Keep server state in TanStack Query, never in Jotai.
- Put shared client state in scoped atoms and read it directly with `useAtomValue`.
- Expose writes through small responsibility-specific hooks using `useSetAtom`; use `useAtom` only when one consumer genuinely reads and writes.
- Keep explicit props for a direct parent-child API. The smell is an intermediary that forwards props it does not use.
- Pass display-ready values to views. Pass raw inputs to features unless orchestration ownership makes a narrowly documented exception necessary.
- Do not create application React Contexts for state sharing. Third-party providers required by a library are outside this rule.

See also: `vercel-react-best-practices` → `rerender-split-combined-hooks`

### 1.6 Choose helpers/ or services/ by Asking "Does It Need a Hook?"

**Impact: HIGH (predictable location, minimal test setup)**

Place a function by what it depends on, not by its name. Helpers always live in a categorized subfolder (see `helpers-categories`), never flat in `helpers/`, and the file is named after its export:

| Needs | Folder | Examples |
| --- | --- | --- |
| Nothing, or read-only context (`useTranslation`, atom read) | `helpers/<category>/` (categories in `helpers-categories`) | `isContractClosed`, `useFormatOrderStatus`, `getOrderStatusBadgeType` |
| Side effects (mutation, dialog, navigation, several queries) | `services/` | `useResendInvoice` |

**Incorrect (flat helper file, mutation hidden in helpers/, pure rule wrapped in a service hook):**

```text
src/domains/contracts/
├── helpers/
│   ├── utils.ts                          # flat grab-bag
│   └── useCloseContract.ts               # calls a mutation: not a helper
└── services/
    └── useIsContractClosed.ts            # pure predicate needlessly made a hook
```

**Correct (categorized helpers, side effects in services/):**

```text
src/domains/contracts/
├── helpers/businessRules/isContractClosed.ts       # (status: ContractStatus) => boolean
├── helpers/formatters/getContractTypeLabel.ts
└── services/useCloseContract.ts                    # mutation + confirmation dialog

src/domains/sales/shared/
├── helpers/formatters/useFormatOrderStatus.ts      # hook only to read `t`
└── helpers/mappers/getOrderStatusBadgeType.ts      # OrderStatus -> BadgeType
```

A formatter that needs `t` is a hook returning a memoized function; it never receives `t` as a parameter. Page-specific helpers follow the same subfolders under `pages/[page]/helpers/`.

### 1.7 Gate Experimental Features With a Typed Flag Registry

**Impact: HIGH (unfinished features never reach production users)**

Every experimental or unfinished feature is gated by a flag declared in one typed registry and read through one hook exposed by a transverse module. Never gate with an ad-hoc env check, a query param or a hand-read `localStorage` key: they are untyped, scattered, impossible to list and easy to forget. Production must always serve the flag-off version unless the flag is explicitly enabled by your flag source.

**Incorrect (ad-hoc switch, readable and writable by anyone):**

```tsx
export const OrdersToolbar: FC = () => {
  const showExportV2 = localStorage.getItem('exportV2') === 'true'
  return <div>{showExportV2 && <ExportAction />}</div>
}
```

**Correct (one registry, typed key, one reading hook):**

```tsx
// src/domains/featureFlags/flags.ts
export const FLAGS = {
  ordersExportV2: { description: 'New export dialog on the orders list' },
} as const satisfies Record<string, { description: string }>

export type FlagKey = keyof typeof FLAGS

// src/domains/featureFlags/useFlag.ts
export const useFlag = (key: FlagKey): boolean => useAtomValue(flagsAtom)[key] ?? false

// src/domains/sales/orders/pages/list/components/OrdersToolbar.tsx
export const OrdersToolbar: FC = () => {
  const isExportV2Enabled = useFlag('ordersExportV2')
  return <div>{isExportV2Enabled && <ExportAction />}</div>
}
```

- Gate at the highest meaningful level (an action, a tab, a route element) so the flag-off path stays the untouched existing behavior.
- The key type is derived from the registry, so an unknown key fails type-checking.
- Remove the flag and its branch once the feature ships.
- A flag never replaces a permission: hide by permission first, then by flag.
- Import the flag hook from the module's public entry, never its internal files.

### 1.8 Keep Components Thin

**Impact: HIGH (logic becomes reusable and testable without rendering)**

A component reads hooks and renders. Each kind of logic has a fixed home outside the JSX file:

| Logic | Home |
| --- | --- |
| User action (mutation + notification + redirect) | `pages/[page]/services/actions/use[Verb][Entity]Action.ts` |
| Modal open/close state | `pages/[page]/services/actions/use[Name]Modal.ts` + atom in `pages/[page]/stores/` |
| Reaction to a state change | a dedicated hook named after the reaction (`use[Action]On[Trigger]`) |
| Business predicate (`isX`, `canX`) | `helpers/businessRules/` (see `helpers-business-rules-pure`) |
| Side effect reused by several pages | domain `services/` |

`useState` stays acceptable for pure UI state (hover, open accordion).

**Incorrect (the action is orchestrated inside the component):**

```tsx
export const DetailHeader: FC<DetailHeaderProps> = ({ contractId }) => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const notify = useNotify()
  const { mutateAsync: deleteContract } = useDeleteContractMutation(contractId)

  const handleDelete = async () => {
    try {
      await deleteContract()
      notify.success(t('contract.messages.deleteSuccess'))
      navigate('/contracts')
    } catch {
      notify.error(t('contract.messages.deleteError'))
    }
  }
  // ...render with handleDelete
}
```

**Correct (the component only wires page hooks):**

```tsx
import { useDeleteContractAction } from '@/domains/contracts/pages/detail/services/actions/useDeleteContractAction'

export const DetailHeader: FC<DetailHeaderProps> = ({ contractId }) => {
  const [deleteContract, isDeleting] = useDeleteContractAction(contractId)
  return <Button onClick={deleteContract} loading={isDeleting}>{t('common.delete')}</Button>
}
```

See also: `vercel-react-best-practices` → `rerender-derived-state-no-effect`, `rerender-move-effect-to-event`

### 1.9 Keep Visual Logic Out of apis/, services/ and helpers/

**Impact: HIGH (domain hooks stay reusable across pages and contexts)**

Toasts, navigation, selection clearing, modal state and form state belong to page-level actions in `pages/[page]/services/actions/`. Domain `apis/`, `services/` and `helpers/` only fetch, mutate, transform and decide; they return data or throw, and let the page decide what the user sees. The same mutation can then be reused by a bulk action, a modal and a detail page with different feedback.

**Incorrect (a domain service shows the toast itself):**

```ts
// src/domains/contracts/services/useResendDocument.ts
export function useResendDocument(contractId: string) {
  const { t } = useTranslation()
  const notify = useNotify()
  const { mutateAsync } = useResendDocumentMutation(contractId)

  return useCallback(
    async (documentId: string) => {
      await mutateAsync({ documentId })
      notify.success(t('contract.messages.resendSuccess'))
    },
    [mutateAsync, notify, t],
  )
}
```

**Correct (the service only acts and throws, the page action owns the feedback):**

```ts
// services/useResendDocument.ts: same hook, without notification nor translation

// pages/detail/services/actions/useResendDocumentAction.ts
// `useNotify` is the page-level notification hook of your app (toast library wrapper)
export function useResendDocumentAction(contractId: string, documentId: string) {
  const { t } = useTranslation()
  const notify = useNotify()
  const resendDocument = useResendDocument(contractId)
  const [isResending, setIsResending] = useState(false)

  const run = useCallback(async () => {
    setIsResending(true)
    try {
      await resendDocument(documentId)
      notify.success(t('contract.messages.resendSuccess'))
    } catch {
      notify.error(t('contract.messages.resendError'))
    } finally {
      setIsResending(false)
    }
  }, [resendDocument, documentId, notify, t])

  return [run, isResending] as const
}
```

How the page action gives feedback:

- Wrap the mutation call in one `try`/`catch`: success and error messages go through `t()`.
- Clear the selection, close the modal or `navigate(...)` only after the mutation succeeded, inside the same `try`.
- Prefer the backend's readable error message when there is one, falling back to a translated default. Run independent saves of one action with `Promise.all`.

See also: `vercel-react-best-practices` → `async-parallel`

### 1.10 No index.ts in stores/, One File per Concern

**Impact: HIGH (prevents circular imports and keeps atoms discoverable)**

Never add an `index.ts` barrel to a state or store folder (domain or page level), and import each store file directly. Atoms are imported by queries, page actions and components at the same time; a barrel ties all of them to every atom file, is the typical source of circular imports, and defeats tree-shaking.

Give each file one concern and a name that says it:

- `<concern>.atoms.ts` for domain and page atoms: `filters.atoms.ts`, `selection.atoms.ts`, `form.atoms.ts`, or a feature name (`reminderModal.atoms.ts`). Never a generic `atoms.ts` / `state.ts` mixing filters, selection, modals and tabs.
- `<name>.store.ts` for app-level stores (session, user, flags) and for shared modules that pair a factory with its hook.

**Incorrect (barrel re-export):**

```ts
// src/domains/sales/orders/stores/index.ts
export * from './filters.atoms'
export * from './selection.atoms'

// consumer
import { ordersFiltersAtom, selectedOrderIdsAtom } from '@/domains/sales/orders/stores'
```

**Correct (explicit file per concern, direct imports):**

```ts
// src/domains/sales/orders/stores/
//   filters.atoms.ts     selection.atoms.ts
// src/domains/sales/orders/pages/detail/stores/
//   reminderModal.atoms.ts     form.atoms.ts

import { ordersFiltersAtom } from '@/domains/sales/orders/stores/filters.atoms'
import { selectedOrderIdsAtom } from '@/domains/sales/orders/stores/selection.atoms'
```

Audit: `find src/domains -path "*stores*" -name index.ts` must return nothing. Detect cycles with a circular-dependency checker in CI.

See also: `vercel-react-best-practices` → `bundle-barrel-imports`

### 1.11 Create a Sub-Domain Only for a Distinct Business Entity

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

---

## 2. API Hooks & Server State

**Impact: CRITICAL**

All HTTP access goes through typed query/mutation hooks, with schema validation on input and output, Suspense/error boundaries around them and explicit handling of API errors. Getting this layer right guarantees typed, validated data everywhere else.

### 2.1 Validate Both Directions With Yup Inside Every API Hook

**Impact: CRITICAL (no unvalidated API data reaches the domain)**

Every API hook validates both directions with Yup, inside the domain hook: a request schema before sending (query params or body) and a response schema after receiving. Without it, `response.data` is trusted as `T` and nothing checks the shape, so a backend change surfaces as a crash far from the call. Declare schemas as module constants (see `yup-module-level-schemas`) and let `stripUnknown` drop fields the domain does not model.

**Incorrect (trusts the raw response and sends params untransformed):**

```tsx
export function useGetProjectsQuery(params: ProjectListQueryParams) {
  return useInfiniteQuery({
    queryKey: ['projects', params],
    queryFn: async ({ pageParam }) =>
      (await http.post<ProjectListPage>(ENDPOINTS.projects.list, { ...params, page: pageParam })).data,
    initialPageParam: 1,
    getNextPageParam: page => page.metadata.nextPage,
  })
}
```

**Correct (both directions go through Yup):**

```tsx
const REQUEST_SCHEMA = yup.object({
  search: yup.string().optional(),
  publishedOnStart: yup.date().optional(),
})
const RESPONSE_SCHEMA = yup.object({ items: PROJECT_ITEMS_SCHEMA, metadata: METADATA_SCHEMA })

export function useGetProjectsQuery(params: ProjectListQueryParams) {
  return useInfiniteQuery({
    queryKey: ['projects', params],
    queryFn: async ({ pageParam }) => {
      const body = await REQUEST_SCHEMA.validate(params, { stripUnknown: true })
      const { data } = await http.post(ENDPOINTS.projects.list, { ...body, page: pageParam })
      return RESPONSE_SCHEMA.validate(data, { stripUnknown: true })
    },
    initialPageParam: 1,
    getNextPageParam: page => page.metadata.nextPage,
  })
}
```

Mutations follow the same rule inside `mutationFn`. Endpoints with an empty body or empty response skip the placeholder schema (see `api-void-mutation`). Keep response schemas tolerant of harmless backend additions (see `yup-tolerant-response-schema`).

### 2.2 Wrap Every Endpoint in a Domain API Hook

**Impact: CRITICAL (single typed, validated entry point per endpoint)**

Each endpoint gets exactly one hook in `apis/queries/` (reads) or `apis/mutations/` (writes) of its domain. That hook owns the query key, the endpoint URL, the Yup validation and the TanStack Query call. Components and page hooks consume it; they never call `axios`, `useQuery` or `useMutation` directly. Inline calls duplicate keys and URLs and skip validation.

**Incorrect (endpoint, key and parsing inlined in a component):**

```tsx
export const RemindersTab: FC<RemindersTabProps> = ({ contractId }) => {
  const { data } = useSuspenseQuery({
    queryKey: ['contract-reminders', contractId],
    queryFn: async () => (await axios.get(`/contracts/${contractId}/reminders`)).data,
  })
  // ...
}
```

**Correct (one domain hook per endpoint, consumed by the component):**

```tsx
// src/domains/contracts/apis/queries/useGetContractRemindersQuery.ts
export function useGetContractRemindersQuery(contractId: string) {
  return useSuspenseQuery<ContractReminder[]>({
    queryKey: ['contracts', contractId, 'reminders'],
    queryFn: async () => {
      const { data } = await http.get(ENDPOINTS.contracts.reminders(contractId))
      return REMINDERS_SCHEMA.validate(data, { stripUnknown: true })
    },
  })
}

// src/domains/contracts/pages/detail/components/RemindersTab/RemindersTab.tsx
export const RemindersTab: FC<RemindersTabProps> = ({ contractId }) => {
  const { data: reminders } = useGetContractRemindersQuery(contractId)
  const { mutateAsync: deleteReminder } = useDeleteReminder(contractId)
  // ...
}
```

Choose the TanStack hook by access pattern (`api-query-hook-choice`); optimistic writes stay in the mutation hook (`api-optimistic-update`).

Audit: `grep -rnwE "useQuery|useSuspenseQuery|useInfiniteQuery|useMutation|axios" src/domains --include="*.tsx"` must only hit tests, stories and comments.

### 2.3 Declare Every Endpoint in One Registry, Never Inline URLs

**Impact: HIGH (one place to change an endpoint)**

Declare every endpoint once in a single registry (static strings or `(id: string) => string` builders), grouped by resource. API hooks import it and never build URL strings inline, so a backend route change is a one-line edit and endpoints are greppable.

**Incorrect (inline template string):**

```tsx
export function useUpdateInvoiceComment(invoiceId: string) {
  return useMutation({
    mutationFn: async ({ commentId, message }: UpdateInvoiceCommentInput) => {
      await http.put(`/invoices/${invoiceId}/comments/${commentId}`, { message })
    },
  })
}
```

**Correct (builder from the endpoint registry):**

```tsx
// src/shared/endpoints.ts
export const ENDPOINTS = {
  invoices: {
    list: '/invoices',
    updateComment: (invoiceId: string, commentId: string) =>
      `/invoices/${invoiceId}/comments/${commentId}`,
  },
} as const

// src/domains/sales/invoices/apis/mutations/useUpdateInvoiceComment.ts
export function useUpdateInvoiceComment(invoiceId: string) {
  return useMutation({
    mutationFn: async ({ commentId, message }: UpdateInvoiceCommentInput) => {
      await http.put(ENDPOINTS.invoices.updateComment(invoiceId, commentId), { message })
    },
  })
}
```

When a new endpoint is needed, add it to the matching resource group of the registry before writing the hook. Path parameters go through the builder, query parameters through axios `params`.

### 2.4 Model Mutations as Input, Payload and Response

**Impact: HIGH (URL params never leak into the request body)**

Type every mutation with three distinct types. `Input` is what the caller passes (domain vocabulary, may include the target id), `Payload` is exactly what the API body expects, `Response` is the parsed domain result (`void` if none). Route identifiers through the endpoint builder and build the body without them. With TanStack Query: `useMutation<Response, Error, Input>`.

**Incorrect (input sent as the body, id included):**

```tsx
export function useRequestInvoiceRejection() {
  return useMutation({
    mutationFn: async (input: { invoiceId: string; comment: string }) => {
      await http.put(ENDPOINTS.invoices.requestRejection(input.invoiceId), input) // body: { invoiceId, comment }
    },
  })
}
```

**Correct (Input → Payload → Response, id only in the URL):**

```tsx
export type RequestInvoiceRejectionInput = { invoiceId: string; comment: string }

const PAYLOAD_SCHEMA = yup.object({ comment: yup.string().trim().required() })
type RequestInvoiceRejectionPayload = yup.InferType<typeof PAYLOAD_SCHEMA> // private to the hook file

export function useRequestInvoiceRejection() {
  const queryClient = useQueryClient()

  return useMutation<void, Error, RequestInvoiceRejectionInput>({
    mutationFn: async ({ invoiceId, ...body }) => {
      const payload: RequestInvoiceRejectionPayload = await PAYLOAD_SCHEMA.validate(body, {
        stripUnknown: true,
      })
      await http.put(ENDPOINTS.invoices.requestRejection(invoiceId), payload)
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['invoices'] }),
  })
}
```

Export the Input type (callers build it) and keep the Payload type private to the hook file. An empty response uses `void` (see `api-void-mutation`); the hook returns the `useMutation` result as-is (see `api-return-result-as-is`).

### 2.5 Normalize API Errors Centrally and Translate Known Keys Before Display

**Impact: HIGH (shows the real backend message, never a raw i18n key)**

Turn every failed request into one predictable shape in one place: an axios response interceptor (or a single helper) that returns either the backend message or one of a few known keys (`error.network`, `error.timeout`, `error.maintenance`) when no usable response came back. Components never read `error.response.data` themselves. Known keys must be translated before display; a backend message must be shown as is, never passed through `t()` (i18n would rewrite words it contains).

**Incorrect (a network failure shows the raw key):**

```tsx
} catch (error) {
  toast.error(getErrorMessage(error) ?? t('orders.messages.closeError')) // "error.network"
}
```

**Correct (one normalizer, known keys translated, backend text untouched):**

```tsx
// shared: one place that knows the error shapes
export const getErrorMessage = (error: unknown): string | undefined => {
  if (axios.isAxiosError(error)) {
    if (!error.response) return error.code === 'ECONNABORTED' ? 'error.timeout' : 'error.network'
    if (error.response.status === 503) return 'error.maintenance'
    return error.response.data?.errors?.map((e: { message: string }) => e.message).join(', ')
  }
  return error instanceof Error ? error.message : undefined
}

export const useTranslatedErrorMessage = () => {
  const { t } = useTranslation()
  return useCallback(
    (error: unknown): string | undefined => {
      const message = getErrorMessage(error)
      if (message === 'error.network') return t('error.network')
      if (message === 'error.timeout') return t('error.timeout')
      if (message === 'error.maintenance') return t('error.maintenance')
      return message
    },
    [t],
  )
}

// in the action that owns the feedback
const translateError = useTranslatedErrorMessage()
} catch (error) {
  toast.error(translateError(error) ?? t('orders.messages.closeError'))
}
```

Error handling and user feedback live in the action that triggers the mutation, not inside the API hook. Keep a single normalizer for the whole app instead of per-domain variants.

### 2.6 Pair Every Suspense Query With an Error Boundary and Handle 404 Separately

**Impact: HIGH (a failed request shows a message or a not-found state, not a crashed page)**

`useSuspenseQuery` throws on a failed request (403, 404, 500, timeout). Without a boundary the throw bubbles up to the router's default error screen and the whole page, navigation included, disappears. Wrap each page that reads Suspense queries in a boundary that owns both the `<Suspense>` fallback and the error state: a not-found block for a 404, a generic error message for anything else. Read the status from `axios.isAxiosError(error) && error.response?.status` (or from the normalized error of your central error handling).

**Incorrect (Suspense query without a boundary):**

```tsx
// pages/ProjectDetailPage.tsx
export function ProjectDetailPage() {
  const { projectId = '' } = useParams()
  // ProjectDetail calls useGetProjectDetailQuery(projectId): a 404 or 500 throws past the page
  return <ProjectDetail projectId={projectId} />
}
```

**Correct (boundary around the page, explicit 404 branch):**

```tsx
import { QueryErrorResetBoundary } from '@tanstack/react-query'
import { ErrorBoundary } from 'react-error-boundary'

const isNotFound = (error: unknown) => axios.isAxiosError(error) && error.response?.status === 404

export function ProjectDetailPage() {
  const { projectId = '' } = useParams()
  return (
    <QueryErrorResetBoundary>
      {({ reset }) => (
        <ErrorBoundary
          onReset={reset}
          resetKeys={[projectId]}
          fallbackRender={({ error, resetErrorBoundary }) =>
            isNotFound(error) ? (
              <ProjectNotFound />
            ) : (
              <ErrorMessage error={error} onRetry={resetErrorBoundary} />
            )
          }
        >
          <Suspense fallback={<PageSkeleton />}>
            <ProjectDetail projectId={projectId} />
          </Suspense>
        </ErrorBoundary>
      )}
    </QueryErrorResetBoundary>
  )
}
```

- `QueryErrorResetBoundary` lets a retry refetch the failed query; `resetKeys` clears a caught error when the route id changes.
- Wrap an optional, failure-prone sub-fetch (a badge, a history) in its own small boundary that renders a degraded fallback, so a secondary 500 does not take the page down.

See also: `vercel-react-best-practices` → `async-suspense-boundaries`

### 2.7 Pick the TanStack Query Hook by Access Pattern

**Impact: HIGH (no remount on key change, no hidden request waterfall)**

TanStack Query v5 hooks behave differently on loading, errors and key changes. Pick by access pattern, inside the domain query hook:

| Access pattern | Hook | Loading / errors |
| --- | --- | --- |
| One resource the screen needs to render (detail, form, dashboard) | `useSuspenseQuery` | suspends / throws (Suspense and error boundary required) |
| Paginated or infinite list | `useInfiniteQuery` | `isPending` / `isFetchingNextPage`, `data` undefined first |
| Data whose key changes while the component stays mounted (options of a select driven by another field, a filter above a table) | `useQuery` with `placeholderData: keepPreviousData` | `isPending` / `isPlaceholderData`; keeps the previous key's data while fetching |

**Incorrect (Suspense query whose key follows a form field):**

```tsx
export function useGetCityOptionsQuery(countryCode: string) {
  // every new countryCode suspends: the select unmounts and loses its state
  return useSuspenseQuery({
    queryKey: ['cities', countryCode],
    queryFn: () => fetchCityOptions(countryCode),
  })
}
```

**Correct (non-suspending query that keeps the previous options on screen):**

```tsx
import { keepPreviousData, useQuery } from '@tanstack/react-query'

export function useGetCityOptionsQuery(countryCode: string) {
  return useQuery({
    queryKey: ['cities', countryCode],
    queryFn: () => fetchCityOptions(countryCode),
    placeholderData: keepPreviousData,
  })
}

// caller: data is undefined at first, then the previous country's cities while isPlaceholderData
const { data: cities = [], isPlaceholderData } = useGetCityOptionsQuery(countryCode)
```

- Two `useSuspenseQuery` calls in the same component run one after the other (the first suspends before the second starts). Read independent resources in sibling components under the same boundary, or use `useSuspenseQueries`.
- `useQuery` does not throw: render its `error` yourself, and do not present placeholder data as the new key's result while `isPlaceholderData`.
- Use `useInfiniteQuery` with `getNextPageParam` for lists loaded by scroll or "load more" instead of page-number state.

See also: `vercel-react-best-practices` → `async-parallel`

### 2.8 Return the TanStack Result As-Is From API Hooks

**Impact: HIGH (keeps isPending, refetch and mutateAsync available to callers)**

A domain API hook returns the object produced by `useQuery` / `useSuspenseQuery` / `useMutation` unchanged. Never return only `mutateAsync`, never rename keys, never reshape `data`. Reshaping belongs in the Yup response schema or in a page-level hook; wrapping drops `isPending`, `isFetching`, `refetch`, `error` and `reset` that other consumers need. Callers destructure what they use.

**Incorrect (hook reshapes and hides the result):**

```tsx
export function useGetContractDetailQuery(contractId: string) {
  const { data } = useSuspenseQuery(contractDetailOptions(contractId))
  return { contract: data, productNames: data.products.map(product => product.name) }
}

export function useCloseOrder(orderId: string) {
  const { mutateAsync } = useMutation({ mutationFn: () => http.put(ENDPOINTS.orders.close(orderId)) })
  return mutateAsync // no isPending, no error, no reset
}
```

**Correct (pass through; callers destructure):**

```tsx
export function useGetContractDetailQuery(contractId: string) {
  return useSuspenseQuery({
    queryKey: ['contracts', contractId],
    queryFn: async () => {
      const { data } = await http.get(ENDPOINTS.contracts.detail(contractId))
      return CONTRACT_DETAIL_SCHEMA.validate(data, { stripUnknown: true })
    },
  })
}

export function useCloseOrder(orderId: string) {
  return useMutation<void, Error, void>({ /* mutationFn, onSuccess */ })
}

// Callers
const { data: contract } = useGetContractDetailQuery(contractId)
const { mutateAsync: closeOrder, isPending: isClosing } = useCloseOrder(orderId)
```

Flattening infinite pages into a single `items` array is done by the page-level hook or by `select`, not by renaming the result of the API hook.

### 2.9 Type API Hooks With the Domain Entity and Let the Return Type Infer

**Impact: HIGH (typed data everywhere without duplicated annotations)**

Make the domain entity (from `types/[entity].type.ts`) the data type of the query or mutation: type the `queryFn` result (or the generic of `useQuery<Entity>` / `useSuspenseQuery<Entity>` / `useMutation<Entity, Error, Input>`). Never leave the hook untyped, never type it with an inline object, and do not annotate the hook's return type: it is inferred from TanStack Query.

**Incorrect (inline shape, manual return annotation):**

```tsx
export function useGetProjectDetailQuery(
  projectId: string,
): UseSuspenseQueryResult<{ id: string; title: string }> {
  return useSuspenseQuery<{ id: string; title: string }>({
    queryKey: ['projects', projectId],
    queryFn: async () => (await http.get(ENDPOINTS.projects.detail(projectId))).data,
  })
}
```

**Correct (domain entity, inferred return):**

```tsx
import type { ProjectDetail } from '@/domains/projects/types/projectDetail.type'

export function useGetProjectDetailQuery(projectId: string) {
  return useSuspenseQuery<ProjectDetail>({
    queryKey: ['projects', projectId],
    queryFn: async () => {
      const { data } = await http.get(ENDPOINTS.projects.detail(projectId))
      return PROJECT_DETAIL_SCHEMA.validate(data, { stripUnknown: true })
    },
  })
}
```

Search the domain `types/` folder and `src/shared/` before creating a new type. Raw API shapes, if needed at all, stay private to the hook file (see `types-entity-vs-response` and `types-consume-entity`).

### 2.10 Use Optimistic Updates Only Where Latency Is Visible, With Rollback

**Impact: MEDIUM (instant feedback with automatic rollback, no stale or lost state)**

Reserve optimistic updates for interactions where latency is visible (toggle, pin, reorder). Implement the full TanStack Query cycle in the mutation hook: `onMutate` cancels in-flight queries for the key, snapshots the cache and writes the optimistic value; `onError` restores the snapshot; `onSettled` invalidates so the server state wins. Skipping `cancelQueries` lets a late refetch overwrite the optimistic value; skipping the rollback leaves a lie on screen.

**Incorrect (optimistic write without cancel, snapshot or rollback):**

```ts
export function useToggleProjectPinned(projectId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ pinned }: ToggleProjectPinnedInput) =>
      http.patch(ENDPOINTS.projects.pin(projectId), { pinned }),
    onMutate: ({ pinned }) => {
      queryClient.setQueryData(['projects', projectId], (project: Project) => ({ ...project, pinned }))
    },
  })
}
```

**Correct (cancel, snapshot, rollback, settle):**

```ts
export function useToggleProjectPinned(projectId: string) {
  const queryClient = useQueryClient()
  const queryKey = ['projects', projectId] // the exact cached key

  return useMutation<void, Error, ToggleProjectPinnedInput, { previous?: Project }>({
    mutationFn: async ({ pinned }) => {
      await http.patch(ENDPOINTS.projects.pin(projectId), { pinned })
    },
    onMutate: async ({ pinned }) => {
      await queryClient.cancelQueries({ queryKey })
      const previous = queryClient.getQueryData<Project>(queryKey)
      queryClient.setQueryData<Project>(queryKey, project => project && { ...project, pinned })
      return { previous }
    },
    onError: (_error, _input, context) => {
      if (context?.previous) queryClient.setQueryData(queryKey, context.previous)
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey }),
  })
}
```

- `queryKey` must be the exact key used by the read hook, including the params segment (`['projects', params]` for a list).
- Callers use the `useMutation` result as-is; user feedback stays in the calling action.

### 2.11 Use TData = void for Body-less or Response-less Mutations

**Impact: MEDIUM (avoids fake schemas and parse failures on empty bodies)**

When an endpoint returns nothing useful (204, empty body), type the mutation with `TData = void` and do not parse the response; the refreshed state comes from invalidating queries. When it takes no body, send none. Do not invent a placeholder schema: an empty body (`''`) fails `yup.object()` validation, and a fake schema validating nothing is noise.

**Incorrect (placeholder schemas for an action endpoint):**

```tsx
const EMPTY_REQUEST_SCHEMA = yup.object({})
const FAKE_RESPONSE_SCHEMA = yup.object({ id: yup.string().required() })

export function useCloseOrder(orderId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async () => {
      await EMPTY_REQUEST_SCHEMA.validate({})
      const { data } = await http.put(ENDPOINTS.orders.close(orderId))
      return FAKE_RESPONSE_SCHEMA.validate(data) // throws on an empty 204 body
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['orders'] }),
  })
}
```

**Correct (explicit void contract):**

```tsx
export function useCloseOrder(orderId: string) {
  const queryClient = useQueryClient()
  return useMutation<void, Error, void>({
    mutationFn: async () => {
      await http.put(ENDPOINTS.orders.close(orderId))
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['orders'] }), // prefix: list, count and detail
  })
}
```

When the endpoint takes a body but returns nothing, still validate the request with Yup and keep `TData = void` (see `api-use-transformation`).

### 2.12 Destructure Query Data With a Business Name

**Impact: LOW-MEDIUM (self-documenting call sites with several queries)**

At every call site, rename `data` to the entity it holds (`const { data: order } = ...`). Components often read two or three queries; a bare `data` (or `result.data.x`) hides which resource is used and collides as soon as a second query is added.

**Incorrect (generic `data`):**

```tsx
export function OrderSidebar({ orderId }: Props) {
  const { data } = useGetOrderDetailQuery(orderId)
  const result = useGetOrderHistoryQuery(orderId)

  return <h2>{data.customerName}</h2>
}
```

**Correct (named after the entity):**

```tsx
export function OrderSidebar({ orderId }: Props) {
  const { data: order } = useGetOrderDetailQuery(orderId)
  const { data: history } = useGetOrderHistoryQuery(orderId)
  // ...
}

const { data: documents } = useGetContractDocumentsQuery(contractId)
// Mutations: rename mutateAsync after the business verb
const { mutateAsync: closeOrder } = useCloseOrder(orderId)
```

Use the singular for one entity (`order`, `contract`) and the plural for collections (`documents`, `reminders`). Other fields (`isPending`, `refetch`) keep their names.

### 2.13 Name API Hooks After the Endpoint Intent

**Impact: LOW-MEDIUM (predictable, greppable hook and file names)**

Queries are `useGet<Entity>[Aspect]Query` (`useGetOrderDetailQuery`, `useGetProjectsQuery`, `useGetContractRemindersQuery`); plural entity for lists. Mutations are `use<Verb><Entity>[Aspect]` with the business verb of the endpoint (`useAddInternalComment`, `useDeleteReminder`, `usePublishProject`, `useValidateOrderPayment`). One hook per file, file named after the hook, in `apis/queries/` or `apis/mutations/`.

**Incorrect (generic or technical names):**

```text
apis/queries/order.ts               → export function useOrder(id)
apis/queries/useFetchProjects.ts    → export function useProjectsList(params)
apis/mutations/useOrderPut.ts       → export function useOrderPut()
apis/mutations/actions.ts           → several mutation hooks in one file
```

**Correct (intent in the name, one hook per file):**

```text
apis/queries/useGetOrderDetailQuery.ts        → useGetOrderDetailQuery(orderId)
apis/queries/useGetProjectsQuery.ts           → useGetProjectsQuery(params)
apis/mutations/useCloseOrder.ts               → useCloseOrder(orderId)
apis/mutations/useUpdateInternalComment.ts    → useUpdateInternalComment(contractId)
```

Hooks that orchestrate several API hooks for a page drop the `Query` suffix (`useGetProjects`), which distinguishes them from the pure domain query. The same "file = export" rule applies to helpers (`useFormatOrderStatus.ts`, not `useFormatStatus.ts`).

---

## 3. Security

**Impact: CRITICAL**

Session isolation, protected file access and safe external navigation. Mistakes here leak data across users or expose the authenticated tab.

### 3.1 Clear the Query Cache on Logout

**Impact: CRITICAL (prevents cross-user data leaks in the same tab)**

Logout implies `queryClient.clear()`. The `QueryClient` lives for the whole page session and survives an SPA logout: the next user of the tab would see the previous user's cached data until it refetches. Resetting the session or user atoms does not touch the cache, so every logout path (user action, idle timeout, 401 or refresh failure) must clear it. Jotai stores holding user data must be reset too.

**Incorrect (session reset, server cache kept):**

```tsx
const { logout } = useLogout()
return <button onClick={logout}>{t('common.logOut')}</button>
```

**Correct (each logout path clears the cache once the session is reset):**

```tsx
// Components under <QueryClientProvider>
const { logout } = useLogout()
const queryClient = useQueryClient()
const logoutAndClearCache = useCallback(async () => {
  await logout()
  queryClient.clear()
}, [logout, queryClient])

// Module where the client is created (401 or refresh failure): the instance is in scope
export const queryClient = new QueryClient()
await logout()
queryClient.clear()
```

Clear once `logout()` has resolved. Better still, centralize it: export the client from a dedicated module and clear it inside the logout hook, so no call site can forget it. Avoid importing the client from a provider file that already imports the logout hook, which would create a cycle.

### 3.2 Open External Links with noopener and noreferrer

**Impact: HIGH (prevents reverse tabnabbing from external CRM, BI and storage URLs)**

A tab opened with `window.open(url, '_blank')` gets a `window.opener` handle back to the app, so the opened page can redirect the authenticated tab (reverse tabnabbing). It also receives the app URL as its referrer. For an absolute external URL, always pass `'noopener,noreferrer'`. In JSX, prefer a link component that always renders `rel="noopener noreferrer"`; for a raw `<a>`, set `rel` explicitly.

**Incorrect (opener and referrer leaked):**

```tsx
const openCrmOpportunity = (opportunityId: string) => {
  window.open(`${CRM_URL}/opportunities/${opportunityId}`, '_blank')
}
```

**Correct (isolated tab, or a link that sets rel):**

```tsx
const openCrmOpportunity = (opportunityId: string) => {
  window.open(`${CRM_URL}/opportunities/${opportunityId}`, '_blank', 'noopener,noreferrer')
}

<a href={`${CRM_URL}/opportunities/${crmId}`} target="_blank" rel="noopener noreferrer">
  {t('opportunity.action.openInCrm')}
</a>
```

This rule covers absolute external URLs only. A backend file path that needs the bearer token is never opened with `window.open` or a native link (see `security-authorized-file-access`). The authorized-open primitive may pre-open a blank same-origin tab because it must write the file URL into the returned `Window`, which `noopener` would turn into `null`. Do not copy this exception for external URLs.

### 3.3 Read Protected Files Only Through the Authorized File Primitive

**Impact: HIGH (protected files load with the bearer token instead of failing or bypassing auth)**

When the backend exposes files as relative protected routes that need a bearer token, a native navigation (`window.open(url)`, `<a href>`, `<iframe src>`, `<img src>`) resolves them against the frontend origin without the `Authorization` header, so they fail or tempt a workaround that bypasses auth. Open, preview and download them through one authenticated primitive of the app: fetch the file with the authenticated axios client (`responseType: 'blob'`), then work on the resulting blob or object URL. Domain code never builds its own fetch for a file.

| Need | Primitive built on the authenticated fetch |
| --- | --- |
| Preview an image or PDF | `useAuthorizedFileUrl(fileUrl)` returns `{ objectUrl, isLoading, error }` |
| Open in a new tab on click | `useOpenAuthorizedFile()` returns `(fileUrl) => Promise<void>` |
| Download one file | `downloadFile(fileUrl, { filename })` |

**Incorrect (relative backend route opened natively, no bearer):**

```tsx
<button onClick={() => window.open(attachment.fileUrl, '_blank')}>{attachment.fileName}</button>
<img src={attachment.previewUrl} alt={attachment.fileName} />
```

**Correct (single fetch-to-blob primitive, object URL revoked by its owner):**

```tsx
// shared/helpers/authorizedFile.ts
export const fetchAuthorizedBlob = async (fileUrl: string): Promise<Blob> => {
  const { data } = await apiClient.get<Blob>(fileUrl, { responseType: 'blob' })
  return data
}

export function useAuthorizedFileUrl(fileUrl: string) {
  const query = useQuery({
    queryKey: ['authorized-file', fileUrl],
    queryFn: () => fetchAuthorizedBlob(fileUrl),
  })
  const objectUrl = useMemo(() => (query.data ? URL.createObjectURL(query.data) : null), [query.data])
  useEffect(() => () => { if (objectUrl) URL.revokeObjectURL(objectUrl) }, [objectUrl])
  return { objectUrl, isLoading: query.isLoading, error: query.error }
}

// consumer
const { objectUrl } = useAuthorizedFileUrl(attachment.previewUrl)
return objectUrl && <img src={objectUrl} alt={attachment.fileName} />
```

- Never add a `window.open(relativeUrl)` fallback, even in a `catch`. Absolute `http(s)` URLs, including intentional external links, keep the native behavior (see `security-window-open-noopener`).
- The code that creates an object URL revokes it (on source change or unmount); never revoke a URL received from a caller.
- Open the new tab synchronously in the click handler, then set its location once the blob is ready, so popup blockers do not interfere.

---

## 4. Query Keys & Cache

**Impact: HIGH**

One query key convention per domain and precise invalidation avoid stale screens after mutations.

### 4.1 Invalidate Exactly What the Mutation Affects

**Impact: HIGH (no stale screens, no wasted refetches)**

The `queryClient.invalidateQueries` calls of a mutation are a business decision: invalidate the keys whose backend data actually changes, no more (a blanket `['contracts']` refetches every list, detail and thread in cache) and no less (a missing key leaves a screen stale). Write the rationale in a comment when it is not obvious from the hook name, especially for backend side effects (cascades, recomputed statuses, counts).

**Incorrect (blanket invalidation picked from the hook name):**

```ts
export function useUpdateReminder() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ reminderId, ...body }: UpdateReminderInput) =>
      http.put(ENDPOINTS.contracts.modifyReminder(reminderId), body),
    // also refetches the list, every other detail, comments…
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['contracts'] }),
  })
}
```

**Correct (scoped key, rationale next to it):**

```ts
export function useAddContractReminder(contractId: string) {
  const queryClient = useQueryClient()
  return useMutation<ContractReminder, Error, AddReminderInput>({
    mutationFn: async input => {
      const body = await PAYLOAD_SCHEMA.validate(input, { stripUnknown: true })
      const { data } = await http.post(ENDPOINTS.contracts.reminders(contractId), body)
      return REMINDER_SCHEMA.validate(data, { stripUnknown: true })
    },
    // The backend recomputes the contract's next reminder date: refresh this contract
    // (detail + its reminders by prefix), not the list nor the other contracts.
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['contracts', contractId] }),
  })
}
```

Prefix matching does the rest: `['contracts', contractId]` already covers `['contracts', contractId, 'reminders']` (see `cache-one-key-convention`). Use the domain-wide key only when the mutation really changes the whole domain, e.g. a publish mutation that changes lists, details and counts at once: `['contracts']`. Return the promise from `onSuccess` so the mutation stays pending until the refetch finishes.

### 4.2 Use One Query Key Convention per Domain

**Impact: HIGH (makes every invalidation predictable from the keys)**

`queryClient.invalidateQueries({ queryKey })` matches keys by **array prefix**, element by element, never by string prefix. So every key of a domain starts with the domain name and follows one shape:

- list `['<domain>', params]`, count `['<domain>', 'count']`;
- detail `['<domain>', id]`, with no `'detail'` segment;
- sub-resource `['<domain>', id, '<sub>']`, so invalidating `['<domain>', id]` refreshes the item **and** its sub-resources.

A hyphenated key (`['orders-count']`) has another first element: `['orders']` never reaches it and it stays stale until `staleTime` expires or a remount. When the id is only known at call time, derive the key from the mutation variables: `onSuccess: (_data, { orderId }) => queryClient.invalidateQueries({ queryKey: ['orders', orderId] })`.

**Incorrect (three shapes in one domain, invalidations silently miss keys):**

```ts
['orders', params]              // list
['orders-count']                // isolated by a string: not under ['orders']
['orders', 'accesses', orderId] // sub-resource before the id: not under ['orders', orderId]

invalidateQueries({ queryKey: ['orders'] })          // does not refresh ['orders-count']
invalidateQueries({ queryKey: ['orders', orderId] }) // does not refresh the accesses
```

**Correct (shared first segment, sub-resources extend the item key):**

```ts
['orders', params]              // list
['orders', 'count']             // count
['orders', orderId]             // detail
['orders', orderId, 'accesses'] // sub-resource

export function useUpdateOrder() {
  const queryClient = useQueryClient()
  return useMutation<void, Error, UpdateOrderInput>({
    mutationFn: ({ orderId, ...body }) => http.put(ENDPOINTS.orders.update(orderId), body),
    // the item and its accesses
    onSuccess: (_data, { orderId }) => queryClient.invalidateQueries({ queryKey: ['orders', orderId] }),
  })
}
```

Never mix two shapes for the same resource (`['<domain>', '<sub>', id]` and `['<domain>', id, '<sub>']`): when you touch one, migrate every key and invalidation of that resource together. Keep an isolated namespace only when the query's lifecycle is fully disjoint from the domain; comment why above the query and list it explicitly in every mutation that affects it.

---

## 5. Domain Types

**Impact: HIGH**

Strict domain entities (real dates, literal unions, explicit nullability) decouple the UI from the raw API shape and remove defensive code downstream.

### 5.1 Consume Domain Entities, Never Redefine Them Locally

**Impact: HIGH (keeps one source of truth per entity shape)**

Helpers, hooks, services and component props import the entity exported from the domain `types/`. Never declare a local structural copy (`type Address = {...}`, an inline `{ uuid: string; file: ... }`): it drifts silently when the entity changes and duplicates the nullability decisions the entity already made. To narrow a dependency, derive it with `Pick<Entity, ...>`.

Before you create a type, search where it would already live, and put a new one at the narrowest level that fits:

- the domain `types/` folder, for anything owned by one sub-domain;
- `domains/[domain]/shared/types/` (e.g. `sales/shared/types/sales.type.ts` with `GlobalStatus`), for a type shared by sibling sub-domains;
- `src/shared/types/`, only for a type no business domain owns and that carries no domain vocabulary.

**Incorrect (helper redeclares the entity shape):**

```typescript
// domains/sales/orders/pages/detail/helpers/toOrderDocumentFile.ts
type OrderDocument = {
  uuid: string
  file?: { uuid: string; url: string; name: string }
  customerComment?: string
}

export function toOrderDocumentFile(item: OrderDocument, label: string) { /* ... */ }
```

**Correct (import the entity; Pick when only a slice is needed):**

```typescript
import type { DocumentFile } from '@/domains/documents/types/document.type'
import type { OrderDocument } from '@/domains/sales/orders/types/orderDocument.type'

export function toOrderDocumentFile(
  item: Pick<OrderDocument, 'uuid' | 'file' | 'customerComment'>,
  label: string,
): DocumentFile | null {
  if (!item.file) return null
  return { uuid: item.uuid, label, comment: item.customerComment, file: item.file }
}
```

When a near-generic shape really differs from the shared one (the order API returns `street1/street2` while the shared `Address` uses `line1/line2`), declare a domain type (`OrderAddress`) with a comment saying why; do not bend the shared type.

### 5.2 Make Nullability Explicit and Justified

**Impact: HIGH (removes defensive code and surfaces backend laxity early)**

Use `| null` when a field is always present but can be null. Use `?` when the field can be missing. Use neither when the domain guarantees a value, and never combine them (`?: T | null`). For each nullable field, check that the business can really have no value, and leave a short comment saying why. If you cannot tell, ask in refinement rather than coding defensively. Default fields like lists in the Yup schema (`.default([])`) so that consumers never need `?? []`.

**Incorrect (lax optionals copied from the API, fallbacks at every use):**

```typescript
export type Order = {
  uuid: string
  deliveryDate?: Date | null
  lines?: OrderLine[] | null
  owners?: Contact[]
}

const total = (order.lines ?? []).length
const names = (order.owners ?? []).map(formatContact)
```

**Correct (guaranteed fields required, each nullable has a reason):**

```typescript
export type Opportunity = {
  uuid: string
  // Backend FK is `null=True`: opportunities created before the CRM link have no account.
  account: OpportunityAccount | null
  creationDate: Date | null
}

export type Order = {
  uuid: string
  deliveryDate: Date | null
  lines: OrderLine[] // schema: .transform(v => v ?? []).default([])
  owners: Contact[]
}

const total = order.lines.length
```

### 5.3 Separate the Domain Entity from the API Response

**Impact: HIGH (decouples the whole UI from the raw backend shape)**

Export only the strict domain `Entity` from `types/[entity].type.ts`. The raw API shape (ISO strings, free strings, lax optionals) lives only in the query hook file: as its Yup schema or as a private `XxxResponse` type that is never exported. The hook's response schema is the single place where the response becomes an Entity. Components, helpers and other hooks never see the raw JSON, so a backend change touches one file.

**Incorrect (one exported type mixes API and domain shapes, consumers re-coerce):**

```tsx
// domains/sales/opportunities/types/opportunity.type.ts
export type OpportunityResponse = {
  uuid: string
  creationDate?: string // raw ISO string leaks to every consumer
}

// a component, far from the API
const created = opportunity.creationDate ? new Date(opportunity.creationDate) : null
```

**Correct (strict Entity exported, raw shape private to the hook):**

```typescript
// domains/sales/opportunities/types/opportunity.type.ts
export type Opportunity = {
  uuid: string
  opportunityCrmId: string
  account: OpportunityAccount | null
  status: string // display-only taxonomy owned by the API, shown as a badge
  creationDate: Date | null
}

// domains/sales/opportunities/apis/queries/useGetOpportunitiesQuery.ts
const ITEM_SCHEMA: yup.ObjectSchema<Opportunity> = yup.object({
  uuid: yup.string().required(),
  opportunityCrmId: yup.string().ensure(),
  account: ACCOUNT_SCHEMA.nullable().default(null),
  status: yup.string().ensure(), // tolerant: no logic branches on it
  creationDate: yup.date().nullable().default(null), // ISO string → Date, only here
})
```

If a second place needs the same raw data, write or reuse a hook that returns the Entity. Never export the Response type so another file can parse it again. When code branches on a field such as `status`, type it as a union instead (see `types-closed-values-not-string`). A `XxxListResponse` that already holds parsed Entities (`items: Order[]`) is a domain page type, not a raw Response.

### 5.4 Type Closed Value Sets as Unions, Not String

**Impact: HIGH (makes status-driven logic exhaustive and type-checked)**

When a field holds one of a known set of values, such as a status, kind or customer type, and that value drives logic (permissions, actions, visible sections, filters), type it as a literal union or an existing domain type, never `string` or `string[]`. The Yup schema is the last place where a `string` may become the union. Every consumer after it gets the strict type, so typos and missing cases fail to compile.

**Incorrect (free string on a status that drives actions):**

```typescript
// domains/sales/orders/types/orderDetail.type.ts
export type PaymentSection = {
  status: string
  isSignatureBypassed: boolean
}

// a typo compiles and silently hides the action
const canValidate = payment.status === 'FORM_TO_REVEIW'
```

**Correct (union from the domain, narrowed once in Yup):**

```typescript
// domains/sales/orders/types/orderDetail.type.ts
export const ALL_PAYMENT_STATUSES = ['DRAFT', 'FORM_TO_REVIEW', 'PAID'] as const
export type PaymentStatus = (typeof ALL_PAYMENT_STATUSES)[number]

export type PaymentSection = {
  status: PaymentStatus
  isSignatureBypassed: boolean
}

// domains/sales/orders/apis/queries/useGetOrderDetailQuery.ts
status: yup.string<PaymentStatus>().oneOf(ALL_PAYMENT_STATUSES).required(),
```

Exception: a display-only taxonomy owned by the API (for example a project `status` that is only shown as a badge) may stay `string`. In that case, parse it with a tolerant `yup.string()` and display it through a mapper with a fallback (see `yup-no-oneof-on-display-enums`). As soon as code branches on the value, switch to a union.

### 5.5 Type Domain Dates as Date and Convert Them in Yup

**Impact: HIGH (removes ad-hoc date parsing from components and helpers)**

In a domain type, a date is `Date`, or `Date | null` when it can be empty, never an ISO `string`. ISO strings exist only on the wire, and both conversions live in the hook's Yup schemas:

- response: `yup.date().nullable().default(null)` turns the ISO string into a `Date`;
- request: a `transform` on the request schema turns a `Date` back into a **date-only** `YYYY-MM-DD` string, and an empty value into `undefined`.

Formatters and sorting then work on real dates, and nobody calls `new Date(str)` or `.toISOString().split('T')[0]` in a component or a page hook.

**Incorrect (ISO string in the entity, parsing scattered in consumers):**

```tsx
// domains/projects/types/projectListItem.type.ts
export type ProjectListItem = {
  uuid: string
  publishedOn: string | null
}

// a cell component
const date = item.publishedOn ? new Date(item.publishedOn) : null
```

**Correct (Date in the entity, conversions in the hook's schemas):**

```typescript
// domains/projects/types/projectListItem.type.ts
export type ProjectListItem = {
  uuid: string
  publishedOn: Date | null
}

// domains/projects/apis/queries/useGetProjectsQuery.ts
const LIST_ITEM_SCHEMA = yup.object({
  uuid: yup.string().required(),
  publishedOn: yup.date().nullable().default(null), // ISO string → Date | null
})

const toDateOnly = (value: Date | null | undefined) =>
  value ? value.toISOString().slice(0, 10) : undefined

const REQUEST_SCHEMA = yup.object({
  publishedOnStart: yup.date().optional().transform(toDateOnly), // Date → '2025-01-15'
})
```

Define the date-only conversion once in a shared Yup helper rather than per hook. The page hook passes `Date` filter values straight into the query params. A date-only conversion drops the time part: when an endpoint needs a full timestamp, serialize it explicitly in that mutation's request schema. Mocks use fixed dates (`new Date('2025-01-15T10:00:00Z')`), never `new Date()` with no argument, so tests stay reproducible.

### 5.6 Use Literal Unions, Never TypeScript Enums

**Impact: HIGH (keeps types erasable and API values directly assignable)**

Model a finite set of values as a string literal union. When you need to iterate over it (Yup `.oneOf`, filter options, tests), add an `ALL_[X]S` array typed with that union. Do not add a TypeScript `enum`. A union matches the raw API strings without casts, makes `Record<Union, T>` mappers exhaustive, and leaves nothing in the bundle. Enforce it with review or a lint rule such as `no-restricted-syntax` on `TSEnumDeclaration`.

**Incorrect (enum, values must be imported and cast everywhere):**

```typescript
// domains/contracts/types/statuses.type.ts
export enum ContractStatus {
  DRAFT = 'DRAFT',
  ONGOING = 'ONGOING',
  CANCELLED = 'CANCELLED',
}

const isDraft = contract.status === ContractStatus.DRAFT
```

**Correct (literal union plus an `ALL_` array for runtime use):**

```typescript
// domains/contracts/types/statuses.type.ts (excerpt)
export type ContractStatus = 'DRAFT' | 'WAITING_FOR_REVIEW' | 'ONGOING' | 'CLOSED' | 'CANCELLED'

export const ALL_CONTRACT_STATUSES: ContractStatus[] = [
  'DRAFT',
  'WAITING_FOR_REVIEW',
  'ONGOING',
  'CLOSED',
  'CANCELLED',
]

const isDraft = contract.status === 'DRAFT'
```

### 5.7 Compose Transverse Types, Reference Foreign Entities by ID

**Impact: MEDIUM (avoids duplicated shapes and cross-domain coupling)**

Reuse the types of transverse domains (e.g. `documents`) and of the app-wide shared types directly: import them, extend them with `&`, or nest them as a field. Do not copy their fields. Never import an entity from a non-transverse or sibling sub-domain. Reference it by its id (`invoiceUuid: string`) instead. Duplicate a shape only when it really differs or will evolve on its own, and say why in a comment.

**Incorrect (copies a transverse shape and imports a sibling entity):**

```typescript
// domains/sales/orders/types/orderRejection.type.ts
import type { Invoice } from '@/domains/sales/invoices/types/invoice.type'

export type OrderRejection = {
  uuid: string
  userName: string
  createdAt: Date
  comment: string // same fields as the documents domain's RejectionHistories
  antivirusStatus?: 'NOT_RUN' | 'ERROR' | 'VIRUS_FREE' // re-typed AntivirusStatus
  relatedInvoice: Invoice // couples orders to invoices
}
```

**Correct (compose the transverse type, link the foreign entity by id):**

```typescript
import type { AntivirusStatus, RejectionHistories } from '@/domains/documents/types/document.type'

export type OrderRejection = RejectionHistories & {
  antivirusStatus?: AntivirusStatus
  relatedInvoiceUuid: string | null
}
```

A justified duplicate is fine. For example, an `OrderAddress` type can exist because the order API returns `street1/street2`, while the shared `Address` uses `line1/line2`; a comment on the type explains this. To show a domain object in a transverse component, map it to the transverse type in a helper (`toOrderDocumentFile` → `DocumentFile`). Compose and import types from a transverse domain, but keep your own types one entity per file (see `types-file-per-entity`).

### 5.8 One Type File per Entity with Predictable Names

**Impact: MEDIUM (makes every entity and its variants easy to locate)**

Give each main entity its own `types/[entity].type.ts` file, named in singular camelCase. Its statuses can live in a shared `statuses.type.ts`. Declare types with `type` aliases, not `interface`. Name the variants after the entity (`Entity`, `EntityStatus`, `EntityFilters`, `[Action]EntityPayload`) so that a type is found from its name alone and grep returns one definition.

Where each variant lives:

- **Filters** live next to the store that uses them: `types/[entity]Filters.type.ts` for a domain store, `pages/[page]/types/[entity]Filters.type.ts` for a page store.
- **Payloads** stay private in the mutation hook file. Move one to `types/[action][Entity]Payload.type.ts` only when several mutations share it.
- Sub-shapes that only exist inside an entity (`InvoiceRecipient`, `PaymentSection`) stay in that entity's file.

**Incorrect (catch-all file, plural name, interfaces, ad-hoc names):**

```typescript
// domains/sales/invoices/types/types.ts
export interface Invoices {
  uuid: string
  globalStatus: string
}
export interface ListParams { /* ... */ }
export interface Body { /* ... */ }
```

**Correct (one file per entity, type aliases, entity-prefixed names):**

```typescript
// domains/sales/invoices/types/invoice.type.ts
export type Invoice = {
  uuid: string
  globalStatus: GlobalStatus
  createdAt: Date
}

// domains/contracts/types/statuses.type.ts (excerpt)
export type ContractStatus = 'DRAFT' | 'WAITING_FOR_REVIEW' | 'ONGOING' | 'CLOSED' | 'CANCELLED'

// domains/sales/invoices/pages/list/types/invoiceFilters.type.ts
export type InvoiceFilters = { /* ... */ }
```

### 5.9 Type Amounts as number and Format Them at Display Time

**Impact: MEDIUM (keeps amounts computable and rendered by a single set of formatters)**

An amount is a `number` in the domain entity (`number | null` when it can be missing), with its currency in a separate field. It is never a `string`, whether a raw decimal (`'1250.50'`, which a decimal API field often sends) or an already formatted label (`'1,250.50 €'`). The response schema coerces it once with `yup.number()`, and formatting happens only at display time. Currency components built on `Intl.NumberFormat` typically only format values whose `typeof` is `'number'`, and render a string amount as empty or `-`.

**Incorrect (string amount, formatted by hand):**

```tsx
// domains/sales/orders/types/order.type.ts
export type Order = {
  uuid: string
  amount: string // '1250.50' from the API
  currency: string
}

// component: parses, formats and concatenates locally
<span>{`${Number(order.amount).toFixed(2)} ${order.currency}`}</span>
```

**Correct (number in the entity, one formatter for display):**

```tsx
// domains/sales/orders/types/order.type.ts
export type Order = {
  uuid: string
  amount: number
  currency: string
}

// domains/sales/orders/apis/queries/useGetOrderDetailQuery.ts
amount: yup.number().required(), // '1250.50' → 1250.5

// domains/sales/helpers/useFormatMoney.ts
export const useFormatMoney = () => {
  const { i18n } = useTranslation()
  return useCallback(
    (amount: number, currency: string) =>
      new Intl.NumberFormat(i18n.language, { style: 'currency', currency }).format(amount),
    [i18n.language],
  )
}

// anywhere (cell, KPI, sentence)
const formatMoney = useFormatMoney()
const label = formatMoney(order.amount, order.currency)
```

Totals and comparisons are computed on the numbers (`lines.reduce((sum, line) => sum + line.amount, 0)`), never on labels. Do not build a local money formatter per component: extend the shared formatter hook when a new format is needed (see `helpers-formatter-hooks`).

### 5.10 No any or Overly Wide Types in Domain Code

**Impact: LOW-MEDIUM (keeps type errors visible instead of silencing them)**

Do not write `any`, `any[]`, `Record<string, any>` or `object` in domain types, hooks or helpers: a lint rule that only warns on `no-explicit-any` is not enough, so reviews must enforce it. Raw API data is `unknown` and becomes a domain type through a Yup schema; other untyped values (a caught error, a storage read) are narrowed with type guards or `instanceof`. `Record<string, unknown>` is fine as a generic constraint.

**Incorrect (wide types switch off checking downstream):**

```typescript
export type ContractDocument = {
  uuid: string
  metadata: Record<string, any>
  file: object
}

const parseItems = (data: any) => data.items
```

**Correct (dedicated types, `unknown` narrowed by a schema):**

```typescript
export type ContractDocument = {
  uuid: string
  name: string
  productUuids: string[]
  url: string
}

const RESPONSE_SCHEMA: yup.ObjectSchema<ContractDocumentList> = yup.object({
  items: yup.array().of(DOCUMENT_SCHEMA.required()).default([]).required(),
})

export function useGetContractDocumentsQuery(contractUuid: string) {
  return useSuspenseQuery({
    queryKey: ['contracts', contractUuid, 'documents'],
    queryFn: async () => {
      const { data } = await axios.get<unknown>(ENDPOINTS.contracts.documents(contractUuid))
      return RESPONSE_SCHEMA.validateSync(data) // unknown → ContractDocumentList
    },
  })
}

export const convertToFormData = <T extends Record<string, unknown>>(data: T): FormData => {
  /* ... */
}
```

Test files may relax `no-explicit-any`, but prefer real domain types and mocks there too.

### 5.11 No Fallback After a Record Lookup on a Union Key

**Impact: LOW-MEDIUM (removes dead code that hides overly wide input types)**

`Record<Union, T>` already forces a value for every member of the union. A `?? fallback` after `map[key]` with a correctly typed key can never run, and it hides that the key type is too wide. Trust the type. If values outside the union really reach the code, state that explicitly: take the raw `string` and narrow it with a type guard, or add `| 'UNKNOWN'` to the union and handle it as a normal case.

**Incorrect (unreachable fallback on a typed key):**

```typescript
const STATUS_BADGE_TYPE: Record<ContractStatus, BadgeType> = {
  DRAFT: 'neutral',
  ONGOING: 'info',
  // ...
}

export const getContractStatusBadgeType = (status: ContractStatus) =>
  STATUS_BADGE_TYPE[status] ?? 'neutral'
```

**Correct (rely on exhaustiveness; narrow raw strings explicitly):**

```typescript
type BadgeType = 'neutral' | 'info' | 'success' | 'danger'

export const getContractStatusBadgeType = (status: ContractStatus): BadgeType =>
  STATUS_BADGE_TYPE[status]

// The API may send a value outside the union: accept a string and narrow it
const isContractStatus = (value: string): value is ContractStatus =>
  Object.hasOwn(STATUS_BADGE_TYPE, value)

const badgeType = isContractStatus(status)
  ? getContractStatusBadgeType(status)
  : 'neutral'
```

Exception: a display-only taxonomy that the API owns can be typed as `string` at the mapper boundary, with a deliberate fallback that has a comment (for example a `getEmailStatusBadge` mapper). Keep the input typed `string` there, so the fallback is reachable and its intent is visible.

---

## 6. Yup Schemas

**Impact: HIGH**

Yup schemas are the single coercion barrier between the API and the domain, and the source of translated form validation. They must be tolerant where data is legacy and strict where logic depends on it.

### 6.1 Do Not Use oneOf on Display-Only API Enums

**Impact: HIGH (a new backend value must not break the screen)**

When the API owns a taxonomy that is only displayed (badge, label, colour), parse it as `yup.string()` and map it with a helper that falls back for unknown values. A strict `.oneOf` fails validation as soon as the backend adds a value, which breaks the whole query. Reserve `.oneOf` (typed literal unions) for values that drive logic such as permissions, branching or form submission.

**Incorrect (strict enum on a display field):**

```tsx
const EMAIL_TRACKING_SCHEMA = yup.object({
  uuid: yup.string().required(),
  status: yup.string().oneOf(ALL_CONTRACT_EMAIL_STATUSES).required(),
})
```

**Correct (tolerant string + mapper with fallback):**

```tsx
const EMAIL_TRACKING_SCHEMA = yup.object({
  uuid: yup.string().required(),
  status: yup.string().required(), // API owns this taxonomy
})

// helpers/mappers/getEmailStatusBadge.ts
const STATUS_BADGE: Record<ContractEmailStatus, EmailStatusBadge> = { /* SENT, OPENED… */ }
const UNKNOWN_STATUS_BADGE: EmailStatusBadge = { type: 'neutral', i18nKey: null }

const isKnownEmailStatus = (status: string): status is ContractEmailStatus =>
  Object.hasOwn(STATUS_BADGE, status)

export const getEmailStatusBadge = (status: string): EmailStatusBadge =>
  isKnownEmailStatus(status) ? STATUS_BADGE[status] : UNKNOWN_STATUS_BADGE
```

Logic-driving enums keep `.oneOf` with the domain union, e.g. `billingMethod: yup.string<ContractBillingMethod>().oneOf(ALL_CONTRACT_BILLING_METHODS)`. The entity types the display field as `string`, not as the union, and the mapper narrows it with a type guard rather than a cast.

See also: `types-closed-values-not-string`

### 6.2 Make Yup the Last Coercion Point

**Impact: HIGH (removes defensive parsing and truthy-string bugs downstream)**

All conversion of raw API values (string → number/boolean/Date, `null` → default, `'YES'` → `true`, empty string → `null`) happens once in the hook's response schema. Downstream code receives strict entity types and never re-coerces with `Number(...)`, `=== 'true'`, `new Date(...)` or `?? ''`. If a consumer needs a fallback, the schema or the entity type is wrong.

Textual booleans are the classic trap: when the domain meaning is yes/no, the entity field is `boolean`, never `string` nor `'YES' | 'NO'`. A non-empty string such as `'NO'` is truthy, so any `if (value)` on it is a silent bug.

**Incorrect (raw values leak, every consumer re-parses):**

```tsx
const LIST_ITEM_SCHEMA = yup.object({
  uuid: yup.string().required(),
  hasVatNumber: yup.string(), // 'YES' | 'NO' | 'true' | 'false'
  numberOfDocuments: yup.mixed(),
})

// component
const hasVat = item.hasVatNumber === 'YES' || item.hasVatNumber === 'true'
const count = Number(item.numberOfDocuments ?? 0)
```

**Correct (coerced once, consumed as-is):**

```tsx
const LIST_ITEM_SCHEMA = yup.object({
  uuid: yup.string().required(),
  publishedOn: yup.date().nullable().default(null),
  numberOfDocuments: yup.number().default(0).required(),
  hasVatNumber: yup
    .boolean()
    .transform((_value, original) => original === true || original === 'true' || original === 'YES')
    .required(),
})

// component
<span>{item.numberOfDocuments}</span>
{item.hasVatNumber && <VatNumberField />}
```

Normalize other API quirks in the schema with `.transform()` too (e.g. `value === '' ? null : value` before `.oneOf`). Two exceptions keep a union instead of a boolean: a yes/no value that is an API filter option sent back as-is (`HasVatNumber = 'YES' | 'NO'` in filter payloads), and answers with more than two choices (`'YES' | 'NO' | 'ABSTAINS'`). Both are still normalized in the schema, never typed `string`.

### 6.3 Never Cast Yup Output to the Entity

**Impact: HIGH (schema drift becomes a compile error instead of a runtime bug)**

Yup infers the output type from the schema, so the result of `validateSync` is already typed. Writing `RESPONSE_SCHEMA.validateSync(data) as ProjectListPage` silences TypeScript: a missing or mistyped field in the schema still compiles and surfaces as `undefined` in the UI. Tie the schema to the entity instead, and let the compiler compare them. Do not `as`-cast the output of schema validation; only `as const` is fine.

**Incorrect (cast hides a schema that no longer matches the entity):**

```tsx
const RESPONSE_SCHEMA = yup.object({
  items: yup.array().of(LIST_ITEM_SCHEMA.required()).default([]).required(),
  // metadata forgotten
})

queryFn: async () => RESPONSE_SCHEMA.validateSync(await fetchProjects()) as ProjectListPage, // compiles anyway
```

**Correct (schema typed against the entity, no cast):**

```tsx
const RESPONSE_SCHEMA: yup.ObjectSchema<ProjectDetail> = yup.object({
  uuid: yup.string().required(),
  title: yup.string().ensure(),
  startDate: yup.date().nullable().default(null),
  // ...a missing or wrongly typed field is a TS error here
})

export function useGetProjectDetailQuery(uuid: string) {
  return useSuspenseQuery({
    queryKey: ['projects', uuid],
    queryFn: async (): Promise<ProjectDetail> => {
      const { data } = await axios.get<unknown>(ENDPOINTS.projects.detail(uuid))
      return RESPONSE_SCHEMA.validateSync(data)
    },
  })
}
```

When the schema cannot be annotated (a generic schema builder, a schema reused for several entities), check the output where it is produced, without `as`:

- assign through an annotation, `const page: ProjectListPage = RESPONSE_SCHEMA.validateSync(data)`, or use `satisfies ProjectListPage` on an object literal;
- or type the `queryFn` return (`Promise<ProjectListPage>`), so the validated value must be assignable to it.

### 6.4 Write Tolerant Response Schemas

**Impact: HIGH (one null field must not crash a Suspense page)**

A response schema that validates strictly throws inside `queryFn` on a single failing field, and takes the whole Suspense boundary down. Mark only identifiers and fields the logic truly depends on as `.required()`. Default display strings with `.ensure()` (`null` → `''`), optional values with `.nullable().default(null)`, and arrays with `.transform(value => value ?? []).default([])`. A bare `.optional()` rejects an explicit `null`: use `.nullable()` or a transform that maps `null` to `undefined`.

**Incorrect (strict everywhere, `null` from legacy rows breaks the page):**

```tsx
const LIST_ITEM_SCHEMA = yup.object({
  uuid: yup.string().required(),
  title: yup.string().required(),
  publicationDate: yup.date().optional(), // throws on null
  products: yup.array().of(PRODUCT_SCHEMA.required()).required(), // throws on null
})
```

**Correct (strict on identity, tolerant on the rest):**

```tsx
const nullToUndefined = <T,>(value: T | null) => value ?? undefined

const LIST_ITEM_SCHEMA = yup.object({
  uuid: yup.string().required(),
  title: yup.string().ensure(),
  publicationDate: yup.date().nullable().default(null),
  label: yup.string().transform(nullToUndefined).optional(),
  products: yup
    .array()
    .of(PRODUCT_SCHEMA.required())
    .transform(value => value ?? [])
    .default([])
    .required(),
})
```

Calibrate against a real payload, and add a short comment when a field is deliberately tolerant.

See also: `types-explicit-nullability`

### 6.5 Build Translated Form Validation Schemas in a use[Form]Schema Hook

**Impact: MEDIUM (translated messages without rebuilding the schema each render)**

Form validation schemas need `t()` for their messages, so they cannot be module constants. Put each one in a `use[Form]Schema` hook in the page's forms folder. The hook calls `useTranslation()` and returns the Yup schema from `useMemo(() => …, [t])`, typed against the form values (`yup.ObjectSchema<FormValues>`). Compose section schemas in another memoized hook (spread their `.fields` into one `yup.object()`). Never hardcode messages, and never build the schema inline in the component, where it is recreated on every render.

**Incorrect (schema rebuilt every render, inline in the component):**

```tsx
export const TeamForm = () => {
  const { t } = useTranslation()
  const schema = yup.object({
    name: yup.string().required(t('common.form.error.required')),
  })
  const onSubmit = (values: TeamFormValues) => schema.validate(values)
  /* … */
}
```

**Correct (typed, translated, memoized on `t`):**

```ts
// directory/teams/pages/detail/forms/useTeamFormSchema.ts
const NAME_MAX = 100

export function useTeamFormSchema(): yup.ObjectSchema<TeamFormValues> {
  const { t } = useTranslation()

  return useMemo(() => {
    const required = t('common.form.error.required')
    return yup.object({
      name: yup
        .string()
        .trim()
        .required(required)
        .max(NAME_MAX, t('common.form.error.maxLength', { length: NAME_MAX })),
      catalogUuid: yup.string().required(required),
    })
  }, [t])
}

// combined form: useProjectFormSchema.ts
export function useProjectFormSchema() {
  const overviewSchema = useProjectOverviewSchema()
  const budgetSchema = useProjectBudgetSchema()
  return useMemo(
    () => yup.object({ ...overviewSchema.fields, ...budgetSchema.fields }),
    [overviewSchema, budgetSchema],
  )
}
```

A schema with no user-facing message can stay a typed module constant. Never rely on Yup's default English messages: provide every message through `t`, or configure them once with `yup.setLocale`. To test a schema without rendering a hook, export a pure `build[Form]Schema(t)` from the same file and wrap it in the hook: this is the one allowed exception to `helpers-no-context-params`, because a form schema is not a helper.

### 6.6 Declare Yup Schemas at Module Level With Explicit Names

**Impact: LOW-MEDIUM (stable references and readable hooks)**

API schemas do not depend on props or state, so declare them as module-level constants named by role (`REQUEST_SCHEMA`, `PAYLOAD_SCHEMA`, `RESPONSE_SCHEMA`, `LIST_ITEM_SCHEMA`) and use them directly in the hook. A schema built inline or in `useMemo(() => ..., [])` inside the hook adds noise, and an inline schema is a new object on every render, so anything that depends on it (a `useCallback`, an effect, a `queryFn` closure) is recreated each time. Never use an empty `yup.object({})` as a placeholder for a payload that has fields.

**Incorrect (schemas built inside the hook, vague names):**

```tsx
export function useGetOrdersQuery() {
  const schema1 = useMemo(() => yup.object({ search: yup.string().optional() }), [])
  const parse = useCallback((data: unknown) => yup.object({ items: yup.array() }).validateSync(data), [])
  // ...
}
```

**Correct (module-level constants, role-based names):**

```tsx
const REQUEST_SCHEMA = yup.object({
  search: yup.string().optional(),
  statuses: yup.array().of(yup.string().required()).optional(),
})

const RESPONSE_SCHEMA = yup.object({
  items: yup.array().of(LIST_ITEM_SCHEMA.required()).default([]).required(),
  metadata: METADATA_SCHEMA.required(),
})

export function useGetProjectsQuery(params: ProjectListQueryParams) {
  return useQuery({
    queryKey: ['projects', 'list', params],
    queryFn: async () => {
      const { data } = await axios.get<unknown>(ENDPOINTS.projects.list, {
        params: REQUEST_SCHEMA.validateSync(params),
      })
      return RESPONSE_SCHEMA.validateSync(data)
    },
  })
}
```

Schemas shared across hooks of a sub-domain go in `helpers/schemas/` (e.g. `orderPaymentSchemas.ts`). Form validation schemas that need `t()` are a different case: a `use[Form]Schema` hook with `useMemo(..., [t])` (see `yup-form-schema-hook`).

---

## 7. UI Composition & Accessibility

**Impact: HIGH**

Structural expectations of compound components, dialogs, forms and styling. Breaking them causes silent layout bugs, lost form values or inaccessible controls.

### 7.1 Delegate Mapped JSX to a Component

**Impact: HIGH (keeps list rendering declarative and isolates per-item decisions)**

When `map` produces JSX, its callback only renders one named component and passes source values to it. Put branching, derived values, event-handler construction, styling decisions and element structure inside that item component. Data-only transformations that do not produce JSX are unaffected.

Enforce this convention with the ESLint rule `local/no-complex-jsx-map` when the project provides it. Treat a warning from that rule as a request to extract or simplify the mapped item, not as a reason to disable the rule.

**Incorrect (the map callback owns conditions and markup):**

```tsx
<div>
  {categories.map((category) => {
    const isActive = category.id === activeCategoryId
    if (category.isOther) return <span key={category.id}>{category.label}</span>

    return (
      <button key={category.id} onClick={() => selectCategory(category.id)}>
        <span className={isActive ? 'active' : undefined}>{category.label}</span>
      </button>
    )
  })}
</div>
```

**Correct (the map delegates each item without inline logic):**

```tsx
type CategoryItemProps = {
  activeCategoryId: string | null
  category: Category
  onSelect: (categoryId: string) => void
}

function CategoryItem({ activeCategoryId, category, onSelect }: CategoryItemProps) {
  const isActive = category.id === activeCategoryId

  if (category.isOther) return <span>{category.label}</span>

  return (
    <button onClick={() => onSelect(category.id)}>
      <span className={isActive ? 'active' : undefined}>{category.label}</span>
    </button>
  )
}

<div>
  {categories.map((category) => (
    <CategoryItem
      key={category.id}
      activeCategoryId={activeCategoryId}
      category={category}
      onSelect={selectCategory}
    />
  ))}
</div>
```

The item component must be declared at module scope, never inside its parent component.

See also: `vercel-react-best-practices` → `rerender-no-inline-components`

### 7.2 Keep Compound Component Slots as Direct, Renderable Children

**Impact: HIGH (prevents silently dropped slots and empty overflow menus)**

Compound components often discover their slots by scanning their **direct** children (`Children.toArray`, matching on `displayName` or `type`). Anything that is not a slot element at that level is silently ignored: a custom component wrapping a slot, a Fragment next to other slots, a `Suspense` boundary, or a slot that renders `null`. No error is raised; the slot just disappears or sits in the wrong place.

```tsx
// Card scans its direct children: Card.Header, Card.Body, Card.Actions
const slots = Children.toArray(children).filter(isValidElement)
const header = slots.find(child => child.type === Card.Header)
```

**Incorrect (each pattern drops or misplaces a slot):**

```tsx
const ArchiveQuestion = ({ name }: { name: string }) => (
  <Card.Body>{t('project.archive.question', { name })}</Card.Body> // wrapper hides the slot
)

<Card>
  <Card.Header title={t('project.archive.title')} />
  <ArchiveQuestion name={project.name} />
  {!readOnly && (
    <>
      <Card.Body>{/* details */}</Card.Body> {/* Fragment next to other slots: ignored */}
      <Card.Actions>{/* … */}</Card.Actions>
    </>
  )}
  <Suspense fallback={null}>
    <Card.Actions>{/* Suspense is not a slot: ignored */}</Card.Actions>
  </Suspense>
</Card>
```

**Correct (slots are direct children; only their content is extracted):**

```tsx
const canRestore = canRestoreProject(project) // boolean business rule

<Card>
  <Card.Header title={t('project.archive.title')} />
  <Card.Body>
    <ArchiveQuestion name={project.name} /> {/* renders text, not Card.Body */}
    {!readOnly && <ProjectDetails project={project} />}
  </Card.Body>
  <Card.Actions maxVisible={2}>
    <ExportButton />
    {canRestore && <RestoreButton onClick={restore} />}
  </Card.Actions>
</Card>
```

- Extract the **content** of a slot into a component, never the slot itself.
- Condition each slot individually (`{cond && <Card.Actions>…</Card.Actions>}` is fine, the element keeps its identity) or inside the slot; never group several slots in a Fragment. A Fragment is only unwrapped when it is the sole child.
- Gate optional actions in the caller with a boolean predicate: a wrapper that renders `null` still occupies a visible slot and can leave an overflow menu empty, and the container cannot know what its children will render.
- Put `Suspense` outside the compound component, or inside a content slot (`Card.Body`), never between the compound and its slots.

### 7.3 Keep Dialog Mounted and Drive It with a Boolean open

**Impact: HIGH (keeps close transitions and focus handling working)**

A Radix dialog is controlled: keep it mounted and pass `open={Boolean(target)}` (`open` / `isOpen` depending on your wrapper). Radix then mounts and unmounts the content itself, plays the exit transition and restores focus to the trigger. Conditionally mounting the dialog with a hardcoded `open` kills the transition and the focus restoration. Guard data-dependent content with `?.` instead of an early return.

**Incorrect (conditional mount + hardcoded open):**

```tsx
const documentToDelete = useAtomValue(documentToDeleteAtom)
if (!documentToDelete) return null

return (
  <ConfirmDialog open onOpenChange={open => !open && cancelDelete()} variant="danger">
    {t('contract.modal.appendix.deleteQuestion', { name: documentToDelete.name })}
  </ConfirmDialog>
)
```

**Correct (always mounted, open derived from the target):**

```tsx
const documentToDelete = useAtomValue(documentToDeleteAtom)

return (
  <ConfirmDialog
    open={Boolean(documentToDelete)}
    onOpenChange={open => !open && cancelDelete()}
    variant="danger"
  >
    {t('contract.modal.appendix.deleteQuestion', { name: documentToDelete?.name ?? '' })}
  </ConfirmDialog>
)
```

While the exit transition plays, the target may already be `null`: keep the last displayed values (or render stable text) so the content does not flash empty during the close animation.

### 7.4 Never Nest a form Inside a form

**Impact: HIGH (prevents native submit that reloads the SPA and loses data)**

A page-level form that hosts an editable row or block with its own `<form>` produces `<form>` inside `<form>`: invalid HTML, a React validation warning, and the inner form submits natively — the browser navigates to `?field=value#` and every unsaved value is lost. The same happens when a modal's form is rendered inside another form (only the dialog content is portaled, not the form element around it). Fix the **outer** form: render it as a `div` when it hosts inner forms and submit it through a handler; the inner forms keep their `<form>` for Enter-to-submit.

**Incorrect (page form nests the editable-row forms):**

```tsx
<form onSubmit={handleSubmit}>
  <DocumentsBlock /> {/* each row in edit mode renders its own <form> */}
  <button type="submit">{t('common.save')}</button>
</form>
```

**Correct (outer container is a div, submit through the handler):**

```tsx
<div role="group" aria-label={t('order.create.title')}>
  <DocumentsBlock />
  <button type="button" onClick={() => void handleSubmit()}>
    {t('common.save')}
  </button>
</div>
```

With a form library, use its "render as div" option or `useForm().handleSubmit` from a button `onClick`. The trade-off is losing native Enter-to-submit on the outer form. Check in the browser console with `document.querySelectorAll('form form').length === 0`.

### 7.5 Wrap the Whole Dialog in a Form Keyed on the Open Target

**Impact: HIGH (submit button inside the form, fresh values on each open)**

A dialog's submit button lives in its footer, a sibling of the body. If the form (element or provider) only wraps the body, the footer button is outside it and cannot submit. Wrap the **whole** dialog (body and footer actions) in the form and **key** it on the open target: the form stays mounted while the dialog is closed, and the key resets `initialValues` on every open. Radix portals the dialog content out of the form's DOM subtree, so a native `type="submit"` button does not reach a wrapping `<form>`: submit through the form's `submit()` function, or give the button a `form="…"` attribute.

**Incorrect (form inside the body, footer button outside it):**

```tsx
<ConfirmDialog open={Boolean(target)} onOpenChange={open => !open && close()}>
  <ReminderFormProvider initialValues={initialValues} onSubmit={handleSubmit}>
    <ReminderFields />
  </ReminderFormProvider>
  <ConfirmDialog.Footer>
    <SubmitButton /> {/* useReminderForm() has no provider here */}
  </ConfirmDialog.Footer>
</ConfirmDialog>
```

**Correct (keyed form around the dialog, submit through the form context):**

```tsx
<ReminderFormProvider
  key={target?.id ?? 'closed'} // one key per open target
  initialValues={toInitialValues(target)}
  onSubmit={handleSubmit}
>
  <ConfirmDialog open={Boolean(target)} onOpenChange={open => !open && close()}>
    <ReminderFields />
    <ConfirmDialog.Footer>
      <button type="button" onClick={close}>{t('common.cancel')}</button>
      <SubmitButton />
    </ConfirmDialog.Footer>
  </ConfirmDialog>
</ReminderFormProvider>

function SubmitButton() {
  const { submit, isSubmitting } = useReminderForm()
  return (
    <button type="button" disabled={isSubmitting} onClick={submit}>
      {t('common.confirm')}
    </button>
  )
}
```

Do not let a generic "confirm" action close the dialog by itself: it would close even when validation fails. Close it from the submit handler on success.

### 7.6 Style with Design System Components, Utility Classes Only for Layout

**Impact: MEDIUM-HIGH (consistent visuals and themeable UI)**

Visual styling (text size, color, weight, background, border, radius, shadow, padding) comes from design-system components (`Text`, `Badge`, `Separator`, `Card`…), not from Tailwind classes on a `<div>` or `<span>` in feature code. Utility classes are tolerated only for minimal layout (`flex`, `gap`, `grow`), and a layout primitive of the design system is preferable even there. Hand-styled markup drifts from the design tokens and breaks on every theme change.

**Incorrect (styled div/span with Tailwind):**

```tsx
<div className="flex items-center gap-2">
  <span className="text-sm font-medium text-gray-500">
    {t('contract.reminders.empty')}
  </span>
  <span className="rounded-full bg-green-100 px-2 py-1 text-green-800">{statusLabel}</span>
</div>
```

**Correct (design-system components carry the styling):**

```tsx
<Stack direction="row" gap="2" align="center">
  <Text variant="sm-medium" color="secondary">
    {t('contract.reminders.empty')}
  </Text>
  <Badge type="success" label={statusLabel} />
</Stack>
```

If no design-system component fits, add or extend one in the shared UI layer instead of styling locally. Detection hint: search feature code for `className=` values containing `bg-`, `text-`, `border-`, `rounded-` or `shadow-`.

### 7.7 Give Icon-Only Buttons and Custom Controls an Accessible Name

**Impact: MEDIUM (usable with assistive tech, queryable by role in tests)**

Every interactive element needs an accessible name. A button whose only child is an icon has none, and a tooltip rendered through `data-tooltip-*` attributes (or CSS-only) is not an accessible name: screen readers and `getByRole(…, { name })` ignore it. Pass a translated `aria-label`. Build controls from real buttons, links and inputs (or design-system components that render them) rather than clickable `div`s. When a shared component lacks a name or hardcodes English, fix it there; never work around it with a `data-testid` in a test.

**Incorrect (icon-only button named only by its tooltip):**

```tsx
<Button
  variant="ghost"
  tooltip={{ content: t('common.delete') }} // rendered as data-tooltip-content
  onClick={() => requestDelete(contact.id)}
>
  <TrashIcon />
</Button>
```

**Correct (translated accessible name, tooltip kept for sighted users):**

```tsx
<Button
  variant="ghost"
  aria-label={t('common.delete')}
  tooltip={{ content: t('common.delete') }}
  onClick={() => requestDelete(contact.id)}
>
  <TrashIcon />
</Button>

// test
await user.click(screen.getByRole('button', { name: 'common.delete' }))
```

In a list, include the row identity when several rows share the same action (`t('contact.actions.deleteNamed', { name })`) so each button has a distinct name. Same rule for icon-only links and for custom inputs (`aria-label`, or a `<label htmlFor>`).

---

## 8. Jotai Client State

**Impact: MEDIUM-HIGH**

Jotai holds client-only shared state (filters, selection, edit modes, tabs). Reusable factories, explicit names and correct locations keep stores predictable and free of circular imports.

### 8.1 Create Atoms at Module Scope, Never During Render

**Impact: MEDIUM-HIGH (prevents state reset on every render)**

An atom's identity is its state key: calling `atom()` or an atom factory inside a component or hook body creates a new atom on every render, so the edit mode, selection or filters reset immediately and every effect depending on the atom re-runs. Declare atoms and factory bundles once, at module scope, in a `stores/*.atoms.ts` file.

**Incorrect (new atom on each render):**

```tsx
export const OverviewBlock = () => {
  const isEditingAtom = atom<boolean>(false) // new atom each render
  const [isEditing, setIsEditing] = useAtom(isEditingAtom) // always false after a re-render

  return <EditButton active={isEditing} onClick={() => setIsEditing(true)} />
}
```

**Correct (module-level declaration in the page store):**

```tsx
// pages/detail/stores/form.atoms.ts
export const overviewEditingAtom = atom<boolean>(false)

// OverviewBlock.tsx
export const OverviewBlock = () => {
  const [isEditing, setIsEditing] = useAtom(overviewEditingAtom)
  return <EditButton active={isEditing} onClick={() => setIsEditing(true)} />
}
```

Only exception: one atom per repeated item (each card of a list) — create it once per instance with `useMemo(() => atom<boolean>(false), [])`, e.g. in an `AttachmentCard` rendered once per attachment.

### 8.2 Keep Server Data in React Query, Not in Atoms

**Impact: MEDIUM-HIGH (avoids stale copies that miss cache invalidation)**

Atoms hold client-only state: filters, search, sort, selection, edit modes, tabs, modal state. Server data (entities, lists, counts, loading/error flags) stays in the TanStack Query hooks of `apis/`. A copy in an atom misses the invalidations of mutations, and the screen keeps showing old data after a save.

**Incorrect (query result mirrored into atoms):**

```ts
// stores/orders.atoms.ts
export const ordersAtom = atom<Order[]>([])
export const isOrdersLoadingAtom = atom<boolean>(false)

// page component
const result = useGetOrdersQuery(params)
const setOrders = useSetAtom(ordersAtom)
useEffect(() => {
  if (result.data) setOrders(result.data.pages.flatMap(page => page.items))
}, [result.data, setOrders])
```

**Correct (atoms hold the query inputs; the data comes from the query hook):**

```ts
// stores/list.atoms.ts — client-only state
export const orderFiltersAtom = atom<OrderFilters>(DEFAULT_FILTERS)
export const orderSearchAtom = atom<string>('')
export const selectedOrderIdsAtom = atom<ReadonlySet<string>>(new Set<string>())

// pages/list/services/actions/useGetOrders.ts — data orchestration hook
export function useGetOrders() {
  const filters = useAtomValue(orderFiltersAtom)
  const search = useAtomValue(orderSearchAtom)
  const params = useMemo(() => ({ ...filters, search }), [filters, search])
  const result = useInfiniteQuery(ordersInfiniteQueryOptions(params)) // the atoms are the query inputs
  const items = useMemo(() => result.data?.pages.flatMap(page => page.items) ?? [], [result.data])
  return { ...result, items }
}

// consumers derive what they need from the query + the atom
const { items } = useGetOrders()
const selectedIds = useAtomValue(selectedOrderIdsAtom)
```

Only exception: filter *options* published from the list metadata into an atom (they must survive filtering). Never extend it to entities.

### 8.3 Place Stores at Domain or Page Level by Reuse

**Impact: MEDIUM-HIGH (avoids cross-page coupling and orphan business state)**

Put an atom in the sub-domain `stores/` (`domains/[main]/[sub]/stores/`, or `domains/[domain]/stores/` for a single-level domain) only when several pages or domain hooks of the sub-domain share it (list filters read by actions, selection read by bulk actions). Everything owned by one page (modal state, page filters, form/edit state, tabs) goes in `domains/[main]/[sub]/pages/[page]/stores/`. Persisted or app-level atoms live in their owning domain; the app-shell domain is reserved for session state, and `src/shared/stores/` only holds generic, business-agnostic atoms.

**Incorrect (page state promoted to the domain, business state in shared):**

```text
src/domains/contracts/stores/reminderModal.atoms.ts   # used by the detail page only
src/shared/stores/orderFilters.atoms.ts               # business state in shared
src/domains/appShell/stores/invoiceTabs.store.ts      # domain state in the app shell
```

**Correct (scope follows the consumers):**

```text
src/domains/sales/orders/stores/filters.atoms.ts                  # read by list page + actions
src/domains/sales/orders/stores/selection.atoms.ts
src/domains/contracts/pages/detail/stores/reminderModal.atoms.ts
src/domains/sales/invoices/pages/detail/stores/uploadInvoiceFileModal.atoms.ts
src/domains/appShell/stores/auth.store.ts                         # session only
src/shared/stores/confirmModal.atoms.ts                           # generic, no business
```

Start at page level; move an atom up to the domain only when a second page needs it.

### 8.4 Reuse App Atom Factories Instead of Hand-Rolled Atoms

**Impact: MEDIUM-HIGH (keeps list behavior (URL sync, debounce, reset) consistent)**

When the app already provides an atom factory (and its owner hook) for a recurring kind of state — list filters, search and sort, multi-selection, modal `{ isOpen, data }`, edit mode — use it instead of declaring separate raw atoms. The owner hook carries the URL sync, debounce, reset or select-all logic that hand-rolled atoms silently lose. If no factory exists yet and several lists share one state shape, write one factory in the domain (or `src/shared/`) once, rather than copying atoms per list. Raw `atom<T>()` is for state with no factory (tabs, wizard answers, richer modal state).

**Incorrect (hand-rolled list state, copied for each list):**

```ts
export const invoiceSearchAtom = atom<string>('')
export const invoiceFiltersAtom = atom<InvoiceFilters>(DEFAULT_FILTERS)
export const invoiceSortAtom = atom<'asc' | 'desc' | null>('desc')
export const selectedInvoiceIdsAtom = atom<string[]>([])
```

**Correct (one locally defined factory + its owner hook, reused by every list):**

```ts
// src/shared/stores/createListAtoms.ts
export function createListAtoms<TFilters>(defaultFilters: TFilters) {
  const filtersAtom = atom<TFilters>(defaultFilters)
  const searchAtom = atom<string>('')
  const sortAtom = atom<'asc' | 'desc'>('desc')
  const selectedIdsAtom = atom<ReadonlySet<string>>(new Set<string>())
  const resetAtom = atom(null, (_get, set) => {
    set(filtersAtom, defaultFilters)
    set(searchAtom, '')
    set(selectedIdsAtom, new Set<string>())
  })
  return { filtersAtom, searchAtom, sortAtom, selectedIdsAtom, resetAtom }
}
export type ListAtoms<TFilters> = ReturnType<typeof createListAtoms<TFilters>>

// src/domains/sales/invoices/stores/list.atoms.ts
export const invoiceListAtoms = createListAtoms<InvoiceFilters>(DEFAULT_FILTERS)

// owner hook: the only place that knows how the atoms are combined
export function useListControls<TFilters>(atoms: ListAtoms<TFilters>) { /* read/write, debounce, reset */ }
```

Call the factory at module scope (see `state-module-level-atoms`) and consume it only through its owner hook.

### 8.5 Derive Atoms Instead of Storing Duplicates

**Impact: MEDIUM (removes sync effects and out-of-date flags)**

When a value can be computed from other atoms (a role check, a count, a "has active filters" flag), expose a read-only derived atom `atom(get => …)` next to its source instead of a second writable atom kept in sync by an effect. Jotai recomputes it only when its dependencies change, and it can never disagree with its source.

**Incorrect (duplicated state synced by an effect):**

```ts
// stores/user.store.ts
export const userAtom = atom<CurrentUser | undefined>(undefined)
export const isAdminAtom = atom<boolean>(false)

// somewhere in the app shell
const user = useAtomValue(userAtom)
const setIsAdmin = useSetAtom(isAdminAtom)
useEffect(() => setIsAdmin(user?.role === 'admin'), [user, setIsAdmin])
```

**Correct (read-only derived atom):**

```ts
// stores/user.store.ts
export const userAtom = atom<CurrentUser | undefined>(undefined)
export const isAdminAtom = atom(get => get(userAtom)?.role === 'admin')

// src/domains/sales/invoices/stores/selection.atoms.ts
export const selectedInvoiceIdsAtom = atom<ReadonlySet<string>>(new Set<string>())
export const selectedInvoiceCountAtom = atom(get => get(selectedInvoiceIdsAtom).size)
```

Derivations that need server data are computed in the page hook (`useMemo` over the query result + atom), not in an atom (see `state-server-state-in-react-query`).

See also: `vercel-react-best-practices` → `rerender-derived-state`

### 8.6 Persist Atoms with atomWithStorage and a Unique Key

**Impact: MEDIUM (avoids key collisions, flashes and crashes on bad storage)**

Persist client state only through `atomWithStorage<T>(key, default, storage?, options?)` from `jotai/utils`, in a `[name].store.ts` file of the owning domain, with a typed default and a key unique across the app. Never read/write `localStorage` by hand in an effect next to a plain atom.

- Export the key as a constant when anything else needs it (tests, cleanup). A single-use inline key is acceptable.
- Pass `{ getOnInit: true }` when the stored value drives the first render; otherwise the default renders first, then the subtree re-renders with the stored value.
- When the stored value is not a plain primitive, give a custom storage whose `getItem` validates the parsed value and falls back to the default: a stale or hand-edited entry must never throw at boot. Change the key (or version the value) when its shape changes.

**Incorrect (manual sync, generic key, unchecked parse):**

```ts
export const pinnedColumnsAtom = atom<Set<string>>(new Set())

useEffect(() => {
  setPinned(new Set(JSON.parse(localStorage.getItem('columns')!))) // throws on bad JSON, flashes
}, [setPinned])
useEffect(() => localStorage.setItem('columns', JSON.stringify([...pinned])), [pinned])
```

**Correct (atomWithStorage, exported key, defensive storage):**

```ts
// src/domains/sales/orders/stores/pinnedColumns.store.ts
export const PINNED_COLUMNS_STORAGE_KEY = 'orders.pinnedColumns'

export const pinnedColumnsAtom = atomWithStorage<Set<string>>(
  PINNED_COLUMNS_STORAGE_KEY,
  new Set<string>(),
  {
    getItem: (key, initialValue) => {
      try {
        const parsed: unknown = JSON.parse(localStorage.getItem(key) ?? 'null')
        return Array.isArray(parsed) ? new Set(parsed.filter(isOrderColumn)) : initialValue
      } catch {
        return initialValue
      }
    },
    setItem: (key, value) => localStorage.setItem(key, JSON.stringify([...value])),
    removeItem: key => localStorage.removeItem(key),
  },
  { getOnInit: true },
)
```

Persist UI preferences and session data only; never persist server data (see `state-server-state-in-react-query`).

See also: `vercel-react-best-practices` → `client-localstorage-schema`

### 8.7 Type Atoms Explicitly with DEFAULT_* Constants

**Impact: MEDIUM (prevents widened or never[] atom types and drifting resets)**

Give every raw atom an explicit type parameter (`atom<T>(…)`) and pass factories their generics. Declare non-trivial initial values as exported, typed `DEFAULT_*` constants (`DEFAULT_FILTERS: OrderFilters`) so that resets, tests and URL sync compare against the same reference. Inference from `[]`, `null` or `''` gives `never[]`, `null` or `string` and lets invalid values in.

**Incorrect (inferred types, inline defaults):**

```ts
export const reminderModalAtom = atom(null) // PrimitiveAtom<null>: can never be opened
export const deletedAtom = atom('active') // string instead of ContactDeletedFilter
export const orderFiltersAtom = atom({ account: [], deliveryDateFrom: null }) // never[] / null
```

**Correct (explicit type parameters, typed constants):**

```ts
export const reminderModalAtom = atom<ReminderModalState | null>(null)
export const deletedAtom = atom<ContactDeletedFilter>(DEFAULT_CONTACT_DELETED_FILTER)

export const DEFAULT_FILTERS: OrderFilters = {
  account: [],
  deliveryDateFrom: null,
  // ...every key of OrderFilters
}
export const orderFiltersAtom = atom<OrderFilters>(DEFAULT_FILTERS)
export const resetOrderFiltersAtom = atom(null, (_get, set) => set(orderFiltersAtom, DEFAULT_FILTERS))
```

A plain boolean flag may rely on inference (`atom(false)`), but `atom<boolean>(false)` is preferred for consistency.

### 8.8 Prefix Atoms with Their Entity

**Impact: LOW-MEDIUM (avoids ambiguous imports across lists and pages)**

Name atoms `[entity][Purpose]Atom` so that two lists or modals never export the same `filtersAtom` / `selectedIdsAtom`. The suffix tells the shape:

- bundles of several atoms returned by a factory take a plural `Atoms` suffix (`orderListAtoms`);
- selection atoms are `selected[Entity]IdsAtom`;
- modal atoms are `[feature]ModalAtom`, edit-mode atoms `[block]EditingAtom`.

**Incorrect (generic names that collide between domains):**

```ts
export const filtersAtom = atom<OrderFilters>(DEFAULT_ORDER_FILTERS)
export const selectedIdsAtom = atom<ReadonlySet<string>>(new Set())
export const dataAtoms = createListAtoms<InvoiceFilters>(DEFAULT_INVOICE_FILTERS)
export const modalAtom = atom<ReminderModalState | null>(null)
```

**Correct (entity-prefixed, suffix tells the shape):**

```ts
export const orderListAtoms = createListAtoms<OrderFilters>(DEFAULT_ORDER_FILTERS)
export const selectedOrderIdsAtom = atom<ReadonlySet<string>>(new Set())
export const contactTypeFilterAtom = atom<ContactTypeFilter>(DEFAULT_CONTACT_TYPE_FILTER)
export const reminderModalAtom = atom<ReminderModalState | null>(null)
export const projectOverviewEditingAtom = atom<boolean>(false)
```

Pick one naming scheme per kind of atom and keep it across the app. Raw atoms follow `state-explicit-types-defaults` (explicit type parameter, typed default).

### 8.9 Pick useAtomValue, useSetAtom or useAtom by Need

**Impact: LOW (write-only consumers stop re-rendering on every change)**

Subscribe only to what the component or hook uses: `useAtomValue` to read, `useSetAtom` to write, `useAtom` only when both are needed in the same place. A modal controller that only opens or closes a modal must not re-render its caller (often the whole page header) each time the atom changes.

**Incorrect (write-only hook subscribed to the value):**

```ts
export function useReminderModal() {
  const [, setModal] = useAtom(reminderModalAtom) // re-renders the caller on open/close
  const openAdd = useCallback(() => setModal({ mode: 'add' }), [setModal])
  const close = useCallback(() => setModal(null), [setModal])
  return { openAdd, close }
}
```

**Correct (setter for writers, value for readers):**

```ts
// pages/detail/services/actions/useReminderModal.ts — modal controller, writer only
export function useReminderModal() {
  const setModal = useSetAtom(reminderModalAtom)
  const openAdd = useCallback(() => setModal({ mode: 'add' }), [setModal])
  const close = useCallback(() => setModal(null), [setModal])
  return { openAdd, close }
}

// pages/detail/components/modals/ReminderModal.tsx — reader
const state = useAtomValue(reminderModalAtom)
```

Owner hooks that wrap a whole bundle of atoms (filters + search + sort) subscribe to their whole state by design; use them as they are rather than re-implementing them for a narrower subscription. This is a minor optimization: apply it to new hooks, do not churn existing code for it.

---

## 9. Helpers

**Impact: MEDIUM-HIGH**

Formatters, mappers and business rules centralize display and decision logic so that it is reusable, testable and consistent across pages.

### 9.1 Format Entities Through Formatter Hooks, Never Inline

**Impact: MEDIUM-HIGH (one display rule per entity, changeable in one place)**

Turning an entity into display text (name, address, status label, date, amount) is a domain rule. Never concatenate fields, map statuses or call `.toFixed()` / `.toLocaleString()` in a component or another hook: call a `useFormatXxx` hook from `helpers/formatters/`. Before writing one, search for an existing formatter: duplicated formatting is how the same entity ends up displayed three different ways.

**Incorrect (formatting inline in the component):**

```tsx
export const OrderAccessRow: FC<Props> = ({ access, order }) => {
  const { t } = useTranslation()
  return (
    <>
      <p>{`${access.contact.firstName} ${access.contact.lastName}`}</p>
      <span className="badge">
        {order.globalStatus === 'CLOSED' ? t('sales.globalStatus.CLOSED') : t('sales.globalStatus.STARTED')}
      </span>
      <p>{`${order.amount.toFixed(2)} ${order.currency}`}</p>
    </>
  )
}
```

**Correct (dedicated formatter hooks, existing ones reused):**

```tsx
// domains/sales/shared/helpers/formatters/useFormatContact.ts
export function useFormatContact() {
  return useCallback((contact: Contact) => `${contact.firstName} ${contact.lastName}`.trim(), [])
}

// domains/sales/shared/helpers/formatters/useFormatGlobalStatus.ts
export function useFormatGlobalStatus() {
  const { t } = useTranslation()
  return useCallback((status: GlobalStatus) => t(`sales.globalStatus.${status}`), [t])
}

// component
const formatContact = useFormatContact()
const formatGlobalStatus = useFormatGlobalStatus()
const formatMoney = useFormatMoney()

<p>{formatContact(access.contact)}</p>
<span className="badge">{formatGlobalStatus(order.globalStatus)}</span>
<p>{formatMoney(order.amount, order.currency)}</p>
```

Where to look first: the app-wide formatters in `src/shared/helpers/formatters/` (money, dates, addresses), then the domain's and its main domain's `shared/helpers/formatters/`. A formatter used by several sub-domains lives once in `[domain]/shared/helpers/formatters/`, one hook per file named after it. A formatter hook returns a `useCallback`-wrapped function taking the entity (see `arch-helpers-vs-services` for its shape). Lint the raw locale calls (`toLocaleDateString`, `toLocaleTimeString`) with `no-restricted-properties` so that dates also go through the shared formatters.

### 9.2 Keep Business Rules as Pure, Intent-Named Predicates

**Impact: MEDIUM-HIGH (decisions readable in JSX and testable without rendering)**

Any non-trivial condition (status sets, bypass flags, counts) goes in `helpers/businessRules/` as a **pure function** `(entity/state) => boolean | string | union`: no React hook, no API call, no side effect. Name it after **why** it is true: `isX` / `hasX` / `areXProvided` (business state), `canX` (business authorization), `shouldShowX` (display decision composing the others), never `isVisible` / `showBlock`.

**Incorrect (rule inlined in JSX, then wrapped in a hook with a meaningless name):**

```tsx
{paymentApprovers.length > 0 &&
  ['PENDING_SIGNATURE', 'AT_LEAST_ONE_APPROVER_FAILED', 'SIGNED'].includes(data.payment.status) &&
  !data.payment.isSignatureBypassed && <ApproversBlockSection section="payment" /* … */ />}

// services/useIsVisible.ts
export const useIsVisible = (payment: PaymentSection, count: number) =>
  useMemo(() => /* same condition */, [payment, count])
```

**Correct (pure predicate in helpers/businessRules/, named by intent):**

```tsx
// pages/detail/helpers/businessRules/arePaymentApproversProvided.ts
const PAYMENT_PROVIDED_STATUSES = new Set<PaymentSection['status']>([
  'PENDING_SIGNATURE',
  'AT_LEAST_ONE_APPROVER_FAILED',
  'SIGNED',
])

export const arePaymentApproversProvided = (payment: PaymentSection, paymentApproversCount: number): boolean =>
  PAYMENT_PROVIDED_STATUSES.has(payment.status) && !payment.isSignatureBypassed && paymentApproversCount > 0

// ApproversBlock.tsx
const showPaymentApprovers = arePaymentApproversProvided(data.payment, paymentApprovers.length)
{showPaymentApprovers && <ApproversBlockSection section="payment" /* … */ />}
```

Call predicates directly during render, with no `useState`/`useEffect` to store their result. A predicate living in a hook file belongs in `helpers/businessRules/`; anything that really needs a hook is a formatter, a mapper or a service instead.

See also: `vercel-react-best-practices` → `rerender-derived-state-no-effect`

### 9.3 Never Pass t, navigate or Stores to a Helper

**Impact: MEDIUM-HIGH (business-only signatures, no context threading through callers)**

A helper signature takes business data only. When it needs a React context dependency (`t`, `navigate`, a Jotai atom, the `queryClient`), turn it into a helper **hook** (`use…`) that reads the dependency internally, or composes another helper hook, and returns a memoized value or function. Passing `t` around forces every caller to own `useTranslation` and leaks UI plumbing into business signatures.

**Incorrect (context dependency threaded as a parameter):**

```ts
// sales/orders/helpers/mappers/getOrderStatusOptions.ts
export const getOrderStatusOptions = (t: TFunction) => [
  { value: 'DRAFT', label: t('order.orderStatus.DRAFT') },
  { value: 'CONFIRMED', label: t('order.orderStatus.CONFIRMED') },
  { value: 'SHIPPED', label: t('order.orderStatus.SHIPPED') },
]

// component
const { t } = useTranslation()
const statusOptions = getOrderStatusOptions(t)
```

**Correct (helper hook composing the existing formatter):**

```ts
// sales/orders/helpers/mappers/useOrderStatusOptions.ts
const ORDER_STATUSES = ['DRAFT', 'CONFIRMED', 'SHIPPED'] as const satisfies readonly OrderStatus[]

export function useOrderStatusOptions() {
  const formatOrderStatus = useFormatOrderStatus() // helpers/formatters/
  return useMemo(
    () => ORDER_STATUSES.map(status => ({ value: status, label: formatOrderStatus(status) })),
    [formatOrderStatus],
  )
}

// component
const statusOptions = useOrderStatusOptions()
```

The formatter itself follows the same pattern (see `arch-helpers-vs-services` and `helpers-formatter-hooks`). One explicit exception: a pure `build[Form]Schema(t)` exported next to its `use[Form]Schema` hook, to test the schema without rendering (see `yup-form-schema-hook`). A dependency that triggers a side effect (`navigate`, a mutation, a toast) does not belong in `helpers/` at all: it goes in a page action hook or a domain `services/` hook.

### 9.4 Sort Every Helper Into One of a Fixed Set of Categories

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

---

## 10. Internationalization

**Impact: MEDIUM-HIGH**

Every user-facing string goes through react-i18next with static, analyzable keys so that tooling can detect missing or unused keys.

### 10.1 Inject Dynamic Values Through t() Options, Never Concatenation

**Impact: MEDIUM-HIGH (translatable sentences and checked placeholders)**

Pass every dynamic value as an interpolation option — `t('key', { name, count })` — and let the catalog sentence place it. Never concatenate a translated string with variables, spaces, numbers or another `t()`: the sentence becomes untranslatable (word order, punctuation, plurals), and a translation check can no longer verify that code and catalog agree on the placeholders.

**Incorrect (sentence assembled in code):**

```tsx
<p>{t('common.delete') + ' "' + documentToDelete?.name + '"?'}</p>

const secondaryText = `${t('order.payment.upload.fileLabel')} (${maxFiles} max)`
```

**Correct (placeholders filled through options):**

```tsx
<p>
  {t('contract.modal.appendix.deleteQuestion', {
    name: documentToDelete?.name ?? '',
  })}
</p>

const secondaryText = t('order.shipping.upload.limits', {
  maxSize: MAX_FILE_SIZE_MB,
  maxFiles: MAX_FILES,
})
```

Option names must match the placeholders of the catalog value: a placeholder missing in code is an error, an unused one a warning. If no key holds the full sentence yet, add one rather than gluing fragments. For counts, use i18next plural keys (`count`) instead of branching in code.

### 10.2 Translate Every User-Facing String with a Catalog Key

**Impact: MEDIUM-HIGH (no untranslatable copy, no raw keys on screen)**

Every string a user can see or hear goes through `t()`: titles, labels, buttons, placeholders, empty states, toasts, tooltips and `aria-label`s. When you introduce a key, check that it exists in the reference translation catalog; if not, add it there (and have it created wherever the catalog is maintained) — otherwise the app renders the raw key. Then run the key extraction check.

**Incorrect (hardcoded copy in UI and notifications):**

```tsx
<h2>Delete document</h2>
<button onClick={handleConfirm}>Confirm</button>
<textarea name="message" placeholder="Optional message:" />

toast.success('Reminder added')
```

**Correct (keys resolved from the catalog):**

```tsx
const { t } = useTranslation()

<h2>{t('contract.modal.appendix.deleteTitle')}</h2>
<button onClick={handleConfirm}>{t('common.confirm')}</button>
<textarea name="message" placeholder={t('contract.form.reminder.message')} />

toast.success(t('contract.reminder.messages.addSuccess'))
```

Reuse shared keys (`common.cancel`, `common.confirm`, `common.close`, `common.delete`) before creating new ones. Not concerned: technical identifiers, CSS classes, test IDs, log messages and data coming from the API.

### 10.3 Use Literal Translation Keys Only

**Impact: MEDIUM-HIGH (keys stay visible to i18next-scanner and the missing-key check)**

The key extraction check (typically `i18next-scanner` or `i18next-parser`, configured for `t` and `i18next.t`) only extracts **string literals passed directly to `t()`**, then compares them with the reference translation catalog. A key built or stored elsewhere (template literal, concatenation, constant, `Record` value) is invisible: a missing key ships unnoticed and the user sees the raw key. For a finite union, write one literal `t('…')` call per value inside a formatter hook.

**Incorrect (dynamic or indirect keys):**

```tsx
const label = t(`order.sectionStatus.${status}`) // template literal

const SECTION_STATUS_KEYS: Record<ShippingStatus, string> = {
  NOT_STARTED: 'order.sectionStatus.NOT_STARTED',
  VALIDATED: 'order.sectionStatus.VALIDATED',
}
const title = t(SECTION_STATUS_KEYS[status]) // invisible to the scanner
```

**Correct (one literal `t()` per value, exhaustive over the union):**

```tsx
export function useFormatShippingStatus() {
  const { t } = useTranslation()
  return useCallback(
    (status: ShippingStatus) => {
      const labels: Record<ShippingStatus, string> = {
        NOT_STARTED: t('order.sectionStatus.NOT_STARTED'),
        VALIDATED: t('order.sectionStatus.VALIDATED'),
      }
      return labels[status]
    },
    [t],
  )
}
```

A ternary of literals (`t(isEdit ? 'contract.modal.reminder.editTitle' : 'contract.modal.reminder.addTitle')`) is fine: the scanner reads both branches. Only the **value** may be dynamic, via interpolation options. A lint rule that only forbids template literals does not catch a `Record<Union, 'literal.key'>` mapper passed to `t()`: avoid that pattern too.

### 10.4 Never Use defaultValue in t()

**Impact: MEDIUM (missing keys surface instead of hardcoded fallbacks)**

When translations are served from a catalog (a backend export or JSON files), a `defaultValue` hides a key that does not exist there: the English fallback ships as a hardcoded string, translators never see it, and the copy silently forks from the catalog. Every key must exist in the reference translation catalog; add the key instead of a fallback.

**Incorrect (fallback masks a missing key):**

```tsx
<h2>
  {t('contract.modal.appendix.deleteTitle', {
    defaultValue: 'Delete document',
  })}
</h2>

<button onClick={close}>{t('common.cancel', 'Cancel')}</button>
```

**Correct (plain key, present in the catalog):**

```tsx
<h2>{t('contract.modal.appendix.deleteTitle')}</h2>

<button onClick={close}>{t('common.cancel')}</button>
```

The second argument of `t()` is reserved for interpolation options (`{ name }`), never a default string. The only acceptable built-in fallbacks are the few boot-time keys of screens shown before the catalog loads; do not add feature keys there.

---

## 11. Testing

**Impact: MEDIUM-HIGH**

Jest + React Testing Library tests exercise visible behavior through the real hook stack, stubbing only the network boundary, which makes them robust to refactors.

### 11.1 Isolate Jotai State with a Fresh Store per Test

**Impact: MEDIUM-HIGH (prevents state leaking between tests through module-level atoms)**

Atoms declared in `stores/*.atoms.ts` are module singletons. Without a `Provider`, every test in the file writes to the same default Jotai store, so the outcome depends on test order. Give each test its own `createStore()` and wrap the render in `<Provider store={store}>`. Seed initial values with `store.set(atom, value)`: it is typed against the atom, and the store lets you read the result back.

**Incorrect (no Provider: every test writes to the shared default store):**

```tsx
it('should reset the filters when the contract changes', () => {
  const { rerender } = renderHook(({ id }) => useResetHistoryFilters(id), {
    initialProps: { id: 'contract-a' },
  })
  rerender({ id: 'contract-b' })
})
```

**Correct (one store per test, typed seeding, assertions on the store):**

```tsx
import { Provider, createStore } from 'jotai'

import {
  DEFAULT_HISTORY_FILTERS,
  historyFiltersAtom,
} from '@/domains/contracts/pages/histories/stores/filters.atoms'

it('should reset the filters when the contract changes', () => {
  const store = createStore()
  const wrapper = ({ children }: { children: ReactNode }) => (
    <Provider store={store}>{children}</Provider>
  )
  const { rerender } = renderHook(({ id }) => useResetHistoryFilters(id), {
    wrapper,
    initialProps: { id: 'contract-a' },
  })

  store.set(historyFiltersAtom, { statuses: ['ONGOING'], changeReasons: ['STATUS_CHANGED'] })
  rerender({ id: 'contract-b' })

  expect(store.get(historyFiltersAtom)).toEqual(DEFAULT_HISTORY_FILTERS)
})
```

If a component has to start from a hydrated value, write a small typed component, for example `HydrateUser({ user, children }: { user: CurrentUser; children: ReactNode })` that calls `useHydrateAtoms([[userAtom, user]])`. Do not write a generic `any` helper. Test atoms through their owner hooks rather than the internals of an atom factory.

### 11.2 Mock the Network Boundary, Never Internal Modules

**Impact: MEDIUM-HIGH (tests that mock internals stay green while the real hook stack is broken)**

Never `jest.mock` an internal module: a hook, component, helper, provider or a schema library such as `yup` (a domain `apis/`, `services/`, `components/` or `helpers/` module). The test then checks a stub instead of the real query key, Yup parsing, permissions and rendering. Stub only the network boundary — MSW handlers or an axios adapter — and let every project hook run.

**Incorrect (stubs the query hook and the permissions hook):**

```tsx
jest.mock('@/domains/sales/orders/apis/queries/useGetOrderDetailQuery', () => ({
  useGetOrderDetailQuery: () => mockUseGetOrderDetailQuery(),
}))
jest.mock('@/domains/sales/orders/pages/detail/services/permissions/usePermissions', () => ({
  usePermissions: () => mockUsePermissions(),
}))

render(<OrderSummary orderId="order-1" />)
```

**Correct (only the HTTP layer is stubbed, the real hook and schema run):**

```tsx
import { HttpResponse, http } from 'msw'

import { server } from '@/testing/server'

it('should accept a null customerType', async () => {
  server.use(
    http.get('*/orders/order-1', () =>
      HttpResponse.json({ id: 'order-1', customerType: null }),
    ),
  )

  render(<OrderSummary orderId="order-1" />, { wrapper: AppProviders })

  expect(await screen.findByRole('heading', { name: 'order-1' })).toBeInTheDocument()
  expect(screen.queryByText('order.customerType.label')).not.toBeInTheDocument()
})
```

- Where MSW cannot run in the test environment, pass an axios instance whose `adapter` returns canned responses, or stub `axios.create` once at the boundary; the hooks above it stay real.
- Third-party and infrastructure modules that cannot run in jsdom (error reporters, file download helpers, auth libraries that build a client on import) may be stubbed; own code may not.
- Do not share a "common mocks" helper that stubs internal modules: it hides the same problem in every test that imports it.
- When touching a test that mocks internals, replace those mocks by a network stub.

### 11.3 Assert Behavior with Parametrized, Unconditional Tests

**Impact: MEDIUM (one failing case points at one input, and refactors stop breaking tests)**

When cases differ only by their input, use `test.each` / `it.each` with typed rows so that every variant is reported on its own. Never wrap assertions in `if/else`, loops or `forEach`: a failure no longer says which input broke, and a branch can silently skip the assertion. Each case asserts one exact, observable outcome.

**Incorrect (loop with a conditional assertion; a failure does not say which status broke):**

```ts
it('should map the statuses', () => {
  const statuses = ['NOT_STARTED', 'STARTED', 'CLOSED', 'NOT_REQUIRED'] as const
  statuses.forEach(status => {
    if (status === 'CLOSED') {
      expect(getStatusBadgeType(status)).toBe('success')
    } else {
      expect(getStatusBadgeType(status)).not.toBe('success')
    }
  })
})
```

**Correct (one typed row per variant, one exact assertion):**

```ts
import type { BadgeType } from '../types/badge.type'
import type { OrderStatus } from '../types/order.type'

it.each<[OrderStatus, BadgeType]>([
  ['NOT_STARTED', 'error'],
  ['STARTED', 'info'],
  ['CLOSED', 'success'],
  ['NOT_REQUIRED', 'neutral'],
])('should map %s to the %s badge', (status, expected) => {
  expect(getStatusBadgeType(status)).toBe(expected)
})
```

Assert what the user or caller observes, not the implementation:

- Prefer ARIA and DOM state: `toBeDisabled()`, `toBeChecked()`, `toHaveAttribute('aria-selected', 'true')`, `toHaveAttribute('data-state', 'open')` for Radix components.
- A state class that is part of a component's public API (`toggle-disabled`) may be asserted only when no semantic equivalent exists.
- Never assert Tailwind utility classes (`px-3`, `opacity-50`, `cursor-not-allowed`), `tagName`, HTML structure or private calls: they change with any visual tweak.

Move repeated setup into `beforeEach` or a local `setup()` helper, not into a branch. Use `test.each` for the null, undefined and empty-string variants as well.

### 11.4 Build Typed, Deterministic Mock Data in the Domain mocks Folder

**Impact: MEDIUM (reproducible tests that break when the domain type changes)**

Domain fixtures live in `src/domains/<domain>/<subDomain>/mocks/<entity>.mock.ts` and are annotated with the domain entity, never cast (`as Invoice[]` hides missing or renamed fields). They use fixed `Date` values (`new Date('2026-01-15T09:00:00.000Z')`, never `new Date()`), a unique id per item, and varied values that cover each state the UI branches on. A factory with `overrides` lets each test state only what it cares about.

A domain `mocks/` folder holds typed fixtures only. Network handlers (MSW) live in one shared mock-server folder and reuse these fixtures, so tests and the dev environment agree on the same data (see `test-mock-network-not-internals`).

**Incorrect (cast hides the missing required fields):**

```ts
export const mockInvoices = [
  { id: 'invoice-1', createdAt: new Date('2026-01-15T09:00:00.000Z'), status: 'DRAFT' },
  { id: 'invoice-2', createdAt: new Date('2026-02-01T09:00:00.000Z'), status: 'PAID' },
] as Invoice[]
```

**Correct (annotated factory with overrides, fixed dates, distinct ids and states):**

```ts
import type { Invoice } from '@/domains/sales/invoices/types/invoice.type'

export const makeInvoice = (overrides: Partial<Invoice> = {}): Invoice => ({
  id: 'invoice-1',
  createdAt: new Date('2026-01-15T09:00:00.000Z'),
  status: 'DRAFT',
  amount: 1250.5,
  paidAt: null,
  // ...every other required field of Invoice
  ...overrides,
})

export const mockInvoices: Invoice[] = [
  makeInvoice(),
  makeInvoice({ id: 'invoice-2', status: 'PAID', paidAt: new Date('2026-03-01T00:00:00.000Z') }),
]
```

When fixtures from two domains have to agree (contacts → accounts), add a small `*.mock.test.ts` that checks the shared ids and their uniqueness.

### 11.5 Colocate a Test Next to Every File, Covering Errors

**Impact: MEDIUM (untested files and happy-path-only tests hide regressions in business logic)**

Every new hook, helper, service, store or component gets a sibling test file with the same base name: `useGetOrderDetailQuery.ts` → `useGetOrderDetailQuery.test.tsx`. Do not use `__tests__/` folders, a central test tree or Storybook `play` functions as the only test. Each test file covers the nominal path and at least one error or edge path (rejected schema, empty list, HTTP error, missing permission).

**Incorrect (test stored far from the code it covers):**

```tsx
// src/__tests__/order.test.tsx
describe('useGetOrderDetailQuery', () => {
  it('should parse the API payload', async () => { /* ... */ })

  it('should throw when the API answers 404', async () => { /* ... */ })
})
```

**Correct (sibling file, nominal and error cases):**

```tsx
// src/domains/sales/orders/apis/queries/useGetOrderDetailQuery.test.tsx
describe('useGetOrderDetailQuery', () => {
  it('should parse the API payload and strip unknown fields', async () => { /* ... */ })

  it('should default lines and attachments to [] when missing', async () => { /* ... */ })

  it('should throw when the API answers 404', async () => { /* ... */ })
})
```

A sibling file makes a missing test visible in the file tree, moves with the code when a folder is renamed, and keeps relative imports short (`./useGetOrderDetailQuery`).

Do not leave a silent `it.skip`: either fix the test or add a `// TODO:` comment that states why it is skipped. Run the tests of the folder you changed.

### 11.6 Query by Role and Label, Interact with userEvent

**Impact: MEDIUM (tests double as accessibility checks and survive markup refactors)**

Find elements the way a user or a screen reader does: `getByRole` (with `name`), then `getByLabelText`, then `getByText` for static content. Do not use `getByTestId`, `container.querySelector` or `.tagName` checks. Drive interactions with `userEvent.setup()`, not `fireEvent`: `userEvent` fires the full focus, pointer and keyboard sequence that Radix-based components rely on.

**Incorrect (test ids and synthetic events):**

```tsx
render(<ReminderModal {...props} />)

fireEvent.change(screen.getByTestId('reminder-message'), { target: { value: 'Please review' } })
fireEvent.click(screen.getByTestId('confirm-button'))

expect(screen.getByTestId('reminder-message').tagName).toBe('TEXTAREA')
```

**Correct (accessible queries and real user interactions):**

```tsx
import userEvent from '@testing-library/user-event'

const user = userEvent.setup()
render(<ReminderModal {...props} />)

const message = screen.getByLabelText('Message')
await user.type(message, 'Please review')
await user.click(screen.getByRole('button', { name: 'Confirm' }))

expect(message).toHaveValue('Please review')
```

If `react-i18next` is mocked globally with an identity `t`, accessible names are the i18n keys rather than the translated text; query with the key. If a query fails, the component may be missing its accessible name: fix the component (see `ui-accessible-names`), do not fall back to a test id.

### 11.7 Test API Hooks with renderHook and a Per-Test Query Wrapper

**Impact: MEDIUM (avoids cache leaks between tests and hanging Suspense or retries)**

Test hooks with `renderHook` from `@testing-library/react` (not the deprecated `@testing-library/react-hooks`). Query hooks need a wrapper with a `QueryClientProvider` holding a **new** `QueryClient` for every test, with `retry: false`, and a `<Suspense>` boundary when the hook uses `useSuspenseQuery`. A module-level client shares its cache between tests, and the default retry policy makes error tests time out. Stub only the network (see `test-mock-network-not-internals`) and let the real hook and Yup schema run.

**Incorrect (module-level client, retries on, no Suspense):**

```tsx
const queryClient = new QueryClient()

it('should load the order', async () => {
  const { result } = renderHook(() => useGetOrderDetailQuery('order-1'), {
    wrapper: ({ children }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    ),
  })
})
```

**Correct (fresh client per render, real hook and Yup schema, network stubbed):**

```tsx
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <Suspense fallback={null}>{children}</Suspense>
    </QueryClientProvider>
  )
}

it('should default missing lines to []', async () => {
  server.use(http.get('*/orders/order-1', () => HttpResponse.json({ id: 'order-1', lines: null })))

  const { result } = renderHook(() => useGetOrderDetailQuery('order-1'), {
    wrapper: createWrapper(),
  })

  await waitFor(() => expect(result.current.data).toBeDefined())
  expect(result.current.data.lines).toEqual([])
})
```

- Keep `createWrapper` in a shared test utility once several files need it.
- For mutations, stub the matching `post`/`patch`/`delete` handler and assert on the result and the invalidated queries. For Jotai-only hooks, pass a Jotai `Provider` as the wrapper (see `test-jotai-provider-isolation`).

---

## 12. Code Quality

**Impact: MEDIUM**

Conventions that keep the codebase consistent and reviewable, beyond what ESLint and TypeScript already enforce.

### 12.1 Never Build Hooks from Hooks (No createUseXxx Factories)

**Impact: MEDIUM (keeps hooks traceable, statically analyzable and Rules-of-Hooks safe)**

Do not write a function that takes a hook as a parameter and returns a new hook (`createUseXxx(useOther)`), and do not write a hook whose parameter is itself a hook. Such factories hide which hook runs where, defeat "go to definition", and stop the hooks lint rules from checking the call order. Write one generic hook that takes the value (not the hook), and call the source hook at the call site. A few explicit duplicate wrappers are fine too.

**Incorrect (factory consumes a hook and returns a hook):**

```ts
export function createUseFormatStatusOptions(useFormatStatus: () => (status: string) => string) {
  return function useFormatStatusOptions() {
    const formatStatus = useFormatStatus()
    return useCallback(
      (statuses: string[]) => statuses.map(status => ({ value: status, label: formatStatus(status) })),
      [formatStatus],
    )
  }
}
export const useFormatInvoiceStatusOptions = createUseFormatStatusOptions(useFormatInvoiceStatus)
```

**Correct (generic hook takes a value, each wrapper calls the source hook explicitly):**

```ts
import { useFormatInvoiceStatus } from '@/domains/sales/invoices/helpers/formatters/useFormatInvoiceStatus'

type StatusOption<T extends string> = { value: T; label: string }

export function useStatusOptionsFormatter<T extends string>(formatStatus: (status: T) => string) {
  return useCallback(
    (statuses: T[]): StatusOption<T>[] =>
      statuses.map(status => ({ value: status, label: formatStatus(status) })),
    [formatStatus],
  )
}

export function useFormatInvoiceStatusOptions() {
  return useStatusOptionsFormatter(useFormatInvoiceStatus())
}
```

A hook that composes behavior from callbacks and atoms (not from hooks passed as parameters) is fine.

### 12.2 No Clickable No-Op Links or Actions

**Impact: MEDIUM (users never click something that silently does nothing)**

Never render a clickable element with an empty handler (`onClick={() => {}}`) or `href="#"` as a placeholder for a URL or an action that is not available yet. The user sees a working link that does nothing. While the target is unavailable, either hide the element (and show a "no value" placeholder if the slot must stay visible), or render it `disabled` with a tooltip that says why.

**Incorrect (looks actionable, does nothing when the CRM id is missing):**

```tsx
<Button onClick={crmId ? openCrmCatalog : () => {}}>
  {t('project.action.manageGroupAccess')}
</Button>
```

**Correct (hide until available, or disable with an explanation):**

```tsx
{crmId && <Button onClick={openCrmCatalog}>{t('project.action.manageGroupAccess')}</Button>}

// When the action must stay visible:
<Button disabled title={t('project.action.manageGroupAccessUnavailable')}>
  {t('project.action.manageGroupAccess')}
</Button>
```

For a display slot, render the placeholder instead of an empty link when there is no URL.

The tooltip must explain the reason with a dedicated translation key (the one above is illustrative): add it to the catalog before using it, and do not reuse a generic key whose wording does not match the situation.

Empty handlers are fine in Storybook stories and documentation examples. They are not fine in a rendered page.

### 12.3 useMemo for Data, useCallback for Functions

**Impact: MEDIUM (stable references for returned functions, and the memo hook states what is returned)**

When the React Compiler is not enabled, manual memoization is required whenever a hook returns a function or an object that callers put in dependency arrays or pass to memoized children. When the compiler is enabled, it handles most of this and manual memoization becomes unnecessary.

When a hook returns a function (formatters, option builders, action handlers), memoize it with `useCallback`. Use `useMemo` only for computed data. Never write `useMemo(() => () => ...)`.

**Incorrect (useMemo returning a function):**

```ts
export function useFormatCustomerTypeOptions() {
  const { t } = useTranslation()
  return useMemo(
    () => (customerTypes: CustomerType[]) => {
      const labels: Record<CustomerType, string> = {
        LEGAL_ENTITY: t('order.customerType.LEGAL_ENTITY'),
        PRIVATE_INDIVIDUAL: t('order.customerType.PRIVATE_INDIVIDUAL'),
      }
      return customerTypes.map(item => ({ value: item, label: labels[item] }))
    },
    [t],
  )
}
```

**Correct (useCallback for the returned function):**

```ts
export function useFormatCustomerTypeOptions() {
  const { t } = useTranslation()
  return useCallback(
    (customerTypes: CustomerType[]) => {
      const labels: Record<CustomerType, string> = {
        LEGAL_ENTITY: t('order.customerType.LEGAL_ENTITY'),
        PRIVATE_INDIVIDUAL: t('order.customerType.PRIVATE_INDIVIDUAL'),
      }
      return customerTypes.map(item => ({ value: item, label: labels[item] }))
    },
    [t],
  )
}
```

When a hook exposes several methods (a modal controller), memoize each one with `useCallback` and return an object literal of them: `const open = useCallback(() => setOpen(true), [setOpen])`. Memoize the whole object with `useMemo` only when a caller needs the object itself to be stable. Skip memoization for cheap primitive values computed inline.

See also: `vercel-react-best-practices` → `rerender-memo`, `rerender-simple-expression-in-memo`

### 12.4 Write Code, Comments and Tests in English

**Impact: MEDIUM (one language for a codebase reviewed by agents and mixed teams)**

Identifiers, comments, JSDoc, `describe`/`it` names, and test data labels are all in English. Other languages never belong in `.ts`/`.tsx`: user-facing copy lives in translation catalogs served through `react-i18next` (see `i18n-no-hardcoded-strings`). Mixed-language code is harder to grep, review and keep consistent with the English domain vocabulary (`order`, `invoice`, `contract`).

**Incorrect (non-English comments and test names, French here):**

```ts
// Retry uniquement sur les erreurs réseau/timeout (max 3 fois)
const isNetworkError = !error.response && !!error.code

it('affiche une erreur quand le champ est invalide', async () => {
  // Toucher le champ et le sortir du focus pour déclencher l'erreur
  await user.tab()
})
```

**Correct (English everywhere):**

```ts
// Retry only network/timeout errors (max 3 attempts)
const isNetworkError = !error.response && !!error.code

it('should display an error when the field is invalid', async () => {
  // Blur the field to mark it as touched
  await user.tab()
})
```

To find leftovers, grep for accented characters in source files (for example `grep -rn "[àâäéèêëïîôùûüÿæœç]" src --include="*.ts*"`). Matches in i18n fixtures or real data samples (names, addresses) are fine. Translate older comments when you touch them.

### 12.5 Scope eslint-disable to the Offending Line with a Reason

**Impact: LOW-MEDIUM (keeps every lint exception visible, minimal and justified)**

First look for a clean fix. If you still need an exception, put `// eslint-disable-next-line <rule> -- <why>` directly above the line that triggers the rule, not above the enclosing `useEffect`, function or JSX block. A misplaced directive suppresses nothing and is reported as an `Unused eslint-disable directive`. A file-wide `/* eslint-disable */` hides every future violation in the file.

**Incorrect (directive placed on the wrapper instead of the offending line):**

```tsx
// eslint-disable-next-line react-hooks/set-state-in-effect -- intentional reset of the radio selection when the modal closes
useEffect(() => {
  if (isOpen) return
  setStatus(null)
}, [isOpen])
```

**Correct (directive on the exact line, named rule, reason after `--`):**

```tsx
useEffect(() => {
  if (isOpen) return
  // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional reset of the radio selection when the modal closes
  setStatus(null)
}, [isOpen])
```

Never omit the rule name or the `--` reason. A file-wide `/* eslint-disable */` is acceptable only for tooling files (Storybook docs, dev mocks, scripts). Even there, name the rule and give a reason, as in `/* eslint-disable jest/no-mocks-import -- dev tooling reuses the mocked catalogue */`.

### 12.6 Keep JSDoc for Non-Obvious Intent Only

**Impact: LOW (less noise, and comments that stay true)**

Add JSDoc only when it explains something the name and types cannot: a business reason, an invariant, a call constraint (Suspense, "call once per page"), or a deliberate tolerance in a schema. Do not paraphrase the function name or restate parameter types. Paraphrase JSDoc drifts out of date and hides the comments that matter. Do not require an `@example` on every hook.

**Incorrect (restates the signature):**

```ts
/**
 * Hook to get the contacts selection.
 * @returns the contacts selection
 */
export function useContactsSelection() {
  // ...
}
```

**Correct (explains the why and the usage constraint):**

```ts
/**
 * Selection of the contacts list. It is cleared whenever the search or a filter changes: a
 * selection must not outlive the rows it was made on, a bulk action would hit contacts no longer
 * on screen.
 *
 * Call it once per page (the clearing is an effect).
 */
export function useContactsSelection() {
  // ...
}
```

A well-named function with explicit types needs no JSDoc at all. Use inline `// WHY:` comments for local surprises, such as a nullable field kept on purpose or an `eslint-disable`.

### 12.7 No Chained or Negated Ternaries

**Impact: LOW (branch logic stays readable and testable)**

A ternary has one positive condition and two outcomes. Never chain them (`a ? x : b ? y : z`) and never start one with a negation (`!a ? x : y`), because readers have to evaluate the branches in reverse. Turn multi-branch decisions into a small named function with early returns. A pure decision belongs in `helpers/`, where `test.each` can cover it. Enforce with the ESLint rules `no-nested-ternary` and `no-negated-condition`.

**Incorrect (chained and negated):**

```tsx
const badgeType: BadgeType = !order.closingDate
  ? order.globalStatus === 'NOT_STARTED' ? 'error' : 'info'
  : 'success'
```

**Correct (named helper with early returns, positive conditions):**

```tsx
const getOrderBadgeType = ({ closingDate, globalStatus }: OrderDetail): BadgeType => {
  if (closingDate) return 'success'
  if (globalStatus === 'NOT_STARTED') return 'error'
  return 'info'
}

const badgeType = getOrderBadgeType(order)
```

A single positive ternary between two static i18n keys is fine: `t(isReadOnly ? 'common.close' : 'common.cancel')`. For JSX with three or more states, map each state to its content in a `Record<Status, ...>` or return early from a subcomponent.

---

## References

1. `vercel-react-best-practices`
