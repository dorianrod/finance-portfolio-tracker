import { useQuery } from '@tanstack/react-query'

import { PORTFOLIO_ENDPOINTS } from '@/domains/portfolio/shared/apis/endpoints'
import { portfolioQueryKeys } from '@/domains/portfolio/shared/apis/queryKeys'
import { RAW_OPERATION_SCHEMA } from '@/domains/portfolio/shared/apis/schemas/portfolioCsvSchemas'
import type {
  MonthlyOperation,
  MonthlyOperationsByMonth,
  MonthlyOperationType,
} from '@/domains/portfolio/shared/types/monthlyOperation.type'
import { parseCsv } from '@/shared/csv/csvData'
import { toCalendarMonth } from '@/shared/helpers/mappers/toCalendarMonth'

function isMonthlyOperationType(value: string): value is MonthlyOperationType {
  return value === 'DEPOSIT' || value === 'WITHDRAWAL'
}

export function useMonthlyOperationsQuery() {
  return useQuery<MonthlyOperationsByMonth>({
    queryKey: portfolioQueryKeys.data('monthly-operations'),
    queryFn: async () => {
      const rows = await parseCsv(
        PORTFOLIO_ENDPOINTS.data.operations,
        RAW_OPERATION_SCHEMA,
      )
      const map = new Map<string, MonthlyOperation[]>()
      for (const row of rows) {
        if (!isMonthlyOperationType(row.operation_type)) continue
        const amount = row.total_amount
        // month key = YYYY-MM
        const month = toCalendarMonth(row.date)
        if (!map.has(month)) map.set(month, [])
        map.get(month)!.push({
          date: row.date,
          account: row.account,
          operation_type: row.operation_type,
          total_amount: amount,
        })
      }
      return map
    },
  })
}
