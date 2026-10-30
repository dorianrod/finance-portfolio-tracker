// eslint-disable-next-line local/review-shared-feature-sharing -- reviewed: 2026-10-27; Validated fund inputs feed holdings inspection, overview comparisons, diversification and quality assessment through the shell. See SHARED_OWNERSHIP_AUDIT.md.
import type { HistoricalSnapshot } from '@/domains/portfolio/shared/helpers/aggregators/historicalFundSnapshots/historicalFundSnapshots.types'
import { historicalSnapshotsByParent } from '@/domains/portfolio/shared/helpers/aggregators/historicalFundSnapshots/historicalSnapshotsByParent'
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
