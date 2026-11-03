import { matchesPositionScope } from '@/domains/portfolio/features/overview/helpers/transformers/matchesPositionScope'
import type { RawPosition } from '@/domains/portfolio/shared/types/rawPosition.type'

export function buildNetValueHistory(
  rows: RawPosition[],
  accountFilters: Set<string>,
  accountTypeFilters: Set<string>,
): Array<{ date: Date; value: number | null }> {
  const byDate = new Map<number, number | null>()
  for (const row of rows) {
    if (!matchesPositionScope(row, accountFilters, accountTypeFilters)) continue
    const date = row.snapshot_date.getTime()
    const value = netPositionValue(row)
    const accumulated = byDate.get(date)
    byDate.set(
      date,
      value === null || accumulated === null
        ? null
        : (accumulated ?? 0) + value,
    )
  }
  return [...byDate.entries()]
    .toSorted(([left], [right]) => left - right)
    .map(([date, value]) => ({
      date: new Date(date),
      value: value === null ? null : Math.round(value),
    }))
}

function netPositionValue(row: RawPosition): number | null {
  const { total_value, unrealized_gain, unrealized_gain_net } = row
  if (
    total_value == null ||
    unrealized_gain == null ||
    unrealized_gain_net == null
  ) {
    return null
  }
  const value = total_value - (unrealized_gain - unrealized_gain_net)
  return Number.isFinite(value) ? value : null
}
