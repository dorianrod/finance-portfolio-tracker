// eslint-disable-next-line local/review-shared-feature-sharing -- Cash-enriched history feeds wealth analysis, performance and overview comparisons through useDashboardHistory. See SHARED_OWNERSHIP_AUDIT.md.
import { useQuery } from '@tanstack/react-query'

import { PORTFOLIO_ENDPOINTS } from '@/domains/portfolio/shared/apis/endpoints'
import { portfolioQueryKeys } from '@/domains/portfolio/shared/apis/queryKeys'
import { RAW_CASH_ROW_SCHEMA } from '@/domains/portfolio/shared/apis/schemas/portfolioCsvSchemas/rawCashRowSchema'
import { aggregateBrokerageCash } from '@/domains/portfolio/shared/helpers/aggregators/aggregateBrokerageCash'
import { parseCsv } from '@/shared/csv/csvData/parseCsv'

export function useBrokerageCashHistoryQuery() {
  return useQuery({
    queryKey: portfolioQueryKeys.data('cash-history'),
    queryFn: async () =>
      aggregateBrokerageCash(
        await parseCsv(PORTFOLIO_ENDPOINTS.data.cash, RAW_CASH_ROW_SCHEMA),
      ),
  })
}
