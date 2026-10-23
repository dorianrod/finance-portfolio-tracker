import { PORTFOLIO_ENDPOINTS } from '@/domains/portfolio/shared/apis/endpoints'
import { useQuery } from '@tanstack/react-query'
import { parseCsv } from '@/shared/csv/csvData'
import { buildPositionsHistory, type HistoryPoint } from '@/domains/portfolio/shared/helpers/aggregators/buildPositionsHistory'
import { RAW_POSITION_SCHEMA } from '@/domains/portfolio/shared/apis/schemas/portfolioCsvSchemas'
import { portfolioQueryKeys } from '@/domains/portfolio/shared/apis/queryKeys'

export type { HistoryPoint }

export function usePositionsHistory(isin: string | null): HistoryPoint[] | null {
  const { data } = useQuery({
    queryKey: portfolioQueryKeys.data('positions-history'),
    queryFn: async () => buildPositionsHistory(
      await parseCsv(PORTFOLIO_ENDPOINTS.data.positions, RAW_POSITION_SCHEMA),
    ),
  })

  if (!data || !isin) return null
  return data.get(isin) ?? null
}
