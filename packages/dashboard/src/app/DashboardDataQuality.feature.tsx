import { DataQualityTab } from '@/domains/portfolio/features/data-quality/features/assessment/pages/DataQualityTab.feature'
import type { DataQualityTabProps } from '@/domains/portfolio/features/data-quality/features/assessment/types/dataQualityTabProps.type'
import { ErrorsTab } from '@/domains/portfolio/features/data-quality/features/errors/components/ErrorsTab.feature'
import { ManualPriceOverridesTable } from '@/domains/portfolio/features/data-quality/features/errors/components/ManualPriceOverridesTable.view'

export function DashboardDataQuality(props: DataQualityTabProps) {
  return (
    <DataQualityTab {...props}>
      <DataQualityTab.Pipeline>
        <ErrorsTab errors={props.errors} />
      </DataQualityTab.Pipeline>
      <DataQualityTab.Prices>
        <ManualPriceOverridesTable
          manualPriceOverrides={props.manualPriceOverrides}
        />
      </DataQualityTab.Prices>
    </DataQualityTab>
  )
}
