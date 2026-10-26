// eslint-disable-next-line local/shared-feature-usage -- Validated fund inputs feed holdings inspection, overview comparisons, diversification and quality assessment through the shell. See SHARED_OWNERSHIP_AUDIT.md.
import type { HistoricalFundHolding } from '@/domains/portfolio/shared/types/fundHolding.type'

import type { HistoricalSnapshot } from './buildConcentrationTrend.types'
import { historicalSnapshotsByParent } from './historicalSnapshotsByParent'
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
