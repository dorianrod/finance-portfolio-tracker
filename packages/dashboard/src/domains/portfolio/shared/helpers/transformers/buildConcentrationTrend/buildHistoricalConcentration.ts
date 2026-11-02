import { matchesFilters } from '@/domains/portfolio/shared/helpers/transformers/matchesFilters'
import type { HistoricalConcentrationPoint } from '@/domains/portfolio/shared/types/historicalConcentrationPoint.type'
import type { RawPosition } from '@/domains/portfolio/shared/types/rawPosition.type'

import { concentrationPoint } from './concentrationPoint'
import { isPositiveHistoricalSnapshot } from './isPositiveHistoricalSnapshot'

export function buildHistoricalConcentration(
  rows: RawPosition[],
  accountFilters: Set<string> = new Set(),
  accountTypeFilters: Set<string> = new Set(),
): HistoricalConcentrationPoint[] {
  const byDate = new Map<
    number,
    Map<string, { label: string; name: string; value: number }>
  >()

  const scopedRows = rows.filter(
    (row) =>
      isPositiveHistoricalSnapshot(row) &&
      matchesFilters(row, accountFilters, accountTypeFilters),
  )
  for (const row of scopedRows) {
    const value = row.total_value
    const key = assetKey(row)
    if (!key || value == null) continue
    const assets =
      byDate.get(row.snapshot_date.getTime()) ??
      new Map<string, { label: string; name: string; value: number }>()
    const current = assets.get(key) ?? historicalAssetIdentity(row)
    current.value += value
    assets.set(key, current)
    byDate.set(row.snapshot_date.getTime(), assets)
  }

  return [...byDate.entries()]
    .toSorted(([left], [right]) => left - right)
    .map(([date, assets]) => {
      const total = [...assets.values()].reduce(
        (sum, holding) => sum + holding.value,
        0,
      )
      return concentrationPoint(new Date(date), assets, total, total, 0, 0)
    })
}

function assetKey(row: RawPosition): string {
  return row.isin.trim() || row.ticker.trim() || row.name.trim()
}

function historicalAssetIdentity(row: RawPosition) {
  return {
    label: row.ticker.trim() || row.name.trim() || row.isin.trim(),
    name: row.name.trim() || row.ticker.trim() || row.isin.trim(),
    value: 0,
  }
}
