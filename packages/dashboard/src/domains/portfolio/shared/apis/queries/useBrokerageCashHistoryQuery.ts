import { PORTFOLIO_ENDPOINTS } from '@/domains/portfolio/shared/apis/endpoints'
import { portfolioQueryKeys } from '@/domains/portfolio/shared/apis/queryKeys'
import { RAW_CASH_ROW_SCHEMA } from '@/domains/portfolio/shared/apis/schemas/portfolioCsvSchemas'
import { aggregateBrokerageCash } from '@/domains/portfolio/shared/helpers/aggregators/aggregateBrokerageCash'
import { parseCsv } from '@/shared/csv/csvData'
import { useQuery } from '@tanstack/react-query'

export function useBrokerageCashHistoryQuery() {
  return useQuery({
    queryKey: portfolioQueryKeys.data('cash-history'),
    queryFn: async () =>
      aggregateBrokerageCash(await parseCsv(PORTFOLIO_ENDPOINTS.data.cash, RAW_CASH_ROW_SCHEMA)),
  })
}
