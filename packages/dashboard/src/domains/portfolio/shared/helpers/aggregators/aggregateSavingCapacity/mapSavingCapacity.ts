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
