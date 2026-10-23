import { PORTFOLIO_ENDPOINTS } from '@/domains/portfolio/shared/apis/endpoints'
import { useQuery } from '@tanstack/react-query'
import type { PortfolioHistoryPoint } from '@/domains/portfolio/shared/types/history'
import { parseCsv } from '@/shared/csv/csvData'
import { RAW_PORTFOLIO_HISTORY_SCHEMA } from '@/domains/portfolio/shared/apis/schemas/portfolioCsvSchemas'
import { portfolioQueryKeys } from '@/domains/portfolio/shared/apis/queryKeys'

export function usePortfolioHistory() {
  return useQuery<PortfolioHistoryPoint[]>({
    queryKey: portfolioQueryKeys.data('portfolio-history'),
    queryFn: async () => {
      const rows = await parseCsv(
        PORTFOLIO_ENDPOINTS.data.portfolioHistory,
        RAW_PORTFOLIO_HISTORY_SCHEMA,
      )

      return rows.map((r) => ({
          date: r.snapshot_date,
          total_value: parseFloat(r.total_value) || 0,
          total_cost_basis: parseFloat(r.total_cost_basis) || 0,
          unrealized_gain: parseFloat(r.unrealized_gain) || 0,
          net_cash_injected: parseFloat(r.net_cash_injected) || 0,
          cash_delta: r.cash_delta === '' ? null : parseFloat(r.cash_delta),
          tri: r.tri !== '' && r.tri != null ? parseFloat(r.tri) : null,
          tri_rolling_1y:
            r.tri_rolling_1y !== '' && r.tri_rolling_1y != null
              ? parseFloat(r.tri_rolling_1y)
              : null,
          tri_rolling_3y:
            r.tri_rolling_3y !== '' && r.tri_rolling_3y != null
              ? parseFloat(r.tri_rolling_3y)
              : null,
        }))
    },
  })
}
