import type { AllocationPoint } from '@/hooks/useAllocationData'
import type { RawIsinRow, RawIsinData } from '@/hooks/useRawIsinData'
import type { AllocationFilter, MatchingIsinRow } from './allocationCharts.types'

const PINNED_CATEGORIES = new Set(['Not concerned', 'nc'])

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
  const pinned = grouped.filter((category) => PINNED_CATEGORIES.has(category.name))
  const groupable = grouped.filter((category) => !PINNED_CATEGORIES.has(category.name))
  if (groupable.length <= 1) return { main: sorted, grouped: [] }
  return { main: [...sorted.slice(0, splitIdx), ...pinned], grouped: groupable }
}

export function computeMatchingIsins(rawData: RawIsinData, filter: AllocationFilter | null): Set<string> {
  if (!filter) return new Set()
  const rows = rawData[filter.type]
  const latestDate = rows.reduce(
    (latest, row) => row.snapshot_date > latest ? row.snapshot_date : latest,
    '',
  )
  const result = new Set<string>()
  for (const row of rows) {
    if (row.snapshot_date === latestDate && (row.values[filter.value] ?? 0) > 0) {
      result.add(row.isin)
    }
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
  const rows = rawData[filter.type]
  const latestDate = rows.reduce(
    (latest, row) => row.snapshot_date > latest ? row.snapshot_date : latest,
    '',
  )
  const byIsin = new Map<string, MatchingIsinRow>()
  for (const row of rows) {
    if (row.snapshot_date !== latestDate || !matchingIsins.has(row.isin)) continue
    const totalValue = Object.values(row.values).reduce((sum, value) => sum + value, 0)
    const filteredValue = row.values[filter.value] ?? 0
    const current = byIsin.get(row.isin)
    if (current) {
      current.totalValue += totalValue
      current.filteredValue += filteredValue
    } else {
      byIsin.set(row.isin, { isin: row.isin, name: row.name, totalValue, filteredValue })
    }
  }

  return [...byIsin.values()]
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
