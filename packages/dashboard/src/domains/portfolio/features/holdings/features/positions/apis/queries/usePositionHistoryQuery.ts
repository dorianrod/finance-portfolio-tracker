import { useQuery, useQueryClient } from '@tanstack/react-query'

import { buildPositionsHistory } from '@/domains/portfolio/features/holdings/features/positions/helpers/aggregators/buildPositionsHistory'
import { PORTFOLIO_POSITIONS_QUERY_OPTIONS } from '@/domains/portfolio/shared/apis/queries/portfolioSourceQueries'
import { portfolioQueryKeys } from '@/domains/portfolio/shared/apis/queryKeys'

export function usePositionHistoryQuery(isin: string | null) {
  const queryClient = useQueryClient()
  return useQuery({
    queryKey: portfolioQueryKeys.data('positions-history'),
    enabled: Boolean(isin),
    queryFn: async () =>
      buildPositionsHistory(
        await queryClient.query({
          ...PORTFOLIO_POSITIONS_QUERY_OPTIONS,
          staleTime: 'static',
        }),
      ),
    select: (historyByPosition) =>
      isin ? (historyByPosition.get(isin) ?? null) : null,
  })
}
