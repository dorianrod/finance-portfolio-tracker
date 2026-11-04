import { skipToken, useQuery } from '@tanstack/react-query'

import type { portfolioQueryKeys } from '@/domains/portfolio/shared/apis/queryKeys'

export function useCachedPortfolioSourceQuery<TData>(
  queryKey: ReturnType<typeof portfolioQueryKeys.data>,
) {
  return useQuery<TData>({
    queryKey,
    queryFn: skipToken,
    placeholderData: undefined,
  })
}
