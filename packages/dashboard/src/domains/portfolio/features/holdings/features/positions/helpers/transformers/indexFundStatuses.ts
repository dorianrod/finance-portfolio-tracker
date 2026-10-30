import type { FundHoldingStatus } from '@/domains/portfolio/shared/types/fundHoldingStatus.type'

export function indexFundStatuses(
  statuses: readonly FundHoldingStatus[],
): FundStatusIndex {
  const byIsin = new Map<string, FundStatusIndexEntry>()
  const byTicker = new Map<string, FundStatusIndexEntry>()
  const byParentId = new Map<string, FundStatusIndexEntry>()
  for (const [index, status] of statuses.entries()) {
    const entry = { index, status }
    keepFirst(byIsin, status.parentIsin, entry)
    keepFirst(byTicker, status.parentTicker, entry)
    keepFirst(byParentId, status.parentId, entry)
  }

  return { byIsin, byTicker, byParentId }
}

export type FundStatusIndex = {
  readonly byIsin: ReadonlyMap<string, FundStatusIndexEntry>
  readonly byTicker: ReadonlyMap<string, FundStatusIndexEntry>
  readonly byParentId: ReadonlyMap<string, FundStatusIndexEntry>
}

export type FundStatusIndexEntry = {
  readonly index: number
  readonly status: FundHoldingStatus
}

function keepFirst(
  index: Map<string, FundStatusIndexEntry>,
  key: string,
  entry: FundStatusIndexEntry,
) {
  if (key && !index.has(key)) index.set(key, entry)
}
