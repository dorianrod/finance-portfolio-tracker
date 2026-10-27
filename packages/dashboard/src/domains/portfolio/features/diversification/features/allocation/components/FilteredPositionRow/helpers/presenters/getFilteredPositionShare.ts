import type { MatchingIsinRow } from '@/domains/portfolio/features/diversification/features/allocation/types/allocationChart.type'

export function getFilteredPositionShare(row: MatchingIsinRow) {
  const percentage =
    row.totalValue > 0 ? (row.filteredValue / row.totalValue) * 100 : 0
  return { percentage, barShare: Math.min(percentage, 100) }
}
