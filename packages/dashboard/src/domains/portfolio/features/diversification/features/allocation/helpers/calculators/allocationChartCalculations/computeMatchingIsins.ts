import type { AllocationFilter } from '@/domains/portfolio/features/diversification/features/allocation/types/allocationChart.type'
import type { RawIsinData } from '@/domains/portfolio/shared/types/rawIsinData.type'

export function computeMatchingIsins(
  rawData: RawIsinData,
  filter: AllocationFilter | null,
  asOfDate?: Date,
): Set<string> {
  if (!filter) return new Set()
  const rows = rawData[filter.type]
  const latestDate = rows.reduce(
    (latest, row) =>
      (!asOfDate || row.snapshot_date <= asOfDate) &&
      row.snapshot_date.getTime() > latest
        ? row.snapshot_date.getTime()
        : latest,
    Number.NEGATIVE_INFINITY,
  )
  const result = new Set<string>()
  for (const row of rows) {
    if (
      row.snapshot_date.getTime() === latestDate &&
      (row.values[filter.value] ?? 0) > 0
    ) {
      result.add(row.isin)
    }
  }
  return result
}
