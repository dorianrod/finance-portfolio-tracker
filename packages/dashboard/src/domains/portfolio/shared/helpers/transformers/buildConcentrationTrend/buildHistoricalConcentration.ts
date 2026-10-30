import { matchesFilters } from '@/domains/portfolio/shared/helpers/transformers/matchesFilters'
import type { HistoricalConcentrationPoint } from '@/domains/portfolio/shared/types/historicalConcentrationPoint.type'
import type { RawPosition } from '@/domains/portfolio/shared/types/rawPosition.type'

import { concentrationPoint } from './concentrationPoint'

// eslint-disable-next-line complexity -- reviewed: 2026-10-27; Scoped valid snapshots feed one date-by-asset accumulator and its concentration denominator.
export function buildHistoricalConcentration(
  rows: RawPosition[],
  accountFilters: Set<string> = new Set(),
  accountTypeFilters: Set<string> = new Set(),
): HistoricalConcentrationPoint[] {
  const byDate = new Map<
    number,
    Map<string, { label: string; name: string; value: number }>
  >()

  for (const row of rows) {
    if (
      row.snapshot_date == null ||
      !matchesFilters(row, accountFilters, accountTypeFilters)
    )
      continue

    const value = row.total_value
    const key = assetKey(row)
    if (!key || value == null || !Number.isFinite(value) || value <= 0) continue

    const assets =
      byDate.get(row.snapshot_date.getTime()) ??
      new Map<string, { label: string; name: string; value: number }>()
    const current = assets.get(key) ?? {
      label: row.ticker.trim() || row.name.trim() || row.isin.trim(),
      name: row.name.trim() || row.ticker.trim() || row.isin.trim(),
      value: 0,
    }
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
