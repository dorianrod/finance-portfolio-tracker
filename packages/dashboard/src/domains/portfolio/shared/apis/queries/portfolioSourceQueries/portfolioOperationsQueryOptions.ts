import { queryOptions } from '@tanstack/react-query'

import { PORTFOLIO_ENDPOINTS } from '@/domains/portfolio/shared/apis/endpoints'
import { portfolioQueryKeys } from '@/domains/portfolio/shared/apis/queryKeys'
import { RAW_OPERATION_SCHEMA } from '@/domains/portfolio/shared/apis/schemas/portfolioCsvSchemas/rawOperationSchema'
import { parseCsv } from '@/shared/csv/csvData/parseCsv'

export const PORTFOLIO_OPERATIONS_QUERY_OPTIONS = queryOptions({
  queryKey: portfolioQueryKeys.data('operations'),
  queryFn: () =>
    parseCsv(PORTFOLIO_ENDPOINTS.data.operations, RAW_OPERATION_SCHEMA),
  staleTime: Infinity,
  gcTime: Infinity,
})
