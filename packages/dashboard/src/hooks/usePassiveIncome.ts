import { useEffect, useMemo, useState } from 'react'
import { dataUrl, parseCsv } from '@/shared/csv/csvData'
import { aggregatePassiveIncomeByYear, type RawPassiveIncomeOp, type PassiveIncomePoint } from '@/logic/passiveIncome.logic'

export type { PassiveIncomePoint }

export function usePassiveIncome(
  accounts?: Set<string>,
  dateFrom?: string,
  dateTo?: string,
): PassiveIncomePoint[] {
  const [data, setData] = useState<PassiveIncomePoint[]>([])

  const accountsKey = useMemo(
    () => (accounts && accounts.size > 0 ? [...accounts].sort().join(',') : ''),
    [accounts],
  )

  useEffect(() => {
    const accountSet = accountsKey ? new Set(accountsKey.split(',')) : null

    parseCsv<RawPassiveIncomeOp>(dataUrl('operations.csv')).then((rows) => {
      setData(aggregatePassiveIncomeByYear(rows, accountSet, dateFrom, dateTo))
    })
  }, [accountsKey, dateFrom, dateTo])

  return data
}
