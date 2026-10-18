import type { PortfolioHistoryPoint } from '@/types/history'
import type { ConcentrationSummary, IncomeSummary, PerformanceSummary, PeriodDrivers } from '@/features/portfolio-charts/portfolioCharts.logic'
import { EvolutionChart } from '@/features/portfolio-charts/EvolutionChart'
import { SummaryKpis } from './SummaryKpis'
import { VariationCard } from './VariationCard'
import type { IrrStatus } from '@/types/history'

interface OverviewTabProps {
  history: PortfolioHistoryPoint[]
  performance: PerformanceSummary
  drivers: PeriodDrivers
  income: IncomeSummary
  heldAssetConcentration: ConcentrationSummary
  lookThroughConcentration: ConcentrationSummary
  globalTri: number | null
  irrStatus: IrrStatus
  irrScopeLabel?: string
  periodLabel: string
}

export function OverviewTab({
  history, performance, drivers, income, heldAssetConcentration, lookThroughConcentration, globalTri, irrStatus, irrScopeLabel, periodLabel,
}: OverviewTabProps) {
  return (
    <div className="mb-6 space-y-4">
      <SummaryKpis performance={performance} drivers={drivers} income={income} globalTri={globalTri} irrStatus={irrStatus} irrScopeLabel={irrScopeLabel} periodLabel={periodLabel} />
      <VariationCard drivers={drivers} heldAssetConcentration={heldAssetConcentration} lookThroughConcentration={lookThroughConcentration} periodLabel={periodLabel} />
      {history.length > 0 && <EvolutionChart history={history} title="Portfolio trajectory" height={260} />}
    </div>
  )
}
