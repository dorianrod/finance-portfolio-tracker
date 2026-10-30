import { useMemo } from 'react'

import { useGetPassiveIncomeQuery } from '@/domains/portfolio/features/performance/apis/queries/useGetPassiveIncomeQuery'
import { computePerformanceSummary } from '@/domains/portfolio/features/performance/helpers/transformers/performanceCalculations/computePerformanceSummary'
import { computeTrailing12mIncome } from '@/domains/portfolio/features/performance/helpers/transformers/performanceCalculations/computeTrailing12mIncome'
import type { DashboardFilters } from '@/domains/portfolio/shared/types/dashboardFilters.type'
import type { PortfolioHistoryPoint } from '@/domains/portfolio/shared/types/portfolioHistoryPoint.type'
import type { PositionRow } from '@/domains/portfolio/shared/types/positionRow.type'

export function useDashboardPerformance({
  currentPositions,
  displayedHistory,
  filters,
  periodPositions,
}: DashboardPerformanceInput) {
  const passiveIncomeQuery = useGetPassiveIncomeQuery(
    filters.accounts,
    filters.dateFrom,
    filters.dateTo,
  )
  const { data: passiveIncome = EMPTY_PASSIVE_INCOME } = passiveIncomeQuery
  const asOfPerformance = useMemo(
    () => computePerformanceSummary(currentPositions),
    [currentPositions],
  )
  const periodPerformance = useMemo(
    () => computePerformanceSummary(periodPositions),
    [periodPositions],
  )
  const performance = useMemo(
    () => ({
      ...asOfPerformance,
      realizedNet: periodPerformance.realizedNet,
      realizedGross: periodPerformance.realizedGross,
    }),
    [asOfPerformance, periodPerformance],
  )
  const trailingIncome = useMemo(
    () =>
      computeTrailing12mIncome(currentPositions, displayedHistory.at(-1)?.date),
    [currentPositions, displayedHistory],
  )

  const passiveIncomeLoading = passiveIncomeQuery.isPending
  const passiveIncomeUpdating = passiveIncomeQuery.isPlaceholderData
  const passiveIncomeError = passiveIncomeQuery.error
  return useMemo(
    () => ({
      passiveIncomeLoading,
      passiveIncomeUpdating,
      passiveIncomeError,
      passiveIncome,
      performance,
      trailingIncome,
    }),
    [
      passiveIncomeLoading,
      passiveIncomeUpdating,
      passiveIncomeError,
      passiveIncome,
      performance,
      trailingIncome,
    ],
  )
}

const EMPTY_PASSIVE_INCOME: NonNullable<
  ReturnType<typeof useGetPassiveIncomeQuery>['data']
> = []

type DashboardPerformanceInput = {
  currentPositions: PositionRow[]
  displayedHistory: PortfolioHistoryPoint[]
  filters: DashboardFilters
  periodPositions: PositionRow[]
}
