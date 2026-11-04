import { DataQualityTab } from '@/domains/portfolio/features/data-quality/features/assessment/pages/DataQualityTab/DataQualityTab.feature'
import { QualityAssessmentPage } from '@/domains/portfolio/features/data-quality/features/assessment/pages/QualityAssessmentPage.feature'
import { ManualPriceOverrides } from '@/domains/portfolio/features/data-quality/features/errors/pages/ManualPriceOverrides.feature'
import { PipelineErrors } from '@/domains/portfolio/features/data-quality/features/errors/pages/PipelineErrors.feature'

export function DashboardDataQuality() {
  return (
    <QualityAssessmentPage>
      <DataQualityTab.Pipeline>
        <PipelineErrors />
      </DataQualityTab.Pipeline>
      <DataQualityTab.Prices>
        <ManualPriceOverrides />
      </DataQualityTab.Prices>
    </QualityAssessmentPage>
  )
}
