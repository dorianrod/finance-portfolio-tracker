import { PORTFOLIO_ENDPOINTS } from '@/domains/portfolio/apis/endpoints'
import { useQuery } from '@tanstack/react-query'
import { parseCsv } from '@/shared/csv/csvData'
import type { AllocationPoint } from '@/domains/portfolio/types/allocation'
import { toLatestByIsin } from '@/domains/portfolio/helpers/allocationByIsin.logic'
import { ALLOCATION_BY_ISIN_ROW_SCHEMA } from '@/domains/portfolio/apis/schemas/portfolioCsvSchemas'
import { portfolioQueryKeys } from '@/domains/portfolio/apis/queryKeys'

const EMPTY_ISIN_ALLOCATIONS = new Map<string, IsinAllocation>()

export interface IsinAllocation {
  isin: string
  name: string
  geo: AllocationPoint | null
  secteur: AllocationPoint | null
  currency: AllocationPoint | null
  classe: AllocationPoint | null
}

export function useAllocationByIsin() {
  return useQuery({
    queryKey: portfolioQueryKeys.data('allocation-by-isin'),
    initialData: EMPTY_ISIN_ALLOCATIONS,
    queryFn: async () => {
      const [geo, secteur, currency, classe] = await Promise.all([
      parseCsv(PORTFOLIO_ENDPOINTS.data.positionsGeoByIsin, ALLOCATION_BY_ISIN_ROW_SCHEMA),
      parseCsv(PORTFOLIO_ENDPOINTS.data.positionsSecteurByIsin, ALLOCATION_BY_ISIN_ROW_SCHEMA),
      parseCsv(PORTFOLIO_ENDPOINTS.data.positionsCurrencyByIsin, ALLOCATION_BY_ISIN_ROW_SCHEMA),
      parseCsv(PORTFOLIO_ENDPOINTS.data.positionsClasseByIsin, ALLOCATION_BY_ISIN_ROW_SCHEMA),
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
