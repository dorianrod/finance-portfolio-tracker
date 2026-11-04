import { summarizeAllocationCoverage } from '@/domains/portfolio/features/data-quality/features/assessment/helpers/transformers/computeAllocationCoverage/summarizeAllocationCoverage'
import { hasMaterialQualityGap } from '@/domains/portfolio/features/data-quality/features/assessment/helpers/transformers/hasMaterialQualityGap'
import type { AccountCoverage } from '@/domains/portfolio/features/data-quality/features/assessment/types/accountCoverage.type'
import type { DimensionCoverage } from '@/domains/portfolio/features/data-quality/features/assessment/types/dimensionCoverage.type'
import { FilterScopeBadges } from '@/domains/portfolio/shared/components/filters/FilterScopeBadges.feature'

import { AccountCoverageRow } from './AccountCoverageRow.feature'
import { AllocationCoverageCardView } from './AllocationCoverageCard.view'
import { AllocationDimensionQuality } from './AllocationDimensionQuality.feature'

export function AllocationCoverageCard({
  coverage,
  dimensionCoverage,
}: {
  coverage: AccountCoverage[]
  dimensionCoverage: DimensionCoverage[]
}) {
  const summary = summarizeAllocationCoverage(coverage)
  if (summary.total <= 0) return null
  return (
    <AllocationCoverageCardView
      summary={summary}
      hasUnmappedGap={hasMaterialQualityGap(summary.unallocatedPct)}
    >
      <AllocationCoverageCardView.Scope>
        <FilterScopeBadges account="filterable" period="latest" />
      </AllocationCoverageCardView.Scope>
      <AllocationCoverageCardView.Accounts>
        {coverage.map((item) => (
          <AccountCoverageRow key={item.account} coverage={item} />
        ))}
      </AllocationCoverageCardView.Accounts>
      <AllocationCoverageCardView.Dimensions>
        <AllocationDimensionQuality coverage={dimensionCoverage} />
      </AllocationCoverageCardView.Dimensions>
    </AllocationCoverageCardView>
  )
}
