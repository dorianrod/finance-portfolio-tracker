import { type LabelProps } from 'recharts'

import type { YearLabelPlacement } from '@/domains/portfolio/features/wealth/components/IncomePlacementRelationshipChart/helpers/presenters/calculateYearLabelLayout'
import { getYearLabelPosition } from '@/domains/portfolio/features/wealth/components/IncomePlacementRelationshipChart/helpers/presenters/getYearLabelPosition'
import type { AnnualIncomeSavingsPoint } from '@/domains/portfolio/features/wealth/types/annualIncomeSavingsPoint.type'
import { PORTFOLIO_CHART_TONES } from '@/domains/portfolio/shared/constants/portfolioChartTones'
import { ChartLabel } from '@/shared/ui/chartLabel/ChartLabel.view'

export function YearLabel({
  index,
  value,
  viewBox,
  placements,
  chartPoints,
  recentYears,
  oldestYear,
  newestYear,
}: Pick<LabelProps, 'index' | 'value' | 'viewBox'> & {
  placements: YearLabelPlacement[]
  chartPoints: AnnualIncomeSavingsPoint[]
  recentYears: Set<number>
  oldestYear: number
  newestYear: number
}) {
  if (index == null || !viewBox || !('x' in viewBox) || !('y' in viewBox))
    return null
  const placement = placements[index] ?? DEFAULT_YEAR_LABEL_PLACEMENT
  const point = chartPoints[index]
  if (point == null) return null

  const { x, y } = getYearLabelPosition(viewBox, placement)
  const isRecent = recentYears.has(point.year)

  return (
    <ChartLabel
      x={x}
      y={y}
      align={placement.textAnchor}
      tone={
        isRecent
          ? PORTFOLIO_CHART_TONES.returnRate
          : PORTFOLIO_CHART_TONES.neutralSeries
      }
      age={{ year: point.year, recent: isRecent, oldestYear, newestYear }}
    >
      {value}
    </ChartLabel>
  )
}

const DEFAULT_YEAR_LABEL_PLACEMENT: YearLabelPlacement = {
  dx: 0,
  dy: -12,
  textAnchor: 'middle',
}
