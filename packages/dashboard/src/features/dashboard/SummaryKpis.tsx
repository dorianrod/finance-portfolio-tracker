import type { IncomeSummary, PerformanceSummary, PeriodDrivers } from '@/features/portfolio-charts/portfolioCharts.logic'
import { KpiCard } from '@/features/kpis/Kpi'
import {
  IrrSinceTrackingKpi,
  NetContributionsKpi,
  NetPortfolioValueKpi,
  PassiveIncomeKpi,
  TotalNetPerformanceKpi,
} from '@/features/kpis/PortfolioKpis'

interface SummaryKpisProps {
  performance: PerformanceSummary
  drivers: PeriodDrivers
  income: IncomeSummary
  globalTri: number | null
  periodLabel: string
}

export function SummaryKpis({ performance, drivers, income, globalTri, periodLabel }: SummaryKpisProps) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
      <KpiCard><NetPortfolioValueKpi performance={performance} /></KpiCard>
      <KpiCard><TotalNetPerformanceKpi performance={performance} /></KpiCard>
      <KpiCard><NetContributionsKpi value={drivers.savings} periodLabel={periodLabel} /></KpiCard>
      <KpiCard><PassiveIncomeKpi income={income} /></KpiCard>
      <KpiCard><IrrSinceTrackingKpi value={globalTri} /></KpiCard>
    </div>
  )
}
