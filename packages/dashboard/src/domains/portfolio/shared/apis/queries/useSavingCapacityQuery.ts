import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useMemo } from 'react'

import { portfolioQueryKeys } from '@/domains/portfolio/shared/apis/queryKeys'
import {
  aggregateSavingCapacityByAccount,
  mapSavingCapacity,
} from '@/domains/portfolio/shared/helpers/aggregators/aggregateSavingCapacity'
import { rawAccountSet } from '@/domains/portfolio/shared/helpers/filters/accountFilter'
import type { SavingCapacityPoint } from '@/domains/portfolio/shared/types/savingCapacityPoint.type'

import {
  PORTFOLIO_ACCOUNT_SAVINGS_QUERY_OPTIONS,
  PORTFOLIO_SAVING_CAPACITY_QUERY_OPTIONS,
} from './portfolioSourceQueries'

export function useSavingCapacityQuery(accounts?: Set<string>) {
  const queryClient = useQueryClient()
  const selectedAccounts = useMemo(
    () => (accounts ? [...accounts].toSorted() : []),
    [accounts],
  )

  return useQuery<SavingCapacityPoint[]>({
    queryKey: portfolioQueryKeys.data('saving-capacity', selectedAccounts),
    queryFn: async () => {
      if (selectedAccounts.length === 0) {
        return mapSavingCapacity(
          await queryClient.query({
            ...PORTFOLIO_SAVING_CAPACITY_QUERY_OPTIONS,
            staleTime: 'static',
          }),
        )
      }

      const accountSet = rawAccountSet(new Set(selectedAccounts)) ?? new Set()
      return aggregateSavingCapacityByAccount(
        await queryClient.query({
          ...PORTFOLIO_ACCOUNT_SAVINGS_QUERY_OPTIONS,
          staleTime: 'static',
        }),
        accountSet,
      )
    },
  })
}
