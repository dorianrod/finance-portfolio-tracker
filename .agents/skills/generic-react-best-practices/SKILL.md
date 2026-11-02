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
  Also use for ESLint fixes, two-phase rule-led audits with persistent findings and corrective plans,
  exception validity reviews and warning budgets.
license: Internal
metadata:
  author: frontend-engineering
  version: "1.7.0"
---

# Generic React Best Practices

Opinionated coding guide for any React front (React 19, TanStack Query, Jotai, Yup, react-i18next, Jest + RTL). It contains 110 rules across 12 categories, ordered by impact, to guide code generation, reviews and refactoring.

This skill defines our reusable React conventions, component composition and client-side performance guidance. Use other relevant skills alongside this catalog; declare them in `metadata.json` when adding cross-skill references. Framework-specific server rendering and API-route conventions are outside this catalog.

**Companion skill scope:** Load `tailwind-design-system` only when the work targets implementation or review inside `shared/ui`, where advanced styling and design-system patterns belong. Domain code composes shared UI primitives and uses only basic layout classes; this does not require the Tailwind skill. Importing or composing a shared UI component alone does not trigger loading it.

**Priority:** When this catalog conflicts with a companion skill, follow this catalog's applicable rule.

Generic means reusable across applications adopting this stack and its conventions. The rules may define shared UI contracts, custom ESLint checks, review thresholds and warning-budget policies. Keep their expected behavior, applicability and analysis limits in the owning rule. Application-specific names, paths and implementation status belong in the consuming application's documentation.

**Bundled analysis tools:** This skill packages the catalog, custom ESLint plugin, reusable configuration, analysis scripts and their generic regression tests. ESLint and scripts provide partial detection or review candidates for the rules. Rule identifiers prefixed with `local/` name the packaged plugin's checks under the configured `local` namespace. Use the [installation and rule-to-tool bindings](references/project-enforcement.md) to enable them in a consuming application. Application roots, reference catalogs, warning ceilings and project integration tests remain with that application.

