import { useAtomValue } from 'jotai'

import { AllocationPage } from '@/domains/portfolio/features/diversification/features/allocation/pages/AllocationPage.feature'
import { useAllocationScope } from '@/domains/portfolio/features/diversification/features/allocation/services/useAllocationScope'
import { ConcentrationPage } from '@/domains/portfolio/features/diversification/features/concentration/pages/ConcentrationPage.feature'
import { dashboardDiversificationViewAtom } from '@/domains/portfolio/features/diversification/shared/stores/dashboardDiversification.atoms'
import i18n from '@/i18n/i18n'
import { Text } from '@/shared/ui/Text.view'

export function DiversificationCharts() {
  const view = useAtomValue(dashboardDiversificationViewAtom)
  const { hasCurrentData, hasSelectedValue, hasApplicableValue, loading } =
    useAllocationScope()
  if (loading)
    return (
      <Text as="p" variant="body" tone="muted">
        {i18n.t('ui.diversificationcharts.loadingBreakdowns')}
      </Text>
    )
  if (hasSelectedValue && !hasApplicableValue)
    return (
      <Text as="p" variant="body" tone="subtle">
        {i18n.t(
          'ui.diversificationcharts.diversificationIsNotApplicableToSavingsCheckingAndBrokerage',
        )}
      </Text>
    )
  if (view === 'current' && !hasCurrentData)
    return (
      <Text as="p" variant="body" tone="subtle">
        {i18n.t(
          'ui.diversificationcharts.noAllocationDataAvailableRunThePipelineToGenerate',
        )}
      </Text>
    )
  return (
    <div className="flex flex-col gap-4 mb-6">
      <ConcentrationPage />
      <AllocationPage />
    </div>
  )
}
