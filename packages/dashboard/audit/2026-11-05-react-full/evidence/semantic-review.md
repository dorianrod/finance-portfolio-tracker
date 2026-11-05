# Semantic review

The application capability map and 105 feature boundary dispositions are retained in component-review.json. Conventional direct data/control APIs stay with their owning feature/view; no alternate conforming folder hierarchy is imposed.

Architecture candidates: App owns persistent shell composition; PrimaryTabButton owns navigation intent/preload; DashboardPanel owns retained lifecycle/error composition; DataQualityTab composes selected assessment and inspection surfaces; AllocationTrendView composes dimension features; FundPositionHoldingRow owns the derived exposure (F-002); PerformanceTab owns return/source/contribution coordination; AccountTreeSelect owns selection decisions; WealthTab composes financial chart capabilities. Substantial JSX is not itself proof that an extra mirror view is useful. Existing chart/card/table views provide the actual independent display contracts.

All 32 support-contract candidates belong to their explicit owning input/output, UI payload or sub-shape: diagnostics row/filter; combined reliability input; scoped fund quality and percentages; manual-price props; concentration tooltip payloads; virtual exposure geometry; buy/sell dot and hover series/rolling return; group totals/status indexes; overview period/windows/comparison/history sub-shapes; IRR KPI/account selector props; account tooltip and label geometry; year label layout; scope badges; account-filter rows; validated savings aggregation rows; historical snapshot metadata. None is an unrelated reusable entity hidden beside a helper.

Required-source queries remain coordinated independently in sibling Suspense consumers and cached observations. JSON request/response schemas preserve the external validation boundary; worker fetch/parse/schema transformation moves large fund history work off the main thread. Row-level 404 optional CSV behavior and required-source missing-data classification differ intentionally. Placeholder history and asset-IRR consumers expose calculating/unavailable states instead of treating old-key results as current scope.

Primitive contracts use generic labels/tones/geometry; global shared production vocabulary scan finds euro-formatting infrastructure but no portfolio-specific primitive state/branches. Currency formatting remains configurable generic infrastructure, not a primitive that interprets a business asset. Domain chart tone mapping owns business semantics. Controls strip raw accessibility wiring; direct label associations, focus/Tab/Shift+Tab, outside dismissal then keyboard reopen/Escape, unavailable targets, caller cancellation and Activity hide cleanup are exercised in real primitive tests. Chart geometry, DOM measurement stubs and external-library contracts remain explicit boundary concerns.

Canonical nullability comments were inventoried/read; domain dates are parsed Date values while month keys identify technical buckets. F-002 is a proven mismatch between a declared nullable valuation and one display calculation, not permission to ban every numeric reducer identity. Other numeric defaults in accumulators, unavailable chart geometry or explicit aggregation policy are not this monetary-display defect.

Formatter inventory covers nullable entity/date/number inputs, configurable fallback, text-only output and stable callbacks; labels, classifications, structured diagnostics and visual tones remain distinguished. Input mutation search finds no production sort/reverse/splice; examined Map/Set writers mutate fresh indexes/accumulators. Indexed fund/status/source lookups preserve duplicate/source-order policy. Tiny selector/tooltip arrays do not justify new caches.

Fixture review: the 25 explicit candidate decisions are scenario commands, policy configurations or raw network payloads; owning fixtures supply complete domain baselines. Type assertions, live fixture clocks and random generators are checked separately. No internal module mocking is present; console/storage/DOM/network observers are actual environment boundaries. Legacy absent sibling tests are not retroactively classified as newly introduced owners.

Current decision owners (retained; no factual reopening trigger):

- `src/domains/portfolio/features/overview/helpers/transformers/buildOverviewComparison/buildOverviewComparison.ts` — `overview-concentration-at-comparison-dates`.
- `src/domains/portfolio/features/holdings/features/fund-look-through/components/FundHoldingsExplorer/services/useFundExposureViewModel.ts` — `exposure-aggregation-independent-of-disclosure`.
- `src/domains/portfolio/features/holdings/features/fund-look-through/helpers/transformers/issuerExposures/createCanonicalIssuerResolver.ts` — `canonical-issuer-prefix-index`.
- `src/domains/portfolio/features/wealth/services/useAccountTypeHistory.ts` — `feature-source-acquisition`.
- `src/domains/portfolio/features/data-quality/features/assessment/pages/DataQualityTab/helpers/presenters/useBuildDataQualityViewModel.ts` — `data-quality-assessment-before-presentation`.
- `src/domains/portfolio/features/data-quality/shared/helpers/transformers/countPipelineIssues.ts` — `pipeline-severity-counts`.
- `src/domains/portfolio/shared/services/useFilterScopeContext.ts` — `direct-filter-scope-inputs`.
- `src/domains/portfolio/shared/apis/queries/useGetPortfolioSourcesQuery.ts` — `required-portfolio-source-batch`.
- `src/domains/portfolio/shared/apis/queries/portfolioSourceQueries/portfolioFundHoldingsQueryOptions.ts` — `fund-source-background-validation`.
- `src/domains/portfolio/shared/apis/schemas/historicalFundHoldingSchema.ts` — `shared-historical-fund-response`.
- `src/domains/portfolio/shared/helpers/transformers/portfolioFilters/useBuildAccountFilterLabels.ts` — `account-scope-data-and-labels`.
- `src/app/services/useDashboardViewModel.ts` — `dashboard-models-at-consumers`.
- `src/shared/ui/ChartViewport.view.tsx` — `chart-viewport-mounting`.
- `src/domains/portfolio/features/overview/pages/OverviewPeriodFilter/OverviewPeriodFilter.feature.tsx` — `comparison-period-control`.
- `src/domains/portfolio/features/holdings/features/positions/components/MiniDonut/MiniDonut.feature.tsx` — `prepared-allocation-chart`.
- `src/domains/portfolio/features/performance/components/performanceContributionCard/AssetIrrView.feature.tsx` — `prepared-asset-irr-results`.
- `src/domains/portfolio/features/wealth/components/AccountTypeBreakdownChart/AccountTypeBreakdownChart.feature.tsx` — `prepared-account-type-breakdown`.
- `src/domains/portfolio/features/wealth/components/AccountTypeHistoryChart/AccountTypeHistoryChart.feature.tsx` — `prepared-account-type-history`.
- `src/domains/portfolio/features/wealth/components/EvolutionChart/EvolutionChart.feature.tsx` — `prepared-evolution-metrics`.
- `src/app/DashboardHeader.feature.tsx` — `header-independent-of-navigation`.
- `src/app/DashboardPanel.feature.tsx` — `visited-dashboard-panels`.
- `src/app/DashboardSources.feature.tsx` — `persistent-dashboard-query-boundary`.
- `src/app/DashboardReliability.feature.tsx` — `reliability-single-model-consumer`.
- `themeHtmlPlugin.ts` — `prepaint-theme-token-source`.

The existing memo/Activity/source-ownership decisions remain consistent with current callers. This audit revalidates their structural assumptions and existing behavior tests; it does not repeat earlier production profiling or assert new timing improvements. F-001/F-002 are the only proven violation families; F-003 is deterministic prevention.
