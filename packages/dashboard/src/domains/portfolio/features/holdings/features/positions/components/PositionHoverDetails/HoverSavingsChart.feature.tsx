import { useMemo } from 'react'
import { createPortal } from 'react-dom'

import { computeMonthlyBalances } from '@/domains/portfolio/features/holdings/features/positions/components/PositionHoverDetails/helpers/calculators/buildHoverChartData'
import { usePositionHistoryQuery } from '@/domains/portfolio/shared/apis/queries/usePositionHistoryQuery'
import i18n from '@/i18n/i18n'
import { toCalendarMonth } from '@/shared/helpers/mappers/toCalendarMonth'
import { getErrorMessage } from '@/shared/helpers/presenters/getErrorMessage'
import { computePopoverPosition } from '@/shared/ui/helpers/presenters/computePopoverPosition'

import { SavingsHistoryChart } from './SavingsHistoryChart.view'

export type SavingsChartTarget = {
  name: string
  operations: { date: Date; total_amount: number; operation_type: string }[]
  buttonRect: DOMRect
}

type SavingsProps = {
  target: SavingsChartTarget
  onMouseEnter: () => void
  onMouseLeave: () => void
}

export function HoverSavingsChart({
  target,
  onMouseEnter,
  onMouseLeave,
}: SavingsProps) {
  const {
    data: history,
    isPending,
    error,
  } = usePositionHistoryQuery(target.name)
  const popoverPosition = computePopoverPosition(target.buttonRect, 480, 300, {
    width: window.innerWidth,
    height: window.innerHeight,
  })

  const chartData = useMemo(
    () =>
      history && history.length > 0
        ? history.map((p, i) => {
            const prev = history[i - 1]
            return {
              month: toCalendarMonth(p.date),
              balance: Math.round(p.value),
              delta: prev ? Math.round(p.value - prev.value) : 0,
            }
          })
        : computeMonthlyBalances(target.operations),
    [history, target.operations],
  )
  const showHistory = !isPending && !error && chartData.length > 0
  const showEmptyHistory = !isPending && !error && chartData.length === 0

  return createPortal(
    <div
      style={popoverPosition}
      className="fixed z-[9999] overflow-y-auto bg-surface border border-border-strong rounded-xl shadow-2xl p-4"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="mb-3">
        <p className="text-content text-sm font-semibold">{target.name}</p>
        <p className="text-content-subtle text-xs">
          {i18n.t('ui.hoversavingschart.balanceOverTime')}
        </p>
      </div>

      {isPending && (
        <p
          role="status"
          className="py-4 text-center text-xs text-content-muted"
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
      {showHistory && <SavingsHistoryChart chartData={chartData} />}
    </div>,
    document.body,
  )
}
