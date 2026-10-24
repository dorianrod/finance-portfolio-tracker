import { PORTFOLIO_ENDPOINTS } from '@/domains/portfolio/shared/apis/endpoints'
import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { parseCsv } from '@/shared/csv/csvData'
import { rawAccountSet } from '@/domains/portfolio/shared/helpers/filters/accountFilter'
import { aggregatePassiveIncomeByYear } from '@/domains/portfolio/shared/helpers/aggregators/aggregatePassiveIncomeByYear'
import type { PassiveIncomePoint } from '@/domains/portfolio/shared/types/passiveIncomePoint.type'
import { RAW_OPERATION_SCHEMA } from '@/domains/portfolio/shared/apis/schemas/portfolioCsvSchemas'
import { portfolioQueryKeys } from '@/domains/portfolio/shared/apis/queryKeys'

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
