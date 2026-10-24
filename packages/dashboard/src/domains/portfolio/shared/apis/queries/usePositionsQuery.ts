import { useQuery } from '@tanstack/react-query'

import { PORTFOLIO_ENDPOINTS } from '@/domains/portfolio/shared/apis/endpoints'
import { portfolioQueryKeys } from '@/domains/portfolio/shared/apis/queryKeys'
import { RAW_POSITION_SCHEMA } from '@/domains/portfolio/shared/apis/schemas/portfolioCsvSchemas'
import type { RawPosition } from '@/domains/portfolio/shared/types/rawPosition.type'
import { parseCsv } from '@/shared/csv/csvData'

export function usePositionsQuery() {
  return useQuery<RawPosition[]>({
    queryKey: portfolioQueryKeys.data('all-positions'),
    queryFn: () =>
      parseCsv(PORTFOLIO_ENDPOINTS.data.positions, RAW_POSITION_SCHEMA),
  })
}
