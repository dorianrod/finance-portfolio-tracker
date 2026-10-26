---
name: generic-react-best-practices
description: >
  Opinionated React/TypeScript rules for any front-end app (React 19, TanStack Query v5, Jotai, Yup,
  react-i18next, Radix, Jest + React Testing Library). The author's own take on best practices, a delta on
  top of vercel-react-best-practices. Use it whenever you write, review, refactor or audit React code:
  domain-first architecture and import boundaries, API query/mutation hooks, query keys and cache
  invalidation, domain types, Yup schemas and form validation, UI composition and accessibility, Jotai
  stores, helpers and formatters, i18n, tests and code quality. Apply it alongside
  vercel-react-best-practices on any React task, even when it isn't named.
license: Internal
metadata:
  author: frontend-engineering
  version: "1.4.1"
---

# Generic React Best Practices

Opinionated coding guide for any React front (React 19, TanStack Query, Jotai, Yup, react-i18next, Jest + RTL). It contains 90 rules across 12 categories, ordered by impact, to guide code generation, reviews and refactoring.

This skill is the equivalent of `vercel-react-best-practices` for our own conventions. Generic React and performance rules (waterfalls, barrel imports, memoization, derived state, conditional rendering…) live in `vercel-react-best-practices`: apply **both**.

Examples use a generic business vocabulary: main domain `sales` (`orders`, `invoices`, `opportunities`, `shared`), single-level domains `contracts` and `projects`, main domain `directory` (`contacts`, `accounts`, `teams`). Map them to your own domains.

## When to Apply

Use these rules when you:

- Write or modify domain code (APIs, types, schemas, stores, helpers, components)
- Create query/mutation hooks, Yup schemas, Jotai stores or form schemas
- Review a PR or audit a screen (use the rule ids in review comments)
- Refactor legacy code toward these standards

Several rules describe the target standard, not the current state of every file. When existing code contradicts a rule, follow the rule for new code and do not copy the legacy pattern.

## Rule Categories by Priority

| Priority | Category | Impact | Prefix |
|----------|----------|--------|--------|
| 1 | Architecture & Boundaries | CRITICAL | `arch-` |
| 2 | API Hooks & Server State | CRITICAL | `api-` |
| 3 | Security | CRITICAL | `security-` |
| 4 | Query Keys & Cache | HIGH | `cache-` |
| 5 | Domain Types | HIGH | `types-` |
| 6 | Yup Schemas | HIGH | `yup-` |
| 7 | UI Composition & Accessibility | HIGH | `ui-` |
| 8 | Jotai Client State | MEDIUM-HIGH | `state-` |
| 9 | Helpers | MEDIUM-HIGH | `helpers-` |
| 10 | Internationalization | MEDIUM-HIGH | `i18n-` |
| 11 | Testing | MEDIUM-HIGH | `test-` |
| 12 | Code Quality | MEDIUM | `quality-` |

## Quick Reference

### 1. Architecture & Boundaries (CRITICAL)

- `arch-component-roles` - Declare Every React Component as a View, State Renderer or Feature
- `arch-domain-first-layout` - Follow the Domain-First Folder Layout
- `arch-transverse-only-imports` - Import Other Domains Only Through Transverse Domains
- `arch-shared-no-domain-knowledge` - Keep Shared Code Within Its Ownership Boundary
- `arch-feature-slice-layout` - Organize Every Domain into Vertical Feature Slices
- `arch-no-prop-drilling` - Share Client State Through Jotai, Not Prop Chains or Context
- `arch-decompose-hook-heavy-components` - Decompose Hook-Heavy Components by Responsibility
- `arch-feature-flags` - Gate Experimental Features With a Typed Flag Registry
- `arch-isolate-effects-in-hooks` - Isolate Effects in Intent-Named Hooks
- `arch-component-module-boundaries` - Keep Component Modules Focused on Components
- `arch-thin-components` - Keep Components Thin
- `arch-no-visual-logic-below-page` - Keep Visual Logic at the Component or Page Boundary
- `arch-stores-no-index` - No index.ts in stores/, One File per Concern
- `arch-helpers-vs-services` - Separate Helpers from Services by Effects and Orchestration
- `arch-subdomain-decision` - Create a Sub-Domain Only for a Distinct Business Entity

### 2. API Hooks & Server State (CRITICAL)

