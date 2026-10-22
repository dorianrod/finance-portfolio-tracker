import { PORTFOLIO_ENDPOINTS } from '@/domains/portfolio/apis/endpoints'
import { useQuery } from '@tanstack/react-query'
import { parseCsv } from '@/shared/csv/csvData'
import { buildAccountLabels, buildPositionRows } from '@/domains/portfolio/helpers/positionHierarchy.logic'
import {
  ACCOUNT_ROW_SCHEMA,
  RAW_OPERATION_SCHEMA,
  RAW_POSITION_SCHEMA,
} from '@/domains/portfolio/apis/schemas/portfolioCsvSchemas'
import { portfolioQueryKeys } from '@/domains/portfolio/apis/queryKeys'
import type { PositionRow, RawOperation, RawPosition } from '@/domains/portfolio/types/domain'

export interface DashboardData {
  accountLabels: Record<string, string>
  positions: PositionRow[]
  rawOperations: RawOperation[]
  rawPositions: RawPosition[]
}

export function useData() {
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
