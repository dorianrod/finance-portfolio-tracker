import { PORTFOLIO_ENDPOINTS } from '@/domains/portfolio/apis/endpoints'
import { useEffect, useState } from 'react'
import { parseCsv } from '@/shared/csv/csvData'
import { toRawRows, type RawIsinRow } from '@/domains/portfolio/helpers/rawIsinData.logic'
import { ALLOCATION_BY_ISIN_ROW_SCHEMA } from '@/domains/portfolio/apis/schemas/portfolioCsvSchemas'

export type { RawIsinRow }

export interface RawIsinData {
  geo: RawIsinRow[]
  secteur: RawIsinRow[]
  currency: RawIsinRow[]
  classe: RawIsinRow[]
  loading: boolean
}

export function useRawIsinData(): RawIsinData {
  const [data, setData] = useState<RawIsinData>({
    geo: [], secteur: [], currency: [], classe: [], loading: true,
  })

  useEffect(() => {
    Promise.all([
      parseCsv(PORTFOLIO_ENDPOINTS.data.positionsGeoByIsin, ALLOCATION_BY_ISIN_ROW_SCHEMA),
      parseCsv(PORTFOLIO_ENDPOINTS.data.positionsSecteurByIsin, ALLOCATION_BY_ISIN_ROW_SCHEMA),
      parseCsv(PORTFOLIO_ENDPOINTS.data.positionsCurrencyByIsin, ALLOCATION_BY_ISIN_ROW_SCHEMA),
      parseCsv(PORTFOLIO_ENDPOINTS.data.positionsClasseByIsin, ALLOCATION_BY_ISIN_ROW_SCHEMA),
    ])
      .then(([geo, secteur, currency, classe]) => {
        setData({
          geo: toRawRows(geo),
          secteur: toRawRows(secteur),
          currency: toRawRows(currency),
          classe: toRawRows(classe),
          loading: false,
        })
      })
      .catch(() => setData((d) => ({ ...d, loading: false })))
  }, [])

  return data
}
