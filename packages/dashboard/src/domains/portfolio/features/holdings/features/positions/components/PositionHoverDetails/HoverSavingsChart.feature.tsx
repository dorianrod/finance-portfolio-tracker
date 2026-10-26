import { useMemo } from 'react'

import { usePositionHistoryQuery } from '@/domains/portfolio/features/holdings/features/positions/apis/queries/usePositionHistoryQuery'
import { computeMonthlyBalances } from '@/domains/portfolio/features/holdings/features/positions/components/PositionHoverDetails/helpers/calculators/buildHoverChartData/computeMonthlyBalances'
import type { SavingsChartTarget } from '@/domains/portfolio/features/holdings/features/positions/types/savingsChartTarget.type'
import i18n from '@/i18n/i18n'
import { toCalendarMonth } from '@/shared/helpers/mappers/toCalendarMonth'
import { getErrorMessage } from '@/shared/helpers/presenters/getErrorMessage'
import { StatusMessage } from '@/shared/ui/controls/StatusMessage.view'
import { Layout } from '@/shared/ui/layout/Layout.view'
import { Preview } from '@/shared/ui/Preview.view'
import { Text } from '@/shared/ui/Text.view'

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

      variant="floatingPanel"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      size="wide"
    >
      <Layout overflow="scroll" inset="default">
        <Layout spaceAfter="default">
          <Text as="p" variant="bodyStrong" tone="default">
            {target.name}
          </Text>
          <Text as="p" variant="caption" tone="subtle">
            {i18n.t('ui.hoversavingschart.balanceOverTime')}
          </Text>
        </Layout>

        {isPending && (
          <StatusMessage variant="caption" tone="muted" align="center">
            <Layout as="span" flow="block" inset="default">
              {i18n.t('ui.hoverchart.loading')}
            </Layout>
          </StatusMessage>
        )}
        {error && (
          <StatusMessage
            urgent
            variant="caption"
            tone="negative"
            align="center"
          >
            <Layout as="span" flow="block" inset="default">
              {getErrorMessage(error)}
            </Layout>
          </StatusMessage>
        )}
        {showEmptyHistory && (
          <StatusMessage variant="caption" tone="muted" align="center">
            <Layout as="span" flow="block" inset="default">
              {i18n.t('ui.hoverchart.noHistory')}
            </Layout>
          </StatusMessage>
        )}
        {showHistory && <SavingsHistoryChart chartData={chartData} />}
      </Layout>
    </Preview.Content>
  )
}

type SavingsProps = {
  target: SavingsChartTarget
  onMouseEnter: () => void
  onMouseLeave: () => void
}
