// eslint-disable-next-line local/review-shared-feature-sharing -- reviewed: 2026-10-27; The shell supplies this savings source to wealth analysis and overview comparisons. See SHARED_OWNERSHIP_AUDIT.md.
import type { RawSavingCapacityRow } from '@/domains/portfolio/shared/helpers/aggregators/aggregateSavingCapacity/aggregateSavingCapacity.types'
import type { SavingCapacityPoint } from '@/domains/portfolio/shared/types/savingCapacityPoint.type'

export function mapSavingCapacity(
  rows: RawSavingCapacityRow[],
): SavingCapacityPoint[] {
  return rows.map((r) => ({
    date: r.snapshot_date,
    savings_delta: r.savings_delta,
    perf_delta: r.perf_delta,
  }))
}
