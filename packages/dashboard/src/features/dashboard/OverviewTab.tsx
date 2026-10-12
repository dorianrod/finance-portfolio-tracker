import type { PortfolioHistoryPoint } from '@/types/history'
import type { ConcentrationSummary, IncomeSummary, PerformanceSummary, PeriodDrivers } from '@/features/portfolio-charts/portfolioCharts.logic'
import { EvolutionChart } from '@/features/portfolio-charts/EvolutionChart'
import { SummaryKpis } from './SummaryKpis'
import { VariationCard } from './VariationCard'
import { SEMANTIC_TEXT_CLASSES } from '@/shared/format/semanticColors'
import type { IrrStatus } from '@/types/history'

interface OverviewTabProps {
  history: PortfolioHistoryPoint[]
  performance: PerformanceSummary
  drivers: PeriodDrivers
  income: IncomeSummary
  concentration: ConcentrationSummary
  globalTri: number | null
  irrStatus: IrrStatus
  irrScopeLabel?: string
  periodLabel: string
  anomalyCount: number
  unallocatedPct: number | null
  onNavigate: (target: 'performance' | 'allocation' | 'quality') => void
}

export function OverviewTab({
  history, performance, drivers, income, concentration, globalTri, irrStatus, irrScopeLabel, periodLabel,
  anomalyCount, unallocatedPct, onNavigate,
}: OverviewTabProps) {
  return (
    <div className="mb-6 space-y-4">
      <SummaryKpis performance={performance} drivers={drivers} income={income} globalTri={globalTri} irrStatus={irrStatus} irrScopeLabel={irrScopeLabel} periodLabel={periodLabel} />
      <VariationCard drivers={drivers} concentration={concentration} periodLabel={periodLabel} />
      {history.length > 0 && <EvolutionChart history={history} title="Portfolio trajectory" height={260} />}
      <section className="rounded-xl border border-gray-800 bg-gray-900 p-4">
        <div className="mb-3 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-sm font-medium text-gray-300">Points to review</h2>
            <p className="mt-0.5 text-xs text-gray-600">Signals worth opening in the detailed analyses.</p>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <button type="button" onClick={() => onNavigate('performance')} className="rounded-lg border border-gray-800 bg-gray-950/40 p-3 text-left transition-colors hover:border-gray-700">
            <div className="text-xs text-gray-500">Market performance</div>
            <div className={`mt-1 text-base font-semibold ${drivers.performance >= 0 ? SEMANTIC_TEXT_CLASSES.performancePositive : SEMANTIC_TEXT_CLASSES.performanceNegative}`}>{drivers.performance >= 0 ? 'Positive' : 'Negative'}</div>
            <div className="mt-1 text-xs text-gray-600">Open performance analysis</div>
          </button>
          <button type="button" onClick={() => onNavigate('allocation')} className="rounded-lg border border-gray-800 bg-gray-950/40 p-3 text-left transition-colors hover:border-gray-700">
            <div className="text-xs text-gray-500">Allocation coverage</div>
            <div className="mt-1 text-base font-semibold text-white">{unallocatedPct == null ? 'Loading…' : `${unallocatedPct.toFixed(0)}% undocumented`}</div>
            <div className="mt-1 text-xs text-gray-600">Open allocation analysis</div>
          </button>
          <button type="button" onClick={() => onNavigate('quality')} className="rounded-lg border border-gray-800 bg-gray-950/40 p-3 text-left transition-colors hover:border-gray-700">
            <div className="text-xs text-gray-500">Data quality</div>
            <div className={`mt-1 text-base font-semibold ${anomalyCount > 0 ? SEMANTIC_TEXT_CLASSES.warning : SEMANTIC_TEXT_CLASSES.coverage}`}>{anomalyCount > 0 ? `${anomalyCount} item${anomalyCount > 1 ? 's' : ''}` : 'No anomaly'}</div>
            <div className="mt-1 text-xs text-gray-600">Open quality controls</div>
          </button>
        </div>
      </section>
    </div>
  )
}
