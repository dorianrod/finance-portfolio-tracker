import type { HistoricalSnapshot } from '@/domains/portfolio/shared/helpers/transformers/historicalFundSnapshots/historicalFundSnapshots.types'
import { historicalSnapshotsByParent } from '@/domains/portfolio/shared/helpers/transformers/historicalFundSnapshots/historicalSnapshotsByParent'
import type { HistoricalFundHolding } from '@/domains/portfolio/shared/types/fundHolding.type'

import { latestSnapshotAt } from './latestSnapshotAt'

export function selectHistoricalFundHoldingsAtDate(
  history: HistoricalFundHolding[],
  date: Date,
): HistoricalFundHolding[] {
  const snapshotsByParent = historicalSnapshotsByParent(history)
  const selected = new Map<string, HistoricalSnapshot>()
  for (const holding of history) {
    const parentKey =
      holding.parentIsin || holding.parentTicker || holding.parentName
    if (!parentKey || selected.has(parentKey)) continue
    const snapshot = latestSnapshotAt(
      snapshotsByParent.get(parentKey),
      new Date(date),
    )
    if (snapshot) selected.set(parentKey, snapshot)
  }
  return [...selected.values()].flatMap((snapshot) => snapshot.holdings)
}
