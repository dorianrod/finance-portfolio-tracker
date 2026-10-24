import { usePassiveIncomeQuery } from '@/domains/portfolio/shared/apis/queries/usePassiveIncomeQuery'
import {
  computePerformanceSummary,
  computeTrailing12mIncome,
} from '@/domains/portfolio/shared/helpers/calculators/calculatePortfolioCharts'
import type { DashboardFilters } from '@/domains/portfolio/shared/types/dashboardFilters.type'
import type { PortfolioHistoryPoint } from '@/domains/portfolio/shared/types/portfolioHistoryPoint.type'
import type { PositionRow } from '@/domains/portfolio/shared/types/positionRow.type'
import { useMemo } from 'react'

const EMPTY_PASSIVE_INCOME: NonNullable<ReturnType<typeof usePassiveIncomeQuery>['data']> = []

type DashboardPerformanceInput = {
  currentPositions: PositionRow[]
  displayedHistory: PortfolioHistoryPoint[]
  filters: DashboardFilters
  periodPositions: PositionRow[]
}

export function useDashboardPerformance({
  currentPositions,
  displayedHistory,
  filters,
  periodPositions,
}: DashboardPerformanceInput) {
  const passiveIncomeQuery = usePassiveIncomeQuery(
    filters.accounts,
    filters.dateFrom,
    filters.dateTo,
  )
  const passiveIncome = passiveIncomeQuery.data ?? EMPTY_PASSIVE_INCOME
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
    () => computeTrailing12mIncome(currentPositions, displayedHistory.at(-1)?.date),
    [currentPositions, displayedHistory],
  )

  const passiveIncomeLoading = passiveIncomeQuery.isPending
  const passiveIncomeError = passiveIncomeQuery.error
  return useMemo(
    () => ({
      passiveIncomeLoading,
      passiveIncomeError,
      passiveIncome,
      performance,
      trailingIncome,
    }),
    [passiveIncomeLoading, passiveIncomeError, passiveIncome, performance, trailingIncome],
  )
}
