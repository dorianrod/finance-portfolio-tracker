import { useMemo } from 'react'
import { createPortal } from 'react-dom'

import {
  buildHoverChartSeries,
  computeUnitPriceDomain,
  type Operation,
} from '@/domains/portfolio/features/holdings/features/positions/components/PositionHoverDetails/helpers/calculators/buildHoverChartData'
import { usePositionHistoryQuery } from '@/domains/portfolio/shared/apis/queries/usePositionHistoryQuery'
import i18n from '@/i18n/i18n'
import { getErrorMessage } from '@/shared/helpers/presenters/getErrorMessage'
import { computePopoverPosition } from '@/shared/ui/helpers/presenters/computePopoverPosition'

import { PositionHistoryCharts } from './PositionHistoryCharts.view'

export type ChartTarget = {
  isin: string
  name: string
  operations: Operation[]
  buttonRect: DOMRect
}

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
  const popoverPosition = computePopoverPosition(target.buttonRect, 600, 460, {
    width: window.innerWidth,
    height: window.innerHeight,
  })

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

  return createPortal(
    <div
      style={popoverPosition}
      className="fixed z-[9999] overflow-y-auto bg-surface border border-border-strong rounded-xl shadow-2xl p-4"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="mb-3">
        <p className="text-content text-sm font-semibold">{target.name}</p>
        <p className="text-content-subtle text-xs font-mono">{target.isin}</p>
      </div>

      {isPending && (
        <p
          role="status"
          className="text-content-muted text-xs py-4 text-center"
        >
          {i18n.t('ui.hoverchart.loading')}
        </p>
      )}

      {error && (
        <p role="alert" className="py-4 text-center text-xs text-danger">
          {getErrorMessage(error)}
        </p>
      )}
      {showEmptyHistory && (
        <p
          role="status"
          className="py-4 text-center text-xs text-content-muted"
        >
          {i18n.t('ui.hoverchart.noHistory')}
        </p>
      )}

      {displayedChartData && (
        <PositionHistoryCharts
          chartData={displayedChartData}
          unitPriceDomain={unitPriceDomain}
          showUnitPrice={showUnitPrice}
        />
      )}
    </div>,
    document.body,
  )
}
