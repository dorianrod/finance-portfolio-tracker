// eslint-disable-next-line local/review-shared-feature-sharing -- reviewed: 2026-10-27; The shell supplies this common position snapshot and account scope to holdings, wealth, performance and quality. See SHARED_OWNERSHIP_AUDIT.md.
import { useQueryClient, useSuspenseQuery } from '@tanstack/react-query'

import { PORTFOLIO_ENDPOINTS } from '@/domains/portfolio/shared/apis/endpoints'
import { PORTFOLIO_OPERATIONS_QUERY_OPTIONS } from '@/domains/portfolio/shared/apis/queries/portfolioSourceQueries/portfolioOperationsQueryOptions'
import { PORTFOLIO_POSITIONS_QUERY_OPTIONS } from '@/domains/portfolio/shared/apis/queries/portfolioSourceQueries/portfolioPositionsQueryOptions'
import { portfolioQueryKeys } from '@/domains/portfolio/shared/apis/queryKeys'
import { ACCOUNT_ROW_SCHEMA } from '@/domains/portfolio/shared/apis/schemas/portfolioCsvSchemas/accountRowSchema'
import { buildAccountLabels } from '@/domains/portfolio/shared/helpers/transformers/buildPositionHierarchy/buildAccountLabels'
import { buildPositionRows } from '@/domains/portfolio/shared/helpers/transformers/buildPositionHierarchy/buildPositionRows'
import type { DashboardData } from '@/domains/portfolio/shared/types/dashboardData.type'
import { parseCsv } from '@/shared/csv/csvData/parseCsv'

export function useGetDashboardDataQuery() {
  const queryClient = useQueryClient()
  return useSuspenseQuery<DashboardData>({
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
