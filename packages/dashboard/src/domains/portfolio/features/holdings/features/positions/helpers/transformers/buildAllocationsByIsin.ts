import type { RawIsinRows } from '@/domains/portfolio/shared/types/rawIsinData.type'

import type { IsinAllocation } from '../../types/isinAllocation.type'
import { toLatestAllocationByIsin } from './toLatestAllocationByIsin'

export function buildAllocationsByIsin({
  geo,
  secteur,
  currency,
  classe,
}: RawIsinRows): Map<string, IsinAllocation> {
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
    const name = allocationName(isin, [
      geoMap,
      secteurMap,
      currencyMap,
      classeMap,
    ])
    data.set(isin, {
      isin,
      name,
      geo: allocationPoint(geoMap, isin),
      secteur: allocationPoint(secteurMap, isin),
      currency: allocationPoint(currencyMap, isin),
      classe: allocationPoint(classeMap, isin),
    })
  }
  return data
}

type DimensionAllocations = ReturnType<typeof toLatestAllocationByIsin>

function allocationName(isin: string, dimensions: DimensionAllocations[]) {
  for (const dimension of dimensions) {
    const allocation = dimension.get(isin)
    if (allocation) return allocation.name
  }
  return isin
}

function allocationPoint(dimension: DimensionAllocations, isin: string) {
  return dimension.get(isin)?.point ?? null
}
