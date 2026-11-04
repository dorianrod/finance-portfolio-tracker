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
    import('@/domains/portfolio/features/performance/pages/PerformancePage.feature').then(
      (module) => ({ default: module.PerformancePage }),
    ),
  diversification: () =>
    import('@/app/DashboardDiversification.feature').then((module) => ({
      default: module.DiversificationCharts,
    })),
  holdings: () =>
    import('@/domains/portfolio/features/holdings/features/positions/pages/PositionsPage.feature').then(
      (module) => ({ default: module.PositionsPage }),
    ),
  quality: () =>
    import('@/app/DashboardDataQuality.feature').then((module) => ({
      default: module.DashboardDataQuality,
    })),
  fundLookThrough: () =>
    import('@/domains/portfolio/features/holdings/features/fund-look-through/pages/FundLookThroughPage.feature').then(
      (module) => ({ default: module.FundLookThroughPage }),
    ),
}
