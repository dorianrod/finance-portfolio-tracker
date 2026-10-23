import { PORTFOLIO_ENDPOINTS } from '@/domains/portfolio/apis/endpoints'
import { useQuery } from '@tanstack/react-query'
import { parseCsv } from '@/shared/csv/csvData'
import { aggregateBrokerageCash, type CashHistoryPoint } from '@/domains/portfolio/helpers/aggregators/aggregateBrokerageCash'
import { RAW_CASH_ROW_SCHEMA } from '@/domains/portfolio/apis/schemas/portfolioCsvSchemas'
import { portfolioQueryKeys } from '@/domains/portfolio/apis/queryKeys'

export type { CashHistoryPoint }

export function useCashHistory() {
  return useQuery({
    queryKey: portfolioQueryKeys.data('cash-history'),
    queryFn: async () => aggregateBrokerageCash(
      await parseCsv(PORTFOLIO_ENDPOINTS.data.cash, RAW_CASH_ROW_SCHEMA),
    ),
  })
}
