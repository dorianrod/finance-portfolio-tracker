# Audit coverage

## File review

| src/domains/portfolio/features/data-quality/features/assessment/components/reliability/analysisReliabilityKpi/AnalysisReliabilityKpi.feature.tsx | arch-no-prop-drilling; quality-eslint-disable-scoped | Original directives and raw inputs/receiving ownership inspected | manually reviewed |
| src/domains/portfolio/features/data-quality/features/assessment/components/reliability/analysisReliabilityKpi/PipelineReliabilityKpi.feature.tsx | arch-no-prop-drilling; quality-eslint-disable-scoped | Original directives and raw inputs/receiving ownership inspected | manually reviewed |
| src/domains/portfolio/features/diversification/features/allocation/components/DonutCard.feature.tsx | arch-no-prop-drilling; quality-eslint-disable-scoped | Original directives and raw inputs/receiving ownership inspected | manually reviewed |
| src/domains/portfolio/features/diversification/features/allocation/components/EvoCard/EvoCard.feature.tsx | arch-no-prop-drilling; quality-eslint-disable-scoped | Original directives and raw inputs/receiving ownership inspected | manually reviewed |
| src/domains/portfolio/features/holdings/features/positions/components/positionColumnCells/PositionBreakdownCell.feature.tsx | arch-no-prop-drilling; quality-eslint-disable-scoped | Original directives and raw inputs/receiving ownership inspected | manually reviewed |
| src/domains/portfolio/features/overview/pages/OverviewSummaryCards.feature.tsx | arch-no-prop-drilling; quality-eslint-disable-scoped | Original directives and raw inputs/receiving ownership inspected | manually reviewed |
| src/domains/portfolio/features/overview/pages/overviewCharts/OverviewConcentrationChart.feature.tsx | arch-no-prop-drilling; quality-eslint-disable-scoped | Original directives and raw inputs/receiving ownership inspected | manually reviewed |
| src/domains/portfolio/features/performance/components/performanceContributionCard/AssetIrrView.feature.tsx | arch-no-prop-drilling; quality-eslint-disable-scoped | Original directives and raw inputs/receiving ownership inspected | manually reviewed |
| src/domains/portfolio/features/performance/components/performanceContributionCard/PerformanceContributionCard.feature.tsx | arch-no-prop-drilling; quality-eslint-disable-scoped | Original directives and raw inputs/receiving ownership inspected | manually reviewed |
| src/domains/portfolio/features/performance/pages/PerformanceTab.feature.tsx | arch-no-prop-drilling; quality-eslint-disable-scoped | Original directives and raw inputs/receiving ownership inspected | manually reviewed |
| src/domains/portfolio/features/scope-selection/components/accountTreeSelect/AccountTree.feature.tsx | arch-no-prop-drilling; quality-eslint-disable-scoped | Original directives and raw inputs/receiving ownership inspected | manually reviewed |
| src/domains/portfolio/features/scope-selection/components/accountTreeSelect/AccountTreeSelect.feature.tsx | arch-no-prop-drilling; quality-eslint-disable-scoped | Original directives and raw inputs/receiving ownership inspected | manually reviewed |

## Rule review

arch-no-prop-drilling: all 29 directives, intermediate components, actual targets and callers inspected; existing detector catches all lifted cases. quality-eslint-disable-scoped: existing descriptions explain current arrangements but omit why compliant composition is impossible. Explicit user revalidation request supersedes earlier historical allowances. Rule prevention is already active at error severity; keep it unchanged and remove exemptions.

## Existing decisions and ignores

Consulted latest three scopes: 2026-11-02-react-full-2, 2026-11-02-react-full, 2026-10-31-react-full. Matching findings/plans do not revalidate these exceptions. Preserve November 2 translated reliability labels and prepared asset IRR ranking ownership (444f8b4 and source prepared-asset-irr-results decision). The user explicitly requests revisiting the October 27 forwarding exceptions; composition can remove them without moving server state into atoms or coupling pickers to dashboard queries. Relevant Git history and clean diffs checked before corrections. Existing unrelated ignores are not revalidated.

## Pending inspection

Phase 1: none. Phase 2: none; affected boundaries/callers and all seven new runtime owners reviewed and verified.

## Phase-2 additions and affected contracts

[Final authored delta](evidence/implementation-files.json) includes every affected source/test/configuration path. All seven introduced runtime owners have sibling behavior tests and fresh colocation checks with zero missing or pending. The derived FilterScopeContext type is not a runtime owner. Three old feature paths are removed: compact KPI wrapper, underlying-status wrapper and feature MetricLabel. MetricLabel's new view has a changed contract and is treated as introduced rather than inheriting a move exemption.

- AccountSelectionRows.view: supplied flags/labels, per-account callbacks, both visual variants; no business imports or shared-state reads.
- AllocationPositionsToggle.feature: direct scoped atom subscriptions, matching dimension visibility, focused action hook; no drilled state.
- OverviewCardShell.view: supplied presentation and onOpen; tooltip actions preserve navigation isolation.
- MetricLabel.view: supplied scope inputs, tooltip content and label; no business providers.
- FilterScopePresentation.view: read-only presenter/formatters from its owning component folder, raw input data supplied by its caller; date precedence retained.
- useFilterScopeContext: raw filter/label subscriptions only, no presentation dependencies or effects; fresh provider store in tests.
- getTrailingThreeYearIrr: immutable read-only history input and explicit null fallback; zero/negative/latest/empty/unavailable cases.

Manual re-review covers every changed component's role, raw versus prepared contracts, mapped JSX delegation, direct compound slots, query ownership (no copying into atoms), and navigation/preview behavior. TypeScript/lint verify affected callers. Current colocation output is local supplementary evidence at evidence/colocation-final.json. Tests and final full checks are complete in verification.md.

## Final reconciliation

The frozen 12-file/29-directive inventory is unchanged. All 29 ledger entries are corrected without exception; all seven new runtime owners satisfy the recorded obligations and have sibling tests. Full lint, type/build, application/tool tests, formatting and fixture review pass. No inspection or user approval remains pending.
