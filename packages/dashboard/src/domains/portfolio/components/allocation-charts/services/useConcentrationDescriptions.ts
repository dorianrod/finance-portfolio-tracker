import type { ConcentrationMode } from '@/domains/portfolio/components/portfolio-charts/ConcentrationModeToggle.view'
import type { useAllocationCharts } from '@/domains/portfolio/services/useAllocationCharts'
import { useFormatMoney } from '@/shared/helpers/formatters/useFormatMoney'
import { useFormatPercentage } from '@/shared/helpers/formatters/useFormatPercentage'
import i18n from '@/i18n/i18n'

export function useConcentrationDescriptions(
  concentration: ReturnType<typeof useAllocationCharts>['concentration'],
  mode: ConcentrationMode,
) {
  const formatMoney = useFormatMoney()
  const formatPercentage = useFormatPercentage()
  return {
    cumulativeDescription: mode === 'held'
      ? i18n.t('ui.useconcentrationdescriptions.heldCumulativeDescription')
      : i18n.t('ui.useconcentrationdescriptions.underlyingCumulativeDescription', {
          coverage: formatPercentage(concentration.coveragePct),
        }),
    holdingsDescription: mode === 'held'
      ? i18n.t('ui.useconcentrationdescriptions.heldPositionsDescription')
      : i18n.t('ui.useconcentrationdescriptions.underlyingPositionsDescription', {
          identified: formatMoney(concentration.identifiedValue, { style: 'full' }),
          undisclosed: formatMoney(concentration.undisclosedValue, { style: 'full' }),
          opaque: formatMoney(concentration.opaqueValue, { style: 'full' }),
        }),
  }
}
