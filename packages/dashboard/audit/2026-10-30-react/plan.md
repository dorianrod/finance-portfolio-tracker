# Corrective plan

## Implementation scope and authorization

Phase 2 authorized on 2026-10-30 by the user's explicit “implémente le plan”. All eight actions are in scope; no additional approval is required. The original phase-1 source hashes matched at implementation start. The former user `.gitignore` edit had been committed before this phase; it was not changed by this implementation. Prior findings and baseline evidence remain preserved.

## Prioritized actions

Execution order by impact/dependencies: **P-006 → P-001 → P-002 → P-003 → P-008 → P-004 → P-005 → P-007**. Stable action IDs are not the priority rank.

### P-006 — Separate three independent visual contracts

- Findings and priority: F-006; CRITICAL `arch-component-roles`, before HIGH/MEDIUM-HIGH work.
- Action and proposed option: fix; extract supplied-data MiniDonut, ready asset-IRR results and two-period comparison views at their current owners.
- Status: verified.
- Authorization or choice: User request “implémente le plan” (2026-10-30) authorizes this action; preserve the behavior/ownership constraints in the finding.
- Dependencies: no dependency on category normalization; coordinate moved helper references with P-005.
- Implementation: features retain allocation grouping, IRR availability/ranking and openFilters lookup. Add named view modules, explicit data contracts and nested slots for live MetricLabel/filter-scope content. Update known callers/tests. Proposed code decisions: `prepared-allocation-chart`, `prepared-asset-irr-results`, `comparison-period-control`; record rules, choice, reason, rejected mixed-boundary alternative and revisit on a new autonomous visual interaction or new business consumer.
- Acceptance: supplied-data rendering, labels/legend percentages/rankings and period onOpen behavior remain identical without business providers in the views; component/composition checks, focused behavior tests and full gates pass.
- Outcome: MiniDonut.view.tsx, AssetIrrResults.view.tsx and OverviewPeriodFilter/OverviewPeriodFilter.view.tsx now own the supplied-data surfaces; features retain business orchestration. Three structured decisions are implemented. Relevant existing behavior cases and I-001/I-002/I-003/I-004 pass; final owner/caller review is in evidence/phase2-semantic-review.md. No remaining acceptance work.

### P-001 — Split shared account protocols from display preparation

- Findings and priority: F-003 HIGH; prerequisite to P-002 despite their same-impact architecture ordering.
- Action and proposed option: fix; keep account IDs/types/history scope as transformers and move labels/row-tree/chart-chip selection to component/page presenters.
- Status: verified.
- Authorization or choice: User request “implémente le plan” (2026-10-30) authorizes this action; preserve the behavior/ownership constraints in the finding.
- Dependencies: independent of P-006 except moved visual-owner paths; required before finalizing services in P-002. Pure category moves may proceed alongside once paths are reconciled.
- Implementation: thirteen F-003 ledger entries. Factor data-only common filter options; reuse unit formatter hooks at display owners; move translated metric/theme/errors/chip builders and input-value/visual-selection helpers into named owner directories. Keep quality severity classifiers as semantic transformers. Do not pass t/formatter clients as helper parameters. Proposed `account-scope-data-and-labels` comment at the common data owner: common IDs/types serve history, wealth and performance; labels are prepared by UI owners. Alternative: mixed common builder violates the same rules; revisit when business scope no longer shares the protocol.
- Acceptance: actual-label/sort/cash-name/chip/expanded-row tests and provider-specific translation case; canonical helper/service dependency rules reject forbidden aliases/transitive dependencies and allow numeric neighbors (C-02–C-05).
- Outcome: Presenters now live at DataQualityTab, ErrorsTab, FundHoldingsExplorer, ActiveFilterSummary, FilterPanel and reliability KPI owners; common account data is pure and display labels are prepared by existing formatter consumers. Feature-level shared support types replace private component dependencies. Provider-specific metric and account-label cases pass with I-001/I-002/I-003. Final owners and the pure app source-data delta are reconciled in evidence/phase2-migration-resolution.json and phase2-semantic-review.md. No remaining acceptance work.

### P-002 — Move seven acquisition wrappers into services

