---
name: generic-react-best-practices
description: >
  Opinionated React/TypeScript rules for any front-end app (React 19, TanStack Query v5, Jotai, Yup,
  react-i18next, Radix, Jest + React Testing Library). Use it whenever you write, review, refactor or audit React code:
  domain-first architecture and import boundaries, API query/mutation hooks, query keys and cache
  invalidation, domain types, Yup schemas and form validation, UI composition and accessibility, Jotai
  stores, helpers and formatters, i18n, tests, rendering performance and code quality. Load
  tailwind-design-system alongside it only when working inside shared/ui, where advanced styling patterns belong.
  Basic layout classes in domain code do not require that companion skill.
  Also use for ESLint fixes, manual catalog audits, exception validity reviews and warning budgets.
license: Internal
metadata:
  author: frontend-engineering
  version: "1.7.0"
---

# Generic React Best Practices

Opinionated coding guide for any React front (React 19, TanStack Query, Jotai, Yup, react-i18next, Jest + RTL). It contains 109 rules across 12 categories, ordered by impact, to guide code generation, reviews and refactoring.

This skill defines our reusable React conventions, component composition and client-side performance guidance. Use other relevant skills alongside this catalog; declare them in `metadata.json` when adding cross-skill references. Framework-specific server rendering and API-route conventions are outside this catalog.

**Companion skill scope:** Load `tailwind-design-system` only when the work targets implementation or review inside `shared/ui`, where advanced styling and design-system patterns belong. Domain code composes shared UI primitives and uses only basic layout classes; this does not require the Tailwind skill. Importing or composing a shared UI component alone does not trigger loading it.

**Priority:** When this catalog conflicts with a companion skill, follow this catalog's applicable rule.

Generic means reusable across applications adopting this stack and its conventions. The rules may define shared UI contracts, custom ESLint checks, review thresholds and warning-budget policies. Keep their expected behavior, applicability and analysis limits in the owning rule. Application-specific names, paths and implementation status belong in the consuming application's documentation.

**ESLint:** Rule identifiers prefixed with `local/` name custom ESLint rules under the configured `local` plugin namespace. Register them in the consuming application's ESLint configuration and enable the checks described in each rule's ESLint section.

This catalog is the single source for our React conventions, including business capability boundaries, strict shared UI composition, semantic colors, centralized accessibility and public API maintenance.

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
| 10 | Internationalization | MEDIUM | `i18n-` |
| 11 | Testing | MEDIUM | `test-` |
| 12 | Code Quality | HIGH | `quality-` |

## Apply Rules

1. Use [focused routing signals](rules/_routing.md) and the Quick Reference below to select relevant rule files.
2. Read those files and confirm applicability and exceptions before applying them. Do not load the entire compiled guide for a focused task.
3. For architecture reviews, identify user outcomes, business scope, hierarchy and ownership before proposing folders. Derive vocabulary from the application; keep its target structure in its own architecture documentation.

### Audits

Every audit covers these activities within its stated scope:

1. **ESLint diagnostics and corrections:** run the application's configured lint checks, investigate errors and warnings, and correct confirmed violations.
2. **Catalog review beyond ESLint:** read applicable rule files and manually inspect requirements and analysis limits that lint does not cover.
3. **Existing ignores, only on request:** revalidate existing suppressions and configuration exceptions only when the user explicitly asks to review them. A general audit or fix-all request does not enable this pass. Keep normal metadata and unused-suppression checks active; review any exception introduced or modified by the task before accepting it.
4. **Deterministic prevention after the audit:** examine findings and manual coverage gaps for reusable ESLint, TypeScript or equivalent checks. Prefer existing enforcement; add or strengthen a check when its generic contract and valid/invalid cases can be established. Keep application-specific names, paths and one-off allowlists out of the check's logic.

Follow the [audit method](references/audit-method.md). By default, correct confirmed violations in scope; honor an explicit findings-only request. A focused review uses the routing above and states its scope. For a full audit or a request to fix all problems, account for every rule in the Quick Reference and read each applicable rule's contract and exceptions. Existing ignores remain outside technical revalidation unless explicitly requested, including in a full audit. Passing lint, TypeScript or an existing test suite does not establish catalog-wide compliance.

Inventory the requested files and rules, and keep enough working notes to distinguish reviewed code from pending work. A full audit accounts for every catalog rule and every in-scope authored file under the requested ignore-review policy. Focused audits state their scope explicitly. No output template, per-rule count table, JSON state or generated report is required.

