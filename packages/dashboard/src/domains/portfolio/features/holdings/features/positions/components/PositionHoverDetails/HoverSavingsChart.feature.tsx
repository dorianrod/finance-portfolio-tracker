import { useMemo } from 'react'

import { useGetPositionHistoryQuery } from '@/domains/portfolio/features/holdings/features/positions/apis/queries/useGetPositionHistoryQuery'
import { buildSavingsHistorySeries } from '@/domains/portfolio/features/holdings/features/positions/components/PositionHoverDetails/helpers/transformers/buildHoverChartData/buildSavingsHistorySeries'
import type { SavingsChartTarget } from '@/domains/portfolio/features/holdings/features/positions/types/savingsChartTarget.type'
import i18n from '@/i18n/i18n'

import { PositionHistoryPreview } from './PositionHistoryPreview.view'
import { SavingsHistoryChart } from './SavingsHistoryChart.view'

export function HoverSavingsChart({
  target,
  onMouseEnter,
  onMouseLeave,
}: SavingsProps) {
  const {
    data: history,
    isPending,
    error,
  } = useGetPositionHistoryQuery(target.name)

  const chartData = useMemo(
    () => buildSavingsHistorySeries(history, target.operations),
    [history, target.operations],
  )
  const showHistory = !isPending && !error && chartData.length > 0
  const showEmptyHistory = !isPending && !error && chartData.length === 0

  return (
    <PositionHistoryPreview
      anchor={target.buttonRect}
      name={target.name}
      description={i18n.t('ui.hoversavingschart.balanceOverTime')}
      descriptionVariant="caption"
      pending={isPending}
      error={error}
      empty={showEmptyHistory}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {showHistory && <SavingsHistoryChart chartData={chartData} />}
    </PositionHistoryPreview>
  )
}

type SavingsProps = {
  target: SavingsChartTarget
  onMouseEnter: () => void
  onMouseLeave: () => void
}
