import type { TriChartPoint } from '@/domains/portfolio/features/performance/components/TriChart/types/triChartPoint.type'
import type { PortfolioHistoryPoint } from '@/domains/portfolio/shared/types/portfolioHistoryPoint.type'

export function buildTriChartData(
  history: PortfolioHistoryPoint[],
): TriChartPoint[] {
  if (
    !history.some(
      (point) => point.tri_rolling_1y !== null || point.tri_rolling_3y !== null,
    )
  )
    return []

  const firstOneYearIndex = history.findIndex(
    (point) => point.tri_rolling_1y !== null,
  )
  const firstOneYearValue =
    firstOneYearIndex === -1 ? null : history[firstOneYearIndex].tri_rolling_1y
  const firstThreeYearIndex = history.findIndex(
    (point) => point.tri_rolling_3y !== null,
  )
  const firstThreeYearValue =
    firstThreeYearIndex === -1
      ? null
      : history[firstThreeYearIndex].tri_rolling_3y

  return history.map((point, index) => ({
    ...point,
    tri_rolling_1y_backfill:
      firstOneYearValue !== null && index <= firstOneYearIndex
        ? firstOneYearValue
        : null,
    tri_rolling_3y_backfill:
      firstThreeYearValue !== null && index <= firstThreeYearIndex
        ? firstThreeYearValue
        : null,
  }))
}
