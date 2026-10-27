import { useMemo } from 'react'

import { usePositionHistoryQuery } from '@/domains/portfolio/features/holdings/features/positions/apis/queries/usePositionHistoryQuery'
import { hasUnitPriceHistory } from '@/domains/portfolio/features/holdings/features/positions/components/PositionHoverDetails/helpers/businessRules/hasUnitPriceHistory'
import { buildHoverChartSeries } from '@/domains/portfolio/features/holdings/features/positions/components/PositionHoverDetails/helpers/calculators/buildHoverChartData/buildHoverChartSeries'
import { computeUnitPriceDomain } from '@/domains/portfolio/features/holdings/features/positions/components/PositionHoverDetails/helpers/presenters/computeUnitPriceDomain'
import type { ChartTarget } from '@/domains/portfolio/features/holdings/features/positions/types/chartTarget.type'
import i18n from '@/i18n/i18n'
import { getErrorMessage } from '@/shared/helpers/presenters/getErrorMessage'
import { StatusMessage } from '@/shared/ui/controls/StatusMessage.view'
import { Layout } from '@/shared/ui/layout/Layout.view'
import { Preview } from '@/shared/ui/Preview.view'
import { Text } from '@/shared/ui/Text.view'

import { PositionHistoryCharts } from './PositionHistoryCharts.view'

export function HoverChart({ target, onMouseEnter, onMouseLeave }: Props) {
  const {
    data: history,
    isPending,
    error,
  } = usePositionHistoryQuery(target.isin)

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
          <Text as="p" variant="captionCode" tone="subtle">
            {target.isin}
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

        {displayedChartData && (
          <PositionHistoryCharts
            chartData={displayedChartData}
            unitPriceDomain={unitPriceDomain}
            showUnitPrice={showUnitPrice}
          />
        )}
      </Layout>
    </Preview.Content>
  )
}

type Props = {
  target: ChartTarget
  onMouseEnter: () => void
  onMouseLeave: () => void
}
