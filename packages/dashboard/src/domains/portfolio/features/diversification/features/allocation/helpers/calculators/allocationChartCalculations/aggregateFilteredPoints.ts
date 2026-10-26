import type { AllocationPoint } from '@/domains/portfolio/shared/types/allocationPoint.type'
import type { RawIsinRow } from '@/domains/portfolio/shared/types/rawIsinRow.type'

export function aggregateFilteredPoints(
  rows: RawIsinRow[],
  matchingIsins: Set<string>,
  restrictToCategory?: string,
): AllocationPoint[] {
  const byDate = new Map<number, Map<string, number>>()
  for (const row of rows) {
    if (!matchingIsins.has(row.isin)) continue
    const catMap =
      byDate.get(row.snapshot_date.getTime()) ?? new Map<string, number>()
    for (const [cat, val] of Object.entries(row.values)) {
      if (restrictToCategory && cat !== restrictToCategory) continue
      catMap.set(cat, (catMap.get(cat) ?? 0) + val)
    }
    byDate.set(row.snapshot_date.getTime(), catMap)
  }
  return [...byDate.entries()]
    .toSorted(([a], [b]) => a - b)
    .map(([date, catMap]) => {
      const categories = [...catMap.entries()]
        .map(([name, value]) => ({ name, value }))
        .filter((c) => c.value > 0)
        .toSorted((a, b) => {
          if (a.name === 'nc') return 1
          if (b.name === 'nc') return -1
          return b.value - a.value
        })
      return { date: new Date(date), categories }
    })
}
