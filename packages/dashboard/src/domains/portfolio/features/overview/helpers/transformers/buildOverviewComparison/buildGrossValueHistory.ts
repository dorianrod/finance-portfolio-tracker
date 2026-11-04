import { matchesPositionScope } from '@/domains/portfolio/features/overview/helpers/transformers/matchesPositionScope'
import type { RawPosition } from '@/domains/portfolio/shared/types/rawPosition.type'

export function buildGrossValueHistory(
  rows: RawPosition[],
  accountFilters: Set<string> = new Set(),
  accountTypeFilters: Set<string> = new Set(),
): Array<{ date: Date; value: number }> {
  const byDate = new Map<number, number>()
  for (const row of rows) {
    if (!isScopedGrossValueSnapshot(row, accountFilters, accountTypeFilters))
      continue
    const grossValue = row.total_value
    if (grossValue == null) continue
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

function isScopedGrossValueSnapshot(
  row: RawPosition,
  accounts: Set<string>,
  accountTypes: Set<string>,
) {
  return (
    row.snapshot_date != null &&
    matchesPositionScope(row, accounts, accountTypes) &&
    row.total_value != null &&
    Number.isFinite(row.total_value)
  )
}
