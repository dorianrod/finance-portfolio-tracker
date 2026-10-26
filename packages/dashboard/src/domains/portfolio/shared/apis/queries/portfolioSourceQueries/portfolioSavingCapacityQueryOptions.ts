// eslint-disable-next-line local/shared-feature-usage -- The shell supplies this savings source to wealth analysis and overview comparisons. See SHARED_OWNERSHIP_AUDIT.md.
import { queryOptions } from '@tanstack/react-query'

import { PORTFOLIO_ENDPOINTS } from '@/domains/portfolio/shared/apis/endpoints'
import { portfolioQueryKeys } from '@/domains/portfolio/shared/apis/queryKeys'
import { RAW_SAVING_CAPACITY_SCHEMA } from '@/domains/portfolio/shared/apis/schemas/portfolioCsvSchemas/rawSavingCapacitySchema'
import { parseCsv } from '@/shared/csv/csvData/parseCsv'

export const PORTFOLIO_SAVING_CAPACITY_QUERY_OPTIONS = queryOptions({
  queryKey: portfolioQueryKeys.data('saving-capacity-source'),
  queryFn: () =>
    parseCsv(
      PORTFOLIO_ENDPOINTS.data.savingCapacity,
      RAW_SAVING_CAPACITY_SCHEMA,
    ),
  staleTime: Infinity,
  gcTime: Infinity,
})
