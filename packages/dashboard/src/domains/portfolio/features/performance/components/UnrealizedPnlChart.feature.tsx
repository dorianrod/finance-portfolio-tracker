import {
  type BarShapeProps,
  ComposedChart,
  ResponsiveContainer,
} from 'recharts'

import { ScopedInfoTooltip } from '@/domains/portfolio/shared/components/kpis/ScopedInfoTooltip.feature'
import { PORTFOLIO_CHART_TONES } from '@/domains/portfolio/shared/constants/portfolioChartTones'
import type { PortfolioHistoryPoint } from '@/domains/portfolio/shared/types/portfolioHistoryPoint.type'
import i18n from '@/i18n/i18n'
import { useFormatDate } from '@/shared/helpers/formatters/useFormatDate'
import { useFormatMoney } from '@/shared/helpers/formatters/useFormatMoney'
import { useFormatPercentage } from '@/shared/helpers/formatters/useFormatPercentage'
import { ChartGrid, ChartXAxis, ChartYAxis } from '@/shared/ui/ChartAxes.view'
import { ChartRectangle } from '@/shared/ui/ChartRectangle.view'
import { ChartReference } from '@/shared/ui/ChartReference.view'
import type { ChartShapeProps } from '@/shared/ui/chartShape'
import { ChartTooltip } from '@/shared/ui/ChartTooltip.view'
import { Inline, Layout } from '@/shared/ui/Layout.view'
import { SeriesBar } from '@/shared/ui/SeriesBar.view'
import { SeriesLine } from '@/shared/ui/SeriesLine.view'
import { Surface } from '@/shared/ui/Surface.view'
import { SeriesSwatch } from '@/shared/ui/Swatch.view'
import { Text } from '@/shared/ui/Text.view'

import {
  type UnrealizedPnlPoint,
  UnrealizedPnlTooltip,
} from './UnrealizedPnlTooltip.view'

export function UnrealizedPnlChart({
  history,
}: {
  history: PortfolioHistoryPoint[]
}) {
  const formatDate = useFormatDate()
  const formatMoney = useFormatMoney()
  const formatPercentage = useFormatPercentage()
  const data: UnrealizedPnlPoint[] = history.map((point, index) => ({
    ...point,
    unrealized_gain_pct:
      point.total_cost_basis > 0
        ? (point.unrealized_gain / point.total_cost_basis) * 100
        : null,
    snapshot_change:
      index > 0
        ? point.unrealized_gain - history[index - 1].unrealized_gain
        : null,
  }))

  if (data.length === 0) return null

  return (
    <Surface variant="chart">
      <Layout spaceAfter="default">
        <Text as="h2" variant="label" tone="secondary">
          <Inline as="span" align="center">
            {i18n.t('ui.unrealizedpnlchart.grossUnrealizedPandlOverTime')}
            <ScopedInfoTooltip
              text={i18n.t(
                'ui.unrealizedpnlchart.amountBeforeEstimatedTaxAndPercentageOfTheTotal',
              )}
              scope={{ account: 'filterable', period: 'range' }}
            />
          </Inline>
        </Text>
        <Layout spaceBefore="compact">
          <Text as="p" variant="caption" tone="subtle">
            {i18n.t(
              'ui.unrealizedpnlchart.amountBeforeEstimatedTaxAndPercentageOfTheTotal',
            )}
          </Text>
        </Layout>
      </Layout>
      <ResponsiveContainer width="100%" height={240}>
        <ComposedChart
          data={data}
          margin={{ top: 4, right: 0, left: 0, bottom: 0 }}
        >
          <ChartGrid vertical={false} />
          <ChartXAxis
            dataKey="date"
            tickFormatter={(value) =>
              formatDate(value, { style: 'shortMonthShortYear' })
            }
            interval="preserveStartEnd"
          />
          <ChartYAxis
            yAxisId="amount"
            tickFormatter={(value) => formatMoney(value, { style: 'compact' })}
            width={52}
          />
          <ChartYAxis
            yAxisId="pct"
            orientation="right"
            tickFormatter={(value: number) =>
              formatPercentage(value, { decimals: 0 })
            }
            width={42}
          />
          <ChartReference yAxisId="amount" y={0} kind="zero" />
          <ChartTooltip highlight="bar">
            <UnrealizedPnlTooltip />
          </ChartTooltip>
          <SeriesBar
            yAxisId="amount"
            dataKey="unrealized_gain"
            maxBarSize={24}
            corners="rounded"
            motion="none"
          >
            <SeriesBar.Shape>
              <UnrealizedPnlBar />
            </SeriesBar.Shape>
          </SeriesBar>
          <SeriesLine
            yAxisId="pct"
            type="monotone"
            dataKey="unrealized_gain_pct"
            connectNulls
            tone={PORTFOLIO_CHART_TONES.returnRate}
            weight="regular"
            markers="hidden"
            hover="default"
            motion="none"
          />
        </ComposedChart>
      </ResponsiveContainer>
      <Layout spaceBefore="default">
        <Text as="div" variant="caption" tone="subtle">
          <Inline as="div" flow="wrap" gap="compact">
            <span>
              <Layout
                as="span"
                flow="inline"
                height="indicator"
                width="indicator"
              >
                <SeriesSwatch tone={PORTFOLIO_CHART_TONES.performancePositive} as="i" shape="dot" />
              </Layout>
              {i18n.t('ui.unrealizedpnlchart.grossUnrealizedGain')}
            </span>
            <span>
              <Layout
                as="span"
                flow="inline"
                height="indicator"
                width="indicator"
              >
                <SeriesSwatch tone={PORTFOLIO_CHART_TONES.performanceNegative} as="i" shape="dot" />
              </Layout>
              {i18n.t('ui.unrealizedpnlchart.grossUnrealizedLoss')}
            </span>
            <span>
              <Layout as="span" flow="inline" height="divider" width="icon">
                <SeriesSwatch tone={PORTFOLIO_CHART_TONES.returnRate} as="i" shape="centeredLine" />
              </Layout>
              {i18n.t('ui.unrealizedpnlchart.pandlCapitalPlaced')}
            </span>
          </Inline>
        </Text>
      </Layout>
    </Surface>
  )
}

function UnrealizedPnlBar(
  shapeProps: Partial<ChartShapeProps<BarShapeProps, UnrealizedPnlPoint>>,
) {
  const point = shapeProps.payload
  if (!point) return null
  return (
    <ChartRectangle
      geometry={shapeProps}
      tone={
        point.unrealized_gain >= 0
          ? PORTFOLIO_CHART_TONES.performancePositive
          : PORTFOLIO_CHART_TONES.performanceNegative
      }
    />
  )
}
