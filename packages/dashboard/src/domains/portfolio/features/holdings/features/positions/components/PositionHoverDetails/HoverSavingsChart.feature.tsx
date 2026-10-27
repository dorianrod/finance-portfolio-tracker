import { useMemo } from 'react'

import { usePositionHistoryQuery } from '@/domains/portfolio/features/holdings/features/positions/apis/queries/usePositionHistoryQuery'
import { buildSavingsHistorySeries } from '@/domains/portfolio/features/holdings/features/positions/components/PositionHoverDetails/helpers/calculators/buildHoverChartData/buildSavingsHistorySeries'
import type { SavingsChartTarget } from '@/domains/portfolio/features/holdings/features/positions/types/savingsChartTarget.type'
import i18n from '@/i18n/i18n'
import { getErrorMessage } from '@/shared/helpers/presenters/getErrorMessage'
import { StatusMessage } from '@/shared/ui/controls/StatusMessage.view'
import { Layout } from '@/shared/ui/layout/Layout.view'
import { Preview } from '@/shared/ui/Preview.view'
import { Text } from '@/shared/ui/Text.view'

import { SavingsHistoryChart } from './SavingsHistoryChart.view'

// eslint-disable-next-line complexity -- reviewed: 2026-10-27; Remote-history and operation-history fallbacks are states of the same savings preview.
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
    () => buildSavingsHistorySeries(history, target.operations),
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
