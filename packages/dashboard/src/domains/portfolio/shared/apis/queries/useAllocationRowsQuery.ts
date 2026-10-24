import { useQuery } from '@tanstack/react-query'

import { PORTFOLIO_ENDPOINTS } from '@/domains/portfolio/shared/apis/endpoints'
import { portfolioQueryKeys } from '@/domains/portfolio/shared/apis/queryKeys'
import { ALLOCATION_BY_ISIN_ROW_SCHEMA } from '@/domains/portfolio/shared/apis/schemas/portfolioCsvSchemas'
import type { RawIsinRows } from '@/domains/portfolio/shared/types/rawIsinData.type'
import { parseCsv } from '@/shared/csv/csvData'

export function useAllocationRowsQuery() {
  return useQuery<RawIsinRows>({
    queryKey: portfolioQueryKeys.data('raw-isin-allocation'),
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

      return {
        geo: geo.filter((row) => row.isin),
        secteur: secteur.filter((row) => row.isin),
        currency: currency.filter((row) => row.isin),
        classe: classe.filter((row) => row.isin),
      }
    },
  })
}
