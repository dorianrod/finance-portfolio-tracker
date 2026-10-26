import type { OverviewComparison } from '@/domains/portfolio/features/overview/helpers/calculators/buildOverviewComparison/buildOverviewComparison.types'
import type { DriverRow } from '@/domains/portfolio/features/overview/types/overviewChart.type'
import { PORTFOLIO_CHART_TONES } from '@/domains/portfolio/shared/constants/portfolioChartTones'
import i18n from '@/i18n/i18n'

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
  const currentChange =
    comparison.contributions.current == null ||
    comparison.marketPerformance.current == null
      ? null
      : comparison.contributions.current + comparison.marketPerformance.current
  const previousChange =
    comparison.contributions.previous == null ||
    comparison.marketPerformance.previous == null
      ? null
      : comparison.contributions.previous +
        comparison.marketPerformance.previous

  return { rows, unavailable, currentChange, previousChange }
}
