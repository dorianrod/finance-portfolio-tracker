import { PORTFOLIO_ENDPOINTS } from '@/domains/portfolio/apis/endpoints'
import { useQuery } from '@tanstack/react-query'
import { parseCsv } from '@/shared/csv/csvData'
import {
  mapAnnualIncomeSavings,
  type AnnualIncomeSavingsPoint,
} from '@/domains/portfolio/helpers/mappers/mapAnnualIncomeSavings'
import { RAW_ANNUAL_INCOME_SAVINGS_SCHEMA } from '@/domains/portfolio/apis/schemas/portfolioCsvSchemas'
import { portfolioQueryKeys } from '@/domains/portfolio/apis/queryKeys'

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
