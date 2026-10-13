import { useMemo } from 'react'
import type { PortfolioHistoryPoint } from '@/types/history'
import type { PassiveIncomePoint } from '@/hooks/usePassiveIncome'
import type { PositionRow, RawOperation, RawPosition } from '@/types/domain'
import type { IrrStatus } from '@/types/history'
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
import { PerformanceContributionCard } from '@/features/portfolio-charts/PerformanceContributionCard'
import { computePerformanceContributions } from '@/features/portfolio-charts/performanceContribution.logic'

export function PerformanceTab({ history, passiveIncome, positions, rawPositions, rawOperations, accountFilters, accountTypeFilters, performance, income, globalTri, irrStatus, irrScopeLabel }: {
  history: PortfolioHistoryPoint[]
  passiveIncome: PassiveIncomePoint[]
  positions: PositionRow[]
  rawPositions: RawPosition[]
  rawOperations: RawOperation[]
  accountFilters: Set<string>
  accountTypeFilters: Set<string>
  performance: PerformanceSummary
  income: IncomeSummary
  globalTri: number | null
  irrStatus: IrrStatus
  irrScopeLabel?: string
}) {
  const performers = computeTopPerformers(positions)
  const rollingTri3y = history[history.length - 1]?.tri_rolling_3y ?? null
  const asOfDate = history.at(-1)?.date
  const contributionFilters = useMemo(() => ({
    accounts: accountFilters,
    accountTypes: accountTypeFilters,
  }), [accountFilters, accountTypeFilters])
  const sinceTrackingContributions = useMemo(
    () => computePerformanceContributions(rawPositions, rawOperations, 'since-tracking', asOfDate, contributionFilters),
    [rawPositions, rawOperations, asOfDate, contributionFilters],
  )
  const trailingThreeYearContributions = useMemo(
    () => computePerformanceContributions(rawPositions, rawOperations, 'trailing-3y', asOfDate, contributionFilters),
    [rawPositions, rawOperations, asOfDate, contributionFilters],
  )

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
            <IrrSinceTrackingKpi value={globalTri} status={irrStatus} scopeLabel={irrScopeLabel} />
            <TrailingThreeYearIrrKpi value={rollingTri3y} status={irrStatus} scopeLabel={irrScopeLabel} />
          </div>
        </section>
      </div>
      {(history.length > 0 || passiveIncome.length > 0) && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {history.length > 0 && <UnrealizedPnlChart history={history} />}
          {history.length > 0 && <TriChart history={history} />}
          {passiveIncome.length > 0 && <PassiveIncomeChart data={passiveIncome} />}
        </div>
      )}
      {performers.length > 0 && <TopPerformersChart data={performers} height={Math.max(260, performers.length * 26)} />}
      <PerformanceContributionCard
        sinceTracking={sinceTrackingContributions}
        trailingThreeYears={trailingThreeYearContributions}
        sinceTrackingIrr={globalTri}
        trailingThreeYearIrr={rollingTri3y}
        irrStatus={irrStatus}
      />
    </div>
  )
}
