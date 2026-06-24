import { useEffect, useState } from 'react'
import { dataUrl, parseCsv } from '@/shared/csv/csvData'
import type { AllocationPoint } from './useAllocationData'
import { toLatestByIsin } from '@/logic/allocationByIsin.logic'

export interface IsinAllocation {
  isin: string
  name: string
  geo: AllocationPoint | null
  secteur: AllocationPoint | null
  currency: AllocationPoint | null
  classe: AllocationPoint | null
}

export function useAllocationByIsin(): { data: Map<string, IsinAllocation>; loading: boolean } {
  const [state, setState] = useState<{ data: Map<string, IsinAllocation>; loading: boolean }>({
    data: new Map(),
    loading: true,
  })

  useEffect(() => {
    Promise.all([
      parseCsv(dataUrl('positions_geo_by_isin.csv')),
      parseCsv(dataUrl('positions_secteur_by_isin.csv')),
      parseCsv(dataUrl('positions_currency_by_isin.csv')),
      parseCsv(dataUrl('positions_classe_by_isin.csv')),
    ])
      .then(([geo, secteur, currency, classe]) => {
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
        setState({ data, loading: false })
      })
      .catch(() => setState((s) => ({ ...s, loading: false })))
  }, [])

  return state
}
