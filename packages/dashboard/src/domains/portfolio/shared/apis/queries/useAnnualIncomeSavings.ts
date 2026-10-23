import { PORTFOLIO_ENDPOINTS } from '@/domains/portfolio/shared/apis/endpoints'
import { useQuery } from '@tanstack/react-query'
import { parseCsv } from '@/shared/csv/csvData'
import {
  mapAnnualIncomeSavings,
  type AnnualIncomeSavingsPoint,
} from '@/domains/portfolio/shared/helpers/mappers/mapAnnualIncomeSavings'
import { RAW_ANNUAL_INCOME_SAVINGS_SCHEMA } from '@/domains/portfolio/shared/apis/schemas/portfolioCsvSchemas'
import { portfolioQueryKeys } from '@/domains/portfolio/shared/apis/queryKeys'

export function useAnnualIncomeSavings() {
  return useQuery<AnnualIncomeSavingsPoint[]>({
    queryKey: portfolioQueryKeys.data('annual-income-savings'),
    queryFn: async () => mapAnnualIncomeSavings(
      await parseCsv(
        PORTFOLIO_ENDPOINTS.data.annualIncomeSavings,
        RAW_ANNUAL_INCOME_SAVINGS_SCHEMA,
      ),
    ),
  })
}
