import { queryOptions } from '@tanstack/react-query'

import { PORTFOLIO_ENDPOINTS } from '@/domains/portfolio/shared/apis/endpoints'
import { portfolioQueryKeys } from '@/domains/portfolio/shared/apis/queryKeys'
import { RAW_POSITION_SCHEMA } from '@/domains/portfolio/shared/apis/schemas/portfolioCsvSchemas/rawPositionSchema'
import { parseCsv } from '@/shared/csv/csvData/parseCsv'

// All consumers share the validated source snapshot for the dashboard session.
export const PORTFOLIO_POSITIONS_QUERY_OPTIONS = queryOptions({
  queryKey: portfolioQueryKeys.data('all-positions'),
  queryFn: () =>
    parseCsv(PORTFOLIO_ENDPOINTS.data.positions, RAW_POSITION_SCHEMA),
  staleTime: Infinity,
  gcTime: Infinity,
})
