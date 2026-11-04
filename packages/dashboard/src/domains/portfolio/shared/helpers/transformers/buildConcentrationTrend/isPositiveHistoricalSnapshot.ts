import type { RawPosition } from '@/domains/portfolio/shared/types/rawPosition.type'

export function isPositiveHistoricalSnapshot(
  row: RawPosition,
): row is RawPosition & { total_value: number } {
  return (
    row.snapshot_date != null &&
    row.total_value != null &&
    Number.isFinite(row.total_value) &&
    row.total_value > 0
  )
}