Continue through the outstanding batches until coverage and the requested corrections are complete. Passing checks or reaching an accepted warning total is not a stopping condition. Do not silently narrow scope or treat a status question as cancellation. If an actual blocker or explicit user interruption stops work, retain enough notes to resume, identify what remains and report an incomplete result. Check the inventory and substantive review evidence before claiming completion.

Keep reusable prevention in the owning rules, configured checks and executable regression tests. In the final response, briefly summarize the ESLint, TypeScript or equivalent protections actually added or strengthened and the rationale for each, using only the main points. Distinguish proposals from implemented checks; if none were added, say so with a short reason. Keep the rest of the response free-form and concise. Any retained application audit artifacts belong outside the inspected source set; keep their paths and results out of this reusable catalog.

Examples isolate their rule rather than serve as complete application templates. Apply the other relevant rules when writing production code. Files beginning with `_` are maintenance material.

## Quick Reference

### 1. Architecture & Boundaries (CRITICAL)

- `arch-component-roles` - Declare Every React Component as a View, State Renderer or Feature
- `arch-domain-first-layout` - Follow the Domain-First Folder Layout
- `arch-transverse-only-imports` - Import Other Domains Only Through Transverse Domains
- `arch-shared-no-domain-knowledge` - Keep Shared Code Within Its Ownership Boundary
- `arch-feature-slice-layout` - Organize Every Domain into Vertical Feature Slices
- `arch-no-prop-drilling` - Share Client State Through Jotai, Not Prop Chains or Context
- `arch-decompose-hook-heavy-components` - Decompose Hook-Heavy Components by Responsibility
- `arch-business-capability-boundaries` - Define Boundaries Through Business Capabilities
- `arch-feature-flags` - Gate Experimental Features With a Typed Flag Registry
- `arch-isolate-effects-in-hooks` - Isolate Effects in Intent-Named Hooks
- `arch-feature-hierarchy` - Justify Feature Hierarchy Through Business Scope
- `arch-component-module-boundaries` - Keep Component Modules Focused on Components
- `arch-thin-components` - Keep Components Thin
- `arch-no-visual-logic-below-page` - Keep Visual Logic at the Component or Page Boundary
- `arch-stores-no-index` - No index.ts in stores/, One File per Concern
- `arch-component-complexity` - Review Component Complexity Before Splitting
- `arch-helpers-vs-services` - Separate Helpers from Services by Effects and Orchestration
- `arch-subdomain-decision` - Create a Sub-Domain Only for a Distinct Business Concept

### 2. API Hooks & Server State (CRITICAL)

- `api-use-transformation` - Validate Both Directions With Yup Inside Every API Hook
- `api-wrap-in-domain-hooks` - Wrap Every Endpoint in a Domain API Hook
- `api-central-url-constants` - Declare Every Endpoint in One Registry, Never Inline URLs
- `api-mutation-three-types` - Model Mutations as Input, Payload and Response
- `api-error-message-helper` - Normalize API Errors Centrally and Translate Known Keys Before Display
- `api-suspense-error-boundary` - Pair Every Suspense Query With an Error Boundary and Handle 404 Separately
- `api-query-hook-choice` - Pick the TanStack Query Hook by Access Pattern
- `api-return-result-as-is` - Return the TanStack Result As-Is From API Hooks
- `api-vercel-parallel-work` - Schedule Independent Async Work Concurrently
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

- `ui-centralize-accessibility` - Centralize Accessibility in Shared UI Primitives
- `ui-delegate-mapped-jsx` - Delegate Mapped JSX to a Component
- `ui-no-classname-on-shared-ui` - Keep className Out of Shared UI Component APIs
- `ui-semantic-colors` - Keep Colors Semantic Behind Shared UI
- `ui-compound-slots-direct-children` - Keep Compound Component Slots as Direct, Renderable Children
- `ui-dialog-controlled` - Keep Dialog Mounted and Drive It with a Boolean open
- `ui-vercel-lazy-loading` - Lazy Load Heavy Optional UI
- `ui-name-compound-render-conditions` - Name Compound Render Conditions by Intent
- `ui-no-nested-form` - Never Nest a form Inside a form
- `ui-required-children` - Require Composition Through Nested Children
- `ui-form-wraps-dialog` - Wrap the Whole Dialog in a Form Keyed on the Open Target
- `ui-vercel-offscreen-content` - Defer Offscreen Rendering in Shared UI
- `ui-no-adhoc-styling` - Style with Design System Components, Utility Classes Only for Layout
- `ui-accessible-names` - Give Icon-Only Buttons and Custom Controls an Accessible Name
- `ui-vercel-responsive-rendering` - Keep Inputs Responsive During Expensive Renders
- `ui-vercel-explicit-variants` - Prefer Explicit Component Variants Over Mode Flags