- Findings and priority: F-002 HIGH `arch-helpers-vs-services`.
- Action and proposed option: fix; move subscription/orchestration wrappers at the same business/component owner, retain pure work in transformers.
- Status: verified.
- Authorization or choice: User request “implémente le plan” (2026-10-30) authorizes this action; preserve the behavior/ownership constraints in the finding.
- Dependencies: P-001 for account/label and wealth facade dependency chains. Other independent acquisition wrappers can move separately during authorized phase 2.
- Implementation: all seven F-002 entries, including transitive useDashboardWealth. Update static/type imports and network/renderHook tests; services must retain real acquisition and not become memo-only numeric adapters. Proposed `feature-source-acquisition` comment beside the owning source wrapper only where the shared cached-source choice is non-obvious: one source cache feeds feature transformations; do not duplicate fetches for folder symmetry; revisit on a new source lifecycle.
- Acceptance: C-03-style direct and transitive acquisition is rejected in helpers; service formatter/presenter imports are absent; real fetch/selection/error tests pass.
- Outcome: All seven ledger wrappers now live in services at their original business/component owners, including wealth and performance. useAccountTypeHistory observes the coordinated positions source cache; pure transformation remains separate. Source selection/network/error tests and I-001/I-002/I-003 pass. feature-source-acquisition is implemented; no presenter/formatter service dependency remains. No remaining acceptance work.

### P-003 — Align required fixed-source reads with concurrent Suspense

- Findings and priority: F-001 HIGH, API category after architecture actions at equal impact.
- Action and proposed option: fix; use concurrent required-source consumers below the persistent navigation/filter shell.
- Status: verified.
- Authorization or choice: User request “implémente le plan” (2026-10-30) authorizes this action; preserve the behavior/ownership constraints in the finding.
- Dependencies: coordinate P-002 acquisition owners and P-001 view-model labels; API-only source option work can proceed independently in phase 2.
- Implementation: eleven hooks in query-access-patterns.json. Use shared query options for a concurrent batch or sibling consumers; never sequentially suspend a source facade. Pair loading/error/reset boundaries, retain normalized status/404 handling and common query cache. Keep scope/date keepPreviousData, optional previews and skipToken observer semantics. Proposed `persistent-dashboard-query-boundary` comment where the shell composes the boundary: navigation and open filters survive source suspension/errors, independent reads start together; alternative sequential facade suspends too early; revisit on route-level source lifecycle changes.
- Acceptance: existing App filter/focus preservation and source-error tests continue to pass; add concurrent-start observation before source completion, loading/error/retry and optional-404 behavior. Full build chunk separation remains intact.
- Outcome: Eleven hooks now use useSuspenseQuery through DashboardSources sibling consumers; DashboardSourceBoundary catches errors while useCachedDashboardSources observes the same caches without acquiring them. Existing shell status/optional-404/reload retry behavior and scoped keepPreviousData are retained. I-003 proves concurrent transport starts, preserved open-filter focus/navigation and source error cases; I-004/I-009 preserve seven optional chunk boundaries. persistent-dashboard-query-boundary is implemented. No remaining acceptance work.

### P-004 — Keep wire adaptation inside typed response boundaries

- Findings and priority: F-004 MEDIUM-HIGH helper-placement violation; response coercion/type correctness are HIGH constraints, not a claim of currently unvalidated primitives.
- Action and proposed option: fix; move four transport-name adapters into owning API response schema composition and leave reusable business aggregation separate.
- Status: verified.
- Authorization or choice: User request “implémente le plan” (2026-10-30) authorizes this action; preserve the behavior/ownership constraints in the finding.
- Dependencies: coordinate P-003 query imports; pure mapper/schema work can run independently from component extraction.
- Implementation: mapFundHolding, mapFundHoldingStatus, mapSavingCapacity and mapAnnualIncomeSavings. Preserve issuer/parent fallback, history metadata, annual filtering/order and account aggregation. Update actual wire consumers/type-only tests. No global rename of all Raw types. No code decision comment for a mechanical owner correction unless an actual non-obvious domain/API split remains.
- Acceptance: typed schema/queryFn outputs without narrowing assertions; nullable/unknown-field/invalid payload and fallback cases run at the real API boundary.
- Outcome: Four wire adapters now execute inside typed fund holding/status/history, saving-capacity and annual-income response schemas; queryFns expose final domain data without narrowing casts. Historical raw validation is private to the merged final schema owner. I-002/I-003 validate actual boundary/fallback/filter/order behavior. Only the merged-owner historical sharing exception was technically re-reviewed (I-008); its decision is documented beside the schema. No remaining acceptance work.

### P-005 — Normalize the complete helper family and verify callers