- `api-use-transformation` - Validate Both Directions With Yup Inside Every API Hook
- `api-wrap-in-domain-hooks` - Wrap Every Endpoint in a Domain API Hook
- `api-central-url-constants` - Declare Every Endpoint in One Registry, Never Inline URLs
- `api-mutation-three-types` - Model Mutations as Input, Payload and Response
- `api-error-message-helper` - Normalize API Errors Centrally and Translate Known Keys Before Display
- `api-suspense-error-boundary` - Pair Every Suspense Query With an Error Boundary and Handle 404 Separately
- `api-query-hook-choice` - Pick the TanStack Query Hook by Access Pattern
- `api-return-result-as-is` - Return the TanStack Result As-Is From API Hooks
- `api-typed-entity-generic` - Type API Hooks With the Domain Entity and Let the Return Type Infer
- `api-optimistic-update` - Use Optimistic Updates Only Where Latency Is Visible, With Rollback
- `api-void-mutation` - Use TData = void for Body-less or Response-less Mutations
- `api-business-destructuring` - Destructure Query Data With a Business Name
- `api-naming` - Name API Hooks After the Endpoint Intent

### 3. Security (CRITICAL)

- `security-clear-cache-on-logout` - Clear the Query Cache on Logout
- `security-window-open-noopener` - Open External Links with noopener and noreferrer
- `security-authorized-file-access` - Read Protected Files Only Through the Authorized File Primitive

### 4. Query Keys & Cache (HIGH)

- `cache-invalidate-exactly` - Invalidate Exactly What the Mutation Affects
- `cache-one-key-convention` - Use One Query Key Convention per Domain

### 5. Domain Types (HIGH)

- `types-consume-entity` - Consume Domain Entities, Never Redefine Them Locally
- `types-explicit-nullability` - Make Nullability Explicit and Justified
- `types-entity-vs-response` - Separate the Domain Entity from the API Response
- `types-closed-values-not-string` - Type Closed Value Sets as Unions, Not String
- `types-dates-as-date` - Type Domain Dates as Date and Convert Them in Yup
- `types-literal-unions-no-enum` - Use Literal Unions, Never TypeScript Enums
- `types-compose-transverse` - Compose Transverse Types, Reference Foreign Entities by ID
- `types-file-per-entity` - One Type File per Entity with Predictable Names
- `types-amounts-as-number` - Type Amounts as number and Format Them at Display Time
- `types-no-any-or-wide` - No any or Overly Wide Types in Domain Code
- `types-no-dead-record-fallback` - No Fallback After a Record Lookup on a Union Key

### 6. Yup Schemas (HIGH)

- `yup-no-oneof-on-display-enums` - Do Not Use oneOf on Display-Only API Enums
- `yup-last-coercion-barrier` - Make Yup the Last Coercion Point
- `yup-no-cast-bypass` - Never Cast Yup Output to the Entity
- `yup-tolerant-response-schema` - Write Tolerant Response Schemas
- `yup-form-schema-hook` - Build Translated Form Validation Schemas in a use[Form]Schema Hook
- `yup-module-level-schemas` - Declare Yup Schemas at Module Level With Explicit Names

### 7. UI Composition & Accessibility (HIGH)

- `ui-delegate-mapped-jsx` - Delegate Mapped JSX to a Component
- `ui-no-classname-on-shared-ui` - Keep className Out of Shared UI Component APIs
- `ui-compound-slots-direct-children` - Keep Compound Component Slots as Direct, Renderable Children
- `ui-dialog-controlled` - Keep Dialog Mounted and Drive It with a Boolean open
- `ui-name-compound-render-conditions` - Name Compound Render Conditions by Intent
- `ui-no-nested-form` - Never Nest a form Inside a form
- `ui-form-wraps-dialog` - Wrap the Whole Dialog in a Form Keyed on the Open Target
- `ui-no-adhoc-styling` - Style with Design System Components, Utility Classes Only for Layout
- `ui-accessible-names` - Give Icon-Only Buttons and Custom Controls an Accessible Name

### 8. Jotai Client State (MEDIUM-HIGH)

- `state-module-level-atoms` - Create Atoms at Module Scope, Never During Render
- `state-server-state-in-react-query` - Keep Server Data in React Query, Not in Atoms
- `state-domain-vs-page-location` - Place Stores at Feature or Page Level by Reuse
- `state-prefer-factories` - Reuse App Atom Factories Instead of Hand-Rolled Atoms
- `state-derived-atoms` - Derive Atoms Instead of Storing Duplicates
- `state-atom-with-storage` - Persist Atoms with atomWithStorage and a Unique Key
- `state-explicit-types-defaults` - Type Atoms Explicitly with DEFAULT_* Constants
- `state-atom-naming` - Prefix Atoms with Their Entity
- `state-hook-variants` - Pick useAtomValue, useSetAtom or useAtom by Need

