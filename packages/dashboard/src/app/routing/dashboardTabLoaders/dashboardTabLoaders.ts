export const DASHBOARD_TAB_LOADERS = {
  overview: () =>
    import('@/domains/portfolio/features/overview/pages/OverviewTab.feature').then(
      (module) => ({ default: module.OverviewTab }),
    ),
  wealth: () =>
    import('@/domains/portfolio/features/wealth/pages/WealthTab.feature').then(
      (module) => ({ default: module.WealthTab }),
    ),
  performance: () =>
    import('@/domains/portfolio/features/performance/pages/PerformanceTab.feature').then(
      (module) => ({ default: module.PerformanceTab }),
    ),
  diversification: () =>
    import('@/app/DashboardDiversification.feature').then((module) => ({
      default: module.DiversificationCharts,
    })),
  holdings: () =>
    import('@/domains/portfolio/features/holdings/features/positions/components/PositionsTable/PositionsTable.feature').then(
      (module) => ({ default: module.PositionsTable }),
    ),
  quality: () =>
    import('@/app/DashboardDataQuality.feature').then((module) => ({
      default: module.DashboardDataQuality,
    })),
  fundLookThrough: () =>
    import('@/domains/portfolio/features/holdings/features/fund-look-through/components/FundLookThroughTab.feature').then(
      (module) => ({ default: module.FundLookThroughTab }),
    ),
}
