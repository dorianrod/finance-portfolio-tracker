import type { AnalysisTab } from '@/domains/portfolio/pages/dashboard/stores/dashboardNavigation.atoms'

export const DASHBOARD_TAB_LOADERS = {
  overview: () => import('@/domains/portfolio/pages/OverviewTab.feature').then((module) => ({ default: module.OverviewTab })),
  wealth: () => import('@/domains/portfolio/pages/WealthTab.feature').then((module) => ({ default: module.WealthTab })),
  performance: () => import('@/domains/portfolio/pages/PerformanceTab.feature').then((module) => ({ default: module.PerformanceTab })),
  allocation: () => import('@/domains/portfolio/components/allocation-charts/AllocationCharts.feature').then((module) => ({ default: module.AllocationCharts })),
  holdings: () => import('@/domains/portfolio/components/positions-table/PositionsTable.feature').then((module) => ({ default: module.PositionsTable })),
  quality: () => import('@/domains/portfolio/pages/DataQualityTab.feature').then((module) => ({ default: module.DataQualityTab })),
  fundLookThrough: () => import('@/domains/portfolio/components/fund-holdings/FundLookThroughTab.feature').then((module) => ({ default: module.FundLookThroughTab })),
}

export function preloadDashboardTab(tab: AnalysisTab) {
  void DASHBOARD_TAB_LOADERS[tab]()
}
