import { useQuery, useQueryClient } from '@tanstack/react-query'

import type {
  MonthlyOperation,
  MonthlyOperationsByMonth,
  MonthlyOperationType,
} from '@/domains/portfolio/features/wealth/types/monthlyOperation.type'
import { PORTFOLIO_OPERATIONS_QUERY_OPTIONS } from '@/domains/portfolio/shared/apis/queries/portfolioSourceQueries/portfolioOperationsQueryOptions'
import { portfolioQueryKeys } from '@/domains/portfolio/shared/apis/queryKeys'
import { toCalendarMonth } from '@/shared/helpers/mappers/toCalendarMonth'

export function useGetMonthlyOperationsQuery() {
  const queryClient = useQueryClient()
  return useQuery<MonthlyOperationsByMonth>({
    queryKey: portfolioQueryKeys.data('monthly-operations'),
    queryFn: async () => {
      const rows = await queryClient.query({
        ...PORTFOLIO_OPERATIONS_QUERY_OPTIONS,
        staleTime: 'static',
      })
      const map = new Map<string, MonthlyOperation[]>()
      for (const row of rows) {
        if (!isMonthlyOperationType(row.operation_type)) continue
        const amount = row.total_amount
        // month key = YYYY-MM
        const month = toCalendarMonth(row.date)
        const operations = map.get(month) ?? []
        operations.push({
          date: row.date,
          account: row.account,
          operation_type: row.operation_type,
          total_amount: amount,
        })
        map.set(month, operations)
      }
      return map
    },
  })
}

function isMonthlyOperationType(value: string): value is MonthlyOperationType {
  return value === 'DEPOSIT' || value === 'WITHDRAWAL'
}
