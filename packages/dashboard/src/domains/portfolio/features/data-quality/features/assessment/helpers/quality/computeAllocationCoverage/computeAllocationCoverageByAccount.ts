import { isAssetAnalysisApplicablePosition } from '@/domains/portfolio/shared/helpers/quality/accountApplicability'
import type { PositionRow } from '@/domains/portfolio/shared/types/positionRow.type'
import type { RawIsinData } from '@/domains/portfolio/shared/types/rawIsinData.type'

import type { AccountCoverage } from './computeAllocationCoverage.types'

/** Current (active, positive-value) positions split into allocated vs
 * unallocated amounts, grouped by account.
 */
// eslint-disable-next-line complexity -- reviewed: 2026-10-27; One account accumulator partitions active value into mapped, missing and inapplicable coverage.
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

    const cur = byAccount.get(p.account) ?? {
      account: p.account,
      allocated: 0,
      unallocated: 0,
      notApplicable: 0,
    }
    if (isAssetAnalysisApplicablePosition(p)) {
      const key = p.isin || `NC-${p.name}`
      if (allocated.has(key)) cur.allocated += value
      else cur.unallocated += value
    } else {
      cur.notApplicable += value
    }
    byAccount.set(p.account, cur)
  }

  return [...byAccount.values()].toSorted(
    (a, b) =>
      b.allocated +
      b.unallocated +
      b.notApplicable -
      (a.allocated + a.unallocated + a.notApplicable),
  )
}

/** Keys ("isin" column of positions_*_by_isin.csv, "NC-<name>" when no ISIN)
 * that have an allocation match in at least one dimension's latest row --
 * mirrors _isin_or_synthetic_key in positions_allocation.py.
 */
function allocatedKeys(rawData: RawIsinData): Set<string> {
  const keys = new Set<string>()
  for (const dim of ['geo', 'secteur', 'currency', 'classe'] as const) {
    for (const row of rawData[dim]) keys.add(row.isin)
  }
  return keys
}
