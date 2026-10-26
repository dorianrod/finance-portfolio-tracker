import { isAssetAnalysisApplicablePosition } from '@/domains/portfolio/shared/helpers/quality/accountApplicability'
import type { PositionRow } from '@/domains/portfolio/shared/types/positionRow.type'
import type { RawIsinData } from '@/domains/portfolio/shared/types/rawIsinData.type'

import type {
  AllocationCoverageIssue,
  DimensionCoverage,
} from './computeAllocationCoverage.types'

/** Monetary allocation coverage per dimension. Explicit `nc` weights and
 * completely missing rows are both counted as unallocated and remain
 * traceable to the responsible current position.
 */
export function computeAllocationCoverageByDimension(
  positions: PositionRow[],
  rawData: RawIsinData,
): DimensionCoverage[] {
  return (['geo', 'secteur', 'currency', 'classe'] as const).map(
    // eslint-disable-next-line complexity -- One dimension accumulator combines the latest breakdown, missing ratio and corresponding issue totals.
    (dimension) => {
      const latestByKey = new Map<
        string,
        (typeof rawData)[typeof dimension][number]
      >()
      for (const row of rawData[dimension]) {
        const current = latestByKey.get(row.isin)
        if (!current || row.snapshot_date > current.snapshot_date)
          latestByKey.set(row.isin, row)
      }
      let allocated = 0
      let unallocated = 0
      const issues = new Map<string, AllocationCoverageIssue>()
      for (const position of positions) {
        const value =
          position.status === 'active'
            ? Math.max(0, position.total_value ?? 0)
            : 0
        if (value <= 0) continue
        if (!isAssetAnalysisApplicablePosition(position)) continue
        const key = position.isin || `NC-${position.name}`
        const allocation = latestByKey.get(key)
        const allocationTotal = allocation
          ? Object.values(allocation.values).reduce(
              (sum, amount) => sum + amount,
              0,
            )
          : 0
        const ncRatio =
          allocationTotal > 0
            ? Math.min(
                1,
                Math.max(0, (allocation?.values.nc ?? 0) / allocationTotal),
              )
            : 1
        const missing = value * ncRatio
        allocated += value - missing
        unallocated += missing
        if (missing > 0.01) {
          const current = issues.get(key) ?? {
            id: key,
            name: position.name,
            value: 0,
            unallocated: 0,
          }
          current.value += value
          current.unallocated += missing
          issues.set(key, current)
        }
      }
      return {
        dimension,
        allocated,
        unallocated,
        issues: [...issues.values()].toSorted(
          (a, b) => b.unallocated - a.unallocated,
        ),
      }
    },
  )
}
