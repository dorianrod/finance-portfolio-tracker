<!-- GENERATED FILE — do not edit. Run: node scripts/build.mjs -->

# Generic React Best Practices

**Version 1.7.0**

Frontend Engineering

October 2026

> **Note:**  
> This document is mainly for agents and LLMs to follow when maintaining,  
> generating, or refactoring React code. Load `tailwind-design-system` only when implementing or reviewing code inside `shared/ui`, where advanced styling and design-system patterns belong. Composing shared UI primitives and using basic layout classes in domain code do not require that skill. This catalog owns architecture, composition, client-side performance and custom ESLint requirements, and takes precedence over conflicting companion guidance.

---

## Abstract

Opinionated React/TypeScript guidelines for any front-end app (React 19, TanStack Query v5, Jotai, Yup, react-i18next, Jest + React Testing Library), designed for AI agents and LLMs. The catalog covers domain-first architecture and import boundaries, API hooks and server state, query keys and cache invalidation, domain types, Yup schemas, UI composition and accessibility, Jotai client state, helpers, i18n, testing, code quality and client-side performance. Each rule includes a rationale and incorrect vs. correct examples using generic business vocabulary. The catalog also owns capability mapping, feature hierarchy, shared UI styling and accessibility boundaries, semantic colors, nested-children composition, component complexity review and public API maintenance.

---

## Table of Contents

