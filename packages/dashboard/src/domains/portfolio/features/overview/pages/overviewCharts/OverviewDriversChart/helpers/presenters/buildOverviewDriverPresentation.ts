import type { OverviewComparison } from '@/domains/portfolio/features/overview/helpers/transformers/buildOverviewComparison/buildOverviewComparison.types'
import type { DriverRow } from '@/domains/portfolio/features/overview/types/overviewChart.type'
import { PORTFOLIO_CHART_TONES } from '@/domains/portfolio/shared/constants/portfolioChartTones'
import i18n from '@/i18n/i18n'

import { computeOverviewGrossChanges } from '../transformers/computeOverviewGrossChanges'

export function buildOverviewDriverPresentation(
  comparison: OverviewComparison,
) {
  const rows: DriverRow[] = [
    {
      label: i18n.t('ui.overviewcharts.netContributions'),
      previous: comparison.contributions.previous,
      current: comparison.contributions.current,
      tone: PORTFOLIO_CHART_TONES.netContributions,
    },
    {
      label: i18n.t('ui.overviewcharts.marketPerformance'),
      previous: comparison.marketPerformance.previous,
      current: comparison.marketPerformance.current,
      tone:
        comparison.marketPerformance.current != null &&
        comparison.marketPerformance.current < 0
          ? PORTFOLIO_CHART_TONES.performanceNegative
          : PORTFOLIO_CHART_TONES.performancePositive,
    },
  ]
  const unavailable =
    comparison.contributions.current == null &&
    comparison.marketPerformance.current == null
  return { rows, unavailable, ...computeOverviewGrossChanges(comparison) }
}
