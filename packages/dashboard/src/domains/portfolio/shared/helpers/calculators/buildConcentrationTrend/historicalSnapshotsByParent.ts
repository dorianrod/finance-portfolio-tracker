import type { HistoricalFundHolding } from '@/domains/portfolio/shared/types/fundHolding.type'

import type { HistoricalSnapshot } from './buildConcentrationTrend.types'

export function historicalSnapshotsByParent(
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
    for (const key of [
      first.parentIsin,
      first.parentTicker,
      first.parentName,
    ].filter(Boolean)) {
      const current = byParent.get(key) ?? []
      current.push(snapshot)
      byParent.set(key, current)
    }
  }
  for (const [key, snapshots] of byParent) {
    byParent.set(
      key,
      snapshots.toSorted((left, right) => {
        const difference =
          left.effectiveDate.getTime() - right.effectiveDate.getTime()
        return difference === 0
          ? (left.capturedAt?.getTime() ?? 0) -
              (right.capturedAt?.getTime() ?? 0)
          : difference
      }),
    )
  }
  return byParent
}
