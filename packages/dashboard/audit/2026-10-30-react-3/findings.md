# Audit findings

## F-001 — Complete fixture baselines still live in test files

- Kind: violation
- Rule IDs and actual impact: `test-mock-data`, MEDIUM.
- Affected files, symbols and callers: 12 test files; complete list below and [machine location ledger](evidence/fixture-locations.json). Their callers are the real scope/quality/positions hooks, concentration/wealth views and presenters, performance calculation, and cache-backed filter badges exercised by these tests.
- Proposed action: fix.
- Plan actions and related code decision identifiers: P-001; P-002 is optional prevention feedback. No runtime architecture decision needs changing.

### Requirement and evidence

The frozen [owning rule](../../../../.agents/skills/generic-react-best-practices/rules/test-mock-data.md) requires fixture defaults in the owning `mocks/<entity>.mock.ts` or nearest shared mocks, with domain typing and deterministic values. Its distinct placement obligation cannot be closed by assignability, fixed dates or passing lint.

The locations below define complete reusable/default sample records or generated rows. They are actual supplied data bases, not expected assertion output, raw validation inputs, factory `Partial` overrides or store action selections. Several canonical owners already exist: `rawIsinData.mock.ts`, `allocationPoint.mock.ts`, `savingCapacityPoint.mock.ts` and `dataQualityTabProps.mock.ts`. The two cumulative-point tests duplicate the exact same six-field sample. The untyped `setQueryData` sample also lacks a direct domain annotation.

