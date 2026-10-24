import { PORTFOLIO_ENDPOINTS } from '@/domains/portfolio/shared/apis/endpoints'
import { useQuery } from '@tanstack/react-query'
import { parseCsv } from '@/shared/csv/csvData'
import { RAW_OPERATION_SCHEMA } from '@/domains/portfolio/shared/apis/schemas/portfolioCsvSchemas'
import { portfolioQueryKeys } from '@/domains/portfolio/shared/apis/queryKeys'
import type {
  MonthlyOperation,
  MonthlyOperationsByMonth,
  MonthlyOperationType,
} from '@/domains/portfolio/shared/types/monthlyOperation.type'

function isMonthlyOperationType(value: string): value is MonthlyOperationType {
  return value === 'DEPOSIT' || value === 'WITHDRAWAL'
}

export function useMonthlyOps() {
  return useQuery<MonthlyOperationsByMonth>({
    queryKey: portfolioQueryKeys.data('monthly-operations'),
    queryFn: async () => {
      const rows = await parseCsv(PORTFOLIO_ENDPOINTS.data.operations, RAW_OPERATION_SCHEMA)
      const map = new Map<string, MonthlyOperation[]>()
      for (const row of rows) {
        if (!isMonthlyOperationType(row.operation_type)) continue
        const amount = row.total_amount
        // month key = YYYY-MM
        const month = row.date.slice(0, 7)
        if (!map.has(month)) map.set(month, [])
        map.get(month)!.push({
          date: row.date.slice(0, 10),
          account: row.account,
          operation_type: row.operation_type,
          total_amount: amount,
        })
      }
      return map
    },
  })
}
