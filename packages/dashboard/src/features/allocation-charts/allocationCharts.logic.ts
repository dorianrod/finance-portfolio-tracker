import type { AllocationPoint } from '@/hooks/useAllocationData'
import type { RawIsinRow, RawIsinData } from '@/hooks/useRawIsinData'
import type { AllocationFilter, MatchingIsinRow } from './allocationCharts.types'

export function groupTail(cats: Array<{ name: string; value: number }>): {
  main: Array<{ name: string; value: number }>
  grouped: Array<{ name: string; value: number }>
} {
  const withValue = cats.filter((c) => c.value > 0)
  if (withValue.length <= 3) return { main: withValue, grouped: [] }
  const total = withValue.reduce((s, c) => s + c.value, 0)
  const sorted = [...withValue].sort((a, b) => b.value - a.value)
  let cumulative = 0
  let splitIdx = 0
  for (let i = 0; i < sorted.length; i++) {
    cumulative += sorted[i].value
    splitIdx = i + 1
    if (cumulative >= total * 0.85) break
  }
  const grouped = sorted.slice(splitIdx)
  if (grouped.length <= 1) return { main: sorted, grouped: [] }
  return { main: sorted.slice(0, splitIdx), grouped }
}

export function computeMatchingIsins(rawData: RawIsinData, filter: AllocationFilter | null): Set<string> {
  if (!filter) return new Set()
  const rows = rawData[filter.type]
  const latestByIsin = new Map<string, RawIsinRow>()
  for (const row of rows) {
    const cur = latestByIsin.get(row.isin)
    if (!cur || row.snapshot_date > cur.snapshot_date) latestByIsin.set(row.isin, row)
  }
  const result = new Set<string>()
  for (const [isin, row] of latestByIsin) {
    if ((row.values[filter.value] ?? 0) > 0) result.add(isin)
  }
  return result
}

export function aggregateFilteredPoints(
  rows: RawIsinRow[],
  matchingIsins: Set<string>,
  restrictToCategory?: string,
): AllocationPoint[] {
  const byDate = new Map<string, Map<string, number>>()
  for (const row of rows) {
    if (!matchingIsins.has(row.isin)) continue
    const catMap = byDate.get(row.snapshot_date) ?? new Map<string, number>()
    for (const [cat, val] of Object.entries(row.values)) {
      if (restrictToCategory && cat !== restrictToCategory) continue
      catMap.set(cat, (catMap.get(cat) ?? 0) + val)
    }
    byDate.set(row.snapshot_date, catMap)
  }
  return [...byDate.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, catMap]) => {
      const categories = [...catMap.entries()]
        .map(([name, value]) => ({ name, value }))
        .filter((c) => c.value > 0)
        .sort((a, b) => {
          if (a.name === 'nc') return 1
          if (b.name === 'nc') return -1
          return b.value - a.value
        })
      return { date, categories }
    })
}

export function computeTableRows(
  rawData: RawIsinData,
  matchingIsins: Set<string>,
  filter: AllocationFilter,
): MatchingIsinRow[] {
  // Total value per ISIN (from any dimension, latest snapshot)
  const byIsin = new Map<string, { name: string; totalValue: number; date: string }>()
  for (const dim of ['geo', 'secteur', 'currency', 'classe'] as const) {
    for (const row of rawData[dim]) {
      if (!matchingIsins.has(row.isin)) continue
      const cur = byIsin.get(row.isin)
      if (!cur || row.snapshot_date > cur.date) {
        const total = Object.values(row.values).reduce((s, v) => s + v, 0)
        byIsin.set(row.isin, { name: row.name, totalValue: total, date: row.snapshot_date })
      }
    }
  }

  // Filtered category value per ISIN (from the filter dimension, latest snapshot)
  const latestFilterDim = new Map<string, Record<string, number>>()
  const latestFilterDate = new Map<string, string>()
  for (const row of rawData[filter.type]) {
    if (!matchingIsins.has(row.isin)) continue
    const curDate = latestFilterDate.get(row.isin)
    if (!curDate || row.snapshot_date > curDate) {
      latestFilterDim.set(row.isin, row.values)
      latestFilterDate.set(row.isin, row.snapshot_date)
    }
  }

  return [...byIsin.entries()]
    .map(([isin, { name, totalValue }]) => {
      const filteredValue = latestFilterDim.get(isin)?.[filter.value] ?? 0
      return { isin, name, totalValue, filteredValue }
    })
    .sort((a, b) => b.filteredValue - a.filteredValue)
}

export function computePopoverPos(rect: DOMRect, w: number, h: number): { top: number; left: number } {
  const M = 10
  let left = rect.right + M
  let top = rect.top + rect.height / 2 - h / 2
  if (left + w > window.innerWidth - M) left = rect.left - w - M
  if (left < M) left = M
  if (top < M) top = M
  if (top + h > window.innerHeight - M) top = window.innerHeight - h - M
  return { top, left }
}
