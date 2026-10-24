import { PORTFOLIO_ENDPOINTS } from '@/domains/portfolio/shared/apis/endpoints'
import { useQuery } from '@tanstack/react-query'
import { parseCsv } from '@/shared/csv/csvData'
import { toRawRows } from '@/domains/portfolio/shared/helpers/mappers/toRawIsinRows'
import type { RawIsinRows } from '@/domains/portfolio/shared/types/rawIsinData.type'
import { ALLOCATION_BY_ISIN_ROW_SCHEMA } from '@/domains/portfolio/shared/apis/schemas/portfolioCsvSchemas'
import { portfolioQueryKeys } from '@/domains/portfolio/shared/apis/queryKeys'

export function useRawIsinData() {
  return useQuery<RawIsinRows>({
    queryKey: portfolioQueryKeys.data('raw-isin-allocation'),
    queryFn: async () => {
      const [geo, secteur, currency, classe] = await Promise.all([
        parseCsv(PORTFOLIO_ENDPOINTS.data.positionsGeoByIsin, ALLOCATION_BY_ISIN_ROW_SCHEMA),
        parseCsv(PORTFOLIO_ENDPOINTS.data.positionsSecteurByIsin, ALLOCATION_BY_ISIN_ROW_SCHEMA),
        parseCsv(PORTFOLIO_ENDPOINTS.data.positionsCurrencyByIsin, ALLOCATION_BY_ISIN_ROW_SCHEMA),
        parseCsv(PORTFOLIO_ENDPOINTS.data.positionsClasseByIsin, ALLOCATION_BY_ISIN_ROW_SCHEMA),
      ])

      return {
        geo: toRawRows(geo),
        secteur: toRawRows(secteur),
        currency: toRawRows(currency),
        classe: toRawRows(classe),
      }
    },
  })
}
