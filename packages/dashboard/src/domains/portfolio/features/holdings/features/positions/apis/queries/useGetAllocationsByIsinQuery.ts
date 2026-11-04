import { useQuery, useQueryClient } from '@tanstack/react-query'

import { buildAllocationsByIsin } from '@/domains/portfolio/features/holdings/features/positions/helpers/transformers/buildAllocationsByIsin'
import type { IsinAllocation } from '@/domains/portfolio/features/holdings/features/positions/types/isinAllocation.type'
import { PORTFOLIO_ALLOCATION_QUERY_OPTIONS } from '@/domains/portfolio/shared/apis/queries/portfolioSourceQueries/portfolioAllocationQueryOptions'
import { portfolioQueryKeys } from '@/domains/portfolio/shared/apis/queryKeys'

export function useGetAllocationsByIsinQuery() {
  const queryClient = useQueryClient()
  return useQuery<Map<string, IsinAllocation>>({
    queryKey: portfolioQueryKeys.data('allocation-by-isin'),
    placeholderData: EMPTY_ISIN_ALLOCATIONS,
    queryFn: async () => {
      const { geo, secteur, currency, classe } = await queryClient.query({
        ...PORTFOLIO_ALLOCATION_QUERY_OPTIONS,
        staleTime: 'static',
      })
      return buildAllocationsByIsin({ geo, secteur, currency, classe })
    },
  })
}

const EMPTY_ISIN_ALLOCATIONS = new Map<string, IsinAllocation>()
