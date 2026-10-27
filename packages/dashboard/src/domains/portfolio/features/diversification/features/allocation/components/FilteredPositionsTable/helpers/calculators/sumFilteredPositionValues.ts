import type { MatchingIsinRow } from '@/domains/portfolio/features/diversification/features/allocation/types/allocationChart.type'

export function sumFilteredPositionValues(rows: MatchingIsinRow[]) {
  return rows.reduce((sum, row) => sum + row.filteredValue, 0)
}