1. [Architecture & Boundaries](#1-architecture--boundaries) — **CRITICAL**
   - 1.1 [Declare Every React Component as a View, State Renderer or Feature](#11-declare-every-react-component-as-a-view-state-renderer-or-feature)
   - 1.2 [Follow the Domain-First Folder Layout](#12-follow-the-domain-first-folder-layout)
   - 1.3 [Import Other Domains Only Through Transverse Domains](#13-import-other-domains-only-through-transverse-domains)
   - 1.4 [Keep Shared Code Within Its Ownership Boundary](#14-keep-shared-code-within-its-ownership-boundary)
   - 1.5 [Organize Every Domain into Vertical Feature Slices](#15-organize-every-domain-into-vertical-feature-slices)
   - 1.6 [Share Client State Through Jotai, Not Prop Chains or Context](#16-share-client-state-through-jotai-not-prop-chains-or-context)
   - 1.7 [Decompose Hook-Heavy Components by Responsibility](#17-decompose-hook-heavy-components-by-responsibility)
   - 1.8 [Define Boundaries Through Business Capabilities](#18-define-boundaries-through-business-capabilities)
   - 1.9 [Gate Experimental Features With a Typed Flag Registry](#19-gate-experimental-features-with-a-typed-flag-registry)
   - 1.10 [Isolate Effects in Intent-Named Hooks](#110-isolate-effects-in-intent-named-hooks)
   - 1.11 [Justify Feature Hierarchy Through Business Scope](#111-justify-feature-hierarchy-through-business-scope)
   - 1.12 [Keep Component Modules Focused on Components](#112-keep-component-modules-focused-on-components)
   - 1.13 [Keep Components Thin](#113-keep-components-thin)
   - 1.14 [Keep Visual Logic at the Component or Page Boundary](#114-keep-visual-logic-at-the-component-or-page-boundary)
   - 1.15 [No index.ts in stores/, One File per Concern](#115-no-indexts-in-stores-one-file-per-concern)
   - 1.16 [Review Component Complexity Before Splitting](#116-review-component-complexity-before-splitting)
   - 1.17 [Separate Helpers from Services by Effects and Orchestration](#117-separate-helpers-from-services-by-effects-and-orchestration)
   - 1.18 [Create a Sub-Domain Only for a Distinct Business Concept](#118-create-a-sub-domain-only-for-a-distinct-business-concept)
2. [API Hooks & Server State](#2-api-hooks--server-state) — **CRITICAL**
   - 2.1 [Validate Both Directions With Yup Inside Every API Hook](#21-validate-both-directions-with-yup-inside-every-api-hook)
   - 2.2 [Wrap Every Endpoint in a Domain API Hook](#22-wrap-every-endpoint-in-a-domain-api-hook)
   - 2.3 [Declare Every Endpoint in One Registry, Never Inline URLs](#23-declare-every-endpoint-in-one-registry-never-inline-urls)
   - 2.4 [Model Mutations as Input, Payload and Response](#24-model-mutations-as-input-payload-and-response)
   - 2.5 [Normalize API Errors Centrally and Translate Known Keys Before Display](#25-normalize-api-errors-centrally-and-translate-known-keys-before-display)
   - 2.6 [Pair Every Suspense Query With an Error Boundary and Handle 404 Separately](#26-pair-every-suspense-query-with-an-error-boundary-and-handle-404-separately)
   - 2.7 [Pick the TanStack Query Hook by Access Pattern](#27-pick-the-tanstack-query-hook-by-access-pattern)
   - 2.8 [Return the TanStack Result As-Is From API Hooks](#28-return-the-tanstack-result-as-is-from-api-hooks)
   - 2.9 [Schedule Independent Async Work Concurrently](#29-schedule-independent-async-work-concurrently)
   - 2.10 [Type API Hooks With the Domain Entity and Let the Return Type Infer](#210-type-api-hooks-with-the-domain-entity-and-let-the-return-type-infer)
   - 2.11 [Use Optimistic Updates Only Where Latency Is Visible, With Rollback](#211-use-optimistic-updates-only-where-latency-is-visible-with-rollback)
   - 2.12 [Use TData = void for Body-less or Response-less Mutations](#212-use-tdata--void-for-body-less-or-response-less-mutations)
   - 2.13 [Destructure Query Data With a Business Name](#213-destructure-query-data-with-a-business-name)
   - 2.14 [Name API Hooks After the Endpoint Intent](#214-name-api-hooks-after-the-endpoint-intent)
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
   - 7.1 [Centralize Accessibility in Shared UI Primitives](#71-centralize-accessibility-in-shared-ui-primitives)
   - 7.2 [Delegate Mapped JSX to a Component](#72-delegate-mapped-jsx-to-a-component)
   - 7.3 [Keep className Out of Shared UI Component APIs](#73-keep-classname-out-of-shared-ui-component-apis)
   - 7.4 [Keep Colors Semantic Behind Shared UI](#74-keep-colors-semantic-behind-shared-ui)
   - 7.5 [Keep Compound Component Slots as Direct, Renderable Children](#75-keep-compound-component-slots-as-direct-renderable-children)
   - 7.6 [Keep Dialog Mounted and Drive It with a Boolean open](#76-keep-dialog-mounted-and-drive-it-with-a-boolean-open)
   - 7.7 [Lazy Load Heavy Optional UI](#77-lazy-load-heavy-optional-ui)
   - 7.8 [Name Compound Render Conditions by Intent](#78-name-compound-render-conditions-by-intent)
   - 7.9 [Never Nest a form Inside a form](#79-never-nest-a-form-inside-a-form)
   - 7.10 [Require Composition Through Nested Children](#710-require-composition-through-nested-children)
   - 7.11 [Wrap the Whole Dialog in a Form Keyed on the Open Target](#711-wrap-the-whole-dialog-in-a-form-keyed-on-the-open-target)
   - 7.12 [Defer Offscreen Rendering in Shared UI](#712-defer-offscreen-rendering-in-shared-ui)
   - 7.13 [Style with Design System Components, Utility Classes Only for Layout](#713-style-with-design-system-components-utility-classes-only-for-layout)
   - 7.14 [Give Icon-Only Buttons and Custom Controls an Accessible Name](#714-give-icon-only-buttons-and-custom-controls-an-accessible-name)
   - 7.15 [Keep Inputs Responsive During Expensive Renders](#715-keep-inputs-responsive-during-expensive-renders)
   - 7.16 [Prefer Explicit Component Variants Over Mode Flags](#716-prefer-explicit-component-variants-over-mode-flags)
8. [Jotai Client State](#8-jotai-client-state) — **MEDIUM-HIGH**
   - 8.1 [Create Atoms at Module Scope, Never During Render](#81-create-atoms-at-module-scope-never-during-render)
   - 8.2 [Keep Server Data in React Query, Not in Atoms](#82-keep-server-data-in-react-query-not-in-atoms)
   - 8.3 [Place Stores at Feature or Page Level by Reuse](#83-place-stores-at-feature-or-page-level-by-reuse)
   - 8.4 [Reuse App Atom Factories Instead of Hand-Rolled Atoms](#84-reuse-app-atom-factories-instead-of-hand-rolled-atoms)
   - 8.5 [Derive Atoms Instead of Storing Duplicates](#85-derive-atoms-instead-of-storing-duplicates)
   - 8.6 [Persist Atoms with atomWithStorage and a Unique Key](#86-persist-atoms-with-atomwithstorage-and-a-unique-key)
   - 8.7 [Type Atoms Explicitly with DEFAULT_* Constants](#87-type-atoms-explicitly-with-default-constants)
   - 8.8 [Update Client State From Its Previous Value](#88-update-client-state-from-its-previous-value)
   - 8.9 [Prefix Atoms with Their Entity](#89-prefix-atoms-with-their-entity)
   - 8.10 [Pick useAtomValue, useSetAtom or useAtom by Need](#810-pick-useatomvalue-usesetatom-or-useatom-by-need)
9. [Helpers](#9-helpers) — **MEDIUM-HIGH**
   - 9.1 [Format Entities Through Formatter Hooks, Never Inline](#91-format-entities-through-formatter-hooks-never-inline)
   - 9.2 [Keep Business Rules as Pure, Intent-Named Predicates](#92-keep-business-rules-as-pure-intent-named-predicates)
   - 9.3 [Never Pass t, navigate or Stores to a Helper](#93-never-pass-t-navigate-or-stores-to-a-helper)
   - 9.4 [Preserve Collection Inputs When Transforming](#94-preserve-collection-inputs-when-transforming)
   - 9.5 [Sort Every Helper Into One of a Fixed Set of Categories](#95-sort-every-helper-into-one-of-a-fixed-set-of-categories)
   - 9.6 [Index Collections for Repeated Lookups](#96-index-collections-for-repeated-lookups)
10. [Internationalization](#10-internationalization) — **MEDIUM**
   - 10.1 [Inject Dynamic Values Through t() Options, Never Concatenation](#101-inject-dynamic-values-through-t-options-never-concatenation)
   - 10.2 [Never Use defaultValue in t()](#102-never-use-defaultvalue-in-t)
   - 10.3 [Translate Every User-Facing String with a Catalog Key](#103-translate-every-user-facing-string-with-a-catalog-key)
   - 10.4 [Use Literal Translation Keys Only](#104-use-literal-translation-keys-only)
11. [Testing](#11-testing) — **MEDIUM**
   - 11.1 [Assert Behavior with Parametrized, Unconditional Tests](#111-assert-behavior-with-parametrized-unconditional-tests)
   - 11.2 [Build Typed, Deterministic Mock Data in the Owning mocks Folder](#112-build-typed-deterministic-mock-data-in-the-owning-mocks-folder)
   - 11.3 [Colocate a Test Next to Every File, Covering Errors](#113-colocate-a-test-next-to-every-file-covering-errors)
   - 11.4 [Isolate Jotai State with a Fresh Store per Test](#114-isolate-jotai-state-with-a-fresh-store-per-test)
   - 11.5 [Mock the Network Boundary, Never Internal Modules](#115-mock-the-network-boundary-never-internal-modules)
   - 11.6 [Query by Role and Label, Interact with userEvent](#116-query-by-role-and-label-interact-with-userevent)
   - 11.7 [Test API Hooks with renderHook and a Per-Test Query Wrapper](#117-test-api-hooks-with-renderhook-and-a-per-test-query-wrapper)
12. [Code Quality](#12-code-quality) — **HIGH**
   - 12.1 [Avoid Deprecated APIs](#121-avoid-deprecated-apis)
   - 12.2 [Keep an Explicit ESLint Warning Budget](#122-keep-an-explicit-eslint-warning-budget)
   - 12.3 [Review and Date ESLint Exceptions](#123-review-and-date-eslint-exceptions)
   - 12.4 [Export One Public Value per File](#124-export-one-public-value-per-file)
   - 12.5 [Never Build Hooks from Hooks (No createUseXxx Factories)](#125-never-build-hooks-from-hooks-no-createusexxx-factories)
   - 12.6 [No Clickable No-Op Links or Actions](#126-no-clickable-no-op-links-or-actions)
   - 12.7 [Place the Public API First](#127-place-the-public-api-first)
   - 12.8 [Prefer ref as a Prop in React 19](#128-prefer-ref-as-a-prop-in-react-19)
   - 12.9 [useMemo for Data, useCallback for Functions](#129-usememo-for-data-usecallback-for-functions)
   - 12.10 [Write Code, Comments and Tests in English](#1210-write-code-comments-and-tests-in-english)
   - 12.11 [Keep JSDoc for Non-Obvious Intent Only](#1211-keep-jsdoc-for-non-obvious-intent-only)
   - 12.12 [No Chained or Negated Ternaries](#1212-no-chained-or-negated-ternaries)

---

## 1. Architecture & Boundaries

**Impact: CRITICAL**

A domain-first layout, vertical feature slices and strict import boundaries keep capabilities cohesive, prevent circular dependencies and make every file's ownership and responsibility obvious from its location.

### 1.1 Declare Every React Component as a View, State Renderer or Feature

**Impact: CRITICAL (makes component ownership and data-flow boundaries explicit)**

Classify every production React component module by responsibility:

- `*.view.tsx` renders display-ready data. It may format or clamp values for display, manage accessibility, and keep local visual state such as hover, tooltip or accordion state.
- `*.state.tsx` receives one resolved discriminated union and exhaustively maps its variants to UI. It may translate semantic state reasons and compose views, state renderers or features, but it does not build the union, call hooks or read business state at runtime.
- `*.feature.tsx` owns business orchestration. It reads queries or atoms, invokes actions and pure business helpers, and supplies display-ready props to views.

The suffix is a controlled declaration, not proof that the implementation is correctly classified. During review, verify the imports and responsibilities. Split a file that mixes feature orchestration with reusable presentation components; every component left in a module inherits that module's role. Entrypoints and test modules may remain unsuffixed, while colocated tests should follow the classified source name.

A view may import React, visual libraries, other views, types, formatters, and colocalized purely visual logic. It must not import a state renderer, feature or runtime dependencies from server-state hooks, client stores, APIs, services, or business helpers. If a deep component needs shared client state, classify it as a feature and let it read the atom directly.

A state renderer is a narrow composition boundary for states such as loading, error, empty, unavailable, degraded and ready. Its owning feature or a pure mapper resolves precedence and constructs the union before rendering. Each union variant carries only the data valid for that state, and the state renderer handles every variant exhaustively with a `never` check. Keep one-off optional sections and simple visual variants in their owning component instead of creating a state renderer.

### Choose the boundary by ownership

Create a feature only when the component owns an autonomous business responsibility. At least one of these must be true:

- it reads or updates server or shared client state;
- it invokes an action, mutation or navigation workflow;
- it applies a business rule or calculation for its own subtree;
- it transforms raw domain inputs into a display model for its own subtree;
- it coordinates business states such as availability, permissions, loading or errors;
- it composes features or state renderers into a named business workflow. Reuse alone does not establish a business responsibility.

Use a view when its complete behavior can be exercised with display-ready props and interaction callbacks, without installing business providers or mocking queries and stores.

Use a state renderer when a surface has multiple mutually exclusive UI states and naming the boundary removes boolean combinations or repeated fallback conditions from its parent. A state renderer may accept explicit interaction callbacks such as `onRetry`, but it never discovers those actions through hooks.

Do not create a feature merely because a component receives raw props, and do not create a matching view for every feature. Split a feature from its view only when the visual part has an independent contract: it is reused with another data source, has meaningful visual variants or interactions, benefits from isolated rendering tests, or contains enough layout to obscure the orchestration. A feature with trivial markup may render that markup directly.

### Decide the role before deciding the split

Use observable responsibility rather than component size, naming or the presence of a hook:

| Responsibility | Role |
| --- | --- |
| Render a supplied entity, translate its labels, format amounts/dates | View |
| Keep hover, disclosure, focus or local visual selection state | View |
| Invoke a supplied `onSelect`/`onRetry` callback without owning the action | View |
| Clamp a meter, choose a visual tone or prepare chart geometry | View with a scoped presenter when needed |
| Read a query/atom, own a mutation/navigation action, aggregate business values or decide eligibility | Feature |
| Compose child features/state renderers into a business surface, even without its own hook | Feature |
| Exhaustively render an already resolved loading/error/empty/ready union | State renderer |

Receiving an entity does not make a component a feature. Neither `useState`, `useMemo`, `useFormatXxx`, reuse by several parents nor a `use…` name proves business ownership. Deriving a business metric or resolving permissions differs from formatting an already supplied value. A formatter that reads business state is not a way to hide that dependency from a view.

Decide the role first, then whether extraction creates a useful visual contract. A genuine feature may keep a short button or tightly coupled JSX. A large JSX count is a review signal, not an automatic extraction rule. Inspect every local component in mixed modules; the outer feature's business imports do not justify a purely visual local child.

Shared UI views may use their own UI behavior services/stores, including Jotai for primitive interaction state. This exception does not permit server queries, application stores or domain state in shared UI. Domain views cannot import business services merely because those services also manage UI state.

### ESLint enforcement and review inventory

Enable `local/component-role` at error level. Check runtime imports, reexports and literal dynamic imports using resolved module paths, including configured aliases, extensionless imports and local reexport modules. Ignore erased type-only edges. Follow local runtime dependencies through indirection to detect hidden feature/state/API/store/service dependencies; report the path. Another classified view owns its own enforcement, and shared UI owns its primitive behavior boundary. Pure business classifications inside a label formatter do not by themselves introduce shared state or orchestration.

Reject features proven to contain only presentation, formatting and local React UI state. Keep feature composition valid. Resolve imported aliases and stable local bindings; a shadowed binding or opaque custom call is not proof of business ownership or of its absence. Verify the checks against the consuming project's actual configuration, including aliases, dynamic imports, a reexport chain, type-only neighbors and cycles.

Provide a repeatable candidate inventory alongside lint. Enumerate features with no identified business signal, opaque calls, local presentation components and substantial JSX. Include file/line, observed business dependencies and unresolved calls so the reviewer can group the whole family before fixing it. Keep these candidates separate from errors and from the warning budget. Inventory output is a triage aid, not evidence of completed semantic review; callback parameters, computed imports, opaque wrappers and business meanings still need inspection.

### Audit every component boundary

An architecture audit is incomplete if it only verifies suffixes and import restrictions. For every `.feature.tsx`, inspect the component responsibilities and reach an explicit boundary decision:

1. Name the business responsibility that justifies the feature.
2. Identify the JSX and local components that only present display-ready data.
3. Decide whether that presentation has an independent visual contract and should move to a `.view.tsx` module.
4. If the feature remains unsplit, verify that its JSX is trivial, tightly coupled to its orchestration, or otherwise has no useful independent contract.

For every `.state.tsx`, verify that the discriminated union is constructed outside the component, its branches are exhaustive, and it contains no hooks or runtime business imports.

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

**Incorrect (the component receives combinations that permit impossible states):**

```tsx
// OrdersState.feature.tsx
export function OrdersState({ loading, error, orders }: Props) {
  if (loading) return <Spinner />
  if (error) return <ErrorMessage error={error} />
  if (orders.length === 0) return <EmptyOrders />
  return <OrdersList orders={orders} />
}
```

**Correct (a mapper resolves one union before an exhaustive state renderer):**

```tsx
// OrdersState.state.tsx
type OrdersViewState =
  | { status: 'loading' }
  | { status: 'error'; error: unknown }
  | { status: 'empty' }
  | { status: 'ready'; orders: Order[] }

export function OrdersState({ state, onRetry }: {
  state: OrdersViewState
  onRetry: () => void
}) {
  switch (state.status) {
    case 'loading': return <Spinner />
    case 'error': return <ErrorMessage error={state.error} onRetry={onRetry} />
    case 'empty': return <EmptyOrders />
    case 'ready': return <OrdersList orders={state.orders} />
  }
  const exhaustiveState: never = state
  return exhaustiveState
}
```

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

- Every production component module declares `.view.tsx`, `.state.tsx` or `.feature.tsx`.
- A view has no runtime import of a state renderer, feature, query, atom, API, service, store or business helper.
- A state renderer receives a resolved discriminated union, renders it exhaustively and has no hooks or runtime business imports.
- Enable `local/state-component-contract` to reject runtime business imports and hook calls in state renderers. Resolve imported/immutable hook aliases, React namespace calls and React 19 `use`; respect shadowing. Opaque wrappers still require manual review. Verify rejected and valid cases through the actual project configuration.
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
    │   │   ├── helpers/{formatters,mappers,…}/
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

See also: `arch-feature-slice-layout`, `arch-shared-no-domain-knowledge`, `arch-subdomain-decision`

### 1.3 Import Other Domains Only Through Transverse Domains

**Impact: CRITICAL (keeps domains isolated and free of import cycles)**

A domain imports only from itself, from `src/shared`, and from an explicit short list of transverse domains (stable, generic, no business context: for example `appShell` or a `featureFlags` module). Sibling sub-domains (e.g. `orders` and `invoices`) and other business domains (`projects`, `contracts`, `directory`...) are forbidden: such imports couple release cycles and create import cycles. Enforce the allowed list with an ESLint restriction on import paths.

**Incorrect (orders reaches into its sibling invoices):**

```tsx
// src/domains/sales/orders/features/detail/pages/detail/components/InvoicesBlock.tsx
import { InvoiceCard } from '@/domains/sales/invoices/features/detail/components/InvoiceCard.feature'
```

**Correct (shared code is promoted, transverse domains are imported freely):**

```tsx
// Promoted once to the main domain's shared folder, used by both sub-domains
import { toOrderReference } from '@/domains/sales/shared/helpers/mappers/toOrderReference'
// Transverse domains from the explicit list are always allowed, through their public entry
import { Alert } from '@/domains/appShell/features/alerts/components/Alert.view'
import { useFlag } from '@/domains/featureFlags/features/registry/services/useFlag'
```

Escape hatches, in order of preference:

1. Move the code to the main domain's `shared/` (used by sibling sub-domains) or to `src/shared/` (generic, no domain vocabulary).
2. Reference the other entity by id or route (store `projectId`, link with a path string) instead of importing its hooks or components.
3. Add a domain to the transverse list only by an explicit architecture decision.

See also: `arch-shared-no-domain-knowledge`, `arch-feature-flags`

### 1.4 Keep Shared Code Within Its Ownership Boundary

**Impact: CRITICAL (keeps shared code reusable at its scope and prevents downward dependencies)**

The meaning of `shared/` is relative to its owner. `src/shared/` has no business-domain knowledge. A scoped folder such as `src/domains/sales/shared/`, `src/domains/sales/orders/shared/` or `features/detail/shared/` may use the stable vocabulary of its enclosing scope, but its reusable contracts and non-UI code never import from or name a descendant sub-domain, feature or nested feature.

Place shared code at the nearest common ancestor of all its consumers. Reusable shared code may depend only on shared code at the same or an ancestor scope; it never depends downward on a descendant. This keeps reuse local, prevents cycles and avoids turning a high-level `shared/` folder into a business catch-all.

**Incorrect (main-domain shared code knows about a descendant entity):**

```tsx
// src/domains/sales/shared/types/invoiceAccess.type.ts
export interface InvoiceAccess {
  invoiceId: string
  recipientEmail: string
}
```

**Correct (entity vocabulary stays in the entity's own shared boundary):**

```tsx
// src/domains/sales/invoices/shared/types/invoiceAccess.type.ts
export interface InvoiceAccess {
  invoiceId: string
  recipientEmail: string
}
```

An entity-level `shared/` may contain entity types and components used by several of its features. The same requirement applies to a parent feature's `shared/`: require production consumers from at least two distinct immediate child capabilities. Several files within one feature count as one consumer. Resolve indirect usage through shared helpers, barrels and type-only contracts; tests, stories, mocks and application wrappers do not count as features.

The parent/leaf folder convention is not a sharing exception. A parent's cohesive business behavior belongs to a named child feature if it serves no other feature. Application pages compose features; shared code does not import descendant entry components or private implementation. A reusable business workflow remains a feature even when several callers use it. If all consumers belong to one branch, move the module to that branch's nearest owner instead of using shared code to evade a sibling-import restriction.

Static import graphs cannot always prove use of common inputs passed through application props. Flag missing evidence for review and inspect the actual consumers; do not add fake imports or broad exemptions. Keep genuine common source requests cached and avoid duplicating them merely to satisfy folder counts. A leaf feature owns role folders directly, without a `shared/` wrapper.

A reference or demo folder using business vocabulary is not shared code: forbid importing it from production code with ESLint.

See also: `arch-domain-first-layout`, `arch-feature-slice-layout`, `arch-transverse-only-imports`

### Shared UI APIs and Indirect Dependencies

Global `shared/ui` primitives render generic UI roles without interpreting business entities, operations or metrics. An import-free primitive still violates ownership when its props name an order status, its variants encode a business operation, or its defaults choose a business currency, label or threshold. Moving the lookup into a theme module or a generic-sounding helper does not remove the business dependency.

Keep adapters in the owning domain: the domain maps an order status to `positive` or `warning` and supplies labels and actions; a shared badge renders that generic tone and nested content. Charts receive generic series and UI palette roles rather than a business category registry. Inspect public names, literal unions, defaults, branches, type-only contracts and transitive dependencies; passing import lint is not proof of domain independence.

UI selection, expansion, dismissal, generic chart geometry and generic numeric formatting remain shared UI concerns. Caller-provided labels may contain business vocabulary when the primitive renders them without interpretation. Domain-scoped shared components may know their own business scope. Tests and isolated stories may use realistic fixtures without introducing business contracts into production primitives.

See also: `ui-no-adhoc-styling`, `ui-centralize-accessibility`, `ui-semantic-colors`

### ESLint Enforcement

Use the custom ESLint rule `local/shared-feature-usage` to report exclusive one-feature ownership and missing production consumers in resolved import graphs. Use a separate `local/review-shared-feature-sharing` warning when consumers outside the owning feature tree prevent proving reuse. An indeterminate graph requests review rather than establishing an invalid owner. Keep layout diagnostics in `local/feature-folder-layout` and forbidden dependencies in `local/import-boundaries`; these ESLint rules should share the same business-scope interpretation without duplicating diagnostics.

When application props distribute common inputs, inspect actual feature consumers. A reviewed line-scoped suppression may address `local/review-shared-feature-sharing` with concrete evidence; it must not disable proven ownership errors. Do not count application wrappers as features, add fake imports or exempt all parent-owned code. Folder moves require a business ownership decision and have no automatic fix.

Import-boundary checks should resolve imports, re-exports, dynamic imports and type imports from global shared code into application or domain modules, and prevent production imports of Storybook modules. They cannot detect business knowledge declared locally or hidden in another shared module. Review names, literal unions, branches, defaults and transitive dependencies even when lint passes.

### 1.5 Organize Every Domain into Vertical Feature Slices

**Impact: CRITICAL (keeps each business capability cohesive and prevents overlapping technical buckets)**

Use `features/` when a domain or entity contains several distinct business capabilities. A small domain that already represents one cohesive capability may own its role folders directly; do not add a feature wrapper merely to satisfy a template. Conversely, once several capabilities coexist, move them into named vertical slices instead of scattering them across domain-level role folders.

Name a feature after a cohesive business capability or user-facing responsibility. Never introduce a generic wrapper such as `screen`, `main`, `workspace` or a repetition of the domain name when its only purpose is to contain all the real features. A feature owns only the role folders it needs among `apis/`, `components/`, `constants/`, `helpers/`, `mocks/`, `pages/`, `services/`, `stores` and `types/`; do not group code by implementation technique in catch-all folders such as `charts/`, `cards/`, `modals/`, `common/` or `misc/`.

A feature containing `features/` must keep every other role folder under its own `shared/`; only `features/` and `shared/` hold its implementation at that level. Every module in that shared scope must serve multiple distinct child features. Put a cohesive parent-only responsibility in a named child feature, and compose child entry components from the application. A leaf feature without `features/` keeps `components/`, `helpers/`, `services/`, `stores/`, and other role folders directly at its root; do not add an unnecessary `shared/` wrapper. Do not mix these two layouts.

Before reorganizing slices, identify their user outcomes and business owners with `arch-business-capability-boundaries`, then justify peers, children and variants with `arch-feature-hierarchy`. The folder convention implements those business decisions.

Allow at most two feature levels below a domain: `features/<feature>/` and, when a genuinely distinct responsibility needs it, `features/<feature>/features/<subfeature>/`. Do not nest a third feature level. Promote an overgrown sub-feature to the domain's first level or introduce a real sub-domain when it has an independent business lifecycle. A sub-feature must express a responsibility, not merely isolate one file or technical category.

**Incorrect (technical buckets and a redundant screen wrapper obscure ownership):**

```text
src/domains/sales/orders/
└── features/
    └── screen/                         # generic wrapper with no business responsibility
        └── features/
            └── detail/
                └── features/
                    └── access-management/ # third feature level
```

**Correct (the capability and its nested responsibility own complete vertical slices):**

```text
src/domains/sales/orders/
├── features/
│   └── detail/
│       ├── shared/
│       │   └── types/detailSection.type.ts
│       └── features/
│           ├── access-management/
│           │   ├── apis/queries/useOrderAccessesQuery.ts
│           │   ├── components/OrderAccessPanel.feature.tsx
│           │   ├── helpers/mappers/toOrderAccessRows.ts
│           │   ├── services/useResendOrderAccess.ts
│           │   └── types/orderAccess.type.ts
│           └── history/                  # also consumes detailSection.type.ts
└── shared/
    └── types/orderSummary.type.ts
```

Application pages compose feature entry components. Sibling features never import each other directly: move code they both need to the nearest common ancestor's `shared/<role>/` folder. A sub-feature may depend on `shared/` folders owned by its ancestors, while shared code never depends on a descendant feature. Do not move a feature or parent-only composition into `shared/` to bypass import restrictions. Apply this direction at both supported feature levels and keep promotion local instead of turning domain-wide shared folders into catch-alls.

Extract the complete responsibility: feature-specific calculations, types and state move with the components. Common inputs may live in shared code used by several children; child-specific logic belongs to its child and application code composes the children. Child-specific code stays inside its child even when only the parent currently calls it. Having children does not automatically establish shared ownership. Inspect actual consumers: several files in one feature count as one feature, and tests or application wrappers do not establish reuse. A business capability remains a feature even if multiple callers use it.

See also: `arch-domain-first-layout`, `arch-shared-no-domain-knowledge`, `arch-subdomain-decision`

### Transfer the Whole Responsibility

When extracting a feature, inspect transformations, validation, API orchestration, business predicates, types and interaction state, including code hidden in parent hooks and broad service modules. Move every child-specific result with the child. Parents may load genuine common inputs and coordinate application composition; reuse cached ancestor-owned sources rather than duplicating requests to give folders an appearance of independence.

Static imports may not prove consumers when application composition passes common inputs as props. Inspect the actual inputs and record the capability evidence instead of inventing imports or treating application wrappers as features. Proven exclusive ownership remains a violation; uncertainty requests review rather than establishing a new exemption. Follow `arch-shared-no-domain-knowledge` for nearest-owner placement and evidence of sharing.

See also: `arch-business-capability-boundaries`, `arch-feature-hierarchy`

### 1.6 Share Client State Through Jotai, Not Prop Chains or Context

**Impact: CRITICAL (prevents prop drilling and oversized UI hooks)**

State consumed below its owner must not be threaded through intermediate component props or moved into an application React Context. Put shared client state in page- or domain-scoped Jotai atoms. A component that needs a value reads the atom directly; a component that needs to change it calls a focused hook that owns the write operations.

Apply this rule together with `arch-component-roles`. A view may receive calculations and display-ready objects because rendering them is its declared responsibility. A feature should receive raw business inputs or read shared state itself; warn when a parent derives a value from its own props and passes that result to another feature. The warning is a review signal: move the calculation to the receiving feature when it owns the decision, classify a truly presentational child as a view, or suppress only the verified exception on the affected line with a reason.

Keep each stateful hook aligned with one concern. For example, split filters, sorting, selection and modal behavior into `useOrdersPageFilters`, `useOrdersPageSort`, `useOrdersPageSelection` and `useOrdersPageModal`. A `useOrdersPageUi` hook may compose these hooks as a thin facade for a caller that genuinely needs all of them, but it must not become the owner of several unrelated `useState` values or a mandatory gateway for deep consumers.

**Incorrect (one hook owns unrelated state, then drills values and actions):**

```tsx
function useOrdersPageUi() {
  const [filters, setFilters] = useState<OrdersPageFilters>(DEFAULT_ORDERS_PAGE_FILTERS)
  const [sort, setSort] = useState<OrdersPageSort>(DEFAULT_ORDERS_PAGE_SORT)
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  return { filters, setFilters, sort, setSort, selectedIds, setSelectedIds }
}

function OrdersPage() {
  const ordersPageUi = useOrdersPageUi()
  return <OrdersPageBody filters={ordersPageUi.filters} setFilters={ordersPageUi.setFilters} />
}

function OrdersPageBody(props: OrdersPageBodyProps) {
  return <OrdersPageToolbar filters={props.filters} setFilters={props.setFilters} />
}
```

Creating an `OrdersPageContext` and consuming it with `useContext` or `use(context)` is not an accepted fix: it hides the same broad dependency behind a provider and keeps unrelated responsibilities coupled.

**Correct (atoms own values; focused hooks own actions; consumers subscribe where needed):**

```tsx
// pages/orders/stores/ordersPageFilters.atoms.ts
export const ordersPageFiltersAtom = atom<OrdersPageFilters>(DEFAULT_ORDERS_PAGE_FILTERS)

// pages/orders/stores/ordersPageSort.atoms.ts
export const ordersPageSortAtom = atom<OrdersPageSort>(DEFAULT_ORDERS_PAGE_SORT)

// pages/orders/services/useOrdersPageFilters.ts
export function useOrdersPageFilters() {
  const setFilters = useSetAtom(ordersPageFiltersAtom)

  const setStatus = useCallback(
    (status: OrderStatus | null) => setFilters(current => ({ ...current, status })),
    [setFilters],
  )
  const resetFilters = useCallback(() => setFilters(DEFAULT_ORDERS_PAGE_FILTERS), [setFilters])

  return useMemo(() => ({ setStatus, resetFilters }), [setStatus, resetFilters])
}

// pages/orders/components/OrdersPageToolbar.tsx
function OrdersPageToolbar() {
  const filters = useAtomValue(ordersPageFiltersAtom)
  const { setStatus, resetFilters } = useOrdersPageFilters()

  return <Filters value={filters} onStatusChange={setStatus} onReset={resetFilters} />
}

// A different deep consumer reads only what it needs, without intermediary props.
function OrdersPageResults() {
  const sort = useAtomValue(ordersPageSortAtom)
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
- A new `createContext`, `useContext` or `use(context)` exists primarily to avoid passing client UI state through props.

### Summary

- Keep truly local, unreturned UI state in `useState`, such as hover or one component's accordion state.
- Keep server state in TanStack Query, never in Jotai.
- Put shared client state in scoped atoms and read it directly with `useAtomValue`.
- Expose writes through small responsibility-specific hooks using `useSetAtom`; use `useAtom` only when one consumer genuinely reads and writes.
- Keep explicit props for a direct parent-child API. The smell is an intermediary that forwards props it does not use.
- Pass display-ready values to views. Pass raw inputs to features unless orchestration ownership makes a narrowly documented exception necessary.
- Do not create application React Contexts for state sharing, including inside project-owned compound UI components. Third-party providers and their consuming hooks required by a library remain outside this rule.

See also: `quality-usecallback-for-functions`

### 1.7 Decompose Hook-Heavy Components by Responsibility

**Impact: HIGH (hook count reveals components coordinating too many concerns)**

A component with many direct hook calls is a refactoring signal. Group related subscriptions, actions and derived values behind an intent-named custom hook when they form one responsibility; extract a child component when the concern also owns an independent rendered region. Keep pure calculations outside hooks.

Do not game a hook-count warning with a generic umbrella hook that merely returns every value. The extraction must create a cohesive boundary with a small interface, such as search state, selection actions or virtual-list measurement.

**Incorrect (the component coordinates unrelated concerns directly):**

```tsx
function OrdersWorkspace() {
  const { data: orders } = useOrdersQuery()
  const filters = useAtomValue(orderFiltersAtom)
  const selection = useAtomValue(orderSelectionAtom)
  const setSelection = useSetAtom(orderSelectionAtom)
  const formatMoney = useFormatMoney()
  const [panelOpen, setPanelOpen] = useState(false)
  const rows = useMemo(() => buildOrderRows(orders, filters), [orders, filters])
  // filtering, selection, panel actions and rendering continue here
}
```

**Correct (each extracted boundary owns one responsibility):**

```tsx
function OrdersWorkspace() {
  const { rows, selection, selectOrder } = useOrdersTable()
  const panel = useOrderDetailsPanel()

  return (
    <OrdersTable
      rows={rows}
      selection={selection}
      onSelect={selectOrder}
      onOpenDetails={panel.open}
    />
  )
}
```

The lint threshold is diagnostic, not a target for every component. When a component legitimately wires several facets of one cohesive primitive, document the narrow exception instead of inventing an artificial abstraction.

Enable `local/max-hooks-per-component` at error level. Count direct conventional hook calls and resolved React hooks, including imported aliases, immutable aliases, destructured namespace bindings and React 19 `use`. Recognize components wrapped with resolved React `memo` or `forwardRef`, including aliases. Respect lexical shadowing and exclude calls inside nested callbacks from the containing component's count. Hook behavior hidden behind arbitrary wrappers or reassigned aliases still requires review. Exercise rejected and valid neighboring examples through the application's actual configuration.

See also: `arch-thin-components`, `arch-helpers-vs-services`, `quality-usecallback-for-functions`

### 1.8 Define Boundaries Through Business Capabilities

**Impact: HIGH**

**Rule:** Define each domain and feature by its business scope and user outcome before choosing its folders.

A valid folder structure can still hide inconsistent responsibilities. Start from what the user needs to understand or accomplish, then identify the owner of its vocabulary, rules and state.

### Applies When

- Creating, reviewing or reorganizing domains and features.
- Distinguishing a business scope from a screen, delivery mechanism or reusable component.

Use these meanings:

| Boundary | Decision criterion |
| --- | --- |
| Domain | A coherent business scope with its own vocabulary and rules. |
| Sub-domain | A distinct business concept with meaningful ownership and evolution within that scope. |
| Feature | A cohesive capability serving an identifiable user outcome. |
| Sub-feature | A distinct responsibility that belongs to a broader capability. |
| Variant | A dimension, period or mode of the same capability. |

For an architecture review, write a short capability map before proposing moves: name each capability, its user outcome, its parent and the reason for that relationship, then identify the owners of its data, business rules and state. Derive those names and relationships from the application's users, vocabulary and workflows. The resulting tree must follow those decisions.

**Incorrect:**
```text
domains/example/features/
└── screen/                    # justified only by the screen name
    └── features/capability/
```

**Correct:**
```text
domains/example/features/
└── capability/                   # justified by an identifiable user outcome
```

The names in these trees are schematic; choose meaningful business names for the actual application. Routes and tabs may compose several capabilities; they do not automatically own them. Endpoint count, CRUD, permission differences and independent lifecycles can support a boundary, but are not mandatory conditions.

### Exceptions

- A small domain with one cohesive capability may keep its role folders directly; do not add empty feature wrappers.
- Preserve established business vocabulary when it describes a real responsibility, even if a route uses the same name.
- A reusable visual element without a distinct business outcome remains a component rather than becoming a feature.

### References

- [Feature hierarchy](rules/arch-feature-hierarchy.md) — choose siblings, children and variants.
- [Feature ownership](rules/arch-shared-no-domain-knowledge.md) — move the responsibility with its implementation.
- [domain layout](rules/arch-domain-first-layout.md) — folder and import conventions.

### 1.9 Gate Experimental Features With a Typed Flag Registry

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
// src/domains/featureFlags/features/registry/constants/flags.ts
export const FLAGS = {
  ordersExportV2: { description: 'New export dialog on the orders list' },
} as const satisfies Record<string, { description: string }>

export type FlagKey = keyof typeof FLAGS

// src/domains/featureFlags/features/registry/services/useFlag.ts
export const useFlag = (key: FlagKey): boolean => useAtomValue(flagsAtom)[key] ?? false

// src/domains/sales/orders/features/list/pages/list/components/OrdersToolbar.tsx
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

### 1.10 Isolate Effects in Intent-Named Hooks

**Impact: HIGH (synchronization responsibilities stay explicit and independently testable)**

Do not place `useEffect` or `useLayoutEffect` directly in a component. First remove effects that only derive render state or respond to a user action. When synchronization with an external system is genuinely required, isolate it in a custom hook named after the synchronization intent, not after the React primitive.

**Incorrect (the rendering component owns browser synchronization):**

```tsx
function OrderPanel({ orderId }: { orderId: string }) {
  useEffect(() => {
    document.title = `Order ${orderId}`
  }, [orderId])

  return <OrderDetails orderId={orderId} />
}
```

**Correct (the effect has a focused, intention-revealing service file):**

```tsx
// OrderPanel/services/useOrderDocumentTitle.ts
export function useOrderDocumentTitle(orderId: string): void {
  useEffect(() => {
    document.title = `Order ${orderId}`
  }, [orderId])
}
```

```tsx
// OrderPanel/OrderPanel.feature.tsx
import { useOrderDocumentTitle } from './services/useOrderDocumentTitle'

function OrderPanel({ orderId }: { orderId: string }) {
  useOrderDocumentTitle(orderId)
  return <OrderDetails orderId={orderId} />
}
```

Keep the hook in the named component directory when it has one consumer, under the page when several components of that page use it, or in the owning feature's `services/` when reused across pages. The hook should expose inputs and outputs for its responsibility rather than component implementation details.

### Reactive Dependencies and Lifecycle

Use the reactive values actually read by synchronization as dependencies. Prefer a specific field such as `order.id` when the effect only needs that field; do not omit a dependency to reduce reruns. Separate independent synchronization responsibilities instead of giving them one combined dependency set. A user-triggered mutation stays in its page action, while a pure derivation is calculated during render or in a derived atom (`state-derived-atoms`). Moving either into a custom effect hook does not make the effect necessary.

When the installed React version provides `useEffectEvent`, use it only for genuinely nonreactive logic invoked by an effect or its subscription. Keep the effect's reactive dependencies; exclude the Effect Event itself from the dependency array and keep it inside its owning hook. Do not use it as a general stable callback, pass it to another component/hook or use it to hide a synchronization dependency.

Pair subscriptions, timers and listeners with cleanup. Share an app-wide subscription through its actual owner rather than installing one listener per unrelated consumer. Use passive touch/wheel listeners only when they never need `preventDefault`. Keep keyboard/focus behavior inside shared UI (`ui-centralize-accessibility`).

Components can remount. Put app-lifetime initialization in the client bootstrap owner and preserve setup/cleanup symmetry for component-lifetime resources. A once-only guard must not prevent a cleaned-up subscription from being re-established. Pure initializers and effects must tolerate development replay.

### ESLint Enforcement

Keep `react-hooks/rules-of-hooks` and `react-hooks/exhaustive-deps` enabled with a version supporting the installed React APIs. Fix the responsibility or dependency mismatch rather than suppressing it. Effect Events supplement dependency tracking; they do not replace it.

Enable `local/no-effects-in-components` to identify React effects by their resolved library binding, including import aliases, immutable aliases and destructured namespace bindings. Recognize aliased React component wrappers and respect lexical shadowing instead of matching local identifier names alone. Keep custom hook ownership valid. Arbitrary wrapper behavior requires manual review. Exercise invalid component effects, valid custom hooks and unrelated or shadowed callbacks through the actual consuming configuration.

See [React Effect Events](https://react.dev/reference/react/useEffectEvent) for their scope and dependency contract.

See also: `arch-component-module-boundaries`, `arch-thin-components`, `arch-decompose-hook-heavy-components`, `state-derived-atoms`

### 1.11 Justify Feature Hierarchy Through Business Scope

**Impact: HIGH**

**Rule:** Place capabilities of equal business scope at the same level, and nest a capability only when its responsibility belongs to the parent.

Answer why a child belongs to its parent in business terms. Sharing a screen, dataset or component implementation does not establish that relationship. A parent must describe a meaningful capability rather than serve as a generic container.

### Applies When

- Comparing responsibilities to decide whether they are peers or parent and child.
- A parent contains both an explicit child capability and the implementation of another comparable capability.
- Considering a split by dimension, current versus historical view, or display mode.

**Incorrect:**
```text
features/parent-capability/
├── shared/
│   ├── services/useParentCapability.ts   # implements two distinct responsibilities
│   └── components/SecondCapability.tsx   # one remains implicit in the parent
└── features/first-capability/
```

**Correct:**
```text
features/parent-capability/
├── shared/
│   └── types/commonInput.type.ts         # used by both peer capabilities
└── features/
    ├── first-capability/
    └── second-capability/
```

These schematic children represent distinct user outcomes within the parent's business scope. A filter, dimension, period or display mode normally remains a parameter or component within its capability. Split it only when it introduces distinct business rules, workflows or ownership, rather than merely different rendering.

If the proposed parent has no business responsibility beyond grouping its children on a screen, place the capabilities at the owning domain level and let the page compose them. Keep the existing limit of two feature levels below a domain. Follow `arch-feature-slice-layout`:: a feature with `features/` puts every parent-owned role folder under `shared/`; a leaf feature keeps role folders directly at its root.

### Exceptions

- Peer responsibilities may have different file counts, implementation sizes and internal layouts; symmetry alone does not justify extraction.
- A parent may coordinate children through application composition. If the remaining parent behavior is itself a cohesive capability with no shared consumers, give it a named child feature rather than placing its implementation in `shared/`.
- A technical extraction or a small variant can remain a component, helper or parameter.

### ESLint Enforcement

Use the custom ESLint rule `local/feature-folder-layout` to count feature scopes below each domain with `maxFeatureDepth: 2`, using the same business-scope interpretation as import boundaries and ownership checks. Report deeper scopes even when no imports exist. A folder named `features` inside a role folder does not create another business scope. Check parent/leaf layout independently. ESLint cannot decide whether the chosen business parent is appropriate and should not move folders automatically.

### References

- [Business boundaries](rules/arch-business-capability-boundaries.md) — define the capability map first.
- [feature slices](rules/arch-feature-slice-layout.md) — supported layout and dependency direction.

### 1.12 Keep Component Modules Focused on Components

**Impact: HIGH (component files stay readable while logic gains explicit ownership)**

A `.view.tsx`, `.state.tsx` or `.feature.tsx` module declares components, component-local prop or view types, and inert configuration constants; it does not declare module-level custom hooks or lowercase helper functions. Local callbacks and event handlers may stay inside the component only when they adapt an event and delegate to an imported action or service. Extract business orchestration and every module-level callable into a file whose path states its responsibility.

When a component needs supporting files, give it a named directory. Put an effectful or orchestrating hook in `services/`, and put a pure or read-only helper in `helpers/<category>/`. Use one public helper export per file, name the file after that export, and keep supporting functions private. Do not create `*.logic.ts`: the suffix hides whether the module selects, aggregates, calculates, presents or performs effects.

Declare component types, including `lazy` and `memo` wrappers, at module scope or in their own files. A component defined inside another component gets a new type on each render and can remount, losing local state and focus. Pass inputs through the component's legitimate API instead of capturing them in a nested component definition. Ordinary event callbacks are not component definitions.

**Incorrect (a component module mixes rendering, synchronization and visual derivation):**

```tsx
function useOrderDocumentTitle(orderId: string) {
  useEffect(() => {
    document.title = `Order ${orderId}`
  }, [orderId])
}

function getOrderTone(total: number) {
  return total >= 0 ? 'positive' : 'negative'
}

export function OrderPanel({ order }: { order: Order }) {
  useOrderDocumentTitle(order.id)
  return <OrderTotal tone={getOrderTone(order.total)} />
}
```

**Correct (the component owns rendering and imports explicitly placed logic):**

```text
OrderPanel/
├── OrderPanel.feature.tsx
├── services/useOrderDocumentTitle.ts
└── helpers/presenters/getOrderTone.ts
```

```tsx
import { getOrderTone } from './helpers/presenters/getOrderTone'
import { useOrderDocumentTitle } from './services/useOrderDocumentTitle'

export function OrderPanel({ order }: { order: Order }) {
  useOrderDocumentTitle(order.id)
  return <OrderTotal tone={getOrderTone(order.total)} />
}
```

Place logic at the narrowest scope that owns it: component-only logic stays in the component directory, page-shared logic goes under that page, and domain-shared logic goes under the domain. Only helpers without business vocabulary belong in application-wide shared code. Presenter helpers stay at component or page scope because their output is coupled to the UI.

Private PascalCase components may share a component module when they all have the module's declared view, state-renderer or feature role; otherwise split mixed roles according to `arch-component-roles`. Export at most one public value according to `quality-single-public-export`; matching component roles do not permit multiple public exports. The ESLint rule treats a PascalCase callable as a component candidate, not as proof that it renders React UI, so review its actual role when auditing the module. Inline callbacks and local UI event handlers are allowed, but they must not hide mutations, navigation, notifications or multi-source orchestration that belongs in a service according to `arch-thin-components`.

See also: `arch-helpers-vs-services`, `arch-isolate-effects-in-hooks`, `arch-thin-components`, `helpers-categories`

### 1.13 Keep Components Thin

**Impact: HIGH (logic becomes reusable and testable without rendering)**

A component reads hooks and renders. Each kind of logic has a fixed home outside the JSX file:

| Logic | Home |
| --- | --- |
| User action (mutation + notification + redirect) | `pages/[page]/services/actions/use[Verb][Entity]Action.ts` |
| Modal open/close state | `pages/[page]/services/actions/use[Name]Modal.ts` + atom in `pages/[page]/stores/` |
| Reaction to a state change | a dedicated hook named after the reaction (`use[Action]On[Trigger]`) |
| Business predicate (`isX`, `canX`) | `helpers/businessRules/` (see `helpers-business-rules-pure`) |
| Compound numeric derivation or metric | `helpers/calculators/` |
| Positioning, dimensions, chart geometry or other display-specific derivation | component- or page-scoped `helpers/presenters/` |
| Side effect reused by several pages | domain `services/` |

`useState` stays acceptable for pure UI state (hover, open accordion).

Extract the whole calculation into an intent-named helper, including its dependent intermediate values. This applies before `return`, inside JSX and inside local callbacks; putting the same arithmetic in `useMemo` does not isolate it. Pass viewport dimensions and other browser measurements as inputs to pure presenters. Small self-contained expressions and simple render conditions can remain local.

A high number of direct hooks indicates that the component may be coordinating several responsibilities; split it according to `arch-decompose-hook-heavy-components`. Effects that remain after removing derived state and event-driven logic belong in an intent-named hook as described by `arch-isolate-effects-in-hooks`.

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
import { useDeleteContractAction } from '@/domains/contracts/features/detail/pages/detail/services/actions/useDeleteContractAction'

export const DetailHeader: FC<DetailHeaderProps> = ({ contractId }) => {
  const [deleteContract, isDeleting] = useDeleteContractAction(contractId)
  return <Button onClick={deleteContract} loading={isDeleting}>{t('common.delete')}</Button>
}
```

See also: `arch-decompose-hook-heavy-components`, `arch-isolate-effects-in-hooks`, `state-derived-atoms`

### Compound Derivations

Extract dependent arithmetic and `Math` calls as one intent-named derivation, including intermediate aliases, JSX expressions and callbacks. Putting the expression in `useMemo` does not move its responsibility. UI coordinates, dimensions, chart radii and layout styles belong in component- or page-owned `helpers/presenters/`; quantitative business metrics belong in `helpers/calculators/`. Pass browser measurements as inputs. Pure helpers must not read browser globals, measure nodes or mutate the DOM.

Small independent expressions such as `index + 1`, `row.depth * 20` or `(value / total) * 100` may remain local when they are not part of a larger derivation. Imported helper calls, hook calls, destructuring, direct reads, simple conditions and event adapters also remain in the component. Moving a helper to module scope in the same component file still violates `arch-component-module-boundaries`.

**Incorrect (a calculation stays in the component):**

```tsx
export function FloatingPanel({ anchorLeft, viewportWidth }: Props) {
  const left = Math.max(8, Math.min(anchorLeft, viewportWidth - 320 - 8))
  return <div style={{ left }} />
}
```

**Correct (a pure presenter owns the complete derivation):**

```typescript
// FloatingPanel/helpers/presenters/getFloatingPanelStyle.ts
export function getFloatingPanelStyle(anchorLeft: number, viewportWidth: number) {
  const left = Math.max(8, Math.min(anchorLeft, viewportWidth - 320 - 8))
  return { left }
}
```

```tsx
// FloatingPanel/FloatingPanel.view.tsx
import { getFloatingPanelStyle } from './helpers/presenters/getFloatingPanelStyle'

export function FloatingPanel({ anchorLeft, viewportWidth }: Props) {
  return <div style={getFloatingPanelStyle(anchorLeft, viewportWidth)} />
}
```

The native container in this example is external layout. Geometry inside a chart remains data supplied to the shared UI primitive, rather than caller-authored CSS injected into it.

### ESLint Enforcement

Use the custom ESLint rule `local/no-complex-component-calculation` to report more than two arithmetic operations (`+`, `-`, `*`, `/`, `%`, `**`) or deterministic `Math` calls in one component derivation, including callbacks and JSX. Follow immutable local initializers and aliases, counting each operation once. Check returned fields of an inline `map`/`flatMap` object together, and group computed geometry properties (`x`, `y`, `cx`, `cy`, `width`, `height`, `r`, `rx`, `ry`) of one JSX element. The `maxOperations` default is two.

Independent small expressions outside those output groups remain independent. This bounded check does not trace reassigned variables, imported helper implementations or arbitrary interprocedural data flow. `local/no-component-data-pipeline` complements it by reporting inline reductions and compound collection predicates in application/domain components; module-boundary and JSX-condition checks address different patterns.

Use the custom ESLint rule `local/no-browser-in-pure-helpers` for production `helpers/presenters/` and `helpers/calculators/`, including component-owned helpers. Resolve browser globals, DOM measurements, known DOM mutation methods and DOM property writes. Locally shadowed names, type-only references and reads of supplied `DOMRect` values remain valid. Exclude tests, declaration files and generated files. This check does not prove purity or follow arbitrary helper implementations and detached DOM methods.

### 1.14 Keep Visual Logic at the Component or Page Boundary

**Impact: HIGH (feature hooks stay reusable across pages and contexts)**

Toasts, navigation, selection clearing, modal state and form state belong to page-level actions in `pages/[page]/services/actions/`. CSS classes, design-system tones, chart geometry and other display-ready values belong in component- or page-scoped `helpers/presenters/`. Feature-level `apis/`, `services/` and scoped shared helpers only fetch, mutate, transform and decide; they return UI-agnostic data or throw, and let the page decide what the user sees.

**Incorrect (a feature service shows the toast itself):**

```ts
// src/domains/contracts/features/detail/services/useResendDocument.ts
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

**Correct (the service only acts and throws, while page-owned code controls feedback and presentation):**

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

```typescript
// pages/detail/helpers/presenters/getDocumentStatusTone.ts
export function getDocumentStatusTone(status: DocumentStatus): StatusTone {
  return status === 'failed' ? 'critical' : 'neutral'
}
```

How the page action gives feedback:

- Wrap the mutation call in one `try`/`catch`: success and error messages go through `t()`.
- Clear the selection, close the modal or `navigate(...)` only after the mutation succeeded, inside the same `try`.
- Prefer the backend's readable error message when there is one, falling back to a translated default. Run independent saves of one action with `Promise.all`.

Presenter helpers have no JSX, hooks or side effects. Keep them at the narrowest component or page scope; moving them to a domain helper would couple reusable business logic to a particular UI vocabulary.

See also: `arch-component-module-boundaries`, `helpers-categories`, `api-vercel-parallel-work`

### ESLint Enforcement

Enable `local/no-service-presentation` at error level for reusable domain/feature services. Reject direct and indirect value imports, reexports and literal dynamic imports of translation APIs (`i18next`, `react-i18next`), conventional `i18n` modules and `helpers/formatters` modules. Keep type-only dependencies and component/page-owned presentation services valid.

Apply the same dependency check to domain `helpers/calculators/`, including component- and page-owned calculators. A calculation returns quantitative values and semantic period identifiers; a formatter translates their labels at display time. Component ownership does not turn translation into a calculation. Verify an aliased translation import, a rejected reexport or dynamic import, and a neighboring valid numeric calculation through the application's configuration.

Resolve project aliases and follow local runtime helper/service dependencies and reexport modules. A service importing a mapper that imports a formatter violates the same contract as a direct formatter import. Report the dependency path, ignore erased type-only edges and terminate on cycles. Preserve validation/API/store boundaries: schema validation diagnostics and API error normalization do not make every caller a display service. These boundaries are checked by their own contracts rather than treating every reachable translation as display formatting.

This is a bounded module dependency check, not a call-graph proof. Value imports and reexports evaluate their modules, including other runtime dependencies in a reexport module. External packages, computed dynamic imports, injected callbacks, arbitrary strings and chart geometry require review. Test the indirect failure and a numeric neighbor through the application configuration. Move the display responsibility to its owning component/page instead of renaming imports to bypass the check.

### 1.15 No index.ts in stores/, One File per Concern

**Impact: HIGH (prevents circular imports and keeps atoms discoverable)**

Never add an `index.ts` barrel to a state or store folder (feature or page level), and import each store file directly. Atoms are imported by queries, page actions and components at the same time; a barrel ties all of them to every atom file, is the typical source of circular imports, and defeats tree-shaking.

Give each file one concern and a name that says it:

- `<concern>.atoms.ts` for feature and page atoms: `filters.atoms.ts`, `selection.atoms.ts`, `form.atoms.ts`, or a feature name (`reminderModal.atoms.ts`). Never a generic `atoms.ts` / `state.ts` mixing filters, selection, modals and tabs.
- `<name>.store.ts` for app-level stores (session, user, flags) and for shared modules that pair a factory with its hook.

**Incorrect (barrel re-export):**

```ts
// src/domains/sales/orders/features/list/stores/index.ts
export * from './filters.atoms'
export * from './selection.atoms'

// consumer
import { ordersFiltersAtom, selectedOrderIdsAtom } from '@/domains/sales/orders/features/list/stores'
```

**Correct (explicit file per concern, direct imports):**

```ts
// src/domains/sales/orders/features/list/stores/
//   filters.atoms.ts     selection.atoms.ts
// src/domains/sales/orders/features/detail/pages/detail/stores/
//   reminderModal.atoms.ts     form.atoms.ts

import { ordersFiltersAtom } from '@/domains/sales/orders/features/list/stores/filters.atoms'
import { selectedOrderIdsAtom } from '@/domains/sales/orders/features/list/stores/selection.atoms'
```

Audit: `find src/domains -path "*stores*" -name index.ts` must return nothing. Detect cycles with a circular-dependency checker in CI.

See also: `quality-single-public-export`

### 1.16 Review Component Complexity Before Splitting

**Impact: HIGH**

**Rule:** Review every flagged function manually and extract a component, hook or helper only when it establishes a cohesive responsibility boundary.

Hook count, cyclomatic complexity and function size measure different things. A large JSX tree can have few branches and hooks while still mixing navigation, summaries, content selection and detail panels. Review those responsibilities separately.

### Applies When

- A component owns multiple regions that can be understood and changed independently.
- ESLint reports excessive function length or cyclomatic complexity, including in a hook or callback used by a component.

### Manual LLM Review

For each function reported by either threshold, the LLM must read the whole function and its relevant callers, identify its responsibilities and decide whether extraction is worthwhile. Record a concrete reason for the decision:

- **Split:** name the responsibility to extract and explain how the new boundary improves understanding or isolates change. Extract a rendered region into a component, cohesive state and actions into an intent-named hook, or pure predicates and derivations into categorized helpers.
- **Keep:** explain why the function represents one cohesive responsibility and why splitting would add indirection or prop plumbing without improving clarity. A threshold exceedance alone does not mandate refactoring or suppression.

Do not apply an automatic fix or bulk extraction solely to lower the metric. Preserve behavior and keep compound UI slots as direct children where required by the UI API.

**Incorrect:**
```tsx
function OrdersWorkspace() {
  const { orders, selection } = useOrdersWorkspace();
  return (
    <Stack>
      <Surface>
        <Text as="h2">{selection.label}</Text>
        <Text>{selection.description}</Text>
      </Surface>
      <OrdersTable orders={orders} />
    </Stack>
  );
}
```

**Correct:**
```tsx
function OrdersWorkspace() {
  const { orders, selection } = useOrdersWorkspace();
  return (
    <Stack>
      <OrderSelectionSummary selection={selection} />
      <OrdersTable orders={orders} />
    </Stack>
  );
}
```

The examples abbreviate an independently owned summary region. Small cohesive JSX does not require extraction merely because it uses several elements.

### Exceptions

- Tests (`*.test.*`, `*.spec.*`, `__tests__/`) and Storybook stories (`*.stories.*`) are excluded from these two thresholds; tooling outside `src/` is also outside their scope.
- The two thresholds are review signals. Keep a cohesive region together when extraction would only fragment it; if a lint suppression is necessary, scope it to the offending line and include the review's concrete reason.
- Do not compress formatting, replace JSX with local variables, or move all logic into an umbrella hook merely to pass a threshold. An extraction must establish a responsibility boundary.

### References

- [ESLint: complexity](https://eslint.org/docs/latest/rules/complexity)
- [ESLint: max-lines-per-function](https://eslint.org/docs/latest/rules/max-lines-per-function)

### Review Thresholds

Review complexity above **8** (modified cyclomatic complexity, counting an entire `switch` once) or function size above **150** lines, excluding blank and comment-only lines. Include JSX and nested callback bodies when measuring a function's span. A score of 8 and a size of 150 are allowed. These are review signals rather than instructions to split automatically. Tests, stories and tooling are outside these production thresholds.

Use both measures: few branches do not imply a small component. Hook count, mapped JSX and compound calculations remain separate signals. Resolve a reported exceedance through a cohesive extraction or a justified, line-scoped keep decision; do not compress formatting, hide JSX in variables or move everything into an umbrella hook merely to lower a metric.

### 1.17 Separate Helpers from Services by Effects and Orchestration

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

### 1.18 Create a Sub-Domain Only for a Distinct Business Concept

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

---

## 2. API Hooks & Server State

**Impact: CRITICAL**

All HTTP access goes through typed query/mutation hooks, with schema validation on input and output, Suspense/error boundaries around them and explicit handling of API errors. Getting this layer right guarantees typed, validated data everywhere else.

### 2.1 Validate Both Directions With Yup Inside Every API Hook

**Impact: CRITICAL (no unvalidated API data reaches the domain)**

Every API hook validates both directions with Yup, inside the owning feature's hook: a request schema before sending (query params or body) and a response schema after receiving. Without it, `response.data` is trusted as `T` and nothing checks the shape, so a backend change surfaces as a crash far from the call. Declare schemas as module constants (see `yup-module-level-schemas`) and let `stripUnknown` drop fields the domain does not model.

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

Each endpoint gets exactly one hook in `apis/queries/` (reads) or `apis/mutations/` (writes) of its owning feature. That hook owns the query key, the endpoint URL, the Yup validation and the TanStack Query call. Components and page hooks consume it; they never call `axios`, `useQuery` or `useMutation` directly. Inline calls duplicate keys and URLs and skip validation.

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

**Correct (one feature-owned hook per endpoint, consumed by the component):**

```tsx
// src/domains/contracts/features/detail/apis/queries/useGetContractRemindersQuery.ts
export function useGetContractRemindersQuery(contractId: string) {
  return useSuspenseQuery<ContractReminder[]>({
    queryKey: ['contracts', contractId, 'reminders'],
    queryFn: async () => {
      const { data } = await http.get(ENDPOINTS.contracts.reminders(contractId))
      return REMINDERS_SCHEMA.validate(data, { stripUnknown: true })
    },
  })
}

// src/domains/contracts/features/detail/pages/detail/components/RemindersTab/RemindersTab.tsx
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

// src/domains/sales/invoices/features/comments/apis/mutations/useUpdateInvoiceComment.ts
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
- Keep usable navigation and shell UI outside a slow region's boundary, and use a skeleton matching its eventual layout. Coordinate independent reads through `api-query-hook-choice`; do not create new request promises during render as an alternative to domain query hooks.

### 2.7 Pick the TanStack Query Hook by Access Pattern

**Impact: HIGH (no remount on key change, no hidden request waterfall)**

TanStack Query v5 hooks behave differently on loading, errors and key changes. Pick by access pattern, inside the domain query hook:

| Access pattern | Hook | Loading / errors |
| --- | --- | --- |
| One resource the screen needs to render (detail, form, screen) | `useSuspenseQuery` | suspends / throws (Suspense and error boundary required) |
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

See also: `api-vercel-parallel-work`

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

### 2.9 Schedule Independent Async Work Concurrently

**Impact: HIGH (removes avoidable waits while preserving real ordering constraints)**

In page actions and orchestration services, start independent operations together. Check cheap synchronous preconditions before starting work needed only by a conditional branch. Each dependent operation waits for its own prerequisite rather than an unrelated batch.

**Incorrect (independent saves wait for each other):**

```typescript
// These functions come from the owning domain mutation hooks.
await saveOrder(orderInput)
await saveContact(contactInput)
```

**Correct (independent saves start together):**

```typescript
await Promise.all([
  saveOrder(orderInput),
  saveContact(contactInput),
])
```

For partial dependencies, chain the dependent work immediately:

```typescript
const orderPromise = createOrder(orderInput)
const attachmentPromise = orderPromise.then(order =>
  attachDocument({ orderId: order.id, documentId }),
)
await Promise.all([orderPromise, attachmentPromise, saveContact(contactInput)])
```

### Exceptions

- Keep required ordering, rate limits and transaction constraints explicit. `Promise.all` rejects on a failure but does not cancel other operations or make writes atomic. Preserve feedback and partial-failure behavior.
- Query hooks remain in `apis/`. Use sibling query consumers or `useSuspenseQueries` for independent Suspense reads (`api-query-hook-choice`); never call React hooks inside `Promise.all`.
- Keep intentionally optional work in the branch that needs it. Concurrency does not justify requests that should never start.

### Sources

Adapted from Vercel's [parallel operations](https://github.com/vercel-labs/agent-skills/blob/main/skills/react-best-practices/rules/async-parallel.md), [partial dependencies](https://github.com/vercel-labs/agent-skills/blob/main/skills/react-best-practices/rules/async-dependencies.md) and [deferred awaits](https://github.com/vercel-labs/agent-skills/blob/main/skills/react-best-practices/rules/async-defer-await.md), without adding an orchestration dependency.

### 2.10 Type API Hooks With the Domain Entity and Let the Return Type Infer

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
import type { ProjectDetail } from '@/domains/projects/shared/types/projectDetail.type'

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

### 2.11 Use Optimistic Updates Only Where Latency Is Visible, With Rollback

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

### 2.12 Use TData = void for Body-less or Response-less Mutations

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

### 2.13 Destructure Query Data With a Business Name

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

A caller may retain the result object for status, errors, refetching or unchanged
forwarding. Destructure its data separately before consuming it:

```typescript
const orderQuery = useGetOrderDetailQuery(orderId)
const { data: order } = orderQuery
```

### ESLint Enforcement

Enable `local/api-business-destructuring` at error level with TypeScript information
for production consumers. Resolve the TanStack result type through direct hooks,
domain wrappers and aliases; do not classify an arbitrary object by a `data`
property or a `Query` suffix alone. Reject direct `data` and `mutateAsync` reads,
including optional/static computed access, and destructuring without a distinct
identifier alias. Allow named aliases with defaults, other result fields and
unchanged result returns. Do not choose the business name automatically.

Meaningful business vocabulary still requires review. Dynamic property names,
opaque untyped results and unrelated libraries are outside this bounded check.

### 2.14 Name API Hooks After the Endpoint Intent

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

Helpers, hooks, services and component props import the entity exported from its owning feature or scoped shared `types/`. Never declare a local structural copy (`type Address = {...}`, an inline `{ uuid: string; file: ... }`): it drifts silently when the entity changes and duplicates the nullability decisions the entity already made. To narrow a dependency, derive it with `Pick<Entity, ...>`.

Before you create a type, search where it would already live, and put a new one at the narrowest level that fits:

- a feature's `types/` folder, for anything owned by that feature;
- an entity's `shared/types/` folder, for an entity type consumed by several sibling features;
- `domains/[domain]/shared/types/` (e.g. `sales/shared/types/sales.type.ts` with `GlobalStatus`), for a type shared by sibling sub-domains;
- `src/shared/types/`, only for a type no business domain owns and that carries no domain vocabulary.

**Incorrect (helper redeclares the entity shape):**

```typescript
// domains/sales/orders/features/detail/pages/detail/helpers/toOrderDocumentFile.ts
type OrderDocument = {
  uuid: string
  file?: { uuid: string; url: string; name: string }
  customerComment?: string
}

export function toOrderDocumentFile(item: OrderDocument, label: string) { /* ... */ }
```

**Correct (import the entity; Pick when only a slice is needed):**

```typescript
import type { DocumentFile } from '@/domains/documents/shared/types/document.type'
import type { OrderDocument } from '@/domains/sales/orders/shared/types/orderDocument.type'

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

### ESLint Enforcement

Enable `local/explicit-nullability` for production domain code to reject an optional property whose direct type union also contains `null`. Preserve required nullable properties, optional non-nullable properties, nullable collection items and nullable function results. Dependency module augmentation follows the external contract and is outside this convention. Check rejected and neighboring valid examples through the consuming application's actual configuration.

This syntax-level check does not resolve nullability hidden in named aliases, imported types or mapped types. Review those contracts and the business reason for each nullable field manually; a diagnostic cannot decide which absence representation is appropriate. Do not autofix the choice between a missing property and an explicit null.

### 5.3 Separate the Domain Entity from the API Response

**Impact: HIGH (decouples the whole UI from the raw backend shape)**

Export only the strict domain `Entity` from `types/[entity].type.ts`. The raw API shape (ISO strings, free strings, lax optionals) lives only in the query hook file: as its Yup schema or as a private `XxxResponse` type that is never exported. The hook's response schema is the single place where the response becomes an Entity. Components, helpers and other hooks never see the raw JSON, so a backend change touches one file.

**Incorrect (one exported type mixes API and domain shapes, consumers re-coerce):**

```tsx
// domains/sales/opportunities/shared/types/opportunity.type.ts
export type OpportunityResponse = {
  uuid: string
  creationDate?: string // raw ISO string leaks to every consumer
}

// a component, far from the API
const created = opportunity.creationDate ? new Date(opportunity.creationDate) : null
```

**Correct (strict Entity exported, raw shape private to the hook):**

```typescript
// domains/sales/opportunities/shared/types/opportunity.type.ts
export type Opportunity = {
  uuid: string
  opportunityCrmId: string
  account: OpportunityAccount | null
  status: string // display-only taxonomy owned by the API, shown as a badge
  creationDate: Date | null
}

// domains/sales/opportunities/features/list/apis/queries/useGetOpportunitiesQuery.ts
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
// domains/sales/orders/features/detail/types/orderDetail.type.ts
export type PaymentSection = {
  status: string
  isSignatureBypassed: boolean
}

// a typo compiles and silently hides the action
const canValidate = payment.status === 'FORM_TO_REVEIW'
```

**Correct (union from the domain, narrowed once in Yup):**

```typescript
// domains/sales/orders/features/detail/types/orderDetail.type.ts
export const ALL_PAYMENT_STATUSES = ['DRAFT', 'FORM_TO_REVIEW', 'PAID'] as const
export type PaymentStatus = (typeof ALL_PAYMENT_STATUSES)[number]

export type PaymentSection = {
  status: PaymentStatus
  isSignatureBypassed: boolean
}

// domains/sales/orders/features/detail/apis/queries/useGetOrderDetailQuery.ts
status: yup.string<PaymentStatus>().oneOf(ALL_PAYMENT_STATUSES).required(),
```

Exception: a display-only taxonomy owned by the API (for example a project `status` that is only shown as a badge) may stay `string`. In that case, parse it with a tolerant `yup.string()` and display it through a component- or page-scoped presenter with a fallback (see `yup-no-oneof-on-display-enums`). As soon as code branches on the value, switch to a union.

### 5.5 Type Domain Dates as Date and Convert Them in Yup

**Impact: HIGH (removes ad-hoc date parsing from components and helpers)**

In a domain type, a date is `Date`, or `Date | null` when it can be empty, never an ISO `string`. ISO strings exist only on the wire, and both conversions live in the hook's Yup schemas:

- response: `yup.date().nullable().default(null)` turns the ISO string into a `Date`;
- request: a `transform` on the request schema turns a `Date` back into a **date-only** `YYYY-MM-DD` string, and an empty value into `undefined`.

Formatters and sorting then work on real dates, and nobody calls `new Date(str)` or `.toISOString().split('T')[0]` in a component or a page hook.

**Incorrect (ISO string in the entity, parsing scattered in consumers):**

```tsx
// domains/projects/features/list/types/projectListItem.type.ts
export type ProjectListItem = {
  uuid: string
  publishedOn: string | null
}

// a cell component
const date = item.publishedOn ? new Date(item.publishedOn) : null
```

**Correct (Date in the entity, conversions in the hook's schemas):**

```typescript
// domains/projects/features/list/types/projectListItem.type.ts
export type ProjectListItem = {
  uuid: string
  publishedOn: Date | null
}

// domains/projects/features/list/apis/queries/useGetProjectsQuery.ts
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
// domains/contracts/shared/types/statuses.type.ts
export enum ContractStatus {
  DRAFT = 'DRAFT',
  ONGOING = 'ONGOING',
  CANCELLED = 'CANCELLED',
}

const isDraft = contract.status === ContractStatus.DRAFT
```

**Correct (literal union plus an `ALL_` array for runtime use):**

```typescript
// domains/contracts/shared/types/statuses.type.ts (excerpt)
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
// domains/sales/orders/shared/types/orderRejection.type.ts
import type { Invoice } from '@/domains/sales/invoices/shared/types/invoice.type'

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
import type { AntivirusStatus, RejectionHistories } from '@/domains/documents/shared/types/document.type'

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

- **Filters** live next to the store that uses them: `types/[entity]Filters.type.ts` for a feature store, `pages/[page]/types/[entity]Filters.type.ts` for a page store.
- **Payloads** stay private in the mutation hook file. Move one to `types/[action][Entity]Payload.type.ts` only when several mutations share it.
- Sub-shapes that only exist inside an entity (`InvoiceRecipient`, `PaymentSection`) stay in that entity's file.

**Incorrect (catch-all file, plural name, interfaces, ad-hoc names):**

```typescript
// domains/sales/invoices/shared/types/types.ts
export interface Invoices {
  uuid: string
  globalStatus: string
}
export interface ListParams { /* ... */ }
export interface Body { /* ... */ }
```

**Correct (one file per entity, type aliases, entity-prefixed names):**

```typescript
// domains/sales/invoices/shared/types/invoice.type.ts
export type Invoice = {
  uuid: string
  globalStatus: GlobalStatus
  createdAt: Date
}

// domains/contracts/shared/types/statuses.type.ts (excerpt)
export type ContractStatus = 'DRAFT' | 'WAITING_FOR_REVIEW' | 'ONGOING' | 'CLOSED' | 'CANCELLED'

// domains/sales/invoices/features/list/pages/list/types/invoiceFilters.type.ts
export type InvoiceFilters = { /* ... */ }
```


### Enforcement and local support contracts

Enable `local/entity-type-files` at error level. In canonical entity files, reject independent exported object shapes that are not sub-shapes of the main entity; preserve derived variants and closed status unions. Follow references between local sub-shapes. Use type aliases except when a dependency explicitly requires interface merging.

Also inspect exported object aliases in domain implementation modules. An independent object exported beside an unrelated helper should not be hidden there merely because the file is outside `types/`. A local function's explicit input/output contract and its referenced sub-shapes may stay local. Private implementation shapes, dependency augmentations and dedicated colocated support-contract modules remain valid; neither a record's size nor its name alone establishes an entity.

This bounded check does not decide whether every return shape or colocated `*.types.ts` contract deserves entity status. Review those candidates by their actual consumers, lifetime and ownership. Reusable entities go to the nearest owning `types/[entity].type.ts`; small component props and helper configuration stay with their owner. Verify an incorrectly placed exported object and a valid helper signature through the application's configuration.

### 5.9 Type Amounts as number and Format Them at Display Time

**Impact: MEDIUM (keeps amounts computable and rendered by a single set of formatters)**

An amount is a `number` in the domain entity (`number | null` when it can be missing), with its currency in a separate field. It is never a `string`, whether a raw decimal (`'1250.50'`, which a decimal API field often sends) or an already formatted label (`'1,250.50 €'`). The response schema coerces it once with `yup.number()`, and formatting happens only at display time. Currency components built on `Intl.NumberFormat` typically only format values whose `typeof` is `'number'`, and render a string amount as empty or `-`.

**Incorrect (string amount, formatted by hand):**

```tsx
// domains/sales/orders/shared/types/order.type.ts
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
// domains/sales/orders/shared/types/order.type.ts
export type Order = {
  uuid: string
  amount: number
  currency: string
}

// domains/sales/orders/features/detail/apis/queries/useGetOrderDetailQuery.ts
amount: yup.number().required(), // '1250.50' → 1250.5

// domains/sales/shared/helpers/formatters/useFormatMoney.ts
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


### Typed safety checks

`no-explicit-any` only prevents writing the keyword. Enable typed `@typescript-eslint/no-unsafe-assignment`, `no-unsafe-argument`, `no-unsafe-call`, `no-unsafe-member-access` and `no-unsafe-return` to catch `any` propagated by dependencies, generic defaults and parsing. Keep raw transform inputs `unknown`; preserve generic schema outputs and give untyped collections explicit element types. Narrow third-party callback contracts at the shared adapter boundary rather than asserting each consumer's input.

Use typed `await-thenable`, `no-floating-promises`, `no-misused-promises`, `prefer-promise-reject-errors`, `only-throw-error`, `no-base-to-string`, `restrict-plus-operands`, `restrict-template-expressions`, `no-misused-spread` and `unbound-method` for their respective runtime hazards. Use `switch-exhaustiveness-check` for closed unions, `no-unnecessary-type-assertion`, `no-duplicate-type-constituents` and `no-redundant-type-constituents` for misleading type declarations, and `consistent-type-imports` to expose erased dependencies. Apply these to tests and tooling too where the same hazards occur. An intentionally asynchronous mock is not a reason to enable `require-await` blindly.

Enable `no-unsafe-type-assertion` and `no-non-null-assertion` to prevent narrowing with `as` or postfix `!` in place of a proof. Validate external strings against actual options before invoking a callback with a closed union. Narrow nullable fields with checked type predicates; read map entries into a local value or iterate entries instead of assuming a later lookup exists. Keep `as const` and widening assertions valid. A type predicate must verify the property it claims; moving an unchecked assertion into a predicate is not a correction.

Use `no-unnecessary-type-conversion` to reject conversions that do not change a declared primitive value. Pair `consistent-type-imports` with `no-import-type-side-effects` when using `verbatimModuleSyntax`: `import { type Order }` can leave a runtime module import, whereas `import type { Order }` is erased completely. Keep mixed type/value imports and intentional side-effect imports valid.

Enable `return-await` with `error-handling-correctness-only` so a promise returned inside error-handling scopes is awaited before `catch`/`finally` run. Enable `use-unknown-in-catch-callback-variable` for promise rejection callbacks; strict compiler catch-variable checks alone do not cover them. Use `no-confusing-void-expression` with `ignoreArrowShorthand: true` to reject consuming a void result while preserving concise event callbacks. Verify rejected and neighboring valid cases through the actual application configuration before enabling these checks.

Use `strict` in both browser and tooling TypeScript projects, plus `noImplicitReturns`, `noImplicitOverride` and `noPropertyAccessFromIndexSignature`. Evaluate `noUncheckedIndexedAccess` and `exactOptionalPropertyTypes` against the real project before migration: index access may be absent, and an omitted property differs from an explicit `undefined`. Correct the contracts and callers before enabling them; avoid assertions or blanket `| undefined` additions merely to silence diagnostics. These checks complement architecture rules; TypeScript does not infer business ownership.

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

Exception: a display-only taxonomy that the API owns can be typed as `string` at the presenter boundary, with a deliberate fallback that has a comment (for example a page-scoped `getEmailStatusBadge` presenter). Keep the input typed `string` there, so the fallback is reachable and its intent is visible.

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

**Correct (tolerant string + component- or page-scoped presenter with fallback):**

```tsx
const EMAIL_TRACKING_SCHEMA = yup.object({
  uuid: yup.string().required(),
  status: yup.string().required(), // API owns this taxonomy
})

// pages/detail/helpers/presenters/getEmailStatusBadge.ts
const STATUS_BADGE: Record<ContractEmailStatus, EmailStatusBadge> = { /* SENT, OPENED… */ }
const UNKNOWN_STATUS_BADGE: EmailStatusBadge = { type: 'neutral', i18nKey: null }

const isKnownEmailStatus = (status: string): status is ContractEmailStatus =>
  Object.hasOwn(STATUS_BADGE, status)

export const getEmailStatusBadge = (status: string): EmailStatusBadge =>
  isKnownEmailStatus(status) ? STATUS_BADGE[status] : UNKNOWN_STATUS_BADGE
```

Logic-driving enums keep `.oneOf` with the domain union, e.g. `billingMethod: yup.string<ContractBillingMethod>().oneOf(ALL_CONTRACT_BILLING_METHODS)`. The entity types the display field as `string`, not as the union, and the presenter narrows it with a type guard rather than a cast.

See also: `types-closed-values-not-string`

### 6.2 Make Yup the Last Coercion Point

**Impact: HIGH (removes defensive parsing and truthy-string bugs downstream)**

All conversion of raw API values (string → number/boolean/Date, `null` → default, `'YES'` → `true`, empty string → `null`) happens once in the hook's response schema. Downstream code receives strict entity types and never re-coerces with `Number(...)`, `=== 'true'`, `new Date(...)` or `?? ''`. If a consumer needs to repair an unexpected missing value, the schema or the entity type is wrong. A formatter's display fallback for a legitimately nullable value is a separate presentation rule (see `helpers-formatter-hooks`); it leaves the domain value unchanged.

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

A schema shared across hooks of a sub-domain gets its own file in `helpers/schemas/`, named after its one public schema export (for example `orderPaymentSchema.ts` exporting `ORDER_PAYMENT_SCHEMA`); supporting sub-schemas stay private. Do not create plural schema grab bags. Form validation schemas that need `t()` are a different case: a `use[Form]Schema` hook with `useMemo(..., [t])` (see `yup-form-schema-hook`).

---

## 7. UI Composition & Accessibility

**Impact: HIGH**

Structural expectations of compound components, dialogs, forms and styling. Breaking them causes silent layout bugs, lost form values or inaccessible controls.

### 7.1 Centralize Accessibility in Shared UI Primitives

**Impact: HIGH**

**Rule:** Centralize all ARIA wiring, keyboard navigation and focus behavior in shared UI primitives, and pass only semantic data, translated labels and business actions from domain and application code.

The design system owns accessibility implementation, including simple attributes such as `aria-label`, `aria-hidden` and `role`. Domain and application components own meaning and actions: labels, selected values, expansion state, business content and business callbacks. Moving behavior into a domain hook or helper does not establish a shared accessibility boundary.

### Applies When

- JSX supplies `aria-*`, `role`, `tabIndex`, `autoFocus`, or keyboard/focus handlers, including on another component.
- Code generates accessibility associations, moves or restores focus, inspects the active element, or registers keyboard/focus listeners.
- Code imports Radix or another accessibility primitive implementation directly into a feature.

**Incorrect:**
```tsx
<button aria-label={t("details")} aria-pressed={active} onClick={toggle}>
  <DetailsIcon />
</button>
```

**Correct:**
```tsx
<ToggleButton label={t("details")} active={active} onClick={toggle}>
  <DetailsIcon />
</ToggleButton>
```

`ToggleButton` and `DetailsIcon` implement their semantics in the shared UI layer. Add or extend a primitive when a capability is missing. Do not create a generic accessibility wrapper that accepts arbitrary roles or an ARIA property bag. Public primitive props describe capabilities (`label`, `active`, `expanded`, `value`, `onOpenChange`); compound components generate their IDs and associations internally. Compose rendered content through nested `children`.

Prefer native HTML for simple controls. Use focused, unstyled primitives such as Radix behind project wrappers for complex widgets; do not repeatedly implement tabs, tooltip dismissal or modal focus management. Preserve pointer and keyboard behavior, translated names, visible focus and nested overlay dismissal when migrating.

### Compose Caller Events

When a primitive adapts a caller's cancelable native event handler, invoke that
handler before built-in activation or other work. Honor the same event's
`defaultPrevented` after the caller returns. A callback reference alone does not
forward the event, and a guard before the caller cannot observe its cancellation.
Keep necessary propagation bookkeeping and read-only DOM metadata within the UI
boundary. Noncancelable value-change notifications do not gain a cancellation
contract from an `on...` name alone.

```tsx
<button onClick={event => {
  onClick?.(event)
  if (event.defaultPrevented) return
  activate()
}} />
```

Test the caller's observable cancellation as well as successful activation. For
reusable overlays, exercise supported sequences: outside dismissal followed by
keyboard reopening and Escape, available/unavailable focus targets, and Tab in
both directions for each supported modality. An isolated first-open test does not
establish the protocol across later openings or other modes.

Only files under `src/shared/ui`, including its internal hooks and helpers, may depend directly on external accessibility or headless UI libraries such as Radix. Domain code, application code and other shared modules must import project-owned UI primitives instead. Keep imports and library integration inside this boundary; do not bypass it through bare re-exports of third-party components.

### Exceptions

- Shared UI primitives and their internal hooks implement the wiring. They must not depend on business domains.
- Native HTML without custom ARIA or focus/keyboard wiring remains valid in domain code, including real buttons, labels, forms and normal `onClick`/`onChange` business actions.
- Domain labels remain translated data. For example, pass `label={t('delete')}` rather than hardcoding a name inside the primitive. A business preload callback may use `onIntent`; the primitive decides how pointer and focus events trigger it.
- External component contracts do not justify authored ARIA wiring in a domain wrapper. Optional external SVG/HTML types alone are not evidence that wiring was actually supplied.

### ESLint Enforcement

Use the custom ESLint rule `local/no-domain-accessibility` with type information for authored application code. Outside shared UI, check JSX attributes, explicitly supplied properties in resolvable spreads, direct accessibility-library imports/re-exports/dynamic imports and resolved DOM focus, keyboard-listener and ARIA APIs. Within shared UI, check public component contracts and compound slots for raw wiring props, including inherited HTML attributes, and reject bare third-party value re-exports, namespace exports and resolved import aliases. Type-only re-exports and internal primitive wiring remain valid. Exclude tests, generated files and isolated Storybook support.

Resolve declarations to avoid false positives from optional attributes inherited from external HTML/SVG types, such as chart renderer props. Static checks cannot prove runtime accessibility or reconstruct arbitrary dynamic property names, opaque objects or transitive helper behavior. Test reusable primitives by role and label, and verify keyboard navigation, relationships, dismissal and focus restoration.

Enable `local/no-overwritten-ui-props` at error level for shared UI. Check handlers
and refs replaced after a props spread. Native cancelable handlers extracted from
the public parameter object remain subject to the composition contract. Resolve
direct, named and immutable handler aliases; recognize invocation rather than
mere property reads. For supported synchronous branches and short-circuits,
check caller-first ordering and a guard on the same event after forwarding.
Keep direct forwarding, read-only DOM metadata, guarded built-in work and
noncancelable notifications valid. Preserve ref composition separately.

This bounded flow analysis does not prove arbitrary higher-order handlers,
asynchronous continuations, loops, exceptions, getter effects or transitive helper
semantics. Opaque composition needs review and executable behavior tests. Do not
approve a missing guard because the callback property appears in the function.

### References

- [Accessible names](rules/ui-accessible-names.md) — naming and native semantics, implemented inside shared UI.
- [Tailwind: reusable controls and form components](../tailwind-design-system/references/details.md) — examples of styling and ARIA inside primitives.
- [mandatory children composition](rules/ui-required-children.md) — labels are data and rendered UI is composed through children.
- [Radix accessibility](https://www.radix-ui.com/primitives/docs/overview/accessibility) — roles, ARIA, keyboard navigation and focus management behind shared wrappers.

### 7.2 Delegate Mapped JSX to a Component

**Impact: HIGH (keeps list rendering declarative and isolates per-item decisions)**

When `map` produces JSX, its callback only renders one named component and passes source values to it. Put branching, derived values, event-handler construction, styling decisions and element structure inside that item component. Data-only transformations that do not produce JSX are unaffected.

Enforce this convention with the custom ESLint rule `local/no-complex-jsx-map` when the project provides it. Treat a warning from that rule as a request to extract or simplify the mapped item, not as a reason to disable the rule.

**Incorrect (the map callback owns conditions and markup):**

```tsx
<div>
  {categories.map((category) => {
    const isActive = category.id === activeCategoryId
    if (category.isOther) return <span key={category.id}>{category.label}</span>

    return (
      <button key={category.id} onClick={() => selectCategory(category.id)}>
        <Text tone={isActive ? 'accent' : 'default'}>{category.label}</Text>
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
      <Text tone={isActive ? 'accent' : 'default'}>{category.label}</Text>
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

See also: `arch-component-module-boundaries`

### 7.3 Keep className Out of Shared UI Component APIs

**Impact: HIGH (prevents caller style overrides and keeps layout with the parent)**

Components and compound slots in `shared/ui` must neither expose nor accept `className` or `style` props. This includes inherited props from `HTMLAttributes`, `ComponentProps`, `ComponentPropsWithoutRef` and similar React types. Omit both properties when composing these types; forwarding or merging caller classes still exposes an override channel. Passing classes through spreads or React element factories follows the same rule.

The parent owns the surrounding layout, including margins, widths and flex placement. Put layout classes on a parent container, even when a class would only add spacing. Appearance and internal layout belong to the shared component and its semantic variants. Do not rename the override prop to bypass this boundary.

**Incorrect (the shared component exposes classes and its caller controls spacing):**

```tsx
import type { ComponentPropsWithoutRef } from 'react'

function Button({ className, ...props }: ComponentPropsWithoutRef<'button'>) {
  return <button {...props} className={`rounded px-3 py-2 ${className}`} />
}

<Button className="mt-2">{t('sales.orders.save')}</Button>
```

**Correct (internal classes define the component; the parent handles layout):**

```tsx
import type { ReactNode } from 'react'

type ButtonProps = { children: ReactNode; label: string; onClick?: () => void }

function Button({ label, ...props }: ButtonProps) {
  return <button {...props} aria-label={label} className="rounded px-3 py-2" />
}

<div className="mt-2">
  <Button label={t('sales.orders.save')}>{t('sales.orders.save')}</Button>
</div>
```

- Internal classes on native elements or third-party primitives remain necessary to implement the design system. Calls from one shared UI component to another still cannot supply `className`.
- Caller-authored children must not inject layout classes or styles, including padding, margins, gap, flex/grid or dimensions. `<Button><span className="px-3 py-2">Save</span></Button>` still bypasses spacing standards. Use the button's closed size variants and supply its content directly.
- This boundary also applies to surfaces, cards, dialogs and slots, extracted child components, JSX variables, fragments, spreads and React factories. Compose complex content with shared UI structure primitives and closed spacing tokens.
- Do not expose equivalent escape hatches such as free-form padding, body classes or inline layout styles. Ancestor selectors must not restyle UI descendants.
- Shared UI implementations own their native classes. Third-party library providers without a visual box do not create an internal layout boundary.
- Preserve compound slot discovery: never insert a layout wrapper between a compound component and its direct slots. External layout wraps the whole component; content slots compose standardized shared UI. Follow `ui-compound-slots-direct-children`.
- Existing components may still expose classes during migration. Follow this API boundary for new code and record existing violations without copying the legacy pattern.

Chart geometry supplied as data is distinct from caller-authored CSS layout. Apply `ui-centralize-accessibility` to inherited native props as well; public UI contracts expose semantic labels and behavior instead of raw ARIA or focus/keyboard wiring.

### ESLint Enforcement

Use the custom ESLint rules `local/no-shared-ui-classname` to protect the public API and `local/no-shared-ui-internal-layout` to report injected classes and inline layout styles, including through statically resolvable extracted components. Apply the same composition rules to tests and Storybook usages. Neither rule should autofix composition or be suppressed merely to complete a migration.

### 7.4 Keep Colors Semantic Behind Shared UI

**Impact: HIGH**

**Rule:** Use semantic color tokens inside shared UI primitives and expose semantic variants to business components.

The [shared UI boundary](rules/ui-no-adhoc-styling.md) applies first:
replacing a raw color with `text-positive` or an imported color constant does not
authorize visual styling in a business component. The styling examples below
belong inside `shared/ui`; domains consume primitives through semantic variants
and nested children.

Semantic variants describe generic UI roles, not business entities, operations or
metrics. Follow [agnostic shared UI](rules/arch-shared-no-domain-knowledge.md): domains
choose the role, and primitives apply its visual tokens without interpreting
business values.

Business components should express visual intent such as `positive`, `negative`, `warning`, or `muted`, without owning the concrete color that represents it. This keeps themes and visual changes centralized and prevents the same business meaning from drifting across the interface.

Hardcoded colors include:

- hexadecimal, `rgb()`, `hsl()`, `oklch()`, and concrete CSS color names such as `red`, `white`, or `black`;
- arbitrary Tailwind colors such as `text-[#b91c1c]`;
- palette-specific utilities such as `text-red-700` or `bg-emerald-100` when they encode a business meaning.

### Applies When

- A React component chooses a color, including inside shared UI primitives.
- A class, inline style, SVG attribute, or component prop selects a concrete color.
- A charting, canvas, mapping, or other third-party API requires a color value rather than a CSS class.

**Incorrect:**
```tsx
// shared/ui/StatusBadge.view.tsx
export function Badge({
  tone,
  children,
}: {
  tone: "positive" | "negative";
  children: React.ReactNode;
}) {
  return (
    <span
      className={
        tone === "positive"
          ? "bg-emerald-100 text-emerald-700"
          : "bg-[#fef2f2] text-[#b91c1c]"
      }
    >
      {children}
    </span>
  );
}
```

**Correct (Semantic Tailwind Classes):**
```tsx
// shared/ui/StatusBadge.view.tsx
export function Badge({
  tone,
  children,
}: {
  tone: "positive" | "negative";
  children: React.ReactNode;
}) {
  return (
    <span
      className={
        tone === "positive"
          ? "bg-positive-muted text-positive"
          : "bg-negative-muted text-negative"
      }
    >
      {children}
    </span>
  );
}
```

The semantic utilities must resolve to centrally defined theme tokens. Business
components use the primitive instead of applying its color classes themselves:

```tsx
export function Status({ isPositive }: { isPositive: boolean }) {
  return (
    <Badge tone={isPositive ? "positive" : "negative"}>
      {isPositive ? "Gain" : "Loss"}
    </Badge>
  );
}
```

**Correct (Centralized Semantic Constants):**
Use this option inside a shared UI wrapper when an API requires a color value
instead of a Tailwind class. Prefer a semantic CSS custom property; if the API
cannot resolve CSS variables, keep the concrete fallback value in this dedicated
theme file as well. Domains supply data and generic UI intent to the wrapper.

```typescript
// shared/theme/chart-colors.ts
export const chartColors = {
  positive: "var(--color-positive)",
  negative: "var(--color-negative)",
} as const;
```

```tsx
// shared/ui/SeriesBar.view.tsx
import { Bar } from "recharts";

import { chartColors } from "../theme/chart-colors";

export function SeriesBar({
  dataKey,
  tone,
}: {
  dataKey: string;
  tone: keyof typeof chartColors;
}) {
  return <Bar dataKey={dataKey} fill={chartColors[tone]} />;
}
```

The exported names describe generic UI roles rather than business metrics or hue
names such as `green500` or `red700`. A domain presenter may map a business metric
to one of these roles without owning its concrete color.

### ESLint Enforcement

Use the custom ESLint rule `local/no-hardcoded-colors` to check literal appearance values and palette utilities in shared UI and application/domain code. Follow immutable aliases and conditional values. Apply the token boundary to imperative style assignments, `setProperty`, SVG `setAttribute` and browser `theme-color` metadata. Dedicated theme and asset definitions may contain concrete values. This bounded check does not parse arbitrary CSS or infer every dynamic DOM target.

### Exceptions

- Global stylesheets, `shared/theme` and dedicated token definitions may define the concrete values behind semantic names.
- Static brand assets may keep mandated brand colors in their dedicated asset or token definition.
- User-provided or data-driven colors are not hardcoded, but their application, validation and fallback colors must remain in shared UI.
- Structural CSS keywords such as `currentColor`, `transparent`, and `inherit` may be used inside shared UI; they do not exempt domains from the shared UI boundary.

### 7.5 Keep Compound Component Slots as Direct, Renderable Children

**Impact: HIGH (prevents silently dropped slots and empty overflow menus)**

This rule applies to compound APIs that discover slots by scanning their **direct** children (`Children.toArray`, matching on `displayName` or `type`). A custom component wrapping a slot, a Fragment or a `Suspense` boundary hides the slot from that scan. The container may ignore the element or place it incorrectly without an error. A wrapper that later renders `null` can still occupy an action position. Verify the compound API's discovery contract; context-based APIs may support deeper composition.

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
- Condition each slot individually (`{cond && <Card.Actions>…</Card.Actions>}` is fine, the element keeps its identity) or inside the slot. `Children.toArray` does not unwrap Fragments, even when a Fragment is the sole child. Unwrapping requires explicit support in the compound implementation; do not assume it.
- Gate optional actions in the caller with a boolean predicate: a wrapper that renders `null` still occupies a visible slot and can leave an overflow menu empty, and the container cannot know what its children will render.
- Put `Suspense` outside the compound component, or inside a content slot (`Card.Body`), never between the compound and its slots.

### 7.6 Keep Dialog Mounted and Drive It with a Boolean open

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

### 7.7 Lazy Load Heavy Optional UI

**Impact: HIGH (keeps optional features out of the initial loading path)**

Load a heavy editor, report or other infrequently used surface when it is needed. Use React `lazy` at module scope with literal import paths, plus loading and error boundaries. Keep initial-screen essentials eager when deferring them would only introduce a waterfall.

**Incorrect (the optional report is imported eagerly):**

```tsx
import { HeavyReport } from './HeavyReport.feature'

export function ReportPreview({ visible }: { visible: boolean }) {
  return visible ? <HeavyReport /> : null
}
```

**Correct (the report module loads on demand):**

```tsx
import { lazy, Suspense } from 'react'
import { ErrorBoundary } from 'react-error-boundary'

export function ReportPreview({ visible }: { visible: boolean }) {
  return (
    <ErrorBoundary fallback={<ReportError />}>
      <Suspense fallback={<ReportSkeleton />}>
        {visible ? <HeavyReport /> : null}
      </Suspense>
    </ErrorBoundary>
  )
}

const HeavyReport = lazy(() =>
  import('./HeavyReport.feature').then(module => ({ default: module.HeavyReport })),
)
```

### Loading Boundaries

- Keep import paths statically analyzable. For a finite module choice, map keys to functions containing literal `import()` calls rather than constructing arbitrary paths.
- Preload on credible user intent when useful. Domain code supplies an `onIntent` callback to shared UI, which owns pointer and focus wiring (`ui-centralize-accessibility`). Handle speculative load failures; a rejected lazy import still needs an error boundary.
- Defer nonessential third-party startup work when appropriate, while preserving any monitoring or initialization required before use.
- Put Suspense outside a compound root or inside its content slot (`ui-compound-slots-direct-children`). Preserve dialog mounting and exit behavior (`ui-dialog-controlled`).

### Verification

Inspect the generated chunks or a bundle report: a dynamic import does not remove a module from the initial graph when another eager import reaches it. Measure startup and first-use latency rather than assuming every split is beneficial.

### Sources

Adapted from Vercel's [dynamic imports](https://github.com/vercel-labs/agent-skills/blob/main/skills/react-best-practices/rules/bundle-dynamic-imports.md), [analyzable paths](https://github.com/vercel-labs/agent-skills/blob/main/skills/react-best-practices/rules/bundle-analyzable-paths.md) and [intent-based preloading](https://github.com/vercel-labs/agent-skills/blob/main/skills/react-best-practices/rules/bundle-preload.md). Uses [React lazy](https://react.dev/reference/react/lazy) rather than a framework-specific loader.

### 7.8 Name Compound Render Conditions by Intent

**Impact: HIGH (display decisions become readable and reviewable at the JSX boundary)**

Give every compound condition that controls whether a JSX subtree appears an intention-revealing name. Keep a presentation-only decision as a boolean derived during render. Move it to `helpers/businessRules/` as a pure `shouldShowX`, `canX`, `hasX` or `isX` predicate when it expresses a business rule or deserves focused tests.

Simple flags and single comparisons do not require extraction. Conditions used only to choose a class, attribute or text value are also outside this rule.

For JSX gating, use a real boolean or an explicit ternary with `null`. A numeric left operand such as `{items.length && <Items />}` can render `0`; prefer `{items.length > 0 ? <Items /> : null}`. Boolean `&&` conditions remain valid and do not require a blanket rewrite.

**Incorrect (the reader must decode the display decision inside JSX):**

```tsx
{order.status === 'READY' && order.total != null && (
  <OrderTotal value={order.total} />
)}
```

**Correct (the JSX states why the subtree is rendered):**

```tsx
const shouldShowOrderTotal = order.status === 'READY' && order.total != null

return shouldShowOrderTotal ? <OrderTotal value={order.total} /> : null
```

Do not store the boolean in state or wrap a cheap condition in `useMemo`. Prefer a local name unless extracting a pure business predicate creates a meaningful reusable or testable boundary.

See also: `helpers-business-rules-pure`, `quality-usecallback-for-functions`

### 7.9 Never Nest a form Inside a form

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
<div>
  <DocumentsBlock />
  <button type="button" onClick={() => void handleSubmit()}>
    {t('common.save')}
  </button>
</div>
```

With a form library, use its "render as div" option or `useForm().handleSubmit` from a button `onClick`. The trade-off is losing native Enter-to-submit on the outer form. Check in the browser console with `document.querySelectorAll('form form').length === 0`.

### 7.10 Require Composition Through Nested Children

**Impact: HIGH**

**Rule:** Compose caller-supplied UI through nested children instead of component, element or render-function props, and extract renderers required by external APIs into module-level components.

Composition is mandatory for project-owned APIs, including shared UI, feature/view boundaries and wrappers. A caller must be able to see and arrange the UI structure without hiding elements or rendering functions in props. This convention is stricter than a preference for children, including when callbacks receive data or state.

### Applies When

- A prop such as `title`, `header`, `actions`, `footer`, `tooltip` or `positionsControl` carries rendered UI rather than data.
- A prop accepts JSX, a fragment, an array of elements, a JSX-valued variable, a component reference, or a render function, with or without arguments.
- A wrapper forwards such content through named props or a spread object.
- JSX uses `children={...}`; the `children` declaration/destructuring in a component's props remains necessary and valid.
- An external API requires a component, element or render function in a named prop.

**Incorrect:**
```tsx
<Panel title={<Title />} header={<Toolbar />} />
<Panel title={titleElement} />
<Panel header={Toolbar} />
<Panel renderHeader={() => <Toolbar />} />
<Panel renderItem={(item) => <Item item={item} />} />
<Panel children={<Content />} />
```

**Correct:**
```tsx
<Panel>
  <Panel.Title>
    <Title />
  </Panel.Title>
  <Panel.Header>
    <Toolbar />
  </Panel.Header>
  <Panel.Body>
    <Content />
  </Panel.Body>
</Panel>
```

Remove the old content props from the component's type and implementation, then migrate every caller. Slots must render their content. When a root discovers slots by inspecting child types, keep those slots as direct children; put extracted components or conditional content inside them. Composition does not require creating a React Context. Share client state through scoped Jotai atoms according to `arch-no-prop-drilling`; purely structural slots need no state provider.

### Exceptions

- Scalar data and configuration remain props, including string labels/descriptions, native `title`, numeric values, business event handlers and domain models; do not turn every data field into a slot. A string-only label prop must not be widened to ReactNode to smuggle UI through it. This exception does not permit ARIA or keyboard/focus wiring in domains or application code: follow [centralized accessibility](rules/ui-centralize-accessibility.md) and pass semantic props to shared UI instead.
- External APIs outside the project's control, such as React `Suspense.fallback` or Recharts `shape`, `content`, `tick` and `label`, may retain their required named UI props at the external integration boundary. Pass a named module-level component reference or an element of that component, according to the installed library's contract. An inline render callback remains forbidden, including one that simply delegates to a component. Do not propagate the external API into project-owned wrappers.

```tsx
// Incorrect: external APIs do not justify an inline render function.
<Series shape={(props) => <SeriesShape {...props} selected={selected} />} />

// Correct: SeriesShape is defined at module scope or imported.
<Series shape={<SeriesShape selected={selected} />} />
// When the library accepts a component function and no extra props are needed:
<Series shape={SeriesShape} />
```

Move captured parent values into the extracted component's data/configuration props. Preserve the library-injected props and their types; do not define the extracted component inside its parent render.

### ESLint Enforcement

Use the custom ESLint rule `local/require-children-composition` with type information to check declared component contracts as well as JSX, `createElement` and `cloneElement`, including resolved factory aliases. Reject named UI props before a caller exists, including typed functions, classes, `memo`, `forwardRef` and public compound slots. Factory calls supply nested children positionally.

Resolve dependency declarations to distinguish external components from local imports and wrappers; do not rely on prop names or a blanket chart-library exemption. Reject external inline render functions and render-local component references. Private dependency renderers may receive inherited external contracts; locally declared UI props and inherited props on public project APIs remain checked. Data, event handlers and scalar formatters remain valid. Arbitrary runtime factories and reassigned element aliases are outside this bounded analysis. Changing a component API requires review and has no automatic fix.

### References

- [Direct, renderable compound slots](rules/ui-compound-slots-direct-children.md) — preserve slot discovery during extraction and conditional rendering.

### 7.11 Wrap the Whole Dialog in a Form Keyed on the Open Target

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

### 7.12 Defer Offscreen Rendering in Shared UI

**Impact: MEDIUM-HIGH (reduces layout and paint work for long surfaces)**

When a long page spends substantial time laying out and painting offscreen content, consider `content-visibility: auto` inside the owning shared UI primitive. Supply a suitable intrinsic-size estimate to limit layout jumps. Feature code continues to compose primitives without adding local appearance or containment styles.

**Incorrect (a long collection eagerly lays out every heavy row):**

```tsx
// shared/ui/DeferredRow.view.tsx
export function DeferredRow({ children }: { children: React.ReactNode }) {
  return <div>{children}</div>
}
```

**Correct (the shared primitive may skip offscreen rendering work):**

```tsx
// shared/ui/DeferredRow.view.tsx
export function DeferredRow({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ contentVisibility: 'auto', containIntrinsicSize: 'auto 80px' }}>
      {children}
    </div>
  )
}
```

The size above is illustrative; the primitive owns the appropriate estimate for its content. Preserve valid list/table structure and test scrolling, dynamic heights, focus and accessible content before adopting containment.

### Exceptions

- This targets browser layout and paint. It does not avoid mounting every React item or remove its DOM nodes. Use pagination or a suitable shared virtualized primitive when the measured cost comes from creating too many items.
- Avoid adding containment to small surfaces without evidence of a benefit, and verify support in the application's browser targets.
- Keep styling and accessibility implementation in shared UI (`ui-no-adhoc-styling`, `ui-centralize-accessibility`).

### Sources

Adapted from Vercel's [offscreen rendering guidance](https://github.com/vercel-labs/agent-skills/blob/main/skills/react-best-practices/rules/rendering-content-visibility.md). See [content-visibility](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/content-visibility) for containment and accessibility behavior.

### 7.13 Style with Design System Components, Utility Classes Only for Layout

**Impact: MEDIUM-HIGH (consistent visuals and themeable UI)**

Visual styling (text size, color, weight, background, border, radius, shadow, opacity, animations and interaction appearance) comes from design-system components (`Text`, `Badge`, `Separator`, `Card`…), not from Tailwind classes on a `<div>` or `<span>` in feature code. External containers may own display, flex/grid, alignment, order, margins, **padding**, gaps, dimensions, aspect ratio, overflow, position, offsets and z-index. Responsive and arbitrary utilities are allowed only when the underlying property is layout. Use a shared layout primitive when it fits. Do not inject layout classes or styles through children or extracted child components. Internal spacing and structure come from shared UI sizes, variants and structure primitives. Never pass `className` or `style` to a shared UI component, including for layout: follow `ui-no-classname-on-shared-ui`. Hand-styled markup drifts from the design tokens and breaks on every theme change.

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
  <Badge tone="positive">{statusLabel}</Badge>
</Stack>
```

If no design-system component fits, add or extend one in the shared UI layer instead of styling locally. Detection hint: search feature code for `className=` values containing `bg-`, `text-`, `border-`, `rounded-` or `shadow-`.

The same boundary covers SVG/Recharts appearance props, local stylesheet imports and imperative DOM style/class/attribute writes, including values supplied through constants, spreads, templates or element factories. A semantic class such as `text-positive` is still visual styling and belongs inside shared UI. Exporting visual class strings does not establish a primitive.

Global stylesheets, themes and token definitions remain design-system infrastructure. Shared UI consumes semantic tokens; domains supply data, actions and generic variants. Dynamic layout styles may remain on external containers. Chart geometry is data supplied to the owning UI primitive. Follow `ui-semantic-colors` for tokens and `arch-shared-no-domain-knowledge` for business adapters.

When a shared primitive genuinely needs DOM measurements and imperative layout updates, group reads and writes rather than alternating them in a loop and forcing repeated layout. Prefer declarative variants where possible. Pure presenters receive measurements as inputs and never measure or mutate nodes themselves (`arch-thin-components`).

### ESLint Enforcement

Use the custom ESLint rule `local/no-domain-styling` to distinguish concrete appearance violations (`nonLayoutClass`, `nonLayoutStyle`), values that require inspection (`unverifiableStyle`) and local stylesheets outside permitted roots (`outsideStylesheet`). Aggregate offending classes or properties for each usage and include this catalog rule's identifier. Inspect unresolved values before deciding whether layout can stay local. Selecting or designing a primitive requires review; do not autofix or suppress diagnostics merely to finish a migration.

### 7.14 Give Icon-Only Buttons and Custom Controls an Accessible Name

**Impact: MEDIUM (usable with assistive tech, queryable by role in tests)**

Every interactive element needs an accessible name. A button whose only child is an icon has none, and a tooltip rendered through `data-tooltip-*` attributes (or CSS-only) is not an accessible name: screen readers and `getByRole(…, { name })` ignore it. Pass a translated semantic `label` to the shared UI primitive, which implements the accessible name internally according to `ui-centralize-accessibility`. Build controls from real buttons, links and inputs (or design-system components that render them) rather than clickable `div`s. When a shared component lacks a name or hardcodes English, fix it there; never work around it with a `data-testid` in a test.

**Incorrect (icon-only button has no accessible name):**

```tsx
<Button
  variant="ghost"
  onClick={() => requestDelete(contact.id)}
>
  <TrashIcon />
</Button>
```

**Correct (a translated semantic label becomes the accessible name):**

```tsx
<Button
  variant="ghost"
  label={t('common.delete')}
  onClick={() => requestDelete(contact.id)}
>
  <TrashIcon />
</Button>

// test
await user.click(screen.getByRole('button', { name: 'common.delete' }))
```

In a list, include the row identity when several rows share the same action (`t('contact.actions.deleteNamed', { name })`) so each button has a distinct name. Apply the same naming policy to icon-only links and custom inputs. Shared UI chooses native label associations or ARIA internally; domain code supplies the translated meaning.

### 7.15 Keep Inputs Responsive During Expensive Renders

**Impact: MEDIUM (separates immediate input feedback from slower result rendering)**

Keep controlled input updates immediate. When profiling shows that an expensive results surface delays typing, pass a deferred value to that surface. Its unchanged props must let it skip the urgent render, through React Compiler optimization or an appropriate memoized component boundary.

**Incorrect (the expensive surface follows every input update immediately):**

```tsx
const query = useAtomValue(orderSearchAtom)
const setQuery = useSetAtom(orderSearchAtom)

return (
  <>
    <SearchField value={query} onValueChange={setQuery} />
    <ExpensiveOrderResults query={query} />
  </>
)
```

**Correct (the results surface follows a deferred query):**

```tsx
const query = useAtomValue(orderSearchAtom)
const setQuery = useSetAtom(orderSearchAtom)
const deferredQuery = useDeferredValue(query)

return (
  <>
    <SearchField value={query} onValueChange={setQuery} />
    <ExpensiveOrderResults query={deferredQuery} />
  </>
)
```

`ExpensiveOrderResults` owns the expensive work and provides the memoized boundary. The parent owns scheduling the visible results; the search field supplies its translated label through its normal UI contract. Use stable deferred inputs rather than creating a fresh object on every render.

### Limits

- Use transitions for eligible React-owned nonurgent updates. Keep controlled input state outside the transition. External-store writes do not become nonblocking merely because they are wrapped in `startTransition`.
- Keep TanStack Query request state in its query/mutation result. A transition's `isPending` does not replace network state or cancel requests, and deferral does not debounce them.
- Show stale-result feedback through shared UI when necessary. Deferral cannot interrupt one long synchronous calculation; reduce that work or move it to an appropriate background execution boundary.

### Sources

Adapted from Vercel's [deferred rendering](https://github.com/vercel-labs/agent-skills/blob/main/skills/react-best-practices/rules/rerender-use-deferred-value.md) and [transitions](https://github.com/vercel-labs/agent-skills/blob/main/skills/react-best-practices/rules/rerender-transitions.md). See [useDeferredValue](https://react.dev/reference/react/useDeferredValue) and [useTransition](https://react.dev/reference/react/useTransition) for their scheduling contracts.

### 7.16 Prefer Explicit Component Variants Over Mode Flags

**Impact: MEDIUM (makes distinct workflows explicit and avoids impossible mode combinations)**

When a component combines distinct workflows through flags such as `isCreating`, `isEditing` and `isCancelling`, give those workflows explicit components that compose shared pieces. Callers can then see the fields and actions of each variant without reasoning about conflicting flag combinations.

**Incorrect (one component permits incompatible workflows):**

```tsx
<OrderComposer isCreating isEditing={false} isCancelling showCancellationReason />
```

**Correct (each workflow composes its own fields and actions):**

```tsx
// CreateOrderComposer.feature.tsx
export function CreateOrderComposer() {
  return (
    <OrderComposer>
      <OrderComposer.Fields>
        <OrderFields />
      </OrderComposer.Fields>
      <OrderComposer.Actions>
        <SaveDraftButton />
        <CreateOrderButton />
      </OrderComposer.Actions>
    </OrderComposer>
  )
}

// CancelOrderComposer.feature.tsx
export function CancelOrderComposer() {
  return (
    <OrderComposer>
      <OrderComposer.Fields>
        <CancellationReasonFields />
      </OrderComposer.Fields>
      <OrderComposer.Actions>
        <KeepOrderButton />
        <CancelOrderButton />
      </OrderComposer.Actions>
    </OrderComposer>
  )
}
```

Use nested children according to `ui-required-children` and keep direct slots where `ui-compound-slots-direct-children` requires them. Shared client state stays in scoped Jotai atoms (`arch-no-prop-drilling`); composition does not prescribe a Context provider.

### Exceptions

- Booleans expressing actual state or capabilities remain valid: `open`, `disabled`, `checked`, `selected` and feature flags. Their presence alone does not justify a variant component.
- Small visual differences belong in closed semantic variants such as `tone` or `size`. Avoid wrappers that merely rename a label or mirror every prop without an independent contract (`arch-component-roles`).
- A small component with one mutually exclusive mode may use a literal union or discriminated union. Extract variants when their structure, actions or responsibilities differ substantially.

### ESLint Enforcement

Use JSX-condition and complexity diagnostics as review signals. Counting boolean props cannot establish whether they encode incompatible workflows; review their meaning and callers before extracting components. Do not ban legitimate boolean state props through a blanket ESLint restriction.

### Sources

Adapted from Vercel's [boolean prop guidance](https://github.com/vercel-labs/agent-skills/blob/main/skills/composition-patterns/rules/architecture-avoid-boolean-props.md) and [explicit variants](https://github.com/vercel-labs/agent-skills/blob/main/skills/composition-patterns/rules/patterns-explicit-variants.md), using this catalog's composition and Jotai conventions.

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

### ESLint Enforcement

Enable `local/atom-contract` at error level. Resolve Jotai constructor imports, namespace access and immutable aliases; report constructors lexically inside components or hooks unless the nearest function is a `useMemo` callback with an empty dependency array. A memo returning a factory does not stabilize atoms created later by that factory. Preserve pure module-level atom factories and unrelated or shadowed names. This bounded check does not follow custom factory calls into render; review their call sites and the business justification for per-instance atoms manually.

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

### 8.3 Place Stores at Feature or Page Level by Reuse

**Impact: MEDIUM-HIGH (avoids cross-page coupling and orphan business state)**

Put an atom in a feature's `stores/` only when several pages, components or services of that feature share it (list filters read by actions, selection read by bulk actions). Everything owned by one page (modal state, page filters, form/edit state, tabs) goes in the feature's `pages/[page]/stores/`. State shared by sibling features moves to their nearest common ancestor's `shared/stores/`. Persisted or app-level atoms live in their owning feature; the app-shell domain is reserved for session state, and `src/shared/stores/` only holds generic, business-agnostic atoms.

**Incorrect (page state promoted to the domain, business state in shared):**

```text
src/domains/contracts/features/detail/stores/reminderModal.atoms.ts   # used by one page only
src/shared/stores/orderFilters.atoms.ts                              # business state in global shared
src/domains/appShell/features/session/stores/invoiceTabs.store.ts    # invoice state in app shell
```

**Correct (scope follows the consumers):**

```text
src/domains/sales/orders/features/list/stores/filters.atoms.ts       # read across the list feature
src/domains/sales/orders/features/list/stores/selection.atoms.ts
src/domains/contracts/features/detail/pages/detail/stores/reminderModal.atoms.ts
src/domains/sales/invoices/features/detail/pages/detail/stores/uploadInvoiceFileModal.atoms.ts
src/domains/appShell/features/session/stores/auth.store.ts           # session only
src/shared/stores/confirmModal.atoms.ts                              # generic, no business
```

Start at page level; move an atom up to the feature only when another consumer in that feature needs it. Promote it to the nearest scoped `shared/stores/` only when sibling features need the same state.

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

// src/domains/sales/invoices/features/list/stores/list.atoms.ts
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

// src/domains/sales/invoices/features/list/stores/selection.atoms.ts
export const selectedInvoiceIdsAtom = atom<ReadonlySet<string>>(new Set<string>())
export const selectedInvoiceCountAtom = atom(get => get(selectedInvoiceIdsAtom).size)
```

Derivations that need server data are computed in the page hook (`useMemo` over the query result + atom), not in an atom (see `state-server-state-in-react-query`).

The same principle applies to props and query results: compute current values during render, using the appropriate pure helper, rather than copying them into local state through an effect. Memoize costly derivations when useful; cheap values need no cache. Reset an independently editable form through its explicit target/key contract (`ui-form-wraps-dialog`) rather than a general prop-to-state synchronization effect.

Subscribe to the derived atom actually needed by a consumer, such as `hasSelectionAtom`, when it only renders a boolean. Keep continuous or full-entity subscriptions for consumers that need those values. This narrows subscriptions without adding Context or a second writable copy (`state-hook-variants`).

### 8.6 Persist Atoms with atomWithStorage and a Unique Key

**Impact: MEDIUM (avoids key collisions, flashes and crashes on bad storage)**

Persist client state only through `atomWithStorage<T>(key, default, storage?, options?)` from `jotai/utils`, in a `[name].store.ts` file of the owning feature, with a typed default and a key unique across the app. Never read/write `localStorage` by hand in an effect next to a plain atom.

- Export the key as a constant when anything else needs it (tests, cleanup). A single-use inline key is acceptable.
- Pass `{ getOnInit: true }` when the stored value drives the first render; otherwise the default renders first, then the subtree re-renders with the stored value.
- When the stored value is not a plain primitive, give a custom storage whose `getItem` validates the parsed value and falls back to the default: a stale or hand-edited entry must never throw at boot. Change the key (or version the value) when its shape changes.
- Store only the fields needed across reloads, and version the key or payload. Validate and migrate known earlier shapes, or deliberately discard them. Handle unavailable storage and failed reads/writes/removals in the adapter; keep usable in-memory state when persistence is unavailable.

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
// src/domains/sales/orders/features/list/stores/pinnedColumns.store.ts
export const PINNED_COLUMNS_STORAGE_KEY = 'orders.pinnedColumns:v1'

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
    setItem: (key, value) => {
      try {
        localStorage.setItem(key, JSON.stringify([...value]))
      } catch {
        // The atom remains usable when persistence is unavailable.
      }
    },
    removeItem: key => {
      try {
        localStorage.removeItem(key)
      } catch {
        // Storage may be unavailable even when the in-memory reset succeeds.
      }
    },
  },
  { getOnInit: true },
)
```

Persist minimal UI preferences and non-sensitive client settings; keep credentials and server entities outside this storage (see `state-server-state-in-react-query`). Use the atom/storage adapter as the owner instead of adding a second global cache of storage reads.

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

### ESLint Enforcement

Enable `local/atom-contract` at error level. For raw `atom` and `atomWithStorage` declarations, require explicit generics except for plain boolean flags, and report inline object, array and constructed defaults. With type information, also check calls that produce object defaults. Preserve derived read atoms and named defaults. Resolve imported constructors, namespace access and immutable aliases while respecting shadowing. Named defaults still require manual review for their type, exported `DEFAULT_*` name, ownership and safe reset semantics; arbitrary atom factories and mutable aliases are outside this bounded check.

### 8.8 Update Client State From Its Previous Value

**Impact: MEDIUM (avoids stale closures and lost updates)**

When the next value depends on the previous one, use the setter's functional update form. This applies to React local state and writable Jotai atoms accepting an updater. A write-only action should not subscribe to an atom merely to calculate its next value.

**Incorrect (the action captures a stale selection):**

```typescript
const selectedIds = useAtomValue(selectedOrderIdsAtom)
const setSelectedIds = useSetAtom(selectedOrderIdsAtom)
const selectOrder = useCallback((id: string) => {
  setSelectedIds(new Set([...selectedIds, id]))
}, [])
```

**Correct (the setter receives the current selection):**

```typescript
const setSelectedIds = useSetAtom(selectedOrderIdsAtom)
const selectOrder = useCallback((id: string) => {
  setSelectedIds(current => new Set([...current, id]))
}, [setSelectedIds])
```

### Scope

- Direct assignment remains appropriate when the next value comes entirely from an argument or a constant. Keep every other reactive dependency in the callback's dependency array.
- Updaters are pure: copy collections before changing them and keep requests, navigation and notifications outside the updater (`helpers-vercel-immutable-collections`).
- For expensive, genuinely local initial state, pass a pure initializer such as `useState(() => createInitialLayout())`. An initializer does not synchronize later prop changes; derive values when they should follow current inputs (`state-derived-atoms`).
- Shared client state remains in scoped atoms. This rule does not justify moving it into a new local-state facade (`arch-no-prop-drilling`).

### ESLint Enforcement

Keep `react-hooks/exhaustive-deps` enabled. Use functional updates to remove unnecessary state reads while retaining actual dependencies; do not suppress the diagnostic to preserve a stale closure.

### Sources

Adapted from Vercel's [functional updates](https://github.com/vercel-labs/agent-skills/blob/main/skills/react-best-practices/rules/rerender-functional-setstate.md) and [lazy initialization](https://github.com/vercel-labs/agent-skills/blob/main/skills/react-best-practices/rules/rerender-lazy-state-init.md), with Jotai ownership preserved.

### 8.9 Prefix Atoms with Their Entity

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

### 8.10 Pick useAtomValue, useSetAtom or useAtom by Need

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

Explicit helper categories separate selection, aggregation, calculation, mapping, presentation, validation and business decisions so each function has predictable ownership and dependencies.

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
  return useCallback(
    (contact: Contact | null | undefined, { fallback = '—' }: { fallback?: string } = {}) => {
      if (contact == null) return fallback
      return `${contact.firstName} ${contact.lastName}`.trim()
    },
    [],
  )
}

// domains/sales/shared/helpers/formatters/useFormatGlobalStatus.ts
export function useFormatGlobalStatus() {
  const { t } = useTranslation()
  return useCallback(
    (status: GlobalStatus | null | undefined, { fallback = '—' }: { fallback?: string } = {}) => {
      if (status == null) return fallback
      return t(`sales.globalStatus.${status}`)
    },
    [t],
  )
}

// component
const formatContact = useFormatContact()
const formatGlobalStatus = useFormatGlobalStatus()
const formatMoney = useFormatMoney()

<p>{formatContact(access.contact)}</p>
<Badge>{formatGlobalStatus(order.globalStatus)}</Badge>
<p>{formatMoney(order.amount, order.currency)}</p>
```

Where to look first: the app-wide formatters in `src/shared/helpers/formatters/` (money, dates, addresses), then the domain's and its main domain's `shared/helpers/formatters/`. A formatter used by several sub-domains lives once in `[domain]/shared/helpers/formatters/`, one hook per file named after it. A formatter hook returns a `useCallback`-wrapped function taking the entity (see `arch-helpers-vs-services` for its shape). Lint the raw locale calls (`toLocaleDateString`, `toLocaleTimeString`) with `no-restricted-properties` so that dates also go through the shared formatters.

### Missing Values in Every Formatter

Every value-to-text formatter owns display fallbacks: dates, numbers, money, percentages, entity names and status labels. Its value parameter accepts the normal input type plus `null | undefined`, its return type stays `string`, and its options expose a configurable `fallback`. Use the application's default placeholder when no fallback is supplied; allow an empty string when the caller needs blank text.

Pass nullable values directly instead of guarding with `value == null ? '' : formatDate(value)`, checking truthiness, or defaulting a formatter input with `??` or `||`. Extend the existing formatter's options rather than creating a wrapper solely for a missing-value placeholder. Resolve absence inside the formatter before property access, lookups or date conversion; never turn a missing date into the Unix epoch or today's date.

**Incorrect (the component owns a display fallback):**

```tsx
<span>{value == null ? '—' : formatNumber(value)}</span>
<span>{publishedOn == null ? '' : formatDate(publishedOn)}</span>
<span>{contact == null ? '—' : formatContact(contact)}</span>
```

**Correct (the existing formatter owns the policy):**

```tsx
<span>{formatNumber(value)}</span>
<span>{formatDate(publishedOn, { fallback: '' })}</span>
<span>{formatContact(contact)}</span>
```

**Correct (the date formatter handles absence before formatting):**

```typescript
export function useFormatDate() {
  const { i18n } = useTranslation()
  const dateFormatter = useMemo(
    () => new Intl.DateTimeFormat(i18n.language),
    [i18n.language],
  )

  return useCallback(
    (value: Date | null | undefined, { fallback = '—' }: { fallback?: string } = {}): string => {
      if (value == null) return fallback
      return dateFormatter.format(value)
    },
    [dateFormatter],
  )
}
```

A display fallback does not change the entity's nullability or replace API parsing and validation (see `types-explicit-nullability` and `yup-last-coercion-barrier`). Preserve each caller's placeholder and existing format options when migrating; replace the empty-string date guard with `{ fallback: '' }` rather than changing its output to the default placeholder.

### Numeric Fallbacks and Zero

Numeric formatters accept `number | null | undefined`. A string fallback is display text; a numeric fallback uses the same precision, sign, currency and unit options as a regular value. Keep zero distinct from absence by default and opt into a zero placeholder explicitly. Do not add numeric fallback or zero-handling options to non-numeric formatters.

Conditions that select structure, loading or error states, permissions or comparability remain component/business logic. A calculation's numeric default belongs to that calculation. A domain formatter may add independent business meaning; a missing-value placeholder alone does not justify one.

### ESLint Enforcement

Enable the typed `local/formatter-contract` rule at error level for exported formatter implementations. Inspect exported local bindings, including aliased and separately declared exports. A plain `formatXxx(value): string` export must not bypass the hook contract by omitting `useFormat` from its name. Require nullable input, configurable fallback options and a string result on the function returned by `useFormatXxx`; reject a hook that returns a non-callable value. Constants, type exports, bundles of existing formatter hooks and private numeric support utilities are not standalone value-to-text formatters. Arbitrary injected callbacks or opaque reexports still need review.

Use the custom ESLint rule `local/no-inline-format-fallback` for production TS and TSX, including domain formatter wrappers. Detect guards on the formatter's first argument and direct `??`/`||` input defaults with string or numeric literals. Cover both ternary branches, either operand order for `==`, `===`, `!=` and `!==`, null/undefined/zero/empty-string tests, `typeof`, truthiness, negation, `Boolean`, immutable boolean aliases, return-only `if` guards and `&&`/`||` short-circuits that directly return a formatter call. Keep query-state conditions and conditional mounting when they select UI structure rather than a text fallback.

Resolve formatter identity from `helpers/formatters/` imports rather than local names alone: `useFormatXxx` hook results, imported `formatXxx` functions, namespaces, relative imports and immutable aliases. Support destructured aliases and member calls from `use…Formatters` bundles without a registry per formatter. Compare stable member accesses across dot/bracket notation and optional access.

The check does not follow reassigned aliases, arbitrary providers, helper parameters, dynamic property keys, multi-child structural JSX branches or fallback expressions nested inside calculations. Exclude global shared formatter implementations and tests; keep domain shared wrappers checked. Do not autofix: preserve business conditions and the distinction between absence and zero.

At translation boundaries, enable the typed `local/i18n-consistency` check to reject native `Date` values supplied directly as interpolation options. Formatting the date belongs to the existing formatter before interpolation; otherwise the translation may expose JavaScript's date string and the host time zone. Resolve translation bindings and native Date declarations, including aliases and nullable unions; preserve formatted strings and unrelated objects with the same names. Opaque option objects and nested interpolation values require manual review. Verify rejected and valid neighboring cases through the application's actual configuration.

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

See also: `state-derived-atoms`

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

### ESLint Enforcement

Use the custom ESLint rule `local/no-helper-context-params` to prevent formatter and context dependencies from being threaded through helper APIs. Review the dependency's actual role and the form-schema exception rather than relying on its name alone.

### 9.4 Preserve Collection Inputs When Transforming

**Impact: MEDIUM-HIGH (prevents helpers from mutating props, atoms or cached entities)**

Selectors, mappers and calculators treat incoming collections as read-only. Sorting or changing a view of props, Jotai state or query data must produce a separate collection, leaving the original order and values intact.

**Incorrect (the selector reorders its caller's array):**

```typescript
export function sortOrders(orders: Order[]): Order[] {
  return orders.sort((left, right) => left.createdAt.getTime() - right.createdAt.getTime())
}
```

**Correct (the selector returns a sorted copy):**

```typescript
// helpers/selectors/sortOrders.ts
export function sortOrders(orders: readonly Order[]): Order[] {
  return orders.toSorted((left, right) => left.createdAt.getTime() - right.createdAt.getTime())
}
```

Use a copied array before `.sort()` when the target runtime lacks `toSorted`. Apply the same policy to reversing, splicing, `Map`/`Set` updates and nested objects. A shallow array copy does not make its elements independent: copy changed records as well.

### Exceptions

- A helper may mutate a fresh accumulator or collection it created itself. Do not deep-clone every input merely to claim purity.
- Use functional setters for state changes and TanStack Query cache APIs for server-state changes; mutating a shared reference bypasses those ownership boundaries (`state-vercel-functional-updates`).

### Sources

Adapted from Vercel's [immutable sorting](https://github.com/vercel-labs/agent-skills/blob/main/skills/react-best-practices/rules/js-tosorted-immutable.md), applied at the helper and state boundaries.

### 9.5 Sort Every Helper Into One of a Fixed Set of Categories

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

### 9.6 Index Collections for Repeated Lookups

**Impact: MEDIUM (avoids repeated linear scans in data transformations)**

When a transformation repeatedly checks membership or resolves records by the same key, build a `Set` or `Map` once for that input snapshot. Keep the transformation in the owning selector, mapper or aggregator rather than adding a data pipeline to JSX.

**Incorrect (each order scans the complete allowed-id list):**

```typescript
export function selectAllowedOrders(orders: readonly Order[], allowedIds: readonly string[]) {
  return orders.filter(order => allowedIds.includes(order.id))
}
```

**Correct (membership uses one index):**

```typescript
// helpers/selectors/selectAllowedOrders.ts
export function selectAllowedOrders(orders: readonly Order[], allowedIds: readonly string[]) {
  const allowed = new Set(allowedIds)
  return orders.filter(order => allowed.has(order.id))
}
```

### Preserve Semantics

- For record lookup, use a `Map` only with a unique key or an explicit duplicate policy. Replacing `.find()` with a map that keeps the last duplicate changes behavior.
- Keep order and duplicates when the output requires them. An existence check can stop at its first match; validation that promises every error must still collect every error.
- Find extrema in one pass when a sorted collection is unnecessary. Combine large repeated traversals only when it improves the measured path without obscuring separate responsibilities.
- Building an index for one lookup in a tiny array may add cost. Profile uncertain cases and prefer the clearest suitable algorithm. Rebuild or memoize by actual inputs; avoid an unbounded module cache of mutable business data.

### Keep Source Keys Separate from Object Metadata

Source-controlled names and IDs may equal `constructor`, `__proto__` or a row's metadata field. Prefer `Map` for these lookups, and expose fixed indexes as `ReadonlyMap` when consumers must not mutate them. Its `.get()` result also makes a missing entry explicit in TypeScript. An object dictionary needs own-property checks; `dictionary[key] ?? fallback` can still return an inherited property. Use `Object.fromEntries` when converting arbitrary keys into an object so that `__proto__` remains an own data property.

Keep dynamic values separate from metadata, for example `{ timestamp, values }`. A chart series should read its value through a typed accessor when a source label could be interpreted as a property path. Keep aggregate identity independent of translated labels so a real category can have the same display text as a synthetic group. These are data-contract decisions: test literal names, missing entries and an aggregate/source-label collision instead of adding identifier-specific exclusions.

### Sources

Adapted from Vercel's [index maps](https://github.com/vercel-labs/agent-skills/blob/main/skills/react-best-practices/rules/js-index-maps.md), [membership indexes](https://github.com/vercel-labs/agent-skills/blob/main/skills/react-best-practices/rules/js-set-map-lookups.md) and [single-pass extrema](https://github.com/vercel-labs/agent-skills/blob/main/skills/react-best-practices/rules/js-min-max-loop.md).

---

## 10. Internationalization

**Impact: MEDIUM**

Every user-facing string goes through react-i18next with static, analyzable keys so that tooling can detect missing or unused keys.

### 10.1 Inject Dynamic Values Through t() Options, Never Concatenation

**Impact: MEDIUM (translatable sentences and checked placeholders)**

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

Enable `local/no-ui-string-concat` for production code. Reject concatenated translations and decorated formatter results in display expressions, for both templates and `+`. Resolve imported formatter hooks and immutable aliases; preserve numeric arithmetic and technical keys, URLs, chart data keys and CSS expressions. For binary expressions, use a proven string operand before calling an operation concatenation. Implicit display text outside JSX/presentation helpers, opaque wrappers and reassigned aliases require manual review. Verify rejected and neighboring valid examples through the consuming application's configuration.

### 10.2 Never Use defaultValue in t()

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

### 10.3 Translate Every User-Facing String with a Catalog Key

**Impact: MEDIUM (no untranslatable copy, no raw keys on screen)**

Every string a user can see or hear goes through `t()`: titles, labels, buttons, placeholders, empty states, toasts, tooltips and accessible labels. Domains pass translated semantic labels; shared UI implements any ARIA wiring (`ui-centralize-accessibility`). When you introduce a key, check that it exists in the reference translation catalog; if not, add it there (and have it created wherever the catalog is maintained) — otherwise the app renders the raw key. Then run the key extraction check.

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

### ESLint Enforcement

Enable `local/no-hardcoded-ui-strings` for production code. Check visible JSX and user-facing attributes directly, including interpolated templates. Presenter and formatter placement is only a signal: their return values can also be technical keys, CSS references or chart identifiers. In an implicit helper return, report recognizable natural-language copy rather than treating every template containing letters as translated text. Keep explicit UI text and attributes checked. Typed data fixtures under `mocks/` or in `*.mock.*` may carry raw entity names and source messages; do not treat those object values as product copy. Keep JSX text and attributes checked even in such a module.

This bounded syntax check cannot prove the meaning of every bare string, follow arbitrary adapters or identify all runtime-generated copy. Review ambiguous helper outputs and API-provided data at their display sites. Verify rejected copy, valid technical identifiers and explicit UI templates through the consuming application's actual configuration; do not add application-specific identifier allowlists.

### 10.4 Use Literal Translation Keys Only

**Impact: MEDIUM (keys stay visible to i18next-scanner and the missing-key check)**

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

Unused-key extraction must recognize the same supported translation bindings as the configured key check: the i18n instance, imported `t`, and `t` obtained from `useTranslation`, including aliases. Resolve lexical bindings so unrelated or shadowed functions do not keep a catalog key alive. Exercise each supported binding and a neighboring unrelated call; matching only the text `i18n.t` wrongly reports valid hook-based translations as unused.

---

## 11. Testing

**Impact: MEDIUM**

Jest + React Testing Library tests exercise visible behavior through the real hook stack, stubbing only the network boundary, which makes them robust to refactors.

### 11.1 Assert Behavior with Parametrized, Unconditional Tests

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

### ESLint Enforcement

Enable `local/no-test-style-assertions` and `local/no-conditional-test-assertions` at error level in authored test files (`*.test.*`, `*.spec.*`, `__tests__/`), including tooling tests.

The style check recognizes Jest/Vitest assertions, import aliases and immutable aliases. Reject `toHaveClass`, class attributes, DOM `className`/`classList` reads and equivalent `getAttribute('class')` assertions. For HTML returned by React server rendering or DOM serialization, detect literal class attributes and recognizable Tailwind utility sequences, including static strings, regex literals, templates, aliases and statically available `test.each` tables. Preserve semantic attributes, visible text, ordinary data comparisons and public SVG drawing contracts. A permitted public state-class exception requires a narrow reviewed directive with its technical rationale.

The conditional-assertion check reports assertions lexically inside branches, loops, collection iteration, catch clauses and short-circuit right operands. Allow parametrized tests, unconditional aggregate assertions and polling callbacks such as `waitFor`. Follow the actual imported assertion binding and respect shadowing.

These are bounded checks: opaque helper results, reassigned aliases, arbitrary regex syntax, dynamic CSS generation and conditional execution hidden behind another function require review. Do not infer Tailwind classes from ordinary prose or attribute all properties named `className` to DOM nodes. There is no automatic conversion to a behavior test.

### 11.2 Build Typed, Deterministic Mock Data in the Owning mocks Folder

**Impact: MEDIUM (reproducible tests that break when the domain type changes)**

Fixtures live in the owning feature's `mocks/<entity>.mock.ts`, or in the nearest scoped `shared/mocks/` when sibling features reuse them. They are annotated with the domain entity, never cast (`as Invoice[]` hides missing or renamed fields). They use fixed `Date` values (`new Date('2026-01-15T09:00:00.000Z')`, never `new Date()`), a unique id per item, and varied values that cover each state the UI branches on. A factory with `overrides` lets each test state only what it cares about.

A `mocks/` folder holds typed fixtures only. Network handlers (MSW) live in one shared mock-server folder and reuse these fixtures, so tests and the dev environment agree on the same data (see `test-mock-network-not-internals`).

**Incorrect (cast hides the missing required fields):**

```ts
export const mockInvoices = [
  { id: 'invoice-1', createdAt: new Date('2026-01-15T09:00:00.000Z'), status: 'DRAFT' },
  { id: 'invoice-2', createdAt: new Date('2026-02-01T09:00:00.000Z'), status: 'PAID' },
] as Invoice[]
```

**Correct (annotated factory with overrides, fixed dates, distinct ids and states):**

```ts
import type { Invoice } from '@/domains/sales/invoices/shared/types/invoice.type'

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

### ESLint Enforcement

Enable `local/test-fixture-contract` at error level for tests and mock-data modules. With TypeScript information, reject object/array fixtures whose source shape is not assignable to the asserted type, including angle-bracket casts, immutable aliases and double casts through `unknown`. Preserve annotations, `satisfies`, `as const`, explicit partial contracts and DOM narrowing. A complete cast may remain assignable; prefer the annotation/factory convention during review.

In `mocks/` and `*.mock.*`, reject the live clock (`new Date()`, `Date()`, `Date.now()`) and `Math.random()`, including immutable aliases. Keep controlled-clock assertions in tests valid. Fixed dates and explicitly seeded generators remain valid.

The check does not prove unique IDs or fixture ownership, follow arbitrary factories or discover every nondeterministic source. Review those properties separately. It does not autofix missing fields, choose business defaults or invent dates.

### 11.3 Colocate a Test Next to Every File, Covering Errors

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
// src/domains/sales/orders/features/detail/apis/queries/useGetOrderDetailQuery.test.tsx
describe('useGetOrderDetailQuery', () => {
  it('should parse the API payload and strip unknown fields', async () => { /* ... */ })

  it('should default lines and attachments to [] when missing', async () => { /* ... */ })

  it('should throw when the API answers 404', async () => { /* ... */ })
})
```

A sibling file makes a missing test visible in the file tree, moves with the code when a folder is renamed, and keeps relative imports short (`./useGetOrderDetailQuery`).

Do not leave a silent `it.skip`: either fix the test or add a `// TODO:` comment that states why it is skipped. Run the tests of the folder you changed.

### 11.4 Isolate Jotai State with a Fresh Store per Test

**Impact: MEDIUM (prevents state leaking between tests through module-level atoms)**

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
} from '@/domains/contracts/features/histories/pages/histories/stores/filters.atoms'

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

### 11.5 Mock the Network Boundary, Never Internal Modules

**Impact: MEDIUM (tests that mock internals stay green while the real hook stack is broken)**

Never `jest.mock` an internal module: a hook, component, helper, provider or a schema library such as `yup` (a domain `apis/`, `services/`, `components/` or `helpers/` module). The test then checks a stub instead of the real query key, Yup parsing, permissions and rendering. Stub only the network boundary — MSW handlers or an axios adapter — and let every project hook run.

**Incorrect (stubs the query hook and the permissions hook):**

```tsx
jest.mock('@/domains/sales/orders/features/detail/apis/queries/useGetOrderDetailQuery', () => ({
  useGetOrderDetailQuery: () => mockUseGetOrderDetailQuery(),
}))
jest.mock('@/domains/sales/orders/features/detail/pages/detail/services/permissions/usePermissions', () => ({
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

### ESLint Enforcement

Enable `local/prefer-semantic-test-queries` at error level in authored test files, including tooling tests. Resolve Testing Library bindings, namespaces, aliases, destructured render queries and `within` results to reject test-ID queries and `fireEvent` interactions. Check DOM selectors and DOM `tagName` access using receiver types or proven DOM/Testing Library origins.

Preserve semantic queries, `userEvent`, compiler AST properties and unrelated APIs with matching method names. Type information extends detection through local helpers returning DOM nodes. Opaque untyped wrappers, runtime property names and nonstandard query libraries require review. The check has no autofix because selecting a role and accessible name may require correcting the component.

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

**Impact: HIGH**

Conventions that keep the codebase consistent and reviewable, beyond what ESLint and TypeScript already enforce.

### 12.1 Avoid Deprecated APIs

**Impact: HIGH**

**Rule:** Replace deprecated APIs with their supported alternatives before using them in project code.

Use the installed dependency versions and their official migration guidance to identify the replacement. Preserve behavior, event cleanup, accessibility, and visual styling during migration. This applies to application code, tests, and configuration, including imported components and deprecated props, not only method calls.

### Applies When

- The resolved API or overload has a JSDoc `@deprecated` annotation.
- The installed API's official documentation marks it deprecated even if its types do not yet carry the annotation.

**Incorrect:**
```typescript
const breakpoint = window.matchMedia('(min-width: 768px)')
const handleChange = (event: MediaQueryListEvent) => console.log(event.matches)

breakpoint.addListener(handleChange)
breakpoint.removeListener(handleChange)
```

**Correct:**
```typescript
const breakpoint = window.matchMedia('(min-width: 768px)')
const handleChange = (event: MediaQueryListEvent) => console.log(event.matches)

breakpoint.addEventListener('change', handleChange)
breakpoint.removeEventListener('change', handleChange)
```

### Exceptions

- Third-party declarations and generated or vendored files are not migration targets; their usage in authored project code still must follow this rule.
- A matching name alone does not establish deprecation: inspect the resolved symbol and applicable overload rather than banning unrelated APIs by name.

### References

- [typescript-eslint: no-deprecated](https://typescript-eslint.io/rules/no-deprecated/)
- [typescript-eslint: typed linting](https://typescript-eslint.io/getting-started/typed-linting/)

### Detection

Use `@typescript-eslint/no-deprecated` with type information for authored TypeScript, including tests and configuration. Do not retain a deprecated call through an allowlist or suppression. Annotated aliased symbols are detectable; manually consult the installed version's official documentation when declarations lack the annotation. A clean lint run does not prove the absence of unannotated deprecations.

### 12.2 Keep an Explicit ESLint Warning Budget

**Impact: HIGH**

**Rule:** Keep the versioned ESLint warning ceiling aligned with reviewed warnings and justify every increase instead of leaving spare capacity.

A warning should require an explicit reviewable change to the budget. The global total includes native ESLint warnings and the tracking warnings for [reviewed suppressions](rules/quality-eslint-disable-scoped.md); suppressed original diagnostics are not counted again.

Configure the custom ESLint suppression-tracking rule described there before counting accepted directives. It implements this catalog's reusable one-warning-per-directive policy.

### Applies When

- Setting up or changing the lint command used locally and in CI.
- Accepting, removing or reauditing an exception, or resolving another warning.

**Incorrect:**
Two accepted exceptions produce two warnings, but the command leaves spare capacity:

```sh
eslint . --max-warnings 5
```

**Correct:**
```sh
eslint . --max-warnings 2
```

### Maintaining the Budget

- Start at `--max-warnings 0`. Keep the ceiling in the versioned lint command, preserving its cache options and `--fix` support; CI must use the same command.
- Audit each exception before accepting it. Increase the ceiling by one per newly accepted directive, not per suppressed rule, diagnostic or review event. Include the rationale for each increase in the change or PR description and the technical evidence in the dated directive.
- A new review of an existing exception updates its date and justification as needed without increasing the ceiling. Removing an exception lowers the ceiling by one. Remove unused suppressions rather than budgeting for them.
- Revalidation of existing exceptions is opt-in under [the exception policy](rules/quality-eslint-disable-scoped.md). A routine audit or budget check preserves their existing allowance without renewing their technical approval or dates. New or modified exceptions still need review; ordinary lint policy errors remain errors.
- Other warnings also consume the global ceiling: investigate and fix them or record why the affected rule permits retaining them before changing the budget. Never absorb invalid review metadata errors into the warning budget.
- Lower the ceiling in the same change when the total decreases. Do not create headroom, automatically update the limit, hide output with `--quiet`, weaken severities or widen ignores to bypass the budget.

### Exceptions

- Focused lint runs and profiling may help diagnosis, but do not replace the full-project budget check.
- Re-running lint or reviewing an existing exception again does not earn an additional allowance.

### References

- [ESLint: max-warnings](https://eslint.org/docs/latest/use/command-line-interface#--max-warnings)

A global warning ceiling rejects excess totals but cannot detect replacing a removed warning with a different warning at the same count. Review new exceptions and lower an oversized ceiling explicitly; neither passing lint nor metadata validation certifies a technical rationale.

### 12.3 Review and Date ESLint Exceptions

**Impact: HIGH**

**Rule:** Review every new or modified ESLint suppression before accepting it, name the affected rules and record the actual review date on a line-scoped directive. Revalidate existing suppressions only when the user explicitly requests it.

A nonempty comment does not establish a valid exception. Accept only a demonstrated false positive, a dependency constraint or an exception permitted by the affected rule. Being inconvenient to fix, pre-existing or needed to pass lint is not a technical justification. This rule does not grant exceptions to rules that expressly prohibit suppression.

### Applies When

- Authored code contains `eslint-disable`, `eslint-disable-line` or `eslint-disable-next-line`, including tests and tooling.
- A suppression is introduced or modified, or the user explicitly requests revalidation of existing ignores. A general audit or changes to the skill, dependencies or nearby code do not enable revalidation by themselves.

**Incorrect:**
```typescript
for (const entry of entries) {
  // eslint-disable-next-line no-await-in-loop
  await writer.append(entry)
}
```

**Correct:**
```typescript
for (const entry of entries) {
  // eslint-disable-next-line no-await-in-loop -- reviewed: 2026-10-27; This writer requires each append to finish before the next write starts.
  await writer.append(entry)
}
```

Use `-- reviewed: YYYY-MM-DD; concrete technical reason`. The date is the actual last review date, not the date lint ran. Name each affected rule explicitly; use `eslint-disable-next-line` or `eslint-disable-line`, never a block/file or all-rules disable.

### Audit and Reaudit

Existing suppressions and configuration exceptions are not technically revalidated by default, even during an initial or full audit. Leave their justification and review date unchanged, and do not lift them merely to complete catalog coverage. Recording their presence or running normal lint is not revalidation or renewed approval. Keep metadata validation, tracking warnings and unused-disable detection enabled; fix policy diagnostics they actually report without bulk-reviewing unrelated exceptions. A newly introduced, widened or otherwise modified exception always needs review before acceptance.

When reviewing a new/modified exception or explicitly revalidating existing ones:

1. Inventory the suppressions in the requested scope. For a targeted reaudit, select the requested exceptions; use their dates to identify when they were last examined.
2. Read each applicable rule, the affected code and relevant callers or dependency evidence. Lift the relevant suppression in an in-memory or isolated check using the application's actual configuration; verify the original rule ID and diagnostic for each named rule. Confirm the check applies to the file before concluding that a suppression is unused. Compare the claimed rationale with the implementation and rule contract; do not infer approval from an earlier comment or a syntactically valid date. If the diagnostic or rationale cannot be verified, leave the exception unresolved rather than updating its review date as if approved.
3. Remove unused suppressions. For a real violation without an allowed exception, correct the code and remove the suppression. For a justified exception, retain the narrow directive and record the concrete rationale and actual review date.
4. Run lint and maintain the [warning budget](rules/quality-eslint-warning-budget.md). A retained directive contributes one tracking warning, even if it names several rules. A new review of the same exception updates its date without adding another warning.

Never bulk-date existing ignores or raise the budget before examining them. If an audit is explicitly deferred, leave the missing metadata as errors rather than approving the exceptions in advance. Do not replace a suppression with a configuration exclusion or a lower severity to bypass review.

### ESLint Enforcement

Configure ESLint with the custom rules `local/require-reviewed-eslint-suppression` at error level and `local/reviewed-eslint-suppression` at warning level for authored JS and TS, including tests and tooling. Reject invalid scope, unnamed rules, missing rationale and missing or invalid calendar dates. Emit one tracking warning per conforming directive containing its rules, rationale and last review date. These tracking warnings require the custom rule; ESLint does not emit them by default.

Enable `reportUnusedDisableDirectives: 'error'` and preserve policy diagnostics even under a blanket disable. Neither check should autofix metadata: validation cannot certify a technical rationale or perform a review.

### Exceptions

- Generated and vendored code outside the project's lint scope is not an audit target.
- Examples embedded in strings or ordinary explanatory comments are not suppression directives.
- A prior review does not expire automatically. Technical revalidation of an existing ignore requires an explicit user request; a new or modified exception still requires review before acceptance.

### References

- [ESLint: configuration comments and descriptions](https://eslint.org/docs/latest/use/configure/rules#using-configuration-comments)
- [ESLint: unused disable directives](https://eslint.org/docs/latest/use/configure/configuration-files#report-unused-disable-directives)

Place the directive immediately above the offending line rather than an enclosing hook, function or JSX block. A misplaced directive suppresses nothing and should fail as unused. First look for a clean fix; do not approve a suppression merely because its metadata is complete.

### 12.4 Export One Public Value per File

**Impact: MEDIUM**

**Rule:** Export at most one public value per production file and group related extracted files in a themed directory.

Give each public component, function, hook or constant a named file. When splitting related components or utilities, group them by theme within their existing owner and helper category; do not introduce a new business feature just to hold the files. Import files directly instead of recreating a multi-export barrel.

For application modules, import the defining file directly; `arch-stores-no-index` adds the state-folder restriction. For dependencies, use documented, typed public exports or supported subpaths. Avoid private `dist/` imports just to bypass a package barrel. Check the actual bundler output before claiming a loading benefit; package structure and tree-shaking differ.

### Applies When

- A production module exports several values, whether with declarations, a default export, an export list or named reexports.
- Several names in one export statement count separately, including aliases of the same binding.
- An `export *` hides how many values the module exposes; replace it with an explicit single value export or direct imports. A namespace export (`export * as values`) exposes one value.

**Incorrect:**
```tsx
// actions/Actions.view.tsx
export function SaveAction() {
  return <button>Save</button>;
}
export function CancelAction() {
  return <button>Cancel</button>;
}
```

**Correct:**
```tsx
// actions/SaveAction.view.tsx
export function SaveAction() {
  return <button>Save</button>;
}

// actions/CancelAction.view.tsx
export function CancelAction() {
  return <button>Cancel</button>;
}
```

The same split applies to helpers: put `sumAmounts.ts` and `averageAmount.ts` in an `amounts/` directory under the appropriate helper category when they previously shared a public module. Keep private support functions in the public helper's file when they serve only that helper.

### Exceptions

- Type-only exports do not count, including local interfaces or type aliases exported without an explicit `type` modifier. A value and its associated exported types may share a file.
- Private components and private helper functions remain allowed, subject to the other component and helper rules.
- A file may export no values. Function overload signatures belong to one public function, not separate exports.
- Tests, stories and Storybook support files, declaration files and tooling configurations are outside this production-module convention.

See also: `arch-component-module-boundaries`, `arch-helpers-vs-services`

### ESLint Enforcement

Use the custom ESLint rule `local/single-public-export` to report production-module violations. Choosing a meaningful owner and directory for extracted files requires review and has no automatic fix.

### 12.5 Never Build Hooks from Hooks (No createUseXxx Factories)

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
import { useFormatInvoiceStatus } from '@/domains/sales/invoices/shared/helpers/formatters/useFormatInvoiceStatus'

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

### 12.6 No Clickable No-Op Links or Actions

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

### 12.7 Place the Public API First

**Impact: MEDIUM**

**Rule:** Declare exported functions and components immediately after imports and module directives, before types, constants and private declarations.

Expose the module's callable API before its implementation details. Keep directives such as `'use client'`, file headers and imports at the start. Public types and constants are also placed after the public function or component; the rule does not impose an order within the remaining declarations.

### Applies When

- A function declaration, function expression, arrow function, class declaration/expression or React component wrapped in `memo` or `forwardRef` is exported.
- A locally declared callable is exposed through an export list or a default identifier export: order the declaration itself, not just the export statement.

**Incorrect:**
```typescript
type Amount = { value: number };
const SCALE = 100;

export function toMinorUnits(amount: Amount) {
  return amount.value * SCALE;
}
```

**Correct:**
```typescript
export function toMinorUnits(amount: Amount) {
  return amount.value * SCALE;
}

type Amount = { value: number };
const SCALE = 100;
```

### Exceptions

- Headers, module directives and imports precede the public API.
- Modules exporting only constants or types have no callable API to reorder. Reexports do not require moving a declaration from another module.
- Tests, stories and Storybook support files, declaration files and tooling configurations are excluded.

### Safe Reordering

Preserve initialization order when moving declarations. Hoisted functions may move across erased or hoisted declarations; function-valued initializers and classes must retain their runtime dependencies. Keep attached documentation and overload groups together, and preserve the relative order of the remaining code. Report an unsafe move for manual refactoring instead of introducing a temporal dead zone or crossing a lint suppression.

### 12.8 Prefer ref as a Prop in React 19

**Impact: MEDIUM (removes unnecessary forwardRef wrappers while preserving typed ref forwarding)**

In React 19+ function components, accept a typed `ref` prop and forward it to the owned element. Keep the ref optional unless the component's contract requires it. Accessibility and focus behavior remain inside shared UI according to `ui-centralize-accessibility`.

**Incorrect (an unnecessary wrapper in React 19-only code):**

```tsx
// shared/ui/TextField.view.tsx
import { forwardRef } from 'react'

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
  ({ label }, ref) => <label>{label}<input ref={ref} /></label>,
)

type TextFieldProps = { label: string }
```

**Correct (the component forwards a typed ref prop):**

```tsx
// shared/ui/TextField.view.tsx
import type { Ref } from 'react'

export function TextField({ label, ref }: TextFieldProps) {
  return <label>{label}<input ref={ref} /></label>
}

type TextFieldProps = {
  label: string
  ref?: Ref<HTMLInputElement>
}
```

### Exceptions

- Apply this convention to React 19+ targets. Libraries and adapters that must support React 18 may retain `forwardRef` at that compatibility boundary.
- Preserve the element or imperative handle exposed by an existing component. Changing the wrapper must not change its public ref behavior.
- Third-party implementations are outside the migration scope. This rule concerns ref forwarding; state sharing continues to follow `arch-no-prop-drilling`.

### ESLint Enforcement

For React 19-only authored code, use ESLint's `no-restricted-imports` to restrict the named `forwardRef` import from `react`. Keep React 18 compatibility adapters outside that restriction. Review namespace/member calls and dependency requirements as well; a named-import restriction does not prove the absence of every wrapper.

### Sources

Adapted from the ref-forwarding part of Vercel's [React 19 guidance](https://github.com/vercel-labs/agent-skills/blob/main/skills/composition-patterns/rules/react19-no-forwardref.md). The [React documentation](https://react.dev/reference/react/forwardRef) describes passing `ref` as a prop in React 19.

### 12.9 useMemo for Data, useCallback for Functions

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

When a hook derives one cohesive data result from the same inputs, prefer constructing that result inside one `useMemo`. Keep intermediate values local to its callback when they do not need an independent cache or reference lifetime. A stable public result does not require a separate memo for each field and another memo just to assemble them.

**Incorrect (intermediate caches with no independent invalidation benefit):**

```ts
export function useOpenOrdersSummary(orders: Order[]) {
  const openOrders = useMemo(
    () => orders.filter(order => order.status === 'open'),
    [orders],
  )
  const total = useMemo(
    () => openOrders.reduce((sum, order) => sum + order.amount, 0),
    [openOrders],
  )
  return useMemo(() => ({ openOrders, total }), [openOrders, total])
}
```

**Correct (derive and return the cohesive result in one memo):**

```ts
export function useOpenOrdersSummary(orders: Order[]) {
  return useMemo(() => {
    const openOrders = orders.filter(order => order.status === 'open')
    const total = openOrders.reduce((sum, order) => sum + order.amount, 0)
    return { openOrders, total }
  }, [orders])
}
```

Keep separate memos when computations have independently changing inputs and merging would repeat meaningful work, or when callers need one returned object's reference to survive changes to unrelated fields. For example, putting an expensive order summary and a request's loading/error state in one memo recomputes the summary and recreates its reference on request-state changes. A final assembly memo, when needed, should compose independently cached results without pulling those calculations into its callback. Keep hooks at the hook's top level; only move pure calculations into a memo callback.

Choose memo boundaries by invalidation and consumer needs, rather than imposing one memo per hook or one memo per field. Use profiling to decide uncertain performance tradeoffs; memo count alone does not establish a speedup.

Skip `useMemo` for cheap primitive expressions. Extract a costly rendered region behind its own component boundary when this lets a loading/visibility branch avoid the work entirely; add manual `memo` only when unchanged props and measured render cost justify it. Keep calculations in their owning helpers and preserve `arch-component-roles`.

When a default array or object becomes an effect dependency or a memoized child's prop, use an immutable shared default if reference stability matters. Do not share mutable per-instance state through that constant. Avoid caching every field, global unbounded result maps or JSX variables solely to make a memo count smaller. With React Compiler, review the compiler's coverage before adding manual caches; neither compiler optimization nor memoization replaces correct state and effect semantics.

### 12.10 Write Code, Comments and Tests in English

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

### 12.11 Keep JSDoc for Non-Obvious Intent Only

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

### 12.12 No Chained or Negated Ternaries

**Impact: LOW (branch logic stays readable and testable)**

A ternary has one positive condition and two outcomes. Never chain them (`a ? x : b ? y : z`) and never start one with a negation (`!a ? x : y`), because readers have to evaluate the branches in reverse. Turn multi-branch decisions into a small named function with early returns. A pure decision belongs in `helpers/`, where `test.each` can cover it. Enforce with the ESLint rules `no-nested-ternary` and `no-negated-condition`.

**Incorrect (chained and negated):**

```tsx
const badgeType: BadgeType = !order.closingDate
  ? order.globalStatus === 'NOT_STARTED' ? 'error' : 'info'
  : 'success'
```

**Correct (component-scoped presenter helper with early returns and positive conditions):**

```tsx
// OrderCard/helpers/presenters/getOrderBadgeType.ts
export const getOrderBadgeType = ({ closingDate, globalStatus }: OrderDetail): BadgeType => {
  if (closingDate) return 'success'
  if (globalStatus === 'NOT_STARTED') return 'error'
  return 'info'
}
```

```tsx
// OrderCard/OrderCard.view.tsx
import { getOrderBadgeType } from './helpers/presenters/getOrderBadgeType'

const badgeType = getOrderBadgeType(order)
```

A single positive ternary between two static i18n keys is fine: `t(isReadOnly ? 'common.close' : 'common.cancel')`. For JSX with three or more states, map each state to its content in a `Record<Status, ...>` or return early from a subcomponent.

---

## References

1. `tailwind-design-system`
