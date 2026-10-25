import { useMemo } from 'react'

import { computeMonthlyBalances } from '@/domains/portfolio/features/holdings/features/positions/components/PositionHoverDetails/helpers/calculators/buildHoverChartData'
import type { SavingsChartTarget } from '@/domains/portfolio/features/holdings/features/positions/types/savingsChartTarget.type'
import { usePositionHistoryQuery } from '@/domains/portfolio/shared/apis/queries/usePositionHistoryQuery'
import i18n from '@/i18n/i18n'
import { toCalendarMonth } from '@/shared/helpers/mappers/toCalendarMonth'
import { getErrorMessage } from '@/shared/helpers/presenters/getErrorMessage'
import { StatusMessage } from '@/shared/ui/Controls.view'
import { Preview } from '@/shared/ui/Preview.view'

import { SavingsHistoryChart } from './SavingsHistoryChart.view'

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

  return (
    <Preview.Content
      anchor={target.buttonRect}
      label={target.name}
      style={{ width: `min(480px, calc(100vw - 20px))` }}
      className="z-[9999] overflow-y-auto bg-surface border border-border-strong rounded-xl shadow-2xl p-4"
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
        <StatusMessage className="py-4 text-center text-xs text-content-muted">
          {i18n.t('ui.hoverchart.loading')}
        </StatusMessage>
      )}
      {error && (
        <StatusMessage urgent className="py-4 text-center text-xs text-danger">
          {getErrorMessage(error)}
        </StatusMessage>
      )}
      {showEmptyHistory && (
        <StatusMessage className="py-4 text-center text-xs text-content-muted">
          {i18n.t('ui.hoverchart.noHistory')}
        </StatusMessage>
      )}
      {showHistory && <SavingsHistoryChart chartData={chartData} />}
    </Preview.Content>
  )
}
