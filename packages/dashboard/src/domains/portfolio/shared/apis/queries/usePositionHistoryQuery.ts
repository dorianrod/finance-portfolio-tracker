import { PORTFOLIO_ENDPOINTS } from '@/domains/portfolio/shared/apis/endpoints'
import { portfolioQueryKeys } from '@/domains/portfolio/shared/apis/queryKeys'
import { RAW_POSITION_SCHEMA } from '@/domains/portfolio/shared/apis/schemas/portfolioCsvSchemas'
import { buildPositionsHistory } from '@/domains/portfolio/shared/helpers/aggregators/buildPositionsHistory'
import { parseCsv } from '@/shared/csv/csvData'
import { useQuery } from '@tanstack/react-query'

export function usePositionHistoryQuery(isin: string | null) {
  return useQuery({
    queryKey: portfolioQueryKeys.data('positions-history'),
    enabled: Boolean(isin),
    queryFn: async () =>
      buildPositionsHistory(
        await parseCsv(PORTFOLIO_ENDPOINTS.data.positions, RAW_POSITION_SCHEMA),
      ),
    select: (historyByPosition) => (isin ? (historyByPosition.get(isin) ?? null) : null),
  })
}
