import { PORTFOLIO_ENDPOINTS } from '@/domains/portfolio/shared/apis/endpoints'
import { useQuery } from '@tanstack/react-query'
import { parseCsv } from '@/shared/csv/csvData'
import { aggregateBrokerageCash } from '@/domains/portfolio/shared/helpers/aggregators/aggregateBrokerageCash'
import { RAW_CASH_ROW_SCHEMA } from '@/domains/portfolio/shared/apis/schemas/portfolioCsvSchemas'
import { portfolioQueryKeys } from '@/domains/portfolio/shared/apis/queryKeys'

export function useCashHistory() {
  return useQuery({
    queryKey: portfolioQueryKeys.data('cash-history'),
    queryFn: async () => aggregateBrokerageCash(
      await parseCsv(PORTFOLIO_ENDPOINTS.data.cash, RAW_CASH_ROW_SCHEMA),
    ),
  })
}
