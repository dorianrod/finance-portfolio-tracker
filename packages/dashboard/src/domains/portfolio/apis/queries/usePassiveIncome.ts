import { PORTFOLIO_ENDPOINTS } from '@/domains/portfolio/apis/endpoints'
import { useEffect, useMemo, useState } from 'react'
import { parseCsv } from '@/shared/csv/csvData'
import { rawAccountSet } from '@/domains/portfolio/helpers/filters/accountFilter'
import { aggregatePassiveIncomeByYear, type PassiveIncomePoint } from '@/domains/portfolio/helpers/passiveIncome.logic'
import { RAW_OPERATION_SCHEMA } from '@/domains/portfolio/apis/schemas/portfolioCsvSchemas'

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
    const accountSet = accountsKey
      ? rawAccountSet(new Set(accountsKey.split(',')))
      : null

    parseCsv(PORTFOLIO_ENDPOINTS.data.operations, RAW_OPERATION_SCHEMA).then((rows) => {
      setData(aggregatePassiveIncomeByYear(rows, accountSet, dateFrom, dateTo))
    })
  }, [accountsKey, dateFrom, dateTo])

  return data
}
