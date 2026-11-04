import { useMemo } from 'react'

import { useGetPositionHistoryQuery } from '@/domains/portfolio/features/holdings/features/positions/apis/queries/useGetPositionHistoryQuery'
import { computeUnitPriceDomain } from '@/domains/portfolio/features/holdings/features/positions/components/PositionHoverDetails/helpers/presenters/computeUnitPriceDomain'
import { buildHoverChartSeries } from '@/domains/portfolio/features/holdings/features/positions/components/PositionHoverDetails/helpers/transformers/buildHoverChartData/buildHoverChartSeries'
import { hasUnitPriceHistory } from '@/domains/portfolio/features/holdings/features/positions/components/PositionHoverDetails/helpers/transformers/hasUnitPriceHistory'
import type { ChartTarget } from '@/domains/portfolio/features/holdings/features/positions/types/chartTarget.type'

import { PositionHistoryCharts } from './PositionHistoryCharts.view'
import { PositionHistoryPreview } from './PositionHistoryPreview.view'

export function HoverChart({ target, onMouseEnter, onMouseLeave }: Props) {
  const {
    data: history,
    isPending,
    error,
  } = useGetPositionHistoryQuery(target.isin)

  const showUnitPrice = hasUnitPriceHistory(history)

  const chartData = useMemo(
    () => (history ? buildHoverChartSeries(history, target.operations) : []),
    [history, target.operations],
  )
  const unitPriceDomain = useMemo(
    () => computeUnitPriceDomain(chartData),
    [chartData],
  )
  const showEmptyHistory = !isPending && !error && chartData.length === 0
  const displayedChartData = chartData.length > 0 ? chartData : null

  return (
    <PositionHistoryPreview
      anchor={target.buttonRect}
      name={target.name}
      description={target.isin}
      descriptionVariant="captionCode"
      pending={isPending}
      error={error}
      empty={showEmptyHistory}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {displayedChartData && (
        <PositionHistoryCharts
          chartData={displayedChartData}
          unitPriceDomain={unitPriceDomain}
          showUnitPrice={showUnitPrice}
        />
      )}
    </PositionHistoryPreview>
  )
}

type Props = {
  target: ChartTarget
  onMouseEnter: () => void
  onMouseLeave: () => void
}
