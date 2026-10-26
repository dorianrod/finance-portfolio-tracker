import { useAtomValue } from 'jotai'
import { useMemo } from 'react'

import { dashboardDiversificationViewAtom } from '@/app/stores/dashboardDiversification.atoms'
import { AllocationSection } from '@/domains/portfolio/features/diversification/features/allocation/components/AllocationSection.feature'
import { excludeNonApplicableAllocationData } from '@/domains/portfolio/features/diversification/features/allocation/helpers/filters/scopeDiversificationData/excludeNonApplicableAllocationData'
import { scopeRawAllocationData } from '@/domains/portfolio/features/diversification/features/allocation/helpers/filters/scopeDiversificationData/scopeRawAllocationData'
import { ConcentrationSection } from '@/domains/portfolio/features/diversification/features/concentration/components/ConcentrationSection.feature'
import type { DiversificationInputs } from '@/domains/portfolio/features/diversification/shared/types/diversificationInputs.type'
import { isAssetAnalysisApplicablePosition } from '@/domains/portfolio/shared/helpers/quality/accountApplicability'
import i18n from '@/i18n/i18n'
import { Text } from '@/shared/ui/Text.view'

export function DiversificationCharts(inputs: DiversificationInputs) {
  const view = useAtomValue(dashboardDiversificationViewAtom)
  const applicablePositions = useMemo(
    () => inputs.positions.filter(isAssetAnalysisApplicablePosition),
    [inputs.positions],
  )
  const scopedRawData = useMemo(
    () =>
      excludeNonApplicableAllocationData(
        scopeRawAllocationData(inputs.rawData, inputs.accountFilters),
        inputs.positions,
      ),
    [inputs.rawData, inputs.accountFilters, inputs.positions],
  )
  const hasCurrentData = [
    scopedRawData.geo,
    scopedRawData.secteur,
    scopedRawData.currency,
    scopedRawData.classe,
  ].some((rows) => rows.length > 0)
  const hasSelectedValue = inputs.positions.some(
    (position) =>
      position.status === 'active' && (position.total_value ?? 0) > 0,
  )
  const hasApplicableValue = applicablePositions.some(
    (position) =>
      position.status === 'active' && (position.total_value ?? 0) > 0,
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
