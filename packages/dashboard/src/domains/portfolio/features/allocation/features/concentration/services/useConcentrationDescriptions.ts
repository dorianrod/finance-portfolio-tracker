import { useMemo } from 'react'

import type { ConcentrationSummary } from '@/domains/portfolio/shared/helpers/calculators/calculatePortfolioCharts'
import type { ConcentrationMode } from '@/domains/portfolio/shared/types/concentrationMode.type'
import i18n from '@/i18n/i18n'
import { useFormatMoney } from '@/shared/helpers/formatters/useFormatMoney'
import { useFormatPercentage } from '@/shared/helpers/formatters/useFormatPercentage'

export function useConcentrationDescriptions(
  concentration: ConcentrationSummary,
  mode: ConcentrationMode,
) {
  const formatMoney = useFormatMoney()
  const formatPercentage = useFormatPercentage()
  return useMemo(
    () => ({
      cumulativeDescription:
        mode === 'held'
          ? i18n.t('ui.useconcentrationdescriptions.heldCumulativeDescription')
          : i18n.t(
              'ui.useconcentrationdescriptions.underlyingCumulativeDescription',
              {
                coverage: formatPercentage(concentration.coveragePct),
              },
            ),
      holdingsDescription:
        mode === 'held'
          ? i18n.t('ui.useconcentrationdescriptions.heldPositionsDescription')
          : i18n.t(
              'ui.useconcentrationdescriptions.underlyingPositionsDescription',
              {
                identified: formatMoney(concentration.identifiedValue, {
                  style: 'full',
                }),
                undisclosed: formatMoney(concentration.undisclosedValue, {
                  style: 'full',
                }),
                opaque: formatMoney(concentration.opaqueValue, {
                  style: 'full',
                }),
              },
            ),
    }),
    [mode, formatPercentage, concentration, formatMoney],
  )
}