### 8. Jotai Client State (MEDIUM-HIGH)

- `state-module-level-atoms` - Create Atoms at Module Scope, Never During Render
- `state-server-state-in-react-query` - Keep Server Data in React Query, Not in Atoms
- `state-domain-vs-page-location` - Place Stores at Feature or Page Level by Reuse
- `state-prefer-factories` - Reuse App Atom Factories Instead of Hand-Rolled Atoms
- `state-derived-atoms` - Derive Atoms Instead of Storing Duplicates
- `state-atom-with-storage` - Persist Atoms with atomWithStorage and a Unique Key
- `state-explicit-types-defaults` - Type Atoms Explicitly with DEFAULT_* Constants
- `state-vercel-functional-updates` - Update Client State From Its Previous Value
- `state-atom-naming` - Prefix Atoms with Their Entity
- `state-hook-variants` - Pick useAtomValue, useSetAtom or useAtom by Need

### 9. Helpers (MEDIUM-HIGH)

- `helpers-formatter-hooks` - Format Entities Through Formatter Hooks, Never Inline
- `helpers-business-rules-pure` - Keep Business Rules as Pure, Intent-Named Predicates
- `helpers-no-context-params` - Never Pass t, navigate or Stores to a Helper
- `helpers-vercel-immutable-collections` - Preserve Collection Inputs When Transforming
- `helpers-categories` - Sort Every Helper Into One of a Fixed Set of Categories
- `helpers-vercel-indexed-lookups` - Index Collections for Repeated Lookups

Every formatter, including dates and entity labels, accepts `null` and `undefined` and owns a configurable display fallback. Pass values directly to it instead of adding missing-value guards in consumers (see `helpers-formatter-hooks`).

### 10. Internationalization (MEDIUM)

- `i18n-interpolation` - Inject Dynamic Values Through t() Options, Never Concatenation
- `i18n-no-default-value` - Never Use defaultValue in t()
- `i18n-no-hardcoded-strings` - Translate Every User-Facing String with a Catalog Key
- `i18n-static-keys` - Use Literal Translation Keys Only

### 11. Testing (MEDIUM)

- `test-behavior-not-implementation` - Assert Behavior with Parametrized, Unconditional Tests
- `test-mock-data` - Build Typed, Deterministic Mock Data in the Owning mocks Folder
- `test-colocated-tests` - Colocate a Test Next to Every File, Covering Errors
- `test-jotai-provider-isolation` - Isolate Jotai State with a Fresh Store per Test
- `test-mock-network-not-internals` - Mock the Network Boundary, Never Internal Modules
- `test-semantic-queries` - Query by Role and Label, Interact with userEvent
- `test-renderhook` - Test API Hooks with renderHook and a Per-Test Query Wrapper

### 12. Code Quality (HIGH)

- `quality-no-deprecated-apis` - Avoid Deprecated APIs
- `quality-eslint-warning-budget` - Keep an Explicit ESLint Warning Budget
- `quality-eslint-disable-scoped` - Review and Date ESLint Exceptions
- `quality-single-public-export` - Export One Public Value per File
- `quality-no-hook-factory` - Never Build Hooks from Hooks (No createUseXxx Factories)
- `quality-no-noop-link` - No Clickable No-Op Links or Actions
- `quality-public-api-first` - Place the Public API First
- `quality-vercel-ref-as-prop` - Prefer ref as a Prop in React 19
- `quality-usecallback-for-functions` - useMemo for Data, useCallback for Functions
- `quality-english-only` - Write Code, Comments and Tests in English
- `quality-jsdoc-minimal` - Keep JSDoc for Non-Obvious Intent Only
- `quality-no-nested-ternary` - No Chained or Negated Ternaries

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
- Optional links to declared companion skills

## Add or Change a Rule

Read [the maintenance guide](README.md#creating-a-new-rule). Identify the observable pattern, check for overlap and extend an existing rule when it owns the same decision. Keep exceptions and distinguishing examples in the rule file, update the Quick Reference and focused routing when relevant, then regenerate and validate the compiled guide.

## Full Compiled Document

For the complete guide with all rules expanded: `AGENTS.md` (generated by `node scripts/build.mjs`; see `README.md`).
