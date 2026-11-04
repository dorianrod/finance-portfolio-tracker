import type { FundHoldingStatus } from '@/domains/portfolio/shared/types/fundHoldingStatus.type'
import type { PositionRow } from '@/domains/portfolio/shared/types/positionRow.type'

import type { FundStatusIndex, FundStatusIndexEntry } from './indexFundStatuses'

export function statusForPosition(
  position: Pick<PositionRow, 'isin' | 'ticker'>,
  index: FundStatusIndex,
): FundHoldingStatus | undefined {
  const parentId = position.isin || position.ticker
  if (!parentId) return undefined
  const candidates = [
    index.byIsin.get(position.isin),
    index.byTicker.get(position.ticker),
    index.byParentId.get(parentId),
  ]
  let first: FundStatusIndexEntry | undefined
  // Preserve the source's first match across all three identifier kinds.
  for (const candidate of candidates) {
    if (candidate && (first == null || candidate.index < first.index))
      first = candidate
  }
  return first?.status
}
