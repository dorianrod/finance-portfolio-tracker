import { hasMaterialQualityGap } from '@/domains/portfolio/features/data-quality/features/assessment/helpers/businessRules/hasMaterialQualityGap'
import { getUnclassifiedAllocationPercentage } from '@/domains/portfolio/features/data-quality/features/assessment/helpers/quality/computeAllocationCoverage/getUnclassifiedAllocationPercentage'
import { useDataQualityClassificationDetails } from '@/domains/portfolio/features/data-quality/features/assessment/pages/DataQualityTab/services/actions/useDataQualityClassificationDetails'
import type { DimensionCoverage } from '@/domains/portfolio/features/data-quality/features/assessment/types/dimensionCoverage.type'
import { Stack } from '@/shared/ui/layout/Stack.view'

import { AllocationDimensionRowView } from './AllocationDimensionRow.view'

export function AllocationDimensionQuality({
  coverage,
}: {
  coverage: DimensionCoverage[]
}) {
  return (
    <Stack gap="relaxed">
      {coverage.map((item) => (
        <AllocationDimensionRow key={item.dimension} item={item} />
      ))}
    </Stack>
  )
}

function AllocationDimensionRow({ item }: { item: DimensionCoverage }) {
  const { openClassificationDetails } = useDataQualityClassificationDetails()
  const missingPct = getUnclassifiedAllocationPercentage(item)
  return (
    <AllocationDimensionRowView
      item={item}
      missingPct={missingPct}
      materialGap={hasMaterialQualityGap(missingPct)}
      onOpenDetails={() => openClassificationDetails(item.dimension)}
    />
  )
}
