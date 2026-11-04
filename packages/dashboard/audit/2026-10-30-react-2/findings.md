# Audit findings

Two proven MEDIUM families were diagnosed at baseline and are now resolved. The original proof/locations and alternatives below are preserved; current action outcomes are in [plan.md](plan.md) and [implementation verification](verification.md#implementation-checks).

## Impact volumes and score

| Actual impact | Baseline families | Open now | Resolved |
| ------------- | ----------------: | -------: | -------: |
| CRITICAL      |                 0 |        0 |        0 |
| HIGH          |                 0 |        0 |        0 |
| MEDIUM-HIGH   |                 0 |        0 |        0 |
| MEDIUM        |                 2 |        0 |        2 |
| LOW-MEDIUM    |                 0 |        0 |        0 |
| LOW           |                 0 |        0 |        0 |

**Score: 99.31/100 → 100.00/100**, formula `weighted-rule-compliance/v1`.

`100 × (1 − open violated-rule weight / applicable-rule weight)`; fixed weights:
CRITICAL 32, HIGH 16, MEDIUM-HIGH 8, MEDIUM 4, LOW-MEDIUM 2, LOW 1.
Baseline: 8 / 1,152 weighted penalty; final: 0 / 1,152. Each violated rule counts
once, regardless of finding grouping or location count. 110 selected rules,
101 applicable, nine not applicable, zero pending inspection.

The two baseline families affected 48 files/owners: seven new runtime owners
without sibling tests and fixture baselines in 41 test files. There are no open
confirmed violations now. Family counts and file counts are separate measures.
The 142 existing suppressions were not technically revalidated; 143 lint warnings
remain. This is conformity of the reviewed obligations, not certification of all
code or renewed approval of those exceptions. Comparisons require the same scope,
rule selection, coverage, exception policy and formula version.

[Baseline input](evidence/metrics-baseline-input.json) / [result](evidence/metrics-baseline.json),
[final input](evidence/metrics-final-input.json) / [result](evidence/metrics-final.json),
[owning formula](../../../../.agents/skills/generic-react-best-practices/references/audit-metrics.md).

## F-001 — Seven newly introduced runtime modules lacked sibling tests

- Kind: violation
- Rule IDs and actual impact: [test-colocated-tests](../../../../.agents/skills/generic-react-best-practices/rules/test-colocated-tests.md) — MEDIUM. Behavior assertions and provider isolation retain their own testing contracts.
- Affected files, symbols and callers: all seven owners below; App, DashboardSources, useDashboardViewModel, useCachedDashboardDataQuery, useAccountTypeHistory, MiniDonut, OverviewPeriodFilter and AssetIrrView. [Exact creation/hash/test-presence proof](evidence/test-colocation-proof.json); [current module/caller inventory](evidence/source-inventory.json).
- Proposed action: fix
- Plan actions and related code decision identifiers: P-001, P-004, P-005. Preserve persistent-dashboard-query-boundary, prepared-allocation-chart, comparison-period-control and prepared-asset-irr-results; the test gap does not invalidate these choices.

### Requirement and evidence

The owning rule requires a sibling test with the same base name for every new hook, helper, service, store or component, covering nominal and error/edge behavior. These seven modules were added by commit `34d269e` (verified with `git show --diff-filter=A`), are explicitly identified as new rather than renamed in the previous implementation manifest, and have no `.test` or `.spec` sibling:

| Owner                                                                                                        | Declaration line | Existing evidence and limit                                                                                            |
| ------------------------------------------------------------------------------------------------------------ | ---------------- | ---------------------------------------------------------------------------------------------------------------------- |
| `src/app/DashboardSourceBoundary.view.tsx`                                                                   | 4                | App.feature.test.tsx; useDashboardViewModel.network.test.tsx                                                           |
| `src/app/DashboardSources.feature.tsx`                                                                       | 25               | App.feature.test.tsx; useDashboardViewModel.network.test.tsx                                                           |
| `src/app/services/useCachedDashboardSources.ts`                                                              | 14               | App.feature.test.tsx; useDashboardViewModel.network.test.tsx                                                           |
| `src/domains/portfolio/features/holdings/features/positions/components/MiniDonut/MiniDonut.view.tsx`         | 13               | No direct MiniDonut import found in authored tests; surrounding chart/grouping cases are not a colocated view contract |
| `src/domains/portfolio/features/overview/pages/OverviewPeriodFilter/OverviewPeriodFilter.view.tsx`           | 13               | OverviewPeriodFilter.feature.test.tsx (nominal SSR only)                                                               |
| `src/domains/portfolio/features/performance/components/performanceContributionCard/AssetIrrResults.view.tsx` | 13               | AssetIrrView.feature.test.tsx (ready + unavailable states)                                                             |
| `src/domains/portfolio/shared/apis/queries/useCachedPortfolioSourceQuery.ts`                                 | 5                | App.feature.test.tsx; useDashboardViewModel.network.test.tsx                                                           |

App.feature.test.tsx:21 verifies eighteen independent requests start while all are pending; its second case at line 70 verifies navigation, typed filter input and focus survive a source failure. useDashboardViewModel.network.test.tsx:21 exercises seven failing source cases. AssetIrrView.feature.test.tsx checks ready/loading/error/unavailable results; OverviewPeriodFilter.feature.test.tsx has one nominal SSR case. Those are valuable integration checks, but are not sibling files for these new owners. No direct MiniDonut import was found in authored tests. This finding does not claim the seven modules have zero indirect coverage or require retrofitting a test beside every historical trivial file.

### Why this matters

The preceding correction introduced independent visual and query/cache contracts but left their tests attached to broader owners. Their missing sibling contracts are harder to discover and move with the implementation. A failing integration test alone does not identify which new query observer/view contract regressed. This is a convention and maintenance gap; no production regression was reproduced.

### Alternatives considered

Keep integration-only coverage: useful behavior evidence, but fails the explicit new-file colocation requirement. Relocate suitable existing assertions and add focused nominal/edge cases at the new owners (recommended): satisfies the rule while retaining shell/network integration coverage. Empty sibling files or duplicate implementation snapshots: reject; they satisfy neither meaningful behavior coverage nor the rule's error/edge requirement. These are test-only ownership changes, with no product or business-architecture alternative to arbitrate.

### Proposed corrective plan

P-001 creates the seven sibling tests, moves useful direct assertions where appropriate and retains integration checks for concurrent fetching and persistent shell controls. Use fresh QueryClient/Jotai stores, real hooks/schemas and network stubs. Test query-cache observation without fetching, source-error containment, empty/nullable result presentation, percentages and the accessible period-open callback. Do not manufacture tests for unrelated historical constants.

### Decision or clarification required

None. The existing rule selects sibling tests; preserve runtime behavior and all eight settled code decisions. Implementation still requires a later implementation request because the current request is audit-only.

### Acceptance and prevention

Each of the seven owners has a same-base sibling with a meaningful nominal and edge/error case. Source concurrency, shell persistence and existing visual results remain exercised. Focused tests, full npm test, typecheck and the unchanged 143-warning lint gate pass. Existing test-fixture/assertion/isolation rules apply to additions. Sibling presence for _new_ files needs Git/provenance information; do not add a blanket ESLint failure for every historical module. The user’s later prevention investigation is recorded as P-005: a provenance-aware presence command for the existing requirement, with behavior quality still reviewed manually.

## F-002 — Domain fixture defaults and factories were maintained in test modules

- Kind: violation
- Rule IDs and actual impact: [test-mock-data](../../../../.agents/skills/generic-react-best-practices/rules/test-mock-data.md) — MEDIUM.
- Affected files, symbols and callers: [complete location and caller list](evidence/fixture-locations.json), covering 41 test files. [Reviewed samples and factories](evidence/fixture-review.json) preserves every candidate, its code/type context and its verdict; overlapping factory/body entries are not separate defect counts.
- Proposed action: fix
- Plan actions and related code decision identifiers: P-002 (fixture ownership), P-003 (bounded prevention), P-004 (complete obligation/delta review). No existing architectural decision or suppression grants a fixture-location exception.

### Requirement and evidence

The rule places fixtures in the owning `mocks/<entity>.mock.ts`, or the nearest scoped shared mocks folder when sibling features reuse them, with explicit entity typing and deterministic values. Its current lint check covers unsafe fixture casts and live clocks in mock modules, and explicitly does not prove fixture ownership.

Fresh TypeScript/caller inspection found 17 typed fixture factories declared inside test files, plus complete synthetic entity samples outside mocks (98 reviewed object locations, some nested or within those factories). Examples:

- buildConcentrationTrend.test.ts:9 and :40 declare full RawPosition/HistoricalFundHolding factories. buildOverviewComparison.test.ts:11/:42 and computePerformanceContributions.test.ts:9/:40 repeat full position/operation baselines despite existing typed factories in portfolio/shared/mocks/rawPosition.mock.ts and rawOperation.mock.ts.
- portfolioFilters.test.ts:9, useFilterSummaries.test.tsx:12 and FilterScopeBadges.feature.test.tsx:36 each declare a DashboardFilters defaults factory; portfolio/shared/mocks/dashboardFilters.mock.ts already owns that contract.
- resolveFilteredHistoryState.test.ts:7 maintains an unannotated PortfolioHistoryPoint sample in the test. buildUnrealizedPnlHistory.test.ts:7 and applyAccountFilterToHistory.test.ts:11 maintain other full history baselines.
- Quality coverage, allocations, concentration, hover-history and wealth tests contain equivalent complete sample data. Their exact owners/lines/entities are all listed in fixture-locations.json; the only callers are their local test cases and fixture factories, also inventoried where named.

All 121 contextual/structural candidates were dispositioned: 98 fixture samples and 23 retained scenario/configuration/update or raw-transport cases. The separate 17-factory inventory covers union/support-contract return types missed by structural matching. The evidence is the inspected role and full default dataset, not mere structural assignability. Preserve explicit Partial overrides, updates of an existing sample, small UI/action parameter structs, empty provider/cache scaffolds and raw wire-validation inputs. These are not orders to extract every object literal in a test.

### Why this matters

Entity defaults have several independently maintained copies, so an entity/default change requires hunting through tests instead of updating typed owning fixtures. Some copies are inferred rather than explicitly tied to their entity. Existing factories already provide a single appropriate owner for several of these datasets. The dates inspected are fixed; no nondeterministic-clock defect or incorrect financial calculation is claimed.

### Alternatives considered

Keep complete defaults/factories in tests: readable locally but contradicts fixture ownership. Reuse existing owning typed factories and retain case-specific overrides in each test (recommended); add a narrow owner fixture only for missing contracts/default profiles. Put all data in one application-wide mocks file: rejects the nearest-owner requirement and obscures business boundaries. Changing shared defaults globally can change other tests; preserve current effective values with explicit overrides or a feature-owned typed profile instead. These implementation details do not require changing business-capability structure.

### Proposed corrective plan

P-002 migrates every confirmed location in fixture-locations.json, preserves the exact effective test values and assertions, reuses the existing shared position/operation/filter/fund factories and adds feature-owned history/coverage/series fixtures where needed. Move support factories with their owning test capability; imports remain test-only. Preserve scenario input structs, raw schema/network samples and field overrides classified as keep. P-003 strengthens only the sound complete typed-factory pattern in the reusable test-fixture check, retaining semantic review for anonymous samples and fixture ownership.

### Decision or clarification required

None. Existing type ownership and actual consumers determine the nearest fixture owner; different default values can remain feature profiles rather than silently changing common defaults. No product behavior or new naming preference is proposed. The current rule already supplies the fixture contract.

### Acceptance and prevention

All confirmed fixture baselines/factories have typed owning mock modules; their case-specific values remain equivalent and all existing behavior assertions pass. No internal-module mocks, schema bypass casts, clock randomness or weakened suppressions are introduced. Add only meaningful fixture integrity checks where cross-entity IDs must agree; do not test object literals by mirroring them.

The current configured local/test-fixture-contract rejects an incomplete entity cast and accepts a typed neighbor, but intentionally accepts a complete local factory: see fixture-calibration.json. P-003 proposes recognizing functions that return a complete explicitly typed domain entity base with optional Partial overrides inside test modules, resolving aliases and union variants. Invalid case: a complete defaults factory in a test. Valid neighbors: the same typed factory in mocks, a test invoking it with Partial overrides, raw JSON schema cases, expected assertion values and state-updater callbacks. Keep unsupported inferred/dynamic cases under semantic review; do not turn the audit's structural heuristic into a broad error rule.

## Implementation reconciliation

All seven sibling contracts have nominal and edge/error behavior evidence (phase2-sibling-review.json). All 17 local fixture factories moved to owning mocks; 32 old/new profile cases compare identically, existing assertions pass, and 28 residual candidates are explicitly retained scenario/update/transport cases. The actual pre-correction concentration test now produces two factory diagnostics at severity 2, while its corrected version produces none. The provenance-aware command reproduces the seven historical omissions and passes for this implementation delta. No architecture decision, existing ignore or production runtime module changed.
