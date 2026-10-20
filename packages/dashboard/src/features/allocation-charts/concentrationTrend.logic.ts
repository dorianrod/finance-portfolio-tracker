import { accountFilterId } from '@/shared/filters/accountFilter'
import { CASH_SUFFIX } from '@/shared/constants/accountCategories'
import type { RawPosition } from '@/types/domain'

const NON_INVESTMENT_CATEGORIES = new Set(['savings', 'checking'])

export interface HistoricalConcentrationHolding {
  key: string
  label: string
  name: string
  value: number
  weight: number
}

export interface HistoricalConcentrationPoint {
  date: string
  positionsTo25Pct: number
  positionsTo50Pct: number
  positionsTo75Pct: number
  positionsTo90Pct: number
  effectiveCount: number
  holdingCount: number
  holdings: HistoricalConcentrationHolding[]
}

export interface AnnualConcentrationFrame extends HistoricalConcentrationPoint {
  year: number
}

export function nextPlaybackIndex(index: number, frameCount: number): {
  index: number
  complete: boolean
} {
  if (frameCount <= 0 || index >= frameCount - 1) return { index: Math.max(0, index), complete: true }
  const nextIndex = index + 1
  return { index: nextIndex, complete: nextIndex >= frameCount - 1 }
}

export function shouldAnimateConcentration(prefersReducedMotion: boolean): boolean {
  return !prefersReducedMotion
}

function isApplicable(row: RawPosition): boolean {
  const category = row.account_category?.trim().toLowerCase() ?? ''
  const accountType = row.account_type?.trim().toLowerCase() ?? ''
  return !NON_INVESTMENT_CATEGORIES.has(category)
    && !accountType.endsWith(CASH_SUFFIX.toLowerCase())
}

function assetKey(row: RawPosition): string {
  return row.isin.trim() || row.ticker.trim() || row.name.trim()
}

function positionsNeededForShare(
  holdings: HistoricalConcentrationHolding[],
  targetPct: number,
): number {
  let cumulativeWeight = 0
  for (let index = 0; index < holdings.length; index += 1) {
    cumulativeWeight += holdings[index].weight
    if (cumulativeWeight + 1e-9 >= targetPct) return index + 1
  }
  return holdings.length
}

export function buildHistoricalConcentration(
  rows: RawPosition[],
  accountFilters: Set<string> = new Set(),
  accountTypeFilters: Set<string> = new Set(),
): HistoricalConcentrationPoint[] {
  const byDate = new Map<string, Map<string, { label: string; name: string; value: number }>>()

  for (const row of rows) {
    if (!row.snapshot_date || !isApplicable(row)) continue
    if (accountFilters.size > 0 && !accountFilters.has(accountFilterId(row))) continue
    if (accountTypeFilters.size > 0 && !accountTypeFilters.has(row.account_type ?? '')) continue

    const value = Number.parseFloat(row.total_value)
    const key = assetKey(row)
    if (!key || !Number.isFinite(value) || value <= 0) continue

    const assets = byDate.get(row.snapshot_date) ?? new Map()
    const current = assets.get(key) ?? {
      label: row.ticker.trim() || row.name.trim() || row.isin.trim(),
      name: row.name.trim() || row.ticker.trim() || row.isin.trim(),
      value: 0,
    }
    current.value += value
    assets.set(key, current)
    byDate.set(row.snapshot_date, assets)
  }

  return [...byDate.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([date, assets]) => {
      const ranked = [...assets.entries()]
        .map(([key, asset]) => ({ key, ...asset }))
        .sort((left, right) => right.value - left.value || left.key.localeCompare(right.key))
      const total = ranked.reduce((sum, holding) => sum + holding.value, 0)
      const holdings = ranked.map((holding) => ({
        ...holding,
        weight: total > 0 ? (holding.value / total) * 100 : 0,
      }))
      const squaredWeightSum = holdings.reduce(
        (sum, holding) => sum + Math.pow(holding.weight / 100, 2),
        0,
      )

      return {
        date,
        positionsTo25Pct: positionsNeededForShare(holdings, 25),
        positionsTo50Pct: positionsNeededForShare(holdings, 50),
        positionsTo75Pct: positionsNeededForShare(holdings, 75),
        positionsTo90Pct: positionsNeededForShare(holdings, 90),
        effectiveCount: squaredWeightSum > 0 ? 1 / squaredWeightSum : 0,
        holdingCount: holdings.length,
        holdings,
      }
    })
}

export function buildAnnualConcentrationFrames(
  points: HistoricalConcentrationPoint[],
): AnnualConcentrationFrame[] {
  const latestByYear = new Map<number, HistoricalConcentrationPoint>()

  for (const point of points) {
    const year = Number.parseInt(point.date.slice(0, 4), 10)
    if (!Number.isFinite(year)) continue
    const current = latestByYear.get(year)
    if (!current || point.date > current.date) latestByYear.set(year, point)
  }

  return [...latestByYear.entries()]
    .sort(([left], [right]) => left - right)
    .map(([year, point]) => ({
      ...point,
      year,
      holdings: point.holdings.slice(0, 10),
    }))
}