| Location | Definition and consumer evidence |
| --- | --- |
| [`src/app/DashboardDataQuality.feature.test.tsx:13`](../../src/app/DashboardDataQuality.feature.test.tsx#L13) | Shared INPUTS supplies the complete DataQualityTabProps base in two composition cases; createDataQualityTabProps already owns the same defaults. |
| [`src/app/DashboardDataQuality.feature.test.tsx:38`](../../src/app/DashboardDataQuality.feature.test.tsx#L38) | Nested all-empty RawIsinData duplicates the canonical rawData base rather than overriding an owned sample. |
| [`src/domains/portfolio/features/data-quality/features/assessment/helpers/transformers/useDashboardQuality.test.tsx:15`](../../src/domains/portfolio/features/data-quality/features/assessment/helpers/transformers/useDashboardQuality.test.tsx#L15) | Complete empty FundHoldingsData & FundDiagnostics baseline is supplied to the real quality hook; compose typed owning data factories. |
| [`src/domains/portfolio/features/data-quality/features/assessment/helpers/transformers/useDashboardQuality.test.tsx:28`](../../src/domains/portfolio/features/data-quality/features/assessment/helpers/transformers/useDashboardQuality.test.tsx#L28) | Complete empty RawIsinData is supplied to the real quality hook; rawData() already owns its defaults. |
| [`src/domains/portfolio/features/diversification/features/concentration/components/CumulativeConcentrationTooltip.view.test.tsx:8`](../../src/domains/portfolio/features/diversification/features/concentration/components/CumulativeConcentrationTooltip.view.test.tsx#L8) | Complete named point baseline is reused and spread across tooltip cases; the same default point is duplicated in the crosshair test. |
| [`src/domains/portfolio/features/diversification/features/concentration/components/CumulativeConcentrationChart/helpers/presenters/cumulativeConcentrationCrosshair.test.ts:7`](../../src/domains/portfolio/features/diversification/features/concentration/components/CumulativeConcentrationChart/helpers/presenters/cumulativeConcentrationCrosshair.test.ts#L7) | Inferred complete cumulative point repeats the tooltip baseline, including fields unrelated to the rank/share assertion. |
| [`src/domains/portfolio/features/diversification/shared/helpers/transformers/prepareDiversificationScope.test.ts:26`](../../src/domains/portfolio/features/diversification/shared/helpers/transformers/prepareDiversificationScope.test.ts#L26) | Named complete RawIsinData baseline supplies both scope cases; use rawData with explicit dimension overrides and preserve row aliasing. |
| [`src/domains/portfolio/features/wealth/components/WealthDriversTooltip.view.test.tsx:8`](../../src/domains/portfolio/features/wealth/components/WealthDriversTooltip.view.test.tsx#L8) | Named complete WealthDriverPoint baseline is reused by three label-formatting cases; its numeric fields are defaults beyond the tested date label. |
| [`src/domains/portfolio/features/wealth/helpers/transformers/wealthCalculations/computeTrailing12mSavings.test.ts:11`](../../src/domains/portfolio/features/wealth/helpers/transformers/wealthCalculations/computeTrailing12mSavings.test.ts#L11) | Array.from builds complete SavingCapacityPoint rows in the test; the existing makeSavingCapacityPoint factory is already imported and used for the other scenario. |
| [`src/domains/portfolio/features/wealth/helpers/transformers/wealthCalculations/computeTrailing12mYearOverYear.test.ts:11`](../../src/domains/portfolio/features/wealth/helpers/transformers/wealthCalculations/computeTrailing12mYearOverYear.test.ts#L11) | Generated monthly history repeats a complete SavingCapacityPoint base rather than creating rows through the existing imported factory. |
| [`src/domains/portfolio/features/wealth/helpers/transformers/wealthCalculations/computeTrailing12mYearOverYear.test.ts:86`](../../src/domains/portfolio/features/wealth/helpers/transformers/wealthCalculations/computeTrailing12mYearOverYear.test.ts#L86) | Second generated 36-month history also repeats the complete SavingCapacityPoint row baseline; retain each computed date/value override. |
| [`src/domains/portfolio/shared/components/filters/FilterScopeBadges.feature.test.tsx:21`](../../src/domains/portfolio/shared/components/filters/FilterScopeBadges.feature.test.tsx#L21) | Repeated render setup seeds a complete DashboardData cache baseline via an untyped setQueryData argument; typed fixture ownership also ties the sample to its domain contract. |
| [`src/domains/portfolio/shared/helpers/transformers/usePortfolioPositions.test.tsx:14`](../../src/domains/portfolio/shared/helpers/transformers/usePortfolioPositions.test.tsx#L14) | Real hook input embeds a complete empty FundHoldingsData baseline; share the typed base with the quality-hook fixture. |
| [`src/domains/portfolio/features/diversification/features/allocation/components/EvoCard/helpers/presenters/allocationTrendDomain.test.ts:7`](../../src/domains/portfolio/features/diversification/features/allocation/components/EvoCard/helpers/presenters/allocationTrendDomain.test.ts#L7) | History dataset embeds an AllocationPoint with an empty categories default; the canonical makeAllocationPoint exists in portfolio/shared/mocks. |
| [`src/domains/portfolio/features/diversification/features/allocation/components/EvoCard/helpers/presenters/allocationTrendDomain.test.ts:8`](../../src/domains/portfolio/features/diversification/features/allocation/components/EvoCard/helpers/presenters/allocationTrendDomain.test.ts#L8) | Second history row repeats the complete AllocationPoint base; preserve its explicitly selected date. |
| [`src/domains/portfolio/features/performance/helpers/transformers/computePerformanceContributions.test.ts:9`](../../src/domains/portfolio/features/performance/helpers/transformers/computePerformanceContributions.test.ts#L9) | Module-level noFilters is a complete reusable default PerformanceContributionFilters sample used by multiple behavior cases, rather than an inline selection override. |

Some location references overlap (the quality props object and its nested data). They are grouped as one rule/failure family; the affected-file count is 12.

The preceding audit's inspector excluded intersection types with `type.flags & TypeFlags.Object` and required at least four matching keys for inferred structural candidates. `RawIsinData`, `CumulativeConcentrationPoint` and `WealthDriverPoint` are intersections; three-field savings rows and two-field defaults/history records also fell outside that candidate path. This is a missed violation under an unchanged contract, not a new source regression or a new rule preference. Fresh [57-candidate review](evidence/fixture-review.json) and [composed-input supplement](evidence/intersection-input-review.json) explicitly close those gaps. The original retained evidence is preserved rather than rewritten.

Configured [calibration](evidence/calibration.json) proves that the current check rejects a complete explicitly typed defaults **factory** at severity 2 and accepts the owning-factory consumer. It reports no fixture diagnostic for the complete local typed value or the actual `prepareDiversificationScope.test.ts` baseline. The factory replacement is valid. This is a documented detector limit, not evidence that local values satisfy placement. All 2993 tests and the lint gate pass despite the ownership violations.

### Why this matters

Complete sample defaults have multiple maintenance owners, including identical cumulative-point data and local raw-allocation/empty-fund data. Tests repeatedly encode fields unrelated to their asserted behavior and can drift from the canonical sample contracts. The untyped cache seed is especially easy to leave stale when `DashboardData` changes. No production failure or financial-result defect is established by this finding; the proven issue is the catalog's fixture ownership/typing convention.

### Alternatives considered

1. Keep complete local bases. Fixed dates and most inferred types are useful, but do not satisfy fixture placement. The reusable local defaults remain independent maintenance owners.
2. Reuse existing typed factories, and add only missing entity factories at their actual feature/shared owner. Keep all scenario-specific dates, values, categories, source identities and nulls as explicit overrides. This satisfies the existing convention with the smallest caller change and preserves behavior.
3. Move each entire scenario into a dedicated profile in the same owning mocks folder. This can conform when a complex named profile is reused, but would add wrappers for simple row generation and duplicate existing canonical factories here. Use a profile only where it provides an actual shared sample contract; no business architecture move is needed.

### Proposed corrective plan

P-001 replaces every confirmed local base in the location ledger. Reuse `rawData`, `makeAllocationPoint`, `makeSavingCapacityPoint` and `createDataQualityTabProps`; add missing typed cumulative-point, wealth-driver, default contribution-filter, dashboard-data and fund-data/diagnostic factories at the narrowest permitted owners. Compose base fixtures where appropriate. Keep outer scenario composition in tests, reuse the factories for its complete nested data bases, and retain all current expectations.

Preserve row aliasing in the scope test and exact dates/amounts in generated month sequences. Do not import application mocks into a domain to reuse `createDashboardSourceFixtures`; promote/reuse generic domain-owned data fixtures instead. No production code change, new suppression or business-boundary decision is required. Routine sample placement does not warrant an architecture decision comment.

### Decision or clarification required

None. The explicit fixture ownership contract and existing type/feature owners select a mechanical correction. Both simple overrides and useful same-owner profiles remain allowed; choosing their ordinary implementation details is not a materially different architecture arbitration. Implementation was not requested in this audit.

### Acceptance and prevention

All confirmed locations consume typed owning mocks, with no replacement local complete defaults. Each input retains the original effective values and observable assertions; compare complete generated scenario inputs in an isolated probe where defaults could otherwise change behavior. Run affected tests, strict TypeScript, unchanged-ceiling uncached lint, full application/generic tests and final fixture inventory. Reconcile actual additions and the distinct placement/typing/determinism obligations before closure; new fixture-only modules are not falsely called production runtime owners.

Existing `local/test-fixture-contract` continues protecting unsafe casts, nondeterministic mocks and recognizable typed local factories. P-002 proposes a portable candidate inventory that includes composed types, small records, variables and generated rows, with raw transport/scenario/expected-value cases distinguished explicitly. Ownership classification still needs semantic review. No suppression, detector edit or additional gate was implemented during phase 1.

### Implementation delta (2026-10-31)

The user authorized both actions. The new collector exposed two additional equivalent F-001 input fixtures in `toLatestAllocationByIsin.test.ts` and `buildAllocationPieData.test.ts`, previously hidden by lexical assertion exclusion. [Exact additional locations](evidence/phase2-new-equivalent-locations.json). Both now use existing owning factories. Total corrected scope: 18 overlapping references in 14 test files; still one MEDIUM family. Original baseline and proof remain preserved.

P-001 migrates all confirmed bases, with [16 effective input equivalence results](evidence/phase2-fixture-input-equivalence.json) and unchanged observable assertions. P-002 packages the collector, regression/CLI/actual-config tests and documented bindings. [Historical replay](evidence/phase2-fixture-replay-summary.json) reproduces 18/18 references; all [15 current candidates](evidence/phase2-fixture-review.json) and [135 supported exclusions](evidence/phase2-exclusion-review.json) have explicit dispositions. [Root causes](root-causes.md) distinguishes previous detector limits from the missing semantic review. [Plan.md](plan.md) remains the source of implementation status: both actions are verified. F-001 is resolved; no remaining proven violation or user decision is pending.
