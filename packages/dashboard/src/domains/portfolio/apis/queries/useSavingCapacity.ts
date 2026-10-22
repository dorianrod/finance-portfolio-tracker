import { PORTFOLIO_ENDPOINTS } from '@/domains/portfolio/apis/endpoints'
import { useEffect, useMemo, useState } from 'react'
import { parseCsv } from '@/shared/csv/csvData'
import { rawAccountSet } from '@/domains/portfolio/helpers/filters/accountFilter'
import {
  mapSavingCapacity,
  aggregateSavingCapacityByAccount,
  type RawSavingCapacityRow,
  type RawSavingCapacityByAccountRow,
  type SavingCapacityPoint,
} from '@/domains/portfolio/helpers/savingCapacity.logic'

export type { SavingCapacityPoint }

export function useSavingCapacity(accounts?: Set<string>): SavingCapacityPoint[] {
  const [data, setData] = useState<SavingCapacityPoint[]>([])

  // Stable key to avoid re-firing on Set reference changes
  const accountsKey = useMemo(
    () => (accounts && accounts.size > 0 ? [...accounts].sort().join(',') : ''),
    [accounts],
  )

  useEffect(() => {
    if (accountsKey) {
      const accountSet = rawAccountSet(new Set(accountsKey.split(','))) ?? new Set()
      parseCsv<RawSavingCapacityByAccountRow>(PORTFOLIO_ENDPOINTS.data.savingCapacityByAccount).then((rows) => {
        setData(aggregateSavingCapacityByAccount(rows, accountSet))
      })
    } else {
      parseCsv<RawSavingCapacityRow>(PORTFOLIO_ENDPOINTS.data.savingCapacity).then((rows) => {
        setData(mapSavingCapacity(rows))
      })
    }
  }, [accountsKey])

  return data
}
