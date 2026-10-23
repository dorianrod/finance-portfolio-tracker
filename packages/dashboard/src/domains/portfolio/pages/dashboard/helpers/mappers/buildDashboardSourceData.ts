import type { CashHistoryPoint } from '@/domains/portfolio/apis/queries/useCashHistory'
import { buildPortfolioFilterOptions } from '@/domains/portfolio/components/filters/helpers/filters/portfolioFilters'
import type { PositionRow } from '@/domains/portfolio/types/domain'
import type { PortfolioHistoryPoint } from '@/domains/portfolio/types/history'

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
