import type { IncomeSummary, PerformanceSummary, PeriodDrivers } from '@/features/portfolio-charts/portfolioCharts.logic'
import type { IrrStatus } from '@/types/history'
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
  irrStatus: IrrStatus
  irrScopeLabel?: string
  periodLabel: string
}

export function SummaryKpis({ performance, drivers, income, globalTri, irrStatus, irrScopeLabel, periodLabel }: SummaryKpisProps) {
  return (
    <div className="flex flex-wrap items-start gap-x-8 gap-y-4 border-b border-gray-800 pb-4">
      <KpiCard><NetPortfolioValueKpi performance={performance} /></KpiCard>
      <KpiCard><TotalNetPerformanceKpi performance={performance} /></KpiCard>
      <KpiCard><NetContributionsKpi value={drivers.savings} periodLabel={periodLabel} /></KpiCard>
      <KpiCard><PassiveIncomeKpi income={income} /></KpiCard>
      <KpiCard><IrrSinceTrackingKpi value={globalTri} status={irrStatus} scopeLabel={irrScopeLabel} /></KpiCard>
    </div>
  )
}
