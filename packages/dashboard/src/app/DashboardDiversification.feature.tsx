import { useAtomValue } from 'jotai'
import { useMemo } from 'react'

import { dashboardDiversificationViewAtom } from '@/app/stores/dashboardDiversification.atoms'
import { AllocationSection } from '@/domains/portfolio/features/diversification/features/allocation/components/AllocationSection.feature'
import { ConcentrationSection } from '@/domains/portfolio/features/diversification/features/concentration/components/ConcentrationSection.feature'
import { prepareDiversificationScope } from '@/domains/portfolio/features/diversification/shared/helpers/transformers/prepareDiversificationScope'
import type { DiversificationInputs } from '@/domains/portfolio/features/diversification/shared/types/diversificationInputs.type'
import i18n from '@/i18n/i18n'
import { Text } from '@/shared/ui/Text.view'

export function DiversificationCharts(inputs: DiversificationInputs) {
  const view = useAtomValue(dashboardDiversificationViewAtom)
  const { positions, rawData, accountFilters } = inputs
  const {
    applicablePositions,
    scopedRawData,
    hasCurrentData,
    hasSelectedValue,
    hasApplicableValue,
  } = useMemo(
    () => prepareDiversificationScope({ positions, rawData, accountFilters }),
    [positions, rawData, accountFilters],
  )
  if (inputs.rawData.loading)
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
      <ConcentrationSection
        view={view}
        positions={applicablePositions}
        fundHoldings={inputs.fundHoldings}
        dateTo={inputs.dateTo}
        rawPositions={inputs.rawPositions}
        fundHoldingsHistory={inputs.fundHoldingsHistory}
        accountFilters={inputs.accountFilters}
        accountTypeFilters={inputs.accountTypeFilters}
        dateFrom={inputs.dateFrom}
      />
      <AllocationSection
        rawData={scopedRawData}
        dateFrom={inputs.dateFrom}
        dateTo={inputs.dateTo}
        view={view}
      />
    </div>
  )
}
