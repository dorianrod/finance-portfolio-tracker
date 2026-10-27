import type { RawPosition } from '@/domains/portfolio/shared/types/rawPosition.type'

import { matchesPositionScope } from './matchesPositionScope'

// eslint-disable-next-line complexity -- reviewed: 2026-10-27; Account scope and finite snapshot guards produce one gross-value history series.
export function buildGrossValueHistory(
  rows: RawPosition[],
  accountFilters: Set<string> = new Set(),
  accountTypeFilters: Set<string> = new Set(),
): Array<{ date: Date; value: number }> {
  const byDate = new Map<number, number>()
  for (const row of rows) {
    if (
      row.snapshot_date == null ||
      !matchesPositionScope(row, accountFilters, accountTypeFilters)
    )
      continue
    const grossValue = row.total_value
    if (grossValue == null || !Number.isFinite(grossValue)) continue
    byDate.set(
      row.snapshot_date.getTime(),
      (byDate.get(row.snapshot_date.getTime()) ?? 0) + grossValue,
    )
  }
  return [...byDate.entries()]
    .toSorted(([left], [right]) => left - right)
    .map(([date, value]) => ({
      date: new Date(date),
      value: Math.round(value),
    }))
}
