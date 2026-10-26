import { useMemo } from 'react'

import {
  buildHoverChartSeries,
  computeUnitPriceDomain,
} from '@/domains/portfolio/features/holdings/features/positions/components/PositionHoverDetails/helpers/calculators/buildHoverChartData'
import type { ChartTarget } from '@/domains/portfolio/features/holdings/features/positions/types/chartTarget.type'
import { usePositionHistoryQuery } from '@/domains/portfolio/shared/apis/queries/usePositionHistoryQuery'
import i18n from '@/i18n/i18n'
import { getErrorMessage } from '@/shared/helpers/presenters/getErrorMessage'
import { StatusMessage } from '@/shared/ui/Controls.view'
import { Preview } from '@/shared/ui/Preview.view'
import { Text } from '@/shared/ui/Text.view'

import { PositionHistoryCharts } from './PositionHistoryCharts.view'

type Props = {
  target: ChartTarget
  onMouseEnter: () => void
  onMouseLeave: () => void
}

export function HoverChart({ target, onMouseEnter, onMouseLeave }: Props) {
  const {
    data: history,
    isPending,
    error,
  } = usePositionHistoryQuery(target.isin)

  const showUnitPrice =
    history != null &&
    history.some((p) => Math.abs(p.last_price - p.value) > 0.01)

  const chartData = useMemo(
    () => (history ? buildHoverChartSeries(history, target.operations) : []),
    [history, target.operations],
  )
  const unitPriceDomain = useMemo(
    () => computeUnitPriceDomain(chartData),
    [chartData],
  )
  const showEmptyHistory = !isPending && !error && chartData.length === 0
  const displayedChartData = chartData?.length ? chartData : null

  return (
    <Preview.Content
      anchor={target.buttonRect}
      label={target.name}
      style={{ width: `min(600px, calc(100vw - 20px))` }}
      variant="floatingPanel"
      className="z-[9999] overflow-y-auto  p-4"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="mb-3">
        <Text as="p" variant="bodyStrong" tone="default">
          {target.name}
        </Text>
        <Text as="p" variant="captionCode" tone="subtle">
          {target.isin}
        </Text>
      </div>

      {isPending && (
        <StatusMessage
          variant="caption"
          tone="muted"
          align="center"
          className="py-4"
        >
          {i18n.t('ui.hoverchart.loading')}
        </StatusMessage>
      )}

      {error && (
        <StatusMessage
          urgent
          variant="caption"
          tone="negative"
          align="center"
          className="py-4"
        >
          {getErrorMessage(error)}
        </StatusMessage>
      )}
      {showEmptyHistory && (
        <StatusMessage
          variant="caption"
          tone="muted"
          align="center"
          className="py-4"
        >
          {i18n.t('ui.hoverchart.noHistory')}
        </StatusMessage>
      )}

      {displayedChartData && (
        <PositionHistoryCharts
          chartData={displayedChartData}
          unitPriceDomain={unitPriceDomain}
          showUnitPrice={showUnitPrice}
        />
      )}
    </Preview.Content>
  )
}
