import type { PortfolioHistoryPoint } from '@/types/history'
import type { PassiveIncomePoint } from '@/hooks/usePassiveIncome'
import type { PositionRow } from '@/types/domain'
import type { IncomeSummary, PerformanceSummary } from '@/features/portfolio-charts/portfolioCharts.logic'
import { computeTopPerformers } from '@/features/portfolio-charts/portfolioCharts.logic'
import {
  IrrSinceTrackingKpi,
  NetRealizedKpi,
  NetUnrealizedKpi,
  PassiveIncomeKpi,
  TotalNetPerformanceKpi,
  TrailingThreeYearIrrKpi,
} from '@/features/kpis/PortfolioKpis'
import { PassiveIncomeChart } from '@/features/portfolio-charts/PassiveIncomeChart'
import { TopPerformersChart } from '@/features/portfolio-charts/TopPerformersChart'
import { TriChart } from '@/features/portfolio-charts/TriChart'
import { UnrealizedPnlChart } from '@/features/portfolio-charts/UnrealizedPnlChart'

export function PerformanceTab({ history, passiveIncome, positions, performance, income, globalTri }: {
  history: PortfolioHistoryPoint[]
  passiveIncome: PassiveIncomePoint[]
  positions: PositionRow[]
  performance: PerformanceSummary
  income: IncomeSummary
  globalTri: number | null
}) {
  const performers = computeTopPerformers(positions)
  const rollingTri3y = history[history.length - 1]?.tri_rolling_3y ?? null

  return (
    <div className="mb-6 space-y-4">
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <section className="rounded-xl border border-gray-800 bg-gray-900 p-4">
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-gray-400">Performance</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <TotalNetPerformanceKpi performance={performance} />
            <NetUnrealizedKpi performance={performance} />
            <NetRealizedKpi performance={performance} />
          </div>
        </section>

        <section className="rounded-xl border border-gray-800 bg-gray-900 p-4">
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-gray-400">Returns &amp; passive income</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <PassiveIncomeKpi income={income} />
            <IrrSinceTrackingKpi value={globalTri} />
            <TrailingThreeYearIrrKpi value={rollingTri3y} />
          </div>
        </section>
      </div>
      {(history.length > 0 || passiveIncome.length > 0) && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {history.length > 0 && <UnrealizedPnlChart history={history} />}
          {history.length > 0 && <TriChart history={history} />}
          {passiveIncome.length > 0 && (
            <div className="lg:col-span-2">
              <PassiveIncomeChart data={passiveIncome} />
            </div>
          )}
        </div>
      )}
      {performers.length > 0 && <TopPerformersChart data={performers} height={Math.max(260, performers.length * 26)} />}
    </div>
  )
}
