import { PORTFOLIO_ENDPOINTS } from '@/domains/portfolio/shared/apis/endpoints'
import { useQuery } from '@tanstack/react-query'
import { parseCsv } from '@/shared/csv/csvData'
import { buildPositionsHistory } from '@/domains/portfolio/shared/helpers/aggregators/buildPositionsHistory'
import { RAW_POSITION_SCHEMA } from '@/domains/portfolio/shared/apis/schemas/portfolioCsvSchemas'
import { portfolioQueryKeys } from '@/domains/portfolio/shared/apis/queryKeys'

export function usePositionsHistory(isin: string | null) {
  return useQuery({
    queryKey: portfolioQueryKeys.data('positions-history'),
    queryFn: async () => buildPositionsHistory(
      await parseCsv(PORTFOLIO_ENDPOINTS.data.positions, RAW_POSITION_SCHEMA),
    ),
    select: (historyByPosition) => isin ? historyByPosition.get(isin) ?? null : null,
  })
}