- Findings and priority: F-005 MEDIUM-HIGH; all 165 affected paths and consumers are frozen in migration-ledger.json.
- Action and proposed option: fix; apply responsibility-specific destinations and coordinated pure/support moves.
- Status: verified.
- Authorization or choice: User request “implémente le plan” (2026-10-30) authorizes this action; preserve the behavior/ownership constraints in the finding.
- Dependencies: P-001/P-002/P-004 determine special-family destinations; P-006 changes three visual owners. Remaining pure transformers can move in coherent independent batches during authorized implementation.
- Implementation: update runtime/type/reexport/literal dynamic imports, support contracts/constants, relevant colocated tests/stories and integration path fixtures. Preserve public behavior and business ownership; no compatibility barrels. Recheck generic getOwnValue's view consumer before accepting a canonical-path false positive. Resolve newly exposed equivalent helper violations within the original scope with explicit ledger deltas.
- Acceptance: zero lint errors, exact warning-budget reconciliation (never raise above 143), typecheck, meaningful affected tests, full npm test, build, build-storybook, direct catalog usage and format:check; production cycle check remains clean. No retired production helper categories remain. Run generic and application integration regressions for the reused checks.
- Outcome: All 165 retired-category findings and callers resolve to final owners in evidence/phase2-migration-resolution.json; 249 original paths moved or folded, with no compatibility barrels. The 141 pure/support helper bodies are unchanged outside imports/comments (I-006). I-001 reports 0 errors / 143 warnings, unchanged ceiling; I-002/I-003/I-004/I-005 and final candidate/file reconciliation I-009 pass. No retired production categories or unresolved cycle remain. No remaining acceptance work.

### P-008 — Feed prepaint browser metadata from canonical theme tokens

- Findings and priority: F-008 HIGH UI category; after HIGH architecture/API prerequisites and before MEDIUM-HIGH category normalization in execution order.
- Action and proposed option: fix; retain synchronous prepaint choice, generate initial metadata/bootstrap colors from PAGE_THEME_COLORS.
- Status: verified.
- Authorization or choice: User request “implémente le plan” (2026-10-30) authorizes this action; preserve the behavior/ownership constraints in the finding.
- Dependencies: independent of helper and query corrections. Coordinate with the build configuration only.
- Implementation: a small typed Vite HTML transform or equivalently early compiled bootstrap owns the integration; concrete values remain in shared/theme. Do not defer all theme setup until React. Proposed `prepaint-theme-token-source` comment: initial and runtime browser metadata consume the same semantic map, synchronous bootstrap prevents theme flash; a React-only effect was rejected for timing; revisit when the bootstrap/asset pipeline changes.
- Acceptance: canonical token changes affect generated initial and runtime meta; storage absent/invalid/blocked/legacy and light/dark system preference keep current behavior. C-06/C-07 and build/bootstrap behavior evidence cover the bounded invariant.
- Outcome: themeHtmlPlugin.ts generates initial/browser-bootstrap colors from PAGE_THEME_COLORS, is wired into Vite and the strict tooling TS project, and records prepaint-theme-token-source. All ten storage/system/token behavior cases and I-002/I-003/I-004 pass. The synchronous bootstrap remains before React; no concrete color copy remains in HTML. No remaining acceptance work.

### P-007 — Use the existing format gate in CI

- Findings and priority: F-007 LOW prevention gap, after required source corrections.
- Action and proposed option: fix; dashboard CI lint step calls npm run format:check, which already includes normal lint.
- Status: verified.
- Authorization or choice: User request “implémente le plan” (2026-10-30) authorizes this action; preserve the behavior/ownership constraints in the finding.
- Dependencies: source corrections must reach zero lint errors before final CI acceptance.
- Implementation: update `.github/workflows/ci.yml` dashboard step command/name; keep the exact warning ceiling, tests and build. No code-local decision comment is needed for this mechanical gate wiring.
- Acceptance: valid files pass formatting, an isolated malformed neighbor fails pinned Prettier, lint budget remains visible, and full pipeline-equivalent commands pass.
- Outcome: The dashboard step in .github/workflows/ci.yml now runs npm run format:check. I-007 proves pinned Prettier rejects malformed input and accepts its valid neighbor; I-001 passes the complete formatting/application+tooling lint gate with ceiling 143. Local pipeline-equivalent tests/types/builds pass; remote CI was not executed. No remaining acceptance work.

## User decisions

No unresolved contract ambiguity or product arbitration remains in either phase. Corrections preserve existing behavior under explicit catalog contracts. Optional alternative implementations are not new requirements. If the user later chooses to retain the explicit non-suspending required-source model, record that as D-001 with the actual answer and a separately authorized API rule-policy change; do not infer that answer or renew a technical exception now.

