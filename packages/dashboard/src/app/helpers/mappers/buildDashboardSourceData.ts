import type { CashHistoryPoint } from '@/domains/portfolio/shared/types/cashHistoryPoint.type'
import { buildPortfolioFilterOptions } from '@/domains/portfolio/shared/components/filters/helpers/filters/portfolioFilters'
import type { PositionRow } from '@/domains/portfolio/shared/types/positionRow.type'
import type { PortfolioHistoryPoint } from '@/domains/portfolio/shared/types/portfolioHistoryPoint.type'

interface BuildDashboardSourceDataInput {
  accountLabels: Record<string, string>
  cashHistory: CashHistoryPoint[]
  history: PortfolioHistoryPoint[]
  positions: PositionRow[]
}

export function buildDashboardSourceData({
  accountLabels,
  cashHistory,
  history,
  positions,
}: BuildDashboardSourceDataInput) {
  const cashByDate = new Map(
    cashHistory.map((cash) => [cash.date, cash.total_broker_cash]),
  )
  const enrichedHistory = history.map((point) => ({
    ...point,
    total_broker_cash: cashByDate.get(point.date) ?? 0,
  }))
  const filterOptions = buildPortfolioFilterOptions(positions, accountLabels)

  return {
    ...filterOptions,
    enrichedHistory,
  }
}
