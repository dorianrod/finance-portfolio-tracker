import type { AllocationPoint } from '@/domains/portfolio/shared/types/allocationPoint.type'
import type { RawIsinRow } from '@/domains/portfolio/shared/types/rawIsinRow.type'

import { aggregateFilteredPoints } from './aggregateFilteredPoints'

export function aggregateAllocationPoints(
  rows: RawIsinRow[],
): AllocationPoint[] {
  return aggregateFilteredPoints(rows, new Set(rows.map((row) => row.isin)))
}
