import type { RawIsinData } from '@/hooks/useRawIsinData'
import type { PositionRow } from '@/types/domain'

export interface AccountCoverage {
  account: string
  allocated: number
  unallocated: number
}

export interface AllocationCoverageIssue {
  id: string
  name: string
  value: number
  unallocated: number
}

export interface DimensionCoverage {
  dimension: 'geo' | 'secteur' | 'currency' | 'classe'
  allocated: number
  unallocated: number
  issues: AllocationCoverageIssue[]
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

/** Monetary allocation coverage per dimension. Explicit `nc` weights and
 * completely missing rows are both counted as unallocated and remain
 * traceable to the responsible current position.
 */
export function computeAllocationCoverageByDimension(
  positions: PositionRow[],
  rawData: RawIsinData,
): DimensionCoverage[] {
  return (['geo', 'secteur', 'currency', 'classe'] as const).map((dimension) => {
    const latestByKey = new Map<string, (typeof rawData)[typeof dimension][number]>()
    for (const row of rawData[dimension]) {
      const current = latestByKey.get(row.isin)
      if (!current || row.snapshot_date > current.snapshot_date) latestByKey.set(row.isin, row)
    }
    let allocated = 0
    let unallocated = 0
    const issues = new Map<string, AllocationCoverageIssue>()
    for (const position of positions) {
      const value = position.status === 'active' ? Math.max(0, position.total_value ?? 0) : 0
      if (value <= 0) continue
      const key = position.isin || `NC-${position.name}`
      const allocation = latestByKey.get(key)
      const allocationTotal = allocation
        ? Object.values(allocation.values).reduce((sum, amount) => sum + amount, 0)
        : 0
      const ncRatio = allocationTotal > 0
        ? Math.min(1, Math.max(0, (allocation?.values.nc ?? 0) / allocationTotal))
        : 1
      const missing = value * ncRatio
      allocated += value - missing
      unallocated += missing
      if (missing > 0.01) {
        const current = issues.get(key) ?? { id: key, name: position.name, value: 0, unallocated: 0 }
        current.value += value
        current.unallocated += missing
        issues.set(key, current)
      }
    }
    return {
      dimension,
      allocated,
      unallocated,
      issues: [...issues.values()].sort((a, b) => b.unallocated - a.unallocated),
    }
  })
}
