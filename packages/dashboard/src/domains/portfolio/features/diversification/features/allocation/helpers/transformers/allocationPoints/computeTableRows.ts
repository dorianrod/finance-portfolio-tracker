import type { AllocationFilter } from '@/domains/portfolio/features/diversification/features/allocation/types/allocationChart.type'
import type { MatchingIsinRow } from '@/domains/portfolio/features/diversification/features/allocation/types/matchingIsinRow.type'
import type { RawIsinData } from '@/domains/portfolio/shared/types/rawIsinData.type'
import { getOwnValue } from '@/shared/helpers/transformers/getOwnValue'

export function computeTableRows(
  rawData: RawIsinData,
  matchingIsins: Set<string>,
  filter: AllocationFilter,
  asOfDate?: Date,
): MatchingIsinRow[] {
  const rows = rawData[filter.type]
  const latestDate = rows.reduce(
    (latest, row) =>
      (!asOfDate || row.snapshot_date <= asOfDate) &&
      row.snapshot_date.getTime() > latest
        ? row.snapshot_date.getTime()
        : latest,
    Number.NEGATIVE_INFINITY,
  )
  const byIsin = new Map<string, MatchingIsinRow>()
  for (const row of rows) {
    if (
      row.snapshot_date.getTime() !== latestDate ||
      !matchingIsins.has(row.isin)
    )
      continue
    const totalValue = Object.values(row.values).reduce(
      (sum, value) => sum + value,
      0,
    )
    const filteredValue = getOwnValue(row.values, filter.value) ?? 0
    const current = byIsin.get(row.isin)
    if (current) {
      current.totalValue += totalValue
      current.filteredValue += filteredValue
    } else {
      byIsin.set(row.isin, {
        isin: row.isin,
        name: row.name,
        totalValue,
        filteredValue,
      })
    }
  }

  return [...byIsin.values()].toSorted(
    (a, b) => b.filteredValue - a.filteredValue,
  )
}
