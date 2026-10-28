import { useCallback } from 'react'

import { useBuildPortfolioFilterOptions } from '@/domains/portfolio/shared/helpers/filters/portfolioFilters/useBuildPortfolioFilterOptions'
import type { CashHistoryPoint } from '@/domains/portfolio/shared/types/cashHistoryPoint.type'
import type { PortfolioHistoryPoint } from '@/domains/portfolio/shared/types/portfolioHistoryPoint.type'
import type { PositionRow } from '@/domains/portfolio/shared/types/positionRow.type'

export function useBuildDashboardSourceData() {
  const buildPortfolioFilterOptions = useBuildPortfolioFilterOptions()
  return useCallback(
    ({
      accountLabels,
      cashHistory,
      history,
      positions,
    }: BuildDashboardSourceDataInput) => {
      const cashByDate = new Map(
        cashHistory.map((cash) => [
          cash.date.getTime(),
          cash.total_broker_cash,
        ]),
      )
      const enrichedHistory = history.map((point) => ({
        ...point,
        total_broker_cash: cashByDate.get(point.date.getTime()) ?? 0,
      }))
      const filterOptions = buildPortfolioFilterOptions(
        positions,
        accountLabels,
      )

      return {
        ...filterOptions,
        enrichedHistory,
      }
    },
    [buildPortfolioFilterOptions],
  )
}

type BuildDashboardSourceDataInput = {
  accountLabels: Record<string, string>
  cashHistory: CashHistoryPoint[]
  history: PortfolioHistoryPoint[]
  positions: PositionRow[]
}
