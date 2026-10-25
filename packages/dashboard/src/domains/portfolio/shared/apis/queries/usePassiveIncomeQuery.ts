import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useMemo } from 'react'

import { portfolioQueryKeys } from '@/domains/portfolio/shared/apis/queryKeys'
import { aggregatePassiveIncomeByYear } from '@/domains/portfolio/shared/helpers/aggregators/aggregatePassiveIncomeByYear'
import { rawAccountSet } from '@/domains/portfolio/shared/helpers/filters/accountFilter'
import type { PassiveIncomePoint } from '@/domains/portfolio/shared/types/passiveIncomePoint.type'

import { PORTFOLIO_OPERATIONS_QUERY_OPTIONS } from './portfolioSourceQueries'

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
