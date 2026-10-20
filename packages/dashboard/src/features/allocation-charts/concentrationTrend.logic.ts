import { accountFilterId } from '@/shared/filters/accountFilter'
import { CASH_SUFFIX } from '@/shared/constants/accountCategories'
import type { RawPosition } from '@/types/domain'
import type { HistoricalFundHolding } from '@/hooks/useFundHoldings'

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
  positionsTo25Pct: number | null
  positionsTo50Pct: number | null
  positionsTo75Pct: number | null
  positionsTo90Pct: number | null
  effectiveCount: number
  holdingCount: number
  coveragePct: number
  identifiedValue: number
  undisclosedValue: number
  opaqueValue: number
  selectedValue: number
  holdings: HistoricalConcentrationHolding[]
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
): number | null {
  let cumulativeWeight = 0
  for (let index = 0; index < holdings.length; index += 1) {
    cumulativeWeight += holdings[index].weight
    if (cumulativeWeight + 1e-9 >= targetPct) return index + 1
  }
  return null
}

function matchesFilters(
  row: RawPosition,
  accountFilters: Set<string>,
  accountTypeFilters: Set<string>,
): boolean {
  return isApplicable(row)
    && (accountFilters.size === 0 || accountFilters.has(accountFilterId(row)))
    && (accountTypeFilters.size === 0 || accountTypeFilters.has(row.account_type ?? ''))
}

