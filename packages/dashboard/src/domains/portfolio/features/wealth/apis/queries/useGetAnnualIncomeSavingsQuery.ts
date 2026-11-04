import { useSuspenseQuery } from '@tanstack/react-query'

import { ANNUAL_INCOME_SAVINGS_SCHEMA } from '@/domains/portfolio/features/wealth/apis/schemas/annualIncomeSavingsSchema'
import type { AnnualIncomeSavingsPoint } from '@/domains/portfolio/features/wealth/types/annualIncomeSavingsPoint.type'
import { PORTFOLIO_ENDPOINTS } from '@/domains/portfolio/shared/apis/endpoints'
import { portfolioQueryKeys } from '@/domains/portfolio/shared/apis/queryKeys'
import { loadCsv } from '@/shared/csv/csvData/loadCsv'
import { readCsvValue } from '@/shared/csv/csvData/readCsvValue'

export function useGetAnnualIncomeSavingsQuery() {
  return useSuspenseQuery<AnnualIncomeSavingsPoint[]>({
    queryKey: portfolioQueryKeys.data('annual-income-savings'),
    queryFn: async () =>
      readCsvValue(
        ANNUAL_INCOME_SAVINGS_SCHEMA,
        await loadCsv(PORTFOLIO_ENDPOINTS.data.annualIncomeSavings),
      ),
  })
}
