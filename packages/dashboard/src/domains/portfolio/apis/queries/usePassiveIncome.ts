import { PORTFOLIO_ENDPOINTS } from '@/domains/portfolio/apis/endpoints'
import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { parseCsv } from '@/shared/csv/csvData'
import { rawAccountSet } from '@/domains/portfolio/helpers/filters/accountFilter'
import { aggregatePassiveIncomeByYear, type PassiveIncomePoint } from '@/domains/portfolio/helpers/aggregators/aggregatePassiveIncomeByYear'
import { RAW_OPERATION_SCHEMA } from '@/domains/portfolio/apis/schemas/portfolioCsvSchemas'
import { portfolioQueryKeys } from '@/domains/portfolio/apis/queryKeys'

export type { PassiveIncomePoint }

export function usePassiveIncome(
  accounts?: Set<string>,
  dateFrom?: string,
  dateTo?: string,
) {
  const accountsKey = useMemo(
    () => (accounts && accounts.size > 0 ? [...accounts].toSorted().join(',') : ''),
    [accounts],
  )

  return useQuery<PassiveIncomePoint[]>({
    queryKey: portfolioQueryKeys.data('passive-income', accountsKey, dateFrom, dateTo),
    queryFn: async () => {
      const accountSet = accountsKey
        ? rawAccountSet(new Set(accountsKey.split(',')))
        : null
      const rows = await parseCsv(PORTFOLIO_ENDPOINTS.data.operations, RAW_OPERATION_SCHEMA)
      return aggregatePassiveIncomeByYear(rows, accountSet, dateFrom, dateTo)
    },
  })
}
