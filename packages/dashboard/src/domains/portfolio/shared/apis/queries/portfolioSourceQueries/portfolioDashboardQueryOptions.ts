import { type QueryClient, queryOptions } from '@tanstack/react-query'

import { PORTFOLIO_ENDPOINTS } from '@/domains/portfolio/shared/apis/endpoints'
import { PORTFOLIO_OPERATIONS_QUERY_OPTIONS } from '@/domains/portfolio/shared/apis/queries/portfolioSourceQueries/portfolioOperationsQueryOptions'
import { PORTFOLIO_POSITIONS_QUERY_OPTIONS } from '@/domains/portfolio/shared/apis/queries/portfolioSourceQueries/portfolioPositionsQueryOptions'
import { portfolioQueryKeys } from '@/domains/portfolio/shared/apis/queryKeys'
import { ACCOUNT_ROW_SCHEMA } from '@/domains/portfolio/shared/apis/schemas/portfolioCsvSchemas/accountRowSchema'
import { buildAccountLabels } from '@/domains/portfolio/shared/helpers/transformers/buildPositionHierarchy/buildAccountLabels'
import { buildPositionRows } from '@/domains/portfolio/shared/helpers/transformers/buildPositionHierarchy/buildPositionRows'
import type { DashboardData } from '@/domains/portfolio/shared/types/dashboardData.type'
import { parseCsv } from '@/shared/csv/csvData/parseCsv'

export function getPortfolioDashboardQueryOptions(queryClient: QueryClient) {
  return queryOptions({
    queryKey: portfolioQueryKeys.data('dashboard'),
    queryFn: async (): Promise<DashboardData> => {
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