For diagnostic quantities by rule, use the [packaged lint-counts command](references/project-enforcement.md#runners-cache-and-regression-checks). It separates active errors/warnings from suppressed diagnostics and supports JSON output; the normal lint command remains the warning-budget gate.

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

| Priority | Category                       | Impact      | Prefix      |
| -------- | ------------------------------ | ----------- | ----------- |
| 1        | Architecture & Boundaries      | CRITICAL    | `arch-`     |
| 2        | API Hooks & Server State       | CRITICAL    | `api-`      |
| 3        | Security                       | CRITICAL    | `security-` |
| 4        | Query Keys & Cache             | HIGH        | `cache-`    |
| 5        | Domain Types                   | HIGH        | `types-`    |
| 6        | Yup Schemas                    | HIGH        | `yup-`      |
| 7        | UI Composition & Accessibility | HIGH        | `ui-`       |
| 8        | Jotai Client State             | MEDIUM-HIGH | `state-`    |
| 9        | Helpers                        | MEDIUM-HIGH | `helpers-`  |
| 10       | Internationalization           | MEDIUM      | `i18n-`     |
| 11       | Testing                        | MEDIUM      | `test-`     |
| 12       | Code Quality                   | HIGH        | `quality-`  |

Start review and correction with the selected rules' own impact: **CRITICAL → HIGH → MEDIUM-HIGH → MEDIUM → LOW-MEDIUM → LOW**. The category impact is a ceiling; read each rule's frontmatter for its actual impact. At equal impact, follow the category priority above. The Quick Reference groups rules for navigation; it is not a global execution queue. A prerequisite correction may come first when needed to resolve a higher-impact violation. ESLint severity, output order, candidate counts and script exit codes do not set catalog priority.

## Apply Rules

1. Use [focused routing signals](rules/_routing.md) and the Quick Reference below to select relevant rule files.
2. Read those files for impact, applicability, exceptions, incorrect/correct examples and analysis aids. Do not load the entire compiled guide for a focused task.
3. Order the applicable rules by impact, then category priority. Select their packaged ESLint checks and complementary scripts through the [rule-to-tool bindings](references/project-enforcement.md), using the consuming application's configured roots, catalog and commands. Use a script when it supports a selected rule; do not run every audit script as an independent checklist. A shared command may serve several selected rules in one run.
4. Confirm findings against the owning rule and inspect requirements beyond automatic coverage. A tool's silence does not establish compliance, and a review candidate does not establish a violation.
5. For architecture reviews, identify user outcomes, business scope, hierarchy and ownership before proposing folders. Derive vocabulary from the application. When implementing a settled choice, record it next to the owning code using [architecture decision comments](rules/quality-jsdoc-minimal.md#architecture-decision-comments); during the audit phase, propose the comment in the plan. Application architecture documents may summarize those choices and the overall target structure.

### Check change history before corrections

Before modifying a file or recommending an audit correction, inspect its staged and unstaged changes, relevant Git patches (for example, `git log --follow -p -- <file>`) and existing decision comments. For renamed, moved or extracted code, inspect the original owner's history as well. From at most the three latest prior audits, read only the relevant scope metadata and matching sections of `findings.md` and `plan.md`; open coverage or evidence only to resolve a specific question. Follow the [selective history lookup](references/audit-method.md#use-the-last-three-audits-as-a-working-base), then revalidate relevant conclusions against current code and rules. Do not load whole dossiers. The three-audit limit does not limit Git history or invalidate code-local decisions.

Check whether the proposed change reverses an earlier correction or reintroduces a rejected arrangement. Preserve an existing conforming choice unless concrete contradictory evidence, a relevant requirement or implementation change, a met revisit condition, or an explicit user request justifies replacing it. Identify the earlier choice and the factual trigger before proposing or applying its replacement; a different conforming preference alone is insufficient. Do not request approval again for an already authorized choice.

Record consulted history and any reversal in the existing audit evidence when auditing; ordinary changes need no new audit dossier or per-file changelog. If history or prior audits are unavailable, state that limit without inventing earlier decisions or treating the absence alone as a blocker.

### File naming and folder normalization

Apply the naming and placement conventions when creating or moving code. Read the owning rules for their contracts, exceptions and enforcement limits:

| Concern                                                                          | Owning rules                                                                                                                                                   |
| -------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Component roles and `.view.tsx`, `.feature.tsx`, `.state.tsx` suffixes           | [Component roles](rules/arch-component-roles.md), [component support modules](rules/arch-component-module-boundaries.md)                                       |
| Domains, features, parent/leaf folders and scoped `shared/`                      | [Domain layout](rules/arch-domain-first-layout.md), [feature slices](rules/arch-feature-slice-layout.md), [feature hierarchy](rules/arch-feature-hierarchy.md) |
| `stores/<concern>.atoms.ts`, `<name>.store.ts` and exported `Atom`/`Atoms` names | [Store modules](rules/arch-stores-no-index.md), [atom identifiers](rules/state-atom-naming.md)                                                                 |
| Helper, entity and API-hook filenames and placement                              | [Helper categories](rules/helpers-categories.md), [entity files](rules/types-file-per-entity.md), [API naming](rules/api-naming.md)                            |

Mechanically observable conventions require deterministic checks in the consuming application. Verify the effective ESLint configuration with invalid and valid neighboring examples; a convention written in this skill does not install its detector. Keep business ownership and component-role decisions under semantic review. Follow [layout enforcement and coordinated renames](rules/arch-domain-first-layout.md#enforcement-and-coordinated-renames) when normalizing files.

### Exception comments

Prefer conforming corrections over ESLint suppressions. Under [the exception policy](rules/quality-eslint-disable-scoped.md), a retained comment explains why the rule cannot be satisfied without the exception, naming the blocking constraint and rejected conforming alternatives. Describing the current implementation is insufficient. Honor any user requirement to approve proposed exceptions before accepting them.

### Formatting and sorting

Use the consuming application's committed Prettier policy for layout and the shared ESLint preset for import/export sorting. Read [formatting and sorting](rules/quality-formatting-and-sorting.md) when configuring these tools or changing ordering conventions: it defines the baseline options, default import groups, related type/public-API contracts and coverage limits. The [integration guide](references/project-enforcement.md#formatting-and-sorting) shows separate fix and check commands.

### Audits

Requested audits, including focused audits, use two distinct phases. Ordinary code changes and rule explanations do not create an audit dossier.

1. **Audit and proposal:** inventory the requested files and rules; investigate lint, associated scripts and semantic requirements in catalog priority order. Write the required [audit dossier](references/audit-output.md) under the consuming project's `audit/<date>-<scope>/`: scope, coverage, findings, plan and verification evidence. Every finding identifies the requirement, proof or precise uncertainty, why it matters, alternatives, proposed correction and action. This phase changes only audit artifacts and isolated probes; source, tests, rules and check configuration remain unchanged.
2. **Take account of findings:** when the user requests implementation, follow the dossier's actionable plan. Correct proven violations, resolve necessary user choices, clarify rule contracts where warranted and implement planned reusable prevention. Keep settled non-obvious decisions in [structured comments beside the owning code](rules/quality-jsdoc-minimal.md#architecture-decision-comments). Verify affected code and callers and update the dossier with the result.

A bare audit or findings-only request runs phase 1. An explicit audit-and-fix request authorizes both phases; finish the dossier before corrections and continue without requesting the same authorization again. A later request to apply the plan starts phase 2 from that dossier. Follow the [decision routing](references/audit-method.md#route-findings-and-user-decisions): preserve conforming choices; ask for a concrete choice only when materially different conforming corrections or contradictory rule interpretations remain unresolved by existing instructions or decisions. Complete the report and options before asking, and continue independent authorized actions while that choice is pending.

Follow the [audit method](references/audit-method.md) and [output contract](references/audit-output.md). Fix the starting scope, rule contracts and required checks, then assess alternatives against those same requirements. A full audit accounts for every Quick Reference rule and every in-scope authored file; a focused audit states its narrower scope. Existing ignores receive technical revalidation only on explicit request; normal metadata and unused-suppression checks remain active, and new or modified exceptions are always reviewed.

Record distinct checked/pending obligations and the obligations triggered by actual phase-2 additions, extractions and moves; follow the closure contract in the audit method. Include impact volumes and the fixed [audit metrics](references/audit-metrics.md), preserving baseline and final snapshots.

Keep coverage, unresolved questions and implementation progress in the dossier. Close phase 1 when its inventory and proposed actions are complete, even if corrections or user decisions remain open. Close phase 2 only when its authorized obligations satisfy the [closure conditions](references/audit-method.md#finish-with-the-evidence-that-exists). Passing lint or tests alone does not establish catalog compliance. A remaining conforming alternative does not reopen a settled choice; cite a relevant change or concrete contradictory evidence before superseding it.

Review deterministic prevention in phase 1 and put each justified change in the plan. Keep implementation within phase 2's authorized plan; unrequested new rule preferences and broader hardening remain separate follow-up work. Reusable guarantees belong in the owning rule contracts, configured checks and regression tests. Application audit dossiers belong under the application's `audit/`, outside the inspected source set and this reusable catalog.

In the final response, link the dossier, name the completed phase, distinguish proven violations from pending decisions and summarize relevant checks. For implementation, briefly explain any ESLint, TypeScript or equivalent protection actually added or strengthened; if none was added, state why. An interrupted or blocked phase retains its checkpoint and explicitly identifies what remains; never narrow the inventory or mark pending work reviewed to claim completion.

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

Helper categories are exactly `transformers`, `formatters` and `presenters`, selected by their exposed contracts (see `helpers-categories`). Business rules, predicates, selection, aggregation, calculations and diagnostics are operations within transformers. API validation and transport adaptation remain at the API boundary.

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
- `quality-formatting-and-sorting` - Format with Prettier and Sort Imports with ESLint
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
- Associated packaged ESLint checks and complementary script capabilities where available, with detection limits and the remaining semantic review; consuming applications configure their roots, catalog and command aliases
- Optional links to declared companion skills

## Add or Change a Rule

Read [the maintenance guide](README.md#creating-a-new-rule). Identify the observable pattern, check for overlap and extend an existing rule when it owns the same decision. Keep exceptions and distinguishing examples in the rule file, update the Quick Reference and focused routing when relevant, then regenerate and validate the compiled guide.

## Full Compiled Document

For the complete guide with all rules expanded: `AGENTS.md` (generated by `node scripts/build.mjs`; see `README.md`).
