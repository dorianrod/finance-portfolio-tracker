import type { AccountCoverage } from '@/domains/portfolio/features/data-quality/features/assessment/types/accountCoverage.type'
import { partitionPercentages } from '@/shared/helpers/calculators/partitionPercentages'

export function summarizeAllocationCoverage(coverage: CoverageAmounts[]) {
  const totals = coverage.reduce(
    (result, item) => ({
      allocated: result.allocated + item.allocated,
      unallocated: result.unallocated + item.unallocated,
      notApplicable: result.notApplicable + item.notApplicable,
    }),
    { allocated: 0, unallocated: 0, notApplicable: 0 },
  )
  const total = totals.allocated + totals.unallocated + totals.notApplicable
  const [allocatedPct, unallocatedPct, notApplicablePct] = partitionPercentages(
    [totals.allocated, totals.unallocated, totals.notApplicable],
  )
  return { ...totals, total, allocatedPct, unallocatedPct, notApplicablePct }
}

type CoverageAmounts = Pick<
  AccountCoverage,
  'allocated' | 'unallocated' | 'notApplicable'
>
