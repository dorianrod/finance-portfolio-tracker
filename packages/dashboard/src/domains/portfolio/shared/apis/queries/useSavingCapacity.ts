import { PORTFOLIO_ENDPOINTS } from '@/domains/portfolio/shared/apis/endpoints'
import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { parseCsv } from '@/shared/csv/csvData'
import { rawAccountSet } from '@/domains/portfolio/shared/helpers/filters/accountFilter'
import {
  RAW_SAVING_CAPACITY_BY_ACCOUNT_SCHEMA,
  RAW_SAVING_CAPACITY_SCHEMA,
} from '@/domains/portfolio/shared/apis/schemas/portfolioCsvSchemas'
import {
  mapSavingCapacity,
  aggregateSavingCapacityByAccount,
  type SavingCapacityPoint,
} from '@/domains/portfolio/shared/helpers/aggregators/aggregateSavingCapacity'
import { portfolioQueryKeys } from '@/domains/portfolio/shared/apis/queryKeys'

export type { SavingCapacityPoint }

export function useSavingCapacity(accounts?: Set<string>) {
  const accountsKey = useMemo(
    () => (accounts && accounts.size > 0 ? [...accounts].toSorted().join(',') : ''),
    [accounts],
  )

  return useQuery<SavingCapacityPoint[]>({
    queryKey: portfolioQueryKeys.data('saving-capacity', accountsKey),
    queryFn: async () => {
      if (!accountsKey) {
        return mapSavingCapacity(
          await parseCsv(
            PORTFOLIO_ENDPOINTS.data.savingCapacity,
            RAW_SAVING_CAPACITY_SCHEMA,
          ),
        )
      }

      const accountSet = rawAccountSet(new Set(accountsKey.split(','))) ?? new Set()
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
