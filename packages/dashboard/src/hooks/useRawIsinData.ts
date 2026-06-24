import { useEffect, useState } from 'react'
import { dataUrl, parseCsv } from '@/shared/csv/csvData'
import { toRawRows, type RawIsinRow } from '@/logic/rawIsinData.logic'

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
      parseCsv(dataUrl('positions_geo_by_isin.csv')),
      parseCsv(dataUrl('positions_secteur_by_isin.csv')),
      parseCsv(dataUrl('positions_currency_by_isin.csv')),
      parseCsv(dataUrl('positions_classe_by_isin.csv')),
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
