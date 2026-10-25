import { useQuery, useQueryClient } from '@tanstack/react-query'

import { portfolioQueryKeys } from '@/domains/portfolio/shared/apis/queryKeys'
import { toLatestByIsin } from '@/domains/portfolio/shared/helpers/mappers/toLatestAllocationByIsin'
import type { IsinAllocation } from '@/domains/portfolio/shared/types/isinAllocation.type'

import { PORTFOLIO_ALLOCATION_QUERY_OPTIONS } from './portfolioSourceQueries'

const EMPTY_ISIN_ALLOCATIONS = new Map<string, IsinAllocation>()

export function useAllocationsByIsinQuery() {
  const queryClient = useQueryClient()
  return useQuery<Map<string, IsinAllocation>>({
    queryKey: portfolioQueryKeys.data('allocation-by-isin'),
    placeholderData: EMPTY_ISIN_ALLOCATIONS,
    queryFn: async () => {
      const { geo, secteur, currency, classe } = await queryClient.query({
        ...PORTFOLIO_ALLOCATION_QUERY_OPTIONS,
        staleTime: 'static',
      })
      const geoMap = toLatestByIsin(geo)
      const secteurMap = toLatestByIsin(secteur)
      const currencyMap = toLatestByIsin(currency)
      const classeMap = toLatestByIsin(classe)

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