function concentrationPoint(
  date: string,
  assets: Map<string, { label: string; name: string; value: number }>,
  selectedValue: number,
  identifiedValue: number,
  undisclosedValue: number,
  opaqueValue: number,
): HistoricalConcentrationPoint {
  const ranked = [...assets.entries()]
    .map(([key, asset]) => ({ key, ...asset }))
    .sort((left, right) => right.value - left.value || left.key.localeCompare(right.key))
  const holdings = ranked.map((holding) => ({
    ...holding,
    weight: selectedValue > 0 ? (holding.value / selectedValue) * 100 : 0,
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
    coveragePct: selectedValue > 0 ? (identifiedValue / selectedValue) * 100 : 0,
    identifiedValue,
    undisclosedValue,
    opaqueValue,
    selectedValue,
    holdings,
  }
}

export function buildHistoricalConcentration(
  rows: RawPosition[],
  accountFilters: Set<string> = new Set(),
  accountTypeFilters: Set<string> = new Set(),
): HistoricalConcentrationPoint[] {
  const byDate = new Map<string, Map<string, { label: string; name: string; value: number }>>()

  for (const row of rows) {
    if (!row.snapshot_date || !matchesFilters(row, accountFilters, accountTypeFilters)) continue

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
      const total = [...assets.values()].reduce((sum, holding) => sum + holding.value, 0)
      return concentrationPoint(date, assets, total, total, 0, 0)
    })
}

interface HistoricalSnapshot {
  effectiveDate: string
  capturedAt: string
  holdings: HistoricalFundHolding[]
}

function historicalSnapshotsByParent(
  history: HistoricalFundHolding[],
): Map<string, HistoricalSnapshot[]> {
  const grouped = new Map<string, HistoricalFundHolding[]>()
  for (const holding of history) {
    const current = grouped.get(holding.historySnapshotId) ?? []
    current.push(holding)
    grouped.set(holding.historySnapshotId, current)
  }

  const byParent = new Map<string, HistoricalSnapshot[]>()
  for (const holdings of grouped.values()) {
    const first = holdings[0]
    const snapshot = {
      effectiveDate: first.effectiveDate,
      capturedAt: first.capturedAt,
      holdings,
    }
    for (const key of [first.parentIsin, first.parentTicker, first.parentName].filter(Boolean)) {
      const current = byParent.get(key) ?? []
      current.push(snapshot)
      byParent.set(key, current)
    }
  }
  for (const snapshots of byParent.values()) {
    snapshots.sort((left, right) =>
      left.effectiveDate.localeCompare(right.effectiveDate)
      || left.capturedAt.localeCompare(right.capturedAt))
  }
  return byParent
}

function latestSnapshotAt(
  snapshots: HistoricalSnapshot[] | undefined,
  date: string,
): HistoricalSnapshot | undefined {
  if (!snapshots) return undefined
  for (let index = snapshots.length - 1; index >= 0; index -= 1) {
    if (snapshots[index].effectiveDate <= date) return snapshots[index]
  }
  return undefined
}

function isFundPosition(row: RawPosition): boolean {
  return /\b(?:ETF|UCITS|FUND|FCP|FCPE|SICAV|OPCVM|PEE|PEI|PERCO)\b/i.test(row.name)
    || /^(?:Amundi|BNP Paribas Easy|Global X|iShares|L&G|Xtrackers|DWS|SPDR|Vanguard|Invesco|UBS|HSBC)\b/i.test(row.name)
}

export function buildHistoricalLookThroughConcentration(
  rows: RawPosition[],
  history: HistoricalFundHolding[],
  accountFilters: Set<string> = new Set(),
  accountTypeFilters: Set<string> = new Set(),
): HistoricalConcentrationPoint[] {
  if (history.length === 0) return []
  const snapshotsByParent = historicalSnapshotsByParent(history)
  const byDate = new Map<string, RawPosition[]>()
  for (const row of rows) {
    if (!row.snapshot_date || !matchesFilters(row, accountFilters, accountTypeFilters)) continue
    const value = Number.parseFloat(row.total_value)
    if (!Number.isFinite(value) || value <= 0) continue
    const current = byDate.get(row.snapshot_date) ?? []
    current.push(row)
    byDate.set(row.snapshot_date, current)
  }

  return [...byDate.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([date, positions]) => {
      const assets = new Map<string, { label: string; name: string; value: number }>()
      let hasApplicableHistoricalSnapshot = false
      let selectedValue = 0
      let identifiedValue = 0
      let undisclosedValue = 0
      let opaqueValue = 0

      const addAsset = (key: string, label: string, name: string, value: number) => {
        const current = assets.get(key) ?? { label, name, value: 0 }
        current.value += value
        assets.set(key, current)
      }

      for (const position of positions) {
        const value = Number.parseFloat(position.total_value)
        selectedValue += value
        const parentKey = position.isin.trim() || position.ticker.trim() || position.name.trim()
        const snapshot = latestSnapshotAt(snapshotsByParent.get(parentKey), date)
        if (snapshot) {
          hasApplicableHistoricalSnapshot = true
          const disclosedWeight = snapshot.holdings.reduce((sum, holding) => sum + holding.weight, 0)
          const scale = disclosedWeight > 1 ? 1 / disclosedWeight : 1
          for (const holding of snapshot.holdings) {
            addAsset(
              holding.issuerId || holding.holdingId,
              holding.issuerName || holding.holdingName,
              holding.issuerName || holding.holdingName,
              value * holding.weight * scale,
            )
          }
          const explainedWeight = Math.min(1, disclosedWeight)
          identifiedValue += value * explainedWeight
          undisclosedValue += value * (1 - explainedWeight)
          continue
        }

        const directKey = position.isin.trim() || position.ticker.trim()
        if (!directKey) {
          opaqueValue += value
        } else if (isFundPosition(position) || snapshotsByParent.has(parentKey)) {
          undisclosedValue += value
        } else {
          addAsset(
            directKey,
            position.ticker.trim() || position.name.trim() || directKey,
            position.name.trim() || position.ticker.trim() || directKey,
            value,
          )
          identifiedValue += value
        }
      }

      return {
        point: concentrationPoint(
          date,
          assets,
          selectedValue,
          identifiedValue,
          undisclosedValue,
          opaqueValue,
        ),
        hasApplicableHistoricalSnapshot,
      }
    })
    .filter(({ hasApplicableHistoricalSnapshot }) => hasApplicableHistoricalSnapshot)
    .map(({ point }) => point)
}
