import { useQuery } from '@tanstack/react-query'

import { PORTFOLIO_ENDPOINTS } from '@/domains/portfolio/shared/apis/endpoints'
import { portfolioQueryKeys } from '@/domains/portfolio/shared/apis/queryKeys'
import { ALLOCATION_BY_ISIN_ROW_SCHEMA } from '@/domains/portfolio/shared/apis/schemas/portfolioCsvSchemas'
import { toLatestByIsin } from '@/domains/portfolio/shared/helpers/mappers/toLatestAllocationByIsin'
import type { IsinAllocation } from '@/domains/portfolio/shared/types/isinAllocation.type'
import { parseCsv } from '@/shared/csv/csvData'

const EMPTY_ISIN_ALLOCATIONS = new Map<string, IsinAllocation>()

export function useAllocationsByIsinQuery() {
  return useQuery<Map<string, IsinAllocation>>({
    queryKey: portfolioQueryKeys.data('allocation-by-isin'),
    placeholderData: EMPTY_ISIN_ALLOCATIONS,
    queryFn: async () => {
      const [geo, secteur, currency, classe] = await Promise.all([
        parseCsv(
          PORTFOLIO_ENDPOINTS.data.positionsGeoByIsin,
          ALLOCATION_BY_ISIN_ROW_SCHEMA,
        ),
        parseCsv(
          PORTFOLIO_ENDPOINTS.data.positionsSecteurByIsin,
          ALLOCATION_BY_ISIN_ROW_SCHEMA,
        ),
        parseCsv(
          PORTFOLIO_ENDPOINTS.data.positionsCurrencyByIsin,
          ALLOCATION_BY_ISIN_ROW_SCHEMA,
        ),
        parseCsv(
          PORTFOLIO_ENDPOINTS.data.positionsClasseByIsin,
          ALLOCATION_BY_ISIN_ROW_SCHEMA,
        ),
      ])
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
