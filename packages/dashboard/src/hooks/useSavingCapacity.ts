import { useEffect, useMemo, useState } from 'react'
import { dataUrl, parseCsv } from '@/shared/csv/csvData'
import {
  mapSavingCapacity,
  aggregateSavingCapacityByAccount,
  type RawSavingCapacityRow,
  type RawSavingCapacityByAccountRow,
  type SavingCapacityPoint,
} from '@/logic/savingCapacity.logic'

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
      const accountSet = new Set(accountsKey.split(','))
      parseCsv<RawSavingCapacityByAccountRow>(dataUrl('saving_capacity_by_account.csv')).then((rows) => {
        setData(aggregateSavingCapacityByAccount(rows, accountSet))
      })
    } else {
      parseCsv<RawSavingCapacityRow>(dataUrl('saving_capacity.csv')).then((rows) => {
        setData(mapSavingCapacity(rows))
      })
    }
  }, [accountsKey])

  return data
}
