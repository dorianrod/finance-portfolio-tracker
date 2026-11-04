import { buildUnrealizedPnlHistory } from '@/domains/portfolio/features/performance/helpers/transformers/buildUnrealizedPnlHistory'
import { ScopedInfoTooltip } from '@/domains/portfolio/shared/components/kpis/ScopedInfoTooltip.feature'
import type { PortfolioHistoryPoint } from '@/domains/portfolio/shared/types/portfolioHistoryPoint.type'
import i18n from '@/i18n/i18n'

import { UnrealizedPnlChartView } from './UnrealizedPnlChart.view'

export function UnrealizedPnlChart({
  history,
}: {
  history: PortfolioHistoryPoint[]
}) {
  const data = buildUnrealizedPnlHistory(history)
  if (data.length === 0) return null
  return (
    <UnrealizedPnlChartView data={data}>
      <ScopedInfoTooltip
        text={i18n.t(
          'ui.unrealizedpnlchart.amountBeforeEstimatedTaxAndPercentageOfTheTotal',
        )}
        scope={{ account: 'filterable', period: 'range' }}
      />
    </UnrealizedPnlChartView>
  )
}
