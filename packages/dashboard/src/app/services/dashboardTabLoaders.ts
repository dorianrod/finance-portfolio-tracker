import type { AnalysisTab } from '@/domains/portfolio/shared/stores/dashboardNavigation.atoms'

export const DASHBOARD_TAB_LOADERS = {
  overview: () => import('@/domains/portfolio/features/overview/pages/OverviewTab.feature').then((module) => ({ default: module.OverviewTab })),
  wealth: () => import('@/domains/portfolio/features/wealth/pages/WealthTab.feature').then((module) => ({ default: module.WealthTab })),
  performance: () => import('@/domains/portfolio/features/performance/pages/PerformanceTab.feature').then((module) => ({ default: module.PerformanceTab })),
  allocation: () => import('@/domains/portfolio/features/allocation/components/AllocationCharts.feature').then((module) => ({ default: module.AllocationCharts })),
  holdings: () => import('@/domains/portfolio/features/holdings/features/positions/components/PositionsTable.feature').then((module) => ({ default: module.PositionsTable })),
  quality: () => import('@/domains/portfolio/features/data-quality/pages/DataQualityTab.feature').then((module) => ({ default: module.DataQualityTab })),
  fundLookThrough: () => import('@/domains/portfolio/features/holdings/features/fund-look-through/components/FundLookThroughTab.feature').then((module) => ({ default: module.FundLookThroughTab })),
}

export function preloadDashboardTab(tab: AnalysisTab) {
  void DASHBOARD_TAB_LOADERS[tab]()
}
