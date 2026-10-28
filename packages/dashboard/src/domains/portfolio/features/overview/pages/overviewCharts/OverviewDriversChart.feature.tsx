import type { OverviewComparison } from '@/domains/portfolio/features/overview/helpers/calculators/buildOverviewComparison/buildOverviewComparison.types'
import { ScopedInfoTooltip } from '@/domains/portfolio/shared/components/kpis/ScopedInfoTooltip.feature'
import i18n from '@/i18n/i18n'

import { EmptyChart } from './EmptyChart.feature'
import { buildOverviewDriverPresentation } from './helpers/presenters/buildOverviewDriverPresentation'
import { OverviewDriversChartView } from './OverviewDriversChart.view'

export function OverviewDriversChart({
  comparison,
}: {
  comparison: OverviewComparison
}) {
  const presentation = buildOverviewDriverPresentation(comparison)
  if (presentation.unavailable)
    return (
      <EmptyChart
        title={i18n.t('ui.overviewcharts.changeDrivers')}
        message={i18n.t(
          'ui.overviewcharts.noCashFlowHistoryIsAvailableForThisPeriod',
        )}
        scope={{ account: 'filterable', period: 'comparison-range' }}
      />
    )
  return (
    <OverviewDriversChartView presentation={presentation}>
      <ScopedInfoTooltip
        text={i18n.t(
          'ui.overviewcharts.grossMovementFromContributionsAndMarketPerformance',
        )}
        scope={{ account: 'filterable', period: 'comparison-range' }}
      />
    </OverviewDriversChartView>
  )
}
