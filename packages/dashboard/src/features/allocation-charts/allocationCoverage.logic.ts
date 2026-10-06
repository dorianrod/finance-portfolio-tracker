import type { RawIsinData } from '@/hooks/useRawIsinData'
import type { PositionRow } from '@/types/domain'

export interface AccountCoverage {
  account: string
  allocated: number
  unallocated: number
}

/** Keys ("isin" column of positions_*_by_isin.csv, "NC-<name>" when no ISIN)
 * that have an allocation match in at least one dimension's latest row --
 * mirrors _isin_or_synthetic_key in positions_allocation.py.
 */
function allocatedKeys(rawData: RawIsinData): Set<string> {
  const keys = new Set<string>()
  for (const dim of ['geo', 'secteur', 'currency', 'classe'] as const) {
    const latestDateByKey = new Map<string, string>()
    for (const row of rawData[dim]) {
      const cur = latestDateByKey.get(row.isin)
      if (!cur || row.snapshot_date > cur) latestDateByKey.set(row.isin, row.snapshot_date)
    }
    for (const key of latestDateByKey.keys()) keys.add(key)
  }
  return keys
}

/** Current (active, positive-value) positions split into allocated vs
 * unallocated amounts, grouped by account.
 */
export function computeAllocationCoverageByAccount(
  positions: PositionRow[],
  rawData: RawIsinData,
): AccountCoverage[] {
  const allocated = allocatedKeys(rawData)
  const byAccount = new Map<string, AccountCoverage>()

  for (const p of positions) {
    if (p.status !== 'active') continue
    const value = p.total_value ?? 0
    if (value <= 0) continue

    const key = p.isin || `NC-${p.name}`
    const cur = byAccount.get(p.account) ?? { account: p.account, allocated: 0, unallocated: 0 }
    if (allocated.has(key)) cur.allocated += value
    else cur.unallocated += value
    byAccount.set(p.account, cur)
  }

  return [...byAccount.values()].sort(
    (a, b) => b.allocated + b.unallocated - (a.allocated + a.unallocated),
  )
}
