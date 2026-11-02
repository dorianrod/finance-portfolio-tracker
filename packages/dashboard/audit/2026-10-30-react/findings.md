# Audit findings

Seven proven catalog violation families and one prevention gap are listed below. None claims an observed production crash or security breach. Impact is the owning catalog impact, not an invented defect-severity score. These sections preserve the phase-1 proof and original locations. Phase 2 implemented all eight authorized actions; the [plan outcomes](plan.md#prioritized-actions) are the source of truth for verified status. Final owners are listed in the [165-entry migration resolution](evidence/phase2-migration-resolution.json) and [file reconciliation](evidence/phase2-file-review.md). Exactly one modified merged-schema exception was technically re-reviewed; the other existing ignores were not.

## F-006 — Three features mix orchestration with independent visual surfaces
- Kind: violation
- Rule IDs and actual impact: [arch-component-roles](../../../../.agents/skills/generic-react-best-practices/rules/arch-component-roles.md) — CRITICAL; [arch-component-module-boundaries](../../../../.agents/skills/generic-react-best-practices/rules/arch-component-module-boundaries.md) — HIGH (correction constraint).
- Affected files, symbols and callers: see locations below and [complete component decisions](evidence/component-boundaries.md).
- Proposed action: fix
- Plan actions and related code decision identifiers: P-006; `prepared-allocation-chart`, `prepared-asset-irr-results`, `comparison-period-control`.

### Requirement and evidence

The component-role contract requires extraction when a feature mixes business orchestration with a substantial presentational subtree that has an independent visual contract. This is not a JSX-count or suffix verdict.

- `src/domains/portfolio/features/holdings/features/positions/components/MiniDonut/MiniDonut.feature.tsx:14` (`MiniDonut`) — src/domains/portfolio/features/holdings/features/positions/components/HoverAllocationPopover/HoverAllocationPopover.feature.tsx:1
- `src/domains/portfolio/features/performance/components/performanceContributionCard/AssetIrrView.feature.tsx:15` (`AssetIrrView`) — src/domains/portfolio/features/performance/components/performanceContributionCard/AssetIrrView.feature.test.tsx:8, src/domains/portfolio/features/performance/components/performanceContributionCard/PerformanceContributionCard.feature.tsx:28
- `src/domains/portfolio/features/overview/pages/OverviewPeriodFilter.feature.tsx:14` (`OverviewPeriodFilter`) — src/app/DashboardFilters.feature.tsx:7, src/domains/portfolio/features/overview/pages/OverviewPeriodFilter.feature.test.tsx:5

MiniDonut lines 21–30 group the allocation through buildAllocationPieData and prepare labels; lines 32–60 render the standalone chart/tooltip/legend. A prepared pie-data/title/total view has a meaningful standalone contract, as neighboring DonutCard.feature/DonutCard.view already demonstrate. AssetIrrView resolves availability and buildAssetIrrRankings before lines 49–101 render the prepared result summary and ranking grids; MetricLabel's live filter feature can stay in caller-owned nested content. OverviewPeriodFilter acquires openFilters at line 16, while the two-period comparison control can render supplied ranges and invoke an onOpen callback without a dashboard store. E-006 identifies two of these as substantial-JSX candidates; MiniDonut was inspected despite falling outside that heuristic.

### Why this matters

Business providers/calculations and visual changes currently share one module. Inference: a layout/interaction test must carry unrelated domain preparation or action state. These surfaces have a stable supplied-data/callback contract, unlike App/WealthTab's legitimate composition of child capabilities.

### Alternatives considered

Keep the current module: appropriate for trivial/tightly coupled markup, but these chart/results/comparison surfaces are independently renderable and substantial. Extract feature + view at the current owner (recommended): preserves the business boundary and makes visual behavior directly exercisable. Move everything to a view: violates the prohibition on business aggregation/actions in views. A generic feature wrapper or new business feature provides no new user outcome.

### Proposed corrective plan

P-006 extracts MiniDonut.view, AssetIrrResults.view and OverviewPeriodFilter.view into named owner directories. Features retain grouping/ranking/availability/action lookup; views may format prepared values and own local visual behavior. Keep MetricLabel/FilterScopeBadges composition in feature-owned nested slots; do not hide business imports in a view or add render-function props. Update all callers/tests in the dependency inventory.

### Decision or clarification required

No product choice is required: preserve the existing visible behavior and business ownership. Routine prop/type names can be selected during authorized implementation; no alternative visual design is requested.

### Acceptance and prevention

Views render prepared chart entries/rankings/periods with no API/atom/action dependencies. Preserve chart labels, legend percentages, available/unavailable IRR states and the period button's accessible action. Focused meaningful rendering/interaction tests plus full lint/typecheck/build/tests pass. Existing component-role and composition checks enforce imports; independent-contract judgment remains manual. Add the proposed code-local decisions; no generic JSX-size ban.

## F-001 — Eleven required fixed-source reads use the wrong query access pattern
- Kind: violation
- Rule IDs and actual impact: [api-query-hook-choice](../../../../.agents/skills/generic-react-best-practices/rules/api-query-hook-choice.md) — HIGH; [api-vercel-parallel-work](../../../../.agents/skills/generic-react-best-practices/rules/api-vercel-parallel-work.md), [api-suspense-error-boundary](../../../../.agents/skills/generic-react-best-practices/rules/api-suspense-error-boundary.md) — HIGH correction constraints.
- Affected files, symbols and callers: eleven hooks below, useDashboardViewModel, App and DashboardLoadState.
- Proposed action: fix
- Plan actions and related code decision identifiers: P-003; `persistent-dashboard-query-boundary`.

### Requirement and evidence

The access-pattern table selects useSuspenseQuery for data required to render a screen, and useQuery/keepPreviousData for mounted key changes. The eleven fixed-key, unconditionally acquired sources below all use useQuery. The shell facade blocks ready content until these queries resolve and maps any failure to a single load-state error; they are therefore required screen reads in the current implementation. See the [19-hook access-pattern ledger](evidence/query-access-patterns.json), source files, and useDashboardViewModel.network.test.tsx/App.feature.test.tsx under E-003. Those tests confirm deliberate explicit loading/error behavior; this is a catalog mismatch, not a claim that useQuery is intrinsically broken.

- `src/domains/portfolio/features/data-quality/features/assessment/apis/queries/useGetFundDiagnosticsQuery.ts:13` (`useGetFundDiagnosticsQuery`) — src/app/services/useDashboardViewModel.ts:6, src/domains/portfolio/features/data-quality/features/assessment/apis/queries/useGetFundDiagnosticsQuery.test.tsx:9
- `src/domains/portfolio/features/data-quality/shared/apis/queries/useGetManualPriceOverridesQuery.ts:12` (`useGetManualPriceOverridesQuery`) — src/app/services/useDashboardViewModel.ts:9
- `src/domains/portfolio/features/data-quality/shared/apis/queries/useGetPipelineErrorsQuery.ts:11` (`useGetPipelineErrorsQuery`) — src/app/services/useDashboardViewModel.ts:10
- `src/domains/portfolio/features/wealth/apis/queries/useGetAnnualIncomeSavingsQuery.ts:10` (`useGetAnnualIncomeSavingsQuery`) — src/app/services/useDashboardViewModel.ts:18
- `src/domains/portfolio/features/wealth/apis/queries/useGetMonthlyOperationsQuery.ts:12` (`useGetMonthlyOperationsQuery`) — src/app/services/useDashboardViewModel.ts:19
- `src/domains/portfolio/shared/apis/queries/useGetAllocationRowsQuery.ts:6` (`useGetAllocationRowsQuery`) — src/app/services/useDashboardViewModel.ts:23, src/domains/portfolio/features/holdings/features/positions/apis/queries/useGetAllocationsByIsinQuery.test.tsx:7
- `src/domains/portfolio/shared/apis/queries/useGetBrokerageCashHistoryQuery.ts:10` (`useGetBrokerageCashHistoryQuery`) — src/app/services/useDashboardViewModel.ts:24
- `src/domains/portfolio/shared/apis/queries/useGetDashboardDataQuery.ts:14` (`useGetDashboardDataQuery`) — src/app/services/useDashboardViewModel.ts:25
- `src/domains/portfolio/shared/apis/queries/useGetFundHoldingsQuery.ts:15` (`useGetFundHoldingsQuery`) — src/app/services/useDashboardViewModel.ts:26, src/domains/portfolio/features/holdings/features/fund-look-through/components/FundHoldingsExplorer/services/useFundExposureViewModel.ts:10, src/domains/portfolio/features/holdings/features/positions/components/FundPositionPopover/helpers/selectors/useFundPositionHoldings.ts:5, src/domains/portfolio/shared/apis/queries/useGetFundHoldingsQuery.test.tsx:9
- `src/domains/portfolio/shared/apis/queries/useGetPortfolioHistoryQuery.ts:10` (`useGetPortfolioHistoryQuery`) — src/app/services/useDashboardViewModel.ts:27
- `src/domains/portfolio/shared/apis/queries/useGetPositionsQuery.ts:6` (`useGetPositionsQuery`) — src/app/services/useDashboardViewModel.ts:28, src/domains/portfolio/features/holdings/features/positions/apis/queries/useGetPositionHistoryQuery.test.tsx:7, src/domains/portfolio/features/wealth/helpers/aggregators/useAccountTypeHistory.ts:5

### Why this matters

The API contract and the application's screen-loading model disagree. A future mechanical hook swap would suspend before the persistent shell returns and serialize independent requests, losing tested filter/navigation behavior. The correction must preserve those properties explicitly.

### Alternatives considered

Keep the current explicit useQuery/load-state model: it has working tests, but does not meet the frozen access-pattern table. Move required reads below the persistent shell and batch them with useSuspenseQueries/use sibling query consumers (recommended): conforms while preserving parallel starts and usability. Sequential useSuspenseQuery calls in the existing facade: rejected, because the first suspension prevents later requests from starting. Changing the rule to allow explicit non-suspending required-screen loaders would be a new policy decision, not proof of existing compliance.

### Proposed corrective plan

P-003 keeps navigation/filter controls outside data suspension and introduces concurrent required-source consumers with loading/error/reset ownership. Preserve normalized errors and 404 absence, cached common source options and selected-account placeholder feedback. Do not convert the four mounted scope/date queries, skipToken observer or conditional preview/demo query as a blanket migration.

### Decision or clarification required

The catalog selects the Suspense access pattern; preserve current error visibility and editable controls. No change to what data failures are surfaced, nor to public demo behavior, is implied. A user preference to retain the explicit model would require a separately authorized rule-policy change.

### Acceptance and prevention

Existing App test continues to show a usable navigation/filter panel while a source is pending or fails, and typed period input/focus survives. Concurrent-start assertions demonstrate all independent required fetches start before any resolves. Error and optional-404 cases remain explicit. No global ban on useQuery is sound: required/conditional ownership needs semantic review. Keep existing typed API checks and the access-pattern ledger; add behavior regressions for the changed boundary.

## F-002 — Seven helper hooks acquire business/server state
- Kind: violation
- Rule IDs and actual impact: [arch-helpers-vs-services](../../../../.agents/skills/generic-react-best-practices/rules/arch-helpers-vs-services.md) — HIGH; [helpers-categories](../../../../.agents/skills/generic-react-best-practices/rules/helpers-categories.md) — MEDIUM-HIGH.
- Affected files, symbols and callers: below and [migration ledger](evidence/migration-ledger.md).
- Proposed action: fix
- Plan actions and related code decision identifiers: P-002, prerequisite P-001; `feature-source-acquisition`.

### Requirement and evidence

Helpers receive explicit validated inputs and must not acquire data or subscribe to business stores. Six hooks directly consume useGet*/useCachedDashboardDataQuery or dashboardFiltersAtom. useDashboardWealth acquires transitively through useAccountTypeHistory. These are real subscriptions, not erased type imports. The current lint reports their category error first; C-03 proves the canonical helper contract rejects acquisition at severity 2.

- `src/domains/portfolio/features/holdings/features/positions/components/FundPositionPopover/helpers/selectors/useFundPositionHoldings.ts:14` (`useFundPositionHoldings`) — src/domains/portfolio/features/holdings/features/positions/components/FundPositionPopover/FundPositionPopover.feature.tsx:2
- `src/domains/portfolio/features/holdings/features/positions/components/PositionsTable/helpers/mappers/usePositionTableData.ts:10` (`usePositionTableData`) — src/domains/portfolio/features/holdings/features/positions/components/PositionsTable/PositionsTable.feature.tsx:16
- `src/domains/portfolio/features/performance/helpers/mappers/useDashboardPerformance.ts:10` (`useDashboardPerformance`) — src/app/services/useDashboardViewModel.ts:17, src/domains/portfolio/features/performance/helpers/mappers/useDashboardPerformance.test.tsx:7
- `src/domains/portfolio/features/scope-selection/helpers/filters/usePortfolioFilterOptions.ts:6` (`usePortfolioFilterOptions`) — src/domains/portfolio/features/scope-selection/components/filterBar/FilterPanel.feature.tsx:9
- `src/domains/portfolio/features/wealth/helpers/aggregators/useAccountTypeHistory.ts:7` (`useAccountTypeHistory`) — src/domains/portfolio/features/wealth/helpers/aggregators/useAccountTypeHistory.test.tsx:5, src/domains/portfolio/features/wealth/helpers/mappers/useDashboardWealth.ts:4, src/domains/portfolio/shared/apis/queries/accountScopes.test.tsx:8
- `src/domains/portfolio/features/wealth/helpers/mappers/useDashboardWealth.ts:17` (`useDashboardWealth`) — src/app/services/useDashboardViewModel.ts:20, src/domains/portfolio/features/wealth/helpers/mappers/useDashboardWealth.test.tsx:7
- `src/domains/portfolio/shared/helpers/filters/portfolioFilters/useAccountFilterLabels.ts:6` (`useAccountFilterLabels`) — src/domains/portfolio/features/data-quality/features/assessment/components/AccountCoverageRow.feature.tsx:3, src/domains/portfolio/shared/components/filters/FilterScopeBadges.feature.tsx:3

### Why this matters

A consumer importing a helper gets query/store providers and request state as hidden dependencies. Simply renaming the retired category to transformers would preserve the violation and expose additional configured dependency errors.

### Alternatives considered

Keep acquisition under a canonical helper folder: violates the same contract. Move acquisition wrappers to services at the same feature/component owner and retain pure calculations in transformers (recommended): preserves source/cache ownership and caller behavior. Pass query/atom clients into helpers: expressly forbidden. Reimplement every request in each component would duplicate transport/cache responsibility.

### Proposed corrective plan

P-001 first removes generated-label dependencies from common data acquisition. P-002 moves all seven wrappers (including the transitive wealth facade) to services and updates imports/type consumers/tests. Keep source options/cache identity unchanged; services do not become pure memo-only wrappers around a helper.

### Decision or clarification required

None: source subscriptions select services under the existing contract. Keep existing business capability ownership.

### Acceptance and prevention

No canonical helper acquires queries/business atoms directly or transitively. Services retain real acquisition and do not import formatters/presenters. Relevant network/renderHook/state tests exercise the real hooks. C-02/C-03 and existing direct/alias/reexport/dynamic integration cases validate the generic detector; no new application-specific lint allowlist.

## F-003 — Display-dependent helpers need component/page ownership
- Kind: violation
- Rule IDs and actual impact: [arch-no-visual-logic-below-page](../../../../.agents/skills/generic-react-best-practices/rules/arch-no-visual-logic-below-page.md) — HIGH; [helpers-categories](../../../../.agents/skills/generic-react-best-practices/rules/helpers-categories.md), [helpers-formatter-hooks](../../../../.agents/skills/generic-react-best-practices/rules/helpers-formatter-hooks.md) — MEDIUM-HIGH.
- Affected files, symbols and callers: thirteen rows in the migration ledger, listed below.
- Proposed action: fix
- Plan actions and related code decision identifiers: P-001; `account-scope-data-and-labels`.

### Requirement and evidence

A presenter owns structured display data/visual selection and belongs to the component/page; a transformer cannot import formatters or return UI configuration. useBuildPipelineErrorsViewModel sorts by formatted display labels; useFilterSummaries produces translated chip labels; useBuildDataQualityViewModel produces translated page themes; buildAnalysisReliabilityMetrics constructs translated metric labels. buildFundExposureViewModel's expanded issuer/security/source row tree is a rendering contract. filterSummariesForTab/selectRenderableAllocationCharts/shouldAnimateConcentration choose rendered chips/charts or animation rather than domain eligibility. toDateInputValue returns a native input control value. Account-option/label construction mixes shared business identifiers with generated display labels; it cannot move unchanged into either a reusable service or transformer. The app-shell load/source builders are allowed at the application presentation boundary, but need a canonical presenter category.

- `src/app/helpers/mappers/useBuildDashboardLoadState.ts:7` (`useBuildDashboardLoadState`) — src/app/helpers/mappers/useBuildDashboardLoadState.test.tsx:5, src/app/services/useDashboardViewModel.ts:4
- `src/app/helpers/mappers/useBuildDashboardSourceData.ts:8` (`useBuildDashboardSourceData`) — src/app/services/useDashboardViewModel.ts:5
- `src/domains/portfolio/features/data-quality/features/assessment/components/reliability/analysisReliabilityKpi/helpers/mappers/buildAnalysisReliabilityMetrics.ts:6` (`buildAnalysisReliabilityMetrics`) — src/domains/portfolio/features/data-quality/features/assessment/components/reliability/analysisReliabilityKpi/helpers/presenters/useCombinedReliabilityPresentation.ts:3
- `src/domains/portfolio/features/data-quality/features/assessment/pages/DataQualityTab/helpers/mappers/useBuildDataQualityViewModel.ts:20` (`useBuildDataQualityViewModel`) — src/domains/portfolio/features/data-quality/features/assessment/pages/DataQualityTab/helpers/mappers/useBuildDataQualityViewModel.test.tsx:9, src/domains/portfolio/features/data-quality/features/assessment/pages/DataQualityTab/services/useDataQualityViewModel.ts:4
- `src/domains/portfolio/features/data-quality/features/errors/helpers/mappers/buildPipelineErrorsViewModel/useBuildPipelineErrorsViewModel.ts:9` (`useBuildPipelineErrorsViewModel`) — src/domains/portfolio/features/data-quality/features/errors/components/ErrorsTab/ErrorsTab.feature.tsx:4, src/domains/portfolio/features/data-quality/features/errors/components/ErrorsTab/ErrorsTab.view.tsx:4
- `src/domains/portfolio/features/diversification/features/concentration/components/ConcentrationTrendSection/helpers/businessRules/shouldAnimateConcentration.ts:1` (`shouldAnimateConcentration`) — src/domains/portfolio/features/diversification/features/concentration/components/ConcentrationTrendSection/ConcentrationTrendSection.feature.test.tsx:5, src/domains/portfolio/features/diversification/features/concentration/components/ConcentrationTrendSection/services/useConcentrationTrendController.ts:4
- `src/domains/portfolio/features/holdings/features/fund-look-through/helpers/mappers/buildFundExposureViewModel.ts:12` (`buildFundExposureViewModel`) — src/domains/portfolio/features/holdings/features/fund-look-through/components/FundExposureRows/fundExposureRows/VirtualExposureRow.view.tsx:1, src/domains/portfolio/features/holdings/features/fund-look-through/components/FundHoldingsExplorer/FundHoldingsExplorer.feature.tsx:43, src/domains/portfolio/features/holdings/features/fund-look-through/components/FundHoldingsExplorer/services/useFundExposureViewModel.ts:4, src/domains/portfolio/features/holdings/features/fund-look-through/components/FundHoldingsExplorer/services/useVirtualExposureList.ts:4, src/domains/portfolio/features/holdings/features/fund-look-through/stores/dashboardUnderlyingHoldings/dashboardUnderlyingSort.atoms.ts:3
- `src/domains/portfolio/features/holdings/features/positions/components/HoverAllocationPopover/helpers/selectors/selectRenderableAllocationCharts.ts:3` (`selectRenderableAllocationCharts`) — src/domains/portfolio/features/holdings/features/positions/components/HoverAllocationPopover/HoverAllocationPopover.feature.tsx:9
- `src/domains/portfolio/features/scope-selection/helpers/filters/filterSummariesForTab.ts:4` (`filterSummariesForTab`) — src/domains/portfolio/features/scope-selection/components/filterBar/ActiveFilterSummary/ActiveFilterSummary.feature.tsx:5
- `src/domains/portfolio/features/scope-selection/helpers/filters/useFilterSummaries.ts:14` (`useFilterSummaries`) — src/app/App.feature.tsx:10, src/domains/portfolio/features/scope-selection/helpers/filters/useFilterSummaries.test.tsx:8
- `src/domains/portfolio/shared/helpers/filters/portfolioFilters/useBuildAccountFilterLabels.ts:7` (`useBuildAccountFilterLabels`) — src/domains/portfolio/shared/helpers/filters/portfolioFilters/useAccountFilterLabels.ts:4, src/domains/portfolio/shared/helpers/filters/portfolioFilters/useBuildAccountFilterLabels.test.tsx:8, src/domains/portfolio/shared/helpers/filters/portfolioFilters/useBuildPortfolioFilterOptions.ts:6
- `src/domains/portfolio/shared/helpers/filters/portfolioFilters/useBuildPortfolioFilterOptions.ts:9` (`useBuildPortfolioFilterOptions`) — src/app/helpers/mappers/useBuildDashboardSourceData.ts:3, src/domains/portfolio/features/scope-selection/helpers/filters/usePortfolioFilterOptions.ts:4
- `src/shared/helpers/mappers/toDateInputValue.ts:1` (`toDateInputValue`) — src/domains/portfolio/features/scope-selection/components/filterBar/FilterPanel.feature.tsx:17

### Why this matters

Moving every retired mapper/filter to transformers would make display text and UI layout shape part of reusable domain derivation. Moving formatted query wrappers unchanged into services would violate the reusable-service presentation boundary. This dependency is demonstrated by C-04/C-05, not inferred from a ViewModel filename.

### Alternatives considered

Mechanical category rename: fails the exposed-contract requirements. Consumer-owned presenters composed from existing unit formatters and pure transformers (recommended) preserve labels, sort behavior, row order and scope. Inject t/formatter functions into pure helpers: prohibited context threading. Promote a mixed helper to global shared code: hides the same responsibility and loses the nearest owner. Pure healthy/warning/critical quality diagnostics remain transformers because they drive business decisions as well as display.

### Proposed corrective plan

P-001 splits common account IDs/types from formatted labels, retaining shared data reuse across history/wealth/performance. Put generated labels/chips/results in their actual component/page presenters (ErrorsTab, DataQualityTab, ActiveFilterSummary, FundHoldingsExplorer, FilterPanel and reliability metric owner). Component-only support modules live in named component directories. Read translation context inside new presenter hooks where translated output is built; reuse existing formatter hooks and preserve fallback/zero behavior. Update type-only imports along with runtime callers.

### Decision or clarification required

None about behavior or business ownership. Preserve current grouping identities, source/cash aliases and label sorting; routine local file/type names are implementation details. No generic new helper category or domain split is proposed.

### Acceptance and prevention

Transformers consume explicit data and contain no formatter/translation/presenter imports; reusable services contain no presentation imports. Rendered labels, cash-account names, chip counts, sorting and exposure expansion remain identical. A nondefault translation-provider regression is appropriate for newly created label presenters. Existing helper, formatter and transitive presentation-dependency checks are reused. C-04/C-05 establish intended rejection/valid cases; no uncertain string-meaning detector is added.

## F-004 — Four helpers adapt API wire field names
- Kind: violation
- Rule IDs and actual impact: [helpers-categories](../../../../.agents/skills/generic-react-best-practices/rules/helpers-categories.md) — MEDIUM-HIGH; [yup-last-coercion-barrier](../../../../.agents/skills/generic-react-best-practices/rules/yup-last-coercion-barrier.md) — HIGH boundary constraint (no downstream primitive re-coercion is alleged).
- Affected files, symbols and callers: below.
- Proposed action: fix
- Plan actions and related code decision identifiers: P-004.

### Requirement and evidence

The helpers contract explicitly places wire-field renames/raw response adaptation in API response schemas, not helper categories. These four functions translate snapshot_date/parent_isin/quality_tier/net_salary-style row fields into exported entity fields. mapFundHolding and mapFundHoldingStatus are typed from API schemas. Their API callers already validate input primitives; this finding concerns boundary placement, not an unvalidated payload, type assertion bypass or observed corrupt value.

- `src/domains/portfolio/features/wealth/helpers/mappers/mapAnnualIncomeSavings/mapAnnualIncomeSavings.ts:4` (`mapAnnualIncomeSavings`) — src/domains/portfolio/features/wealth/apis/queries/useGetAnnualIncomeSavingsQuery.ts:4, src/domains/portfolio/features/wealth/helpers/mappers/mapAnnualIncomeSavings/mapAnnualIncomeSavings.test.ts:4
- `src/domains/portfolio/shared/helpers/mappers/mapFundHolding.ts:7` (`mapFundHolding`) — src/domains/portfolio/shared/apis/queries/useGetFundHoldingsQuery.ts:9
- `src/domains/portfolio/shared/helpers/mappers/mapFundHoldingStatus.ts:7` (`mapFundHoldingStatus`) — src/domains/portfolio/shared/apis/queries/useGetFundHoldingsQuery.ts:10
- `src/domains/portfolio/shared/helpers/mappers/mapSavingCapacity.ts:5` (`mapSavingCapacity`) — src/domains/portfolio/shared/apis/queries/useGetSavingCapacityQuery.ts:14, src/domains/portfolio/shared/helpers/aggregators/aggregateSavingCapacity.test.ts:4

### Why this matters

The external response shape leaks into a downstream helper signature and makes the API contract span helper modules. A direct transformers rename would keep the transport dependency outside its specified owner.

### Alternatives considered

Keep pure wire mappers in transformers: forbidden by the explicit API-adaptation clause, despite being side-effect-free. Move field adaptation into typed API response transformations (recommended): the API emits the final entity. Keep independently useful sorting/aggregation as pure transformers called with final entities; moving real business aggregation into Yup solely because it shares a mapper file would be the opposite mistake.

### Proposed corrective plan

P-004 composes typed final-entity schemas/adapters within owning apis/schemas and updates CSV/query consumers. Preserve mapFundHolding's issuer fallback, historical composition metadata, status parent-ID fallback, annual ordering/invalid-year policy and savings-account aggregation. Do not rename every strict Raw-prefixed entity or erase useful domain types merely because of its name.

### Decision or clarification required

None: API wire adaptation has an explicit owner. Schema composition details may be selected during implementation without changing the accepted domain values.

### Acceptance and prevention

Final API outputs compile against FundHolding/FundHoldingStatus/SavingCapacityPoint/AnnualIncomeSavingsPoint without assertions. Existing CSV/network/mapper edge tests remain meaningful and are moved/adapted to the owning API boundary. Invalid/nullable/unknown-field payloads verify both validation and mapping. Type-only schema inference alone does not prove business purity; no broad rule banning all inferred schema types is proposed.

## F-005 — 165 production files use retired helper categories
- Kind: violation
- Rule IDs and actual impact: [helpers-categories](../../../../.agents/skills/generic-react-best-practices/rules/helpers-categories.md) — MEDIUM-HIGH.
- Affected files, symbols and callers: every current location and all resolved direct consumers are in the [165-file migration ledger](evidence/migration-ledger.md) and [machine-readable ledger](evidence/migration-ledger.json).
- Proposed action: fix
- Plan actions and related code decision identifiers: P-005 after responsibility-specific prerequisites P-001/P-002/P-004.

### Requirement and evidence

The frozen contract permits exactly transformers, formatters and presenters, explicitly rejecting the former category names without compatibility aliases. E-001 (`npm run lint -- --no-cache`) exits 1 with 165 error-level local/helper-module-contract category diagnostics. All 165 affected production paths were compared with the explicit retired-category list; tests/support/constants remain attached to their actual owner. Category counts: calculators 42, mappers 31, selectors 26, filters 23, aggregators 18, businessRules 13, quality 12. Existing formatter/presenter categories do not produce these errors. C-01 proves rejection and C-02 proves acceptance through the effective configuration.

### Why this matters

The real project lint gate fails, including audit:i18n's preliminary quiet lint. Keeping the old paths also makes the advertised three-category contract unreliable. These are one recurring migration family, not 165 unrelated design decisions.

### Alternatives considered

Keep old names or add aliases/disable the detector: violates the frozen contract. Rename everything to transformers: incorrect for the proven acquisition, presentation and wire-adaptation subfamilies. Classify by contract, address those subfamilies and coordinate the remaining pure/support moves (recommended): conforms without changing business outcomes or increasing the warning ceiling.

### Proposed corrective plan

P-005 applies the migration ledger, moves support contracts/constants/colocated tests together, updates static/type/reexport/literal dynamic imports and adjusts integration fixtures that intentionally mention paths. No compatibility barrel or global warning suppression. Resolve newly exposed equivalent canonical helper diagnostics under the same plan, rather than treating the initial category diagnostic as the entire semantic problem.

### Decision or clarification required

None: the category registry and owning-responsibility rules select the permitted targets. No user approval to weaken the policy is inferred.

### Acceptance and prevention

No retired production helper folder remains; all resolved callers compile; expected errors are zero, warning ceiling remains at or below the existing 143 with explicit reconciliation if an exception disappears. Full lint/typecheck/tests/build/Storybook/catalog/format checks pass. Existing generic helper registry and invalid/valid integration tests already provide deterministic prevention; no new preference or bespoke category allowlist is warranted.


## F-007 — CI omits the committed Prettier gate
- Kind: prevention-gap
- Rule IDs and actual impact: [quality-formatting-and-sorting](../../../../.agents/skills/generic-react-best-practices/rules/quality-formatting-and-sorting.md) — LOW.
- Affected files, symbols and callers: repository `.github/workflows/ci.yml:57`, dashboard job; `packages/dashboard/package.json:format:check` and committed Prettier/editor policy.
- Proposed action: fix
- Plan actions and related code decision identifiers: P-007.

### Requirement and evidence

The formatting rule requires locally pinned formatting policy/tools and the same layout/sorting responsibilities in CI. The dashboard CI job invokes npm run lint, npm test and npm run build, but no Prettier check. npm run lint runs ESLint sorting and the warning-budget gate; it does not check Prettier layout. package.json already exposes format:check as prettier --check . && npm run lint. The direct baseline Prettier check passes, so this is a prevention gap rather than evidence of currently misformatted source. CI workflow hashes are in supplemental-ci-inputs.json, added as an explicit supporting-input delta.

### Why this matters

A future layout-only regression can pass the configured dashboard CI checks even when the documented local format:check rejects it. No current formatting failure or remote CI run is alleged.

### Alternatives considered

Keep lint alone: covers sorting, not layout. Replace the dashboard lint command with the existing npm run format:check (recommended): covers both with the same warning ceiling and no second ESLint run. Add a separate prettier check: also conforming, but duplicates command wiring already owned by package.json. These are equivalent gate arrangements, not materially different product choices.

### Proposed corrective plan

P-007 replaces the dashboard lint step's command with npm run format:check and updates its name. Keep tests/build and dependency installation unchanged. No new formatter package, sorter or warning allowance.

### Decision or clarification required

None; the application already owns the combined gate. Implementation is not authorized by the audit-only request.

### Acceptance and prevention

The workflow calls the existing combined script. A temporary malformed/valid formatting pair is rejected/accepted by the pinned formatter, while the normal lint budget remains visible. This strengthens CI wiring, not the rule catalog. Full gates after the source correction plan must pass.

## F-008 — HTML bootstrap duplicates theme colors outside the token owner
- Kind: violation
- Rule IDs and actual impact: [ui-semantic-colors](../../../../.agents/skills/generic-react-best-practices/rules/ui-semantic-colors.md) — HIGH.
- Affected files, symbols and callers: `index.html:8` initial theme-color meta; `index.html:27` bootstrap setAttribute; canonical `src/shared/theme/pageThemeColors.ts:1`; `src/app/services/theme/useDashboardThemeSync.ts:15` already consumes the canonical map.
- Proposed action: fix
- Plan actions and related code decision identifiers: P-008; `prepaint-theme-token-source`.

### Requirement and evidence

The semantic-color rule explicitly includes browser theme-color metadata and imperative content assignments. Concrete values belong in dedicated theme/token definitions. index.html contains #f9fafb in the initial meta and #111827/#f9fafb in its inline bootstrap branch, duplicating PAGE_THEME_COLORS. index.html is neither a theme definition nor a mandated brand asset; the declared asset exception does not apply. React-side synchronization already imports the token map. The values currently agree, so no observed theme mismatch is alleged.

E-012/C-06 rejects the equivalent hardcoded meta assignment in a matched TypeScript file at the intended error-level local/no-hardcoded-colors rule; C-07 accepts PAGE_THEME_COLORS. html-eslint-scope.json proves index.html has no matching ESLint config, explaining the silent gap. This is distinct from the 165 lint-reported category failures.

### Why this matters

Theme-token changes can update React synchronization while leaving the first browser/UI metadata value stale. Inference: bootstrap/paint timing would determine which theme color is briefly displayed. The token's source of truth is already present and should supply both phases.

### Alternatives considered

Keep inline duplicated literals: contradicts central semantic tokens. Generate the prepaint script and initial meta value from the canonical typed map (recommended): preserves synchronous bootstrap behavior while owning values once. Move all initialization into a deferred React effect: removes duplication but risks changing first-paint behavior and does not satisfy the existing bootstrap purpose. An early compiled module consuming the same map is also technically possible if its timing is shown to preserve that behavior; select equivalent build wiring during implementation, not a new color palette.

### Proposed corrective plan

P-008 keeps PAGE_THEME_COLORS as the concrete-value owner and feeds the prepaint bootstrap/meta from it through a small build-time HTML transform or an equivalently early typed bootstrap. Preserve storage-key migration, unavailable storage, system preference, light/dark choice and first-paint timing. Keep business-domain code out of generic tokens. Add one code-local decision at the bootstrap owner describing the early timing and canonical source.

### Decision or clarification required

None about colors or visible behavior: reuse the current tokens and preserve prepaint semantics. This does not authorize a theme redesign or removal of storage compatibility.

### Acceptance and prevention

No authored HTML/bootstrap copy of concrete theme-color values remains outside the token definition. Both theme branches, no/invalid/unavailable storage and legacy preference migration continue to select the same theme. A generated-HTML/boot behavior regression should demonstrate that changing the canonical token changes both initial and synchronized metadata; do not assert private CSS classes. Existing TS color checks protect extracted code. No application-specific literal allowlist or broad HTML lint migration is needed for this bounded correction.

### Implementation evidence (2026-10-30)

The original finding IDs and proofs above remain historical evidence; their corrections and prevention are verified in plan.md, with no pending decision. [Affected-code/caller review](evidence/phase2-semantic-review.md) explains the final ownership and behavior.

| Finding | Plan outcome / actual owner | Acceptance evidence |
| --- | --- | --- |
| F-006 | P-006; MiniDonut.view, AssetIrrResults.view, OverviewPeriodFilter.view | I-001/I-002/I-003/I-004; three code decisions |
| F-001 | P-003; DashboardSources + DashboardSourceBoundary; typed cache observers in domain API/app service | I-003 concurrent starts, preserved shell controls and source-error/404 cases; I-004/I-009 lazy chunks |
| F-002 | P-002; seven source wrappers in owning services | I-001/I-002/I-003; feature-source-acquisition |
| F-003 | P-001; display-owner presenters, common account-data transformers, provider-aware translation hooks | I-001/I-002/I-003; account-scope-data-and-labels |
| F-004 | P-004; typed API response schemas, private historical wire validation | I-002/I-003/I-008; shared-historical-fund-response |
| F-005 | P-005; all 165 ledger entries normalized with callers | I-001–I-006/I-009; 141 unchanged pure/support bodies |
| F-007 | P-007; CI format:check step | I-001/I-007; valid/invalid pinned formatter evidence |
| F-008 | P-008; themeHtmlPlugin.ts + Vite HTML integration | I-002/I-003/I-004; ten bootstrap cases, prepaint-theme-token-source |