### 9. Helpers (MEDIUM-HIGH)

- `helpers-formatter-hooks` - Format Entities Through Formatter Hooks, Never Inline
- `helpers-business-rules-pure` - Keep Business Rules as Pure, Intent-Named Predicates
- `helpers-no-context-params` - Never Pass t, navigate or Stores to a Helper
- `helpers-categories` - Sort Every Helper Into One of a Fixed Set of Categories

### 10. Internationalization (MEDIUM-HIGH)

- `i18n-interpolation` - Inject Dynamic Values Through t() Options, Never Concatenation
- `i18n-no-hardcoded-strings` - Translate Every User-Facing String with a Catalog Key
- `i18n-static-keys` - Use Literal Translation Keys Only
- `i18n-no-default-value` - Never Use defaultValue in t()

### 11. Testing (MEDIUM-HIGH)

- `test-jotai-provider-isolation` - Isolate Jotai State with a Fresh Store per Test
- `test-mock-network-not-internals` - Mock the Network Boundary, Never Internal Modules
- `test-behavior-not-implementation` - Assert Behavior with Parametrized, Unconditional Tests
- `test-mock-data` - Build Typed, Deterministic Mock Data in the Owning mocks Folder
- `test-colocated-tests` - Colocate a Test Next to Every File, Covering Errors
- `test-semantic-queries` - Query by Role and Label, Interact with userEvent
- `test-renderhook` - Test API Hooks with renderHook and a Per-Test Query Wrapper

### 12. Code Quality (MEDIUM)

- `quality-no-hook-factory` - Never Build Hooks from Hooks (No createUseXxx Factories)
- `quality-no-noop-link` - No Clickable No-Op Links or Actions
- `quality-usecallback-for-functions` - useMemo for Data, useCallback for Functions
- `quality-english-only` - Write Code, Comments and Tests in English
- `quality-eslint-disable-scoped` - Scope eslint-disable to the Offending Line with a Reason
- `quality-jsdoc-minimal` - Keep JSDoc for Non-Obvious Intent Only
- `quality-no-nested-ternary` - No Chained or Negated Ternaries

## Delegated to vercel-react-best-practices

These topics are generic React advice. Apply the Vercel rule instead of looking for a rule here:

| Topic | Vercel rule |
|-------|-------------|
| Barrel imports in general (`arch-stores-no-index` only adds the circular-dependency rule for state folders) | `bundle-barrel-imports` |
| `Promise.all` for independent mutations in a page action | `async-parallel` |
| Sorting without mutating the source array | `js-tosorted-immutable` |
| Updating state from its previous value (stale closures, stable callbacks) | `rerender-functional-setstate` |
| Derive values during render instead of syncing with effects | `rerender-derived-state-no-effect` |
| User-triggered logic in event handlers, not effects | `rerender-move-effect-to-event` |
| Memoizing expensive subtrees and avoiding trivial `useMemo` | `rerender-memo`, `rerender-simple-expression-in-memo` |
| Ternary vs `&&` in JSX | `rendering-conditional-render` |
| No component defined inside another component | `rerender-no-inline-components` |
| Versioning data persisted in `localStorage` | `client-localstorage-schema` |

### Arbitrations on Vercel rules

- **React Compiler**: when it is not enabled, ignore the Vercel notes saying manual memoization is unnecessary: functions and objects returned by hooks must be memoized (`quality-usecallback-for-functions`).
- **Client-side SPA with TanStack Query**: `client-swr-dedup` (use the query hooks instead), all `server-*` rules, `async-api-routes`, `rendering-hydration-no-flicker`, `rendering-hydration-suppress-warning` and `rendering-script-defer-async` do not apply.
- **Suspense boundaries** (`async-suspense-boundaries`) apply, always together with an error boundary (`api-suspense-error-boundary`) and never between a compound component and its content slot (`ui-compound-slots-direct-children`).

## How to Use

Read individual rule files for the rationale and incorrect/correct examples:

```
rules/api-wrap-in-domain-hooks.md
rules/state-prefer-factories.md
```

Each rule file contains:
- Why the rule matters
- An incorrect example and a correct example, using generic business entities and real library APIs
- Notes on exceptions
- An optional `See also` link to Vercel rules

## Full Compiled Document

For the complete guide with all rules expanded: `AGENTS.md` (generated by `node scripts/build.mjs`; see `README.md`).
