import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'

import { PORTFOLIO_ENDPOINTS } from '@/domains/portfolio/shared/apis/endpoints'
import { portfolioQueryKeys } from '@/domains/portfolio/shared/apis/queryKeys'
import { RAW_OPERATION_SCHEMA } from '@/domains/portfolio/shared/apis/schemas/portfolioCsvSchemas'
import { aggregatePassiveIncomeByYear } from '@/domains/portfolio/shared/helpers/aggregators/aggregatePassiveIncomeByYear'
import { rawAccountSet } from '@/domains/portfolio/shared/helpers/filters/accountFilter'
import type { PassiveIncomePoint } from '@/domains/portfolio/shared/types/passiveIncomePoint.type'
import { parseCsv } from '@/shared/csv/csvData'

export function usePassiveIncomeQuery(
  accounts?: Set<string>,
  dateFrom?: Date,
  dateTo?: Date,
) {
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
      const rows = await parseCsv(
        PORTFOLIO_ENDPOINTS.data.operations,
        RAW_OPERATION_SCHEMA,
      )
      return aggregatePassiveIncomeByYear(rows, accountSet, dateFrom, dateTo)
    },
  })
}
