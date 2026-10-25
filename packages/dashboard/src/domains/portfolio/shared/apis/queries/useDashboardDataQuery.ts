import { useQuery, useQueryClient } from '@tanstack/react-query'

import { PORTFOLIO_ENDPOINTS } from '@/domains/portfolio/shared/apis/endpoints'
import { portfolioQueryKeys } from '@/domains/portfolio/shared/apis/queryKeys'
import { ACCOUNT_ROW_SCHEMA } from '@/domains/portfolio/shared/apis/schemas/portfolioCsvSchemas'
import {
  buildAccountLabels,
  buildPositionRows,
} from '@/domains/portfolio/shared/helpers/mappers/buildPositionHierarchy'
import type { DashboardData } from '@/domains/portfolio/shared/types/dashboardData.type'
import { parseCsv } from '@/shared/csv/csvData'

import {
  PORTFOLIO_OPERATIONS_QUERY_OPTIONS,
  PORTFOLIO_POSITIONS_QUERY_OPTIONS,
} from './portfolioSourceQueries'

export function useDashboardDataQuery() {
  const queryClient = useQueryClient()
  return useQuery<DashboardData>({
    queryKey: portfolioQueryKeys.data('dashboard'),
    queryFn: async () => {
      const [rawOperations, rawPositions, accountRows] = await Promise.all([
        queryClient.query({
          ...PORTFOLIO_OPERATIONS_QUERY_OPTIONS,
          staleTime: 'static',
        }),
        queryClient.query({
          ...PORTFOLIO_POSITIONS_QUERY_OPTIONS,
          staleTime: 'static',
        }),
        parseCsv(PORTFOLIO_ENDPOINTS.data.accounts, ACCOUNT_ROW_SCHEMA),
      ])

      return {
        positions: buildPositionRows(rawOperations, rawPositions),
        rawPositions,
        rawOperations,
        accountLabels: buildAccountLabels(accountRows),
      }
    },
  })
}