## Rule and enforcement feedback

Existing helper-category, transitive helper/service/formatter, component-role, composition and type checks are the intended prevention. The five actual-configuration probes and existing alias/reexport/dynamic regression suites show their scope. Reuse these checks after moving code; do not add application-specific entity names, path allowlists or JSX-count bans to reusable rules. Query access patterns, independent visual contracts and raw-vs-domain semantics still need review; a mechanically enforceable invariant has not been established for those meanings. F-007 strengthens CI wiring and F-008 protects canonical bootstrap values; neither introduces a new style preference. No new rule preference is needed. New component/source behavior regressions should target the missing property, not mirror helper implementation or create tests for every mechanical move.

## Follow-ups and plan changes

No unrelated dependency upgrade, compiler migration, feature redesign, performance tuning or existing-ignore technical reaudit is included. Browser/screen-reader certification and timing profiles are outside the source audit's available evidence. Existing noUncheckedIndexedAccess/exactOptionalPropertyTypes migration candidates remain documented follow-ups. If input hashes change, record the exact delta and revalidate affected findings/callers; preserve unaffected conclusions and this original baseline.

Phase-2 authorization (2026-10-30): user requested “implémente le plan”. All eight actions are authorized. Original authored-source hashes match; the former .gitignore change is now committed and no authored source has changed since phase 1.

### Phase-2 implementation deltas (2026-10-30)

- P-006 extracted three supplied-data views and code-local decisions. The existing ErrorsTab controller became a view after its business-free display preparation moved to its component presenter; this is an equivalent role correction exposed by the migration.
- P-001 removed generated ordinary account names from common account data. Existing consumer formatters now handle missing source names; cash aliases and explicit source labels remain data. Consequently useBuildDashboardSourceData is a pure transformer rather than the mixed presenter proposed from the baseline. Filter/visibility contracts and exposure sort mode moved to feature-level types because real callers include application composition and a store.
- P-002 retains all seven acquisition wrappers in services. Account-type history observes the coordinated positions cache through its real source query key, so the persistent shell does not suspend; its transformation stays pure. Code-local decision `feature-source-acquisition` records the dependency.
- P-003 uses eleven actual source consumers in sibling Suspense boundaries, with one owning required-read hook each. The persistent facade uses a domain-owned, typed, skipToken-only cache observer and retains DashboardLoadState's existing normalized error/loading feedback. Independent readers start together; no request is implemented in the shell observer. Required query tests now assert thrown errors through their boundary/cache contract instead of expecting a rendered suspense result's isError field.
- P-004 moves four wire adapters to typed response schemas; the historical wire schema was folded into its final schema owner rather than adding another shared module. No narrowing cast or new technical suppression was introduced.
- P-005 relocated source/tests/support modules with resolved imports. Integration fixtures that name actual source paths are updated; portable invalid/valid fixtures retain their intended examples. The generic getOwnValue view consumer now performs its direct guarded dictionary read locally, avoiding both business-helper imports and a duplicate utility. Generated audit evidence is explicitly excluded from ESLint; it is outside the original authored source inventory, not an application-source bypass.
- P-008 generates both initial and runtime browser metadata colors from PAGE_THEME_COLORS while retaining the synchronous storage/system bootstrap. The new tooling module is included in the strict tooling TS project. Ten behavior cases cover blocked/invalid/legacy storage and changing the canonical tokens.
- P-007 reuses format:check in the existing dashboard CI step. No new formatter preference, rule severity, warning ceiling or application ignore was introduced.
- The first broad test attempt was intentionally stopped when concrete source paths in JS integration fixtures still referenced retired locations. The corrected integration run is retained separately. The complete final run passes 263 application/integration files (2,308 tests) and 28 packaged tooling files (624 tests). The initial focused test run exposed three tests still reading a thrown suspense result; their cache-error assertions were corrected, preserving error behavior.

### Phase-2 closure (2026-10-30)

All eight authorized actions are verified; no required correction or decision remains. [Verification I-001–I-009](verification.md#implementation-checks) records final checks, exact warnings and the intervening failed/interrupted attempts. Final input/file/owner/exception reconciliation and eight code decisions are linked from coverage.md. The reusable catalog and its runtime checks, warning ceiling, dependency versions and lockfile are unchanged. No commit, publication or remote CI execution was requested or performed.
