import { useMemo } from 'react'

import { PORTFOLIO_ALLOCATION_QUERY_OPTIONS } from '@/domains/portfolio/shared/apis/queries/portfolioSourceQueries/portfolioAllocationQueryOptions'
import { useCachedPortfolioSourceQuery } from '@/domains/portfolio/shared/apis/queries/useCachedPortfolioSourceQuery'
import type { RawIsinRows } from '@/domains/portfolio/shared/types/rawIsinData.type'

export function usePortfolioAllocationData() {
  const { data: allocations = EMPTY_ALLOCATIONS, isPending } =
    useCachedPortfolioSourceQuery<RawIsinRows>(
      PORTFOLIO_ALLOCATION_QUERY_OPTIONS.queryKey,
    )
  return useMemo(
    () => ({ ...allocations, loading: isPending }),
    [allocations, isPending],
  )
}
const EMPTY_ALLOCATIONS: RawIsinRows = {
  geo: [],
  secteur: [],
  currency: [],
  classe: [],
}
