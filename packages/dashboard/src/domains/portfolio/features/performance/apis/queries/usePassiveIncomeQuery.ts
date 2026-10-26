import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useMemo } from 'react'

import { aggregatePassiveIncomeByYear } from '@/domains/portfolio/features/performance/helpers/aggregators/aggregatePassiveIncomeByYear'
import type { PassiveIncomePoint } from '@/domains/portfolio/features/performance/types/passiveIncomePoint.type'
import { PORTFOLIO_OPERATIONS_QUERY_OPTIONS } from '@/domains/portfolio/shared/apis/queries/portfolioSourceQueries/portfolioOperationsQueryOptions'
import { portfolioQueryKeys } from '@/domains/portfolio/shared/apis/queryKeys'
import { rawAccountSet } from '@/domains/portfolio/shared/helpers/filters/accountFilter/rawAccountSet'

export function usePassiveIncomeQuery(
  accounts?: Set<string>,
  dateFrom?: Date,
  dateTo?: Date,
) {
  const queryClient = useQueryClient()
  const selectedAccounts = useMemo(
    () => (accounts ? [...accounts].toSorted() : []),
    [accounts],
  )

  return useQuery<PassiveIncomePoint[]>({
    queryKey: portfolioQueryKeys.data(
      'passive-income',
      selectedAccounts,
      dateFrom,
      dateTo,
    ),
    queryFn: async () => {
      const accountSet =
        selectedAccounts.length > 0
          ? rawAccountSet(new Set(selectedAccounts))
          : null
      const rows = await queryClient.query({
        ...PORTFOLIO_OPERATIONS_QUERY_OPTIONS,
        staleTime: 'static',
      })
      return aggregatePassiveIncomeByYear(rows, accountSet, dateFrom, dateTo)
    },
  })
}
