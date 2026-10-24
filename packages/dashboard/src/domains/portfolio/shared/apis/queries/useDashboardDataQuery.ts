import { PORTFOLIO_ENDPOINTS } from '@/domains/portfolio/shared/apis/endpoints'
import { portfolioQueryKeys } from '@/domains/portfolio/shared/apis/queryKeys'
import {
  ACCOUNT_ROW_SCHEMA,
  RAW_OPERATION_SCHEMA,
  RAW_POSITION_SCHEMA,
} from '@/domains/portfolio/shared/apis/schemas/portfolioCsvSchemas'
import {
  buildAccountLabels,
  buildPositionRows,
} from '@/domains/portfolio/shared/helpers/mappers/buildPositionHierarchy'
import type { DashboardData } from '@/domains/portfolio/shared/types/dashboardData.type'
import { parseCsv } from '@/shared/csv/csvData'
import { useQuery } from '@tanstack/react-query'

export function useDashboardDataQuery() {
  return useQuery<DashboardData>({
    queryKey: portfolioQueryKeys.data('dashboard'),
    queryFn: async () => {
      const [rawOperations, rawPositions, accountRows] = await Promise.all([
        parseCsv(PORTFOLIO_ENDPOINTS.data.operations, RAW_OPERATION_SCHEMA),
        parseCsv(PORTFOLIO_ENDPOINTS.data.positions, RAW_POSITION_SCHEMA),
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
