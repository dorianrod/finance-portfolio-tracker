// eslint-disable-next-line local/review-shared-feature-sharing -- The shell supplies this savings source to wealth analysis and overview comparisons. See SHARED_OWNERSHIP_AUDIT.md.
import type { SavingCapacityPoint } from '@/domains/portfolio/shared/types/savingCapacityPoint.type'

import type { RawSavingCapacityByAccountRow } from './aggregateSavingCapacity.types'

export function aggregateSavingCapacityByAccount(
  rows: RawSavingCapacityByAccountRow[],
  accountSet: Set<string>,
): SavingCapacityPoint[] {
  const filtered = rows.filter((r) => accountSet.has(r.account))
  const byDate = new Map<
    number,
    { savings_delta: number; perf_delta: number }
  >()
  for (const r of filtered) {
    const d = r.snapshot_date
    if (!byDate.has(d.getTime()))
      byDate.set(d.getTime(), { savings_delta: 0, perf_delta: 0 })
    const entry = byDate.get(d.getTime())!
    entry.savings_delta += r.savings_delta
    entry.perf_delta += r.perf_delta
  }
  return Array.from(byDate.entries())
    .toSorted(([a], [b]) => a - b)
    .map(([date, vals]) => ({
      date: new Date(date),
      savings_delta: Math.round(vals.savings_delta * 100) / 100,
      perf_delta: Math.round(vals.perf_delta * 100) / 100,
    }))
}
