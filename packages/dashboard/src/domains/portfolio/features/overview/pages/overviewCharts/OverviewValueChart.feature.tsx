import type { OverviewComparison } from '@/domains/portfolio/features/overview/helpers/calculators/buildOverviewComparison/buildOverviewComparison.types'
import { ScopedInfoTooltip } from '@/domains/portfolio/shared/components/kpis/ScopedInfoTooltip.feature'
import i18n from '@/i18n/i18n'

import { EmptyChart } from './EmptyChart.feature'
import { OverviewValueChartView } from './OverviewValueChart.view'

export function OverviewValueChart({
  comparison,
}: {
  comparison: OverviewComparison
}) {
  if (comparison.valueHistory.length === 0) {
    return (
      <EmptyChart
        title={i18n.t('ui.overviewcharts.portfolioValue')}
        message={i18n.t(
          'ui.overviewcharts.noValueHistoryIsAvailableForThesePeriods',
        )}
        scope={{ account: 'filterable', period: 'comparison-range' }}
      />
    )
  }
  return (
    <OverviewValueChartView comparison={comparison}>
      <ScopedInfoTooltip
        text={i18n.t(
          'ui.overviewcharts.grossMarketValueAcrossThePreviousAndCurrentPeriods',
        )}
        scope={{
          account: 'filterable',
          period: 'comparison-range',
        }}
      />
    </OverviewValueChartView>
  )
}
