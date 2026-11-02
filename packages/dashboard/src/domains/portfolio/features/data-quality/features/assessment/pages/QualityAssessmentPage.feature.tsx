import type { ReactNode } from 'react'

import { DataQualityTab } from '@/domains/portfolio/features/data-quality/features/assessment/pages/DataQualityTab/DataQualityTab.feature'
import { useQualityAssessmentModel } from '@/domains/portfolio/features/data-quality/features/assessment/services/useQualityAssessmentModel'
import { useGetQualitySourcesQuery } from '@/domains/portfolio/features/data-quality/shared/apis/queries/useGetQualitySourcesQuery'

export function QualityAssessmentPage({ children }: { children: ReactNode }) {
  useGetQualitySourcesQuery()
  const {
    latestAccountPositions,
    scopedPipelineErrors,
    scopedManualPriceOverrides,
    fundData,
    rawAllocationData,
  } = useQualityAssessmentModel()
  return (
    <DataQualityTab
      positions={latestAccountPositions}
      errors={scopedPipelineErrors}
      manualPriceOverrides={scopedManualPriceOverrides}
      fundStatuses={fundData.statuses}
      fundReport={fundData.report}
      fundHoldings={fundData.holdings}
      fundSnapshots={fundData.snapshots}
      fundUnresolved={fundData.unresolved}
      rawData={rawAllocationData}
    >
      {children}
    </DataQualityTab>
  )
}
