import { useQuery } from '@tanstack/react-query'

import { PORTFOLIO_ENDPOINTS } from '@/domains/portfolio/shared/apis/endpoints'
import { portfolioQueryKeys } from '@/domains/portfolio/shared/apis/queryKeys'
import { RAW_PORTFOLIO_HISTORY_SCHEMA } from '@/domains/portfolio/shared/apis/schemas/portfolioCsvSchemas'
import type { PortfolioHistoryPoint } from '@/domains/portfolio/shared/types/portfolioHistoryPoint.type'
import { parseCsv } from '@/shared/csv/csvData'

export function usePortfolioHistoryQuery() {
  return useQuery<PortfolioHistoryPoint[]>({
    queryKey: portfolioQueryKeys.data('portfolio-history'),
    queryFn: async () => {
      const rows = await parseCsv(
        PORTFOLIO_ENDPOINTS.data.portfolioHistory,
        RAW_PORTFOLIO_HISTORY_SCHEMA,
      )

      return rows.map((r) => ({
        date: r.snapshot_date,
        total_value: r.total_value,
        total_cost_basis: r.total_cost_basis,
        unrealized_gain: r.unrealized_gain,
        net_cash_injected: r.net_cash_injected,
        cash_delta: r.cash_delta,
        tri: r.tri,
        tri_rolling_1y: r.tri_rolling_1y,
        tri_rolling_3y: r.tri_rolling_3y,
      }))
    },
  })
}
