import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'

import { PORTFOLIO_ENDPOINTS } from '@/domains/portfolio/shared/apis/endpoints'
import { portfolioQueryKeys } from '@/domains/portfolio/shared/apis/queryKeys'
import {
  RAW_SAVING_CAPACITY_BY_ACCOUNT_SCHEMA,
  RAW_SAVING_CAPACITY_SCHEMA,
} from '@/domains/portfolio/shared/apis/schemas/portfolioCsvSchemas'
import {
  aggregateSavingCapacityByAccount,
  mapSavingCapacity,
} from '@/domains/portfolio/shared/helpers/aggregators/aggregateSavingCapacity'
import { rawAccountSet } from '@/domains/portfolio/shared/helpers/filters/accountFilter'
import type { SavingCapacityPoint } from '@/domains/portfolio/shared/types/savingCapacityPoint.type'
import { parseCsv } from '@/shared/csv/csvData'

export function useSavingCapacityQuery(accounts?: Set<string>) {
  const selectedAccounts = useMemo(
    () => (accounts ? [...accounts].toSorted() : []),
    [accounts],
  )

  return useQuery<SavingCapacityPoint[]>({
    queryKey: portfolioQueryKeys.data('saving-capacity', selectedAccounts),
    queryFn: async () => {
      if (selectedAccounts.length === 0) {
        return mapSavingCapacity(
          await parseCsv(
            PORTFOLIO_ENDPOINTS.data.savingCapacity,
            RAW_SAVING_CAPACITY_SCHEMA,
          ),
        )
      }

      const accountSet = rawAccountSet(new Set(selectedAccounts)) ?? new Set()
      return aggregateSavingCapacityByAccount(
        await parseCsv(
          PORTFOLIO_ENDPOINTS.data.savingCapacityByAccount,
          RAW_SAVING_CAPACITY_BY_ACCOUNT_SCHEMA,
        ),
        accountSet,
      )
    },
  })
}
