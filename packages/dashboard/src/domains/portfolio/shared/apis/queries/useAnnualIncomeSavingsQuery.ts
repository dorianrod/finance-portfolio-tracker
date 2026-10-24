import { useQuery } from '@tanstack/react-query'

import { PORTFOLIO_ENDPOINTS } from '@/domains/portfolio/shared/apis/endpoints'
import { portfolioQueryKeys } from '@/domains/portfolio/shared/apis/queryKeys'
import { RAW_ANNUAL_INCOME_SAVINGS_SCHEMA } from '@/domains/portfolio/shared/apis/schemas/portfolioCsvSchemas'
import {
  type AnnualIncomeSavingsPoint,
  mapAnnualIncomeSavings,
} from '@/domains/portfolio/shared/helpers/mappers/mapAnnualIncomeSavings'
import { parseCsv } from '@/shared/csv/csvData'

export function useAnnualIncomeSavingsQuery() {
  return useQuery<AnnualIncomeSavingsPoint[]>({
    queryKey: portfolioQueryKeys.data('annual-income-savings'),
    queryFn: async () =>
      mapAnnualIncomeSavings(
        await parseCsv(
          PORTFOLIO_ENDPOINTS.data.annualIncomeSavings,
          RAW_ANNUAL_INCOME_SAVINGS_SCHEMA,
        ),
      ),
  })
}
