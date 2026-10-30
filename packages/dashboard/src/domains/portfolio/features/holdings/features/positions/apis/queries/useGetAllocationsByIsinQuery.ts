import { useQuery, useQueryClient } from '@tanstack/react-query'

import { toLatestAllocationByIsin } from '@/domains/portfolio/features/holdings/features/positions/helpers/aggregators/toLatestAllocationByIsin'
import type { IsinAllocation } from '@/domains/portfolio/features/holdings/features/positions/types/isinAllocation.type'
import { PORTFOLIO_ALLOCATION_QUERY_OPTIONS } from '@/domains/portfolio/shared/apis/queries/portfolioSourceQueries/portfolioAllocationQueryOptions'
import { portfolioQueryKeys } from '@/domains/portfolio/shared/apis/queryKeys'

export function useGetAllocationsByIsinQuery() {
  const queryClient = useQueryClient()
  return useQuery<Map<string, IsinAllocation>>({
    queryKey: portfolioQueryKeys.data('allocation-by-isin'),
    placeholderData: EMPTY_ISIN_ALLOCATIONS,
    // eslint-disable-next-line complexity -- reviewed: 2026-10-27; The four optional allocation dimensions use one explicit name-precedence and missing-point policy.
    queryFn: async () => {
      const { geo, secteur, currency, classe } = await queryClient.query({
        ...PORTFOLIO_ALLOCATION_QUERY_OPTIONS,
        staleTime: 'static',
      })
      const geoMap = toLatestAllocationByIsin(geo)
      const secteurMap = toLatestAllocationByIsin(secteur)
      const currencyMap = toLatestAllocationByIsin(currency)
      const classeMap = toLatestAllocationByIsin(classe)

      const allIsins = new Set([
        ...geoMap.keys(),
        ...secteurMap.keys(),
        ...currencyMap.keys(),
        ...classeMap.keys(),
      ])
      const data = new Map<string, IsinAllocation>()
      for (const isin of allIsins) {
        const name =
          geoMap.get(isin)?.name ??
          secteurMap.get(isin)?.name ??
          currencyMap.get(isin)?.name ??
          classeMap.get(isin)?.name ??
          isin
        data.set(isin, {
          isin,
          name,
          geo: geoMap.get(isin)?.point ?? null,
          secteur: secteurMap.get(isin)?.point ?? null,
          currency: currencyMap.get(isin)?.point ?? null,
          classe: classeMap.get(isin)?.point ?? null,
        })
      }
      return data
    },
  })
}

const EMPTY_ISIN_ALLOCATIONS = new Map<string, IsinAllocation>()
