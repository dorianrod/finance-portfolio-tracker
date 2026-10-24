import type { AllocationPoint } from '@/domains/portfolio/shared/types/allocationPoint.type'

import { accountFilterId } from '@/domains/portfolio/shared/helpers/filters/accountFilter'
import {
  formatGroupedAllocationLabel,
  groupAllocationTail,
} from '@/domains/portfolio/shared/helpers/presenters/groupAllocationTail'
import { isAssetAnalysisApplicablePosition } from '@/domains/portfolio/shared/helpers/quality/accountApplicability'
import type {
  AllocationFilter,
  MatchingIsinRow,
} from '@/domains/portfolio/shared/types/allocationChart.type'
import type { PositionRow } from '@/domains/portfolio/shared/types/positionRow.type'
import type { RawIsinData } from '@/domains/portfolio/shared/types/rawIsinData.type'
import type { RawIsinRow } from '@/domains/portfolio/shared/types/rawIsinRow.type'
import { partitionPercentages } from '@/shared/helpers/calculators/partitionPercentages'

function dateTimestamp(date: Date | undefined): number | null {
  if (!date) return null
  const timestamp = date.getTime()
  return Number.isNaN(timestamp) ? null : timestamp
}

export function allocationTrendDomain(points: AllocationPoint[]): [number, number] {
  const firstPoint = dateTimestamp(points[0]?.date)
  const lastPoint = dateTimestamp(points.at(-1)?.date)
  const start = firstPoint ?? 0
  const end = lastPoint ?? start
  return [start, Math.max(start, end)]
}

export function buildAllocationTrend(points: AllocationPoint[]): {
  categories: string[]
  groupedCategory: string | null
  rows: Array<Record<string, number | null>>
} {
  const totalsByCategory = new Map<string, number>()
  for (const point of points) {
    for (const category of point.categories) {
      totalsByCategory.set(
        category.name,
        (totalsByCategory.get(category.name) ?? 0) + category.value,
      )
    }
  }

  const { main, grouped } = groupAllocationTail(
    [...totalsByCategory]
      .map(([name, value]) => ({ name, value }))
      .toSorted((a, b) => b.value - a.value),
  )
  const mainNames = main.map((category) => category.name)
  const groupedNames = new Set(grouped.map((category) => category.name))
  const groupedKey = grouped.length > 1 ? formatGroupedAllocationLabel(grouped.length) : null
  const categories = [...mainNames, ...(groupedKey ? [groupedKey] : [])]

  const rows = points.map((point) => {
    const valuesByCategory = new Map(
      point.categories.map((category) => [category.name, category.value]),
    )
    const values = mainNames.map((name) => valuesByCategory.get(name) ?? 0)
    if (groupedKey) {
      values.push(
        point.categories.reduce(
          (sum, category) => (groupedNames.has(category.name) ? sum + category.value : sum),
          0,
        ),
      )
    }

    const total = values.reduce((sum, value) => sum + value, 0)
    const percentages = total > 0 ? partitionPercentages(values) : values.map(() => null)
    const row: Record<string, number | null> = {
      date: dateTimestamp(point.date) ?? 0,
    }
    categories.forEach((category, index) => {
      row[category] = percentages[index]
    })
    return row
  })

  return { categories, groupedCategory: groupedKey, rows }
}

export function computeMatchingIsins(
  rawData: RawIsinData,
  filter: AllocationFilter | null,
  asOfDate?: Date,
): Set<string> {
  if (!filter) return new Set()
  const rows = rawData[filter.type]
  const latestDate = rows.reduce(
    (latest, row) =>
      (!asOfDate || row.snapshot_date <= asOfDate) && row.snapshot_date.getTime() > latest
        ? row.snapshot_date.getTime()
        : latest,
    Number.NEGATIVE_INFINITY,
  )
  const result = new Set<string>()
  for (const row of rows) {
    if (row.snapshot_date.getTime() === latestDate && (row.values[filter.value] ?? 0) > 0) {
      result.add(row.isin)
    }
  }
  return result
}

export function scopeRawAllocationData(rawData: RawIsinData, accounts: Set<string>): RawIsinData {
  if (accounts.size === 0) return rawData
  const inScope = (row: RawIsinRow) =>
    !!row.account &&
    accounts.has(
      accountFilterId({
        account: row.account,
        account_type: row.account_type,
      }),
    )
  return {
    geo: rawData.geo.filter(inScope),
    secteur: rawData.secteur.filter(inScope),
    currency: rawData.currency.filter(inScope),
    classe: rawData.classe.filter(inScope),
    loading: rawData.loading,
  }
}

export function excludeNonApplicableAllocationData(
  rawData: RawIsinData,
  positions: PositionRow[],
): RawIsinData {
  const excludedAccounts = new Set(
    positions
      .filter((position) => !isAssetAnalysisApplicablePosition(position))
      .map(accountFilterId),
  )
  if (excludedAccounts.size === 0) return rawData
  const isApplicable = (row: RawIsinRow) =>
    !row.account ||
    !excludedAccounts.has(
      accountFilterId({
        account: row.account,
        account_type: row.account_type,
      }),
    )
  return {
    geo: rawData.geo.filter(isApplicable),
    secteur: rawData.secteur.filter(isApplicable),
    currency: rawData.currency.filter(isApplicable),
    classe: rawData.classe.filter(isApplicable),
    loading: rawData.loading,
  }
}

export function aggregateAllocationPoints(rows: RawIsinRow[]): AllocationPoint[] {
  return aggregateFilteredPoints(rows, new Set(rows.map((row) => row.isin)))
}

export function aggregateFilteredPoints(
  rows: RawIsinRow[],
  matchingIsins: Set<string>,
  restrictToCategory?: string,
): AllocationPoint[] {
  const byDate = new Map<number, Map<string, number>>()
  for (const row of rows) {
    if (!matchingIsins.has(row.isin)) continue
    const catMap = byDate.get(row.snapshot_date.getTime()) ?? new Map<string, number>()
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

export function computeTableRows(
  rawData: RawIsinData,
  matchingIsins: Set<string>,
  filter: AllocationFilter,
  asOfDate?: Date,
): MatchingIsinRow[] {
  const rows = rawData[filter.type]
  const latestDate = rows.reduce(
    (latest, row) =>
      (!asOfDate || row.snapshot_date <= asOfDate) && row.snapshot_date.getTime() > latest
        ? row.snapshot_date.getTime()
        : latest,
    Number.NEGATIVE_INFINITY,
  )
  const byIsin = new Map<string, MatchingIsinRow>()
  for (const row of rows) {
    if (row.snapshot_date.getTime() !== latestDate || !matchingIsins.has(row.isin)) continue
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

  return [...byIsin.values()].toSorted((a, b) => b.filteredValue - a.filteredValue)
}
