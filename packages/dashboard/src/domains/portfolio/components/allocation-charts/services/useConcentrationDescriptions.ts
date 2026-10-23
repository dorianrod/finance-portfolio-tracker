import type { ConcentrationMode } from '@/domains/portfolio/components/portfolio-charts/ConcentrationModeToggle.view'
import type { useAllocationCharts } from '@/domains/portfolio/services/useAllocationCharts'
import { useFormatMoney } from '@/shared/helpers/formatters/useFormatMoney'
import { useFormatPercentage } from '@/shared/helpers/formatters/useFormatPercentage'

export function useConcentrationDescriptions(
  concentration: ReturnType<typeof useAllocationCharts>['concentration'],
  mode: ConcentrationMode,
) {
  const formatMoney = useFormatMoney()
  const formatPercentage = useFormatPercentage()
  return {
    cumulativeDescription: mode === 'held'
      ? 'Share of the applicable portfolio held in the largest N positions.'
      : `Share of the applicable portfolio identified in the largest N look-through exposures · ${formatPercentage(concentration.coveragePct)} coverage.`,
    holdingsDescription: mode === 'held'
      ? 'Positions effectively held, aggregated across accounts.'
      : `Identified ${formatMoney(concentration.identifiedValue, { style: 'full' })} · undisclosed funds ${formatMoney(concentration.undisclosedValue, { style: 'full' })} · opaque ${formatMoney(concentration.opaqueValue, { style: 'full' })}.`,
  }
}
