// eslint-disable-next-line local/review-shared-feature-sharing -- The shell supplies this savings source to wealth analysis and overview comparisons. See SHARED_OWNERSHIP_AUDIT.md.
import type { SavingCapacityPoint } from '@/domains/portfolio/shared/types/savingCapacityPoint.type'

import type { RawSavingCapacityRow } from './aggregateSavingCapacity.types'

export function mapSavingCapacity(
  rows: RawSavingCapacityRow[],
): SavingCapacityPoint[] {
  return rows.map((r) => ({
    date: r.snapshot_date,
    savings_delta: r.savings_delta,
    perf_delta: r.perf_delta,
  }))
}
