import { ManualPriceOverridesTable } from '@/domains/portfolio/features/data-quality/features/errors/components/manualPriceOverridesTable/ManualPriceOverridesTable.view'
import { useGetQualitySourcesQuery } from '@/domains/portfolio/features/data-quality/shared/apis/queries/useGetQualitySourcesQuery'
import { useQualityIssueScope } from '@/domains/portfolio/features/data-quality/shared/services/useQualityIssueScope'
export function ManualPriceOverrides() {
  useGetQualitySourcesQuery()
  const { scopedManualPriceOverrides } = useQualityIssueScope()
  return (
    <ManualPriceOverridesTable
      manualPriceOverrides={scopedManualPriceOverrides}
    />
  )
}
