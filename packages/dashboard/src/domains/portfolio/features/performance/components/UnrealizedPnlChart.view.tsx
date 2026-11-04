import type { ReactNode } from 'react'
import {
  type BarShapeProps,
  ComposedChart,
  ResponsiveContainer,
} from 'recharts'

import type { UnrealizedPnlPoint } from '@/domains/portfolio/features/performance/types/unrealizedPnlPoint.type'
import { PORTFOLIO_CHART_TONES } from '@/domains/portfolio/shared/constants/portfolioChartTones'
import i18n from '@/i18n/i18n'
import { useFormatDate } from '@/shared/helpers/formatters/useFormatDate'
import { useFormatMoney } from '@/shared/helpers/formatters/useFormatMoney'
import { useFormatPercentage } from '@/shared/helpers/formatters/useFormatPercentage'
import { ChartGrid } from '@/shared/ui/chartAxes/ChartGrid.view'
import { ChartXAxis } from '@/shared/ui/chartAxes/ChartXAxis.view'
import { ChartYAxis } from '@/shared/ui/chartAxes/ChartYAxis.view'
import { ChartRectangle } from '@/shared/ui/ChartRectangle.view'
import { ChartReference } from '@/shared/ui/chartReference/ChartReference.view'
import type { ChartShapeProps } from '@/shared/ui/chartShape'
import { ChartTooltip } from '@/shared/ui/ChartTooltip.view'
import { Inline } from '@/shared/ui/layout/Inline.view'
import { Layout } from '@/shared/ui/layout/Layout.view'
import { SeriesBar } from '@/shared/ui/SeriesBar.view'
import { SeriesLine } from '@/shared/ui/SeriesLine.view'
import { Surface } from '@/shared/ui/Surface.view'
import { SeriesSwatch } from '@/shared/ui/swatch/SeriesSwatch.view'
import { Text } from '@/shared/ui/Text.view'

import { UnrealizedPnlTooltip } from './UnrealizedPnlTooltip.view'

export function UnrealizedPnlChartView({
  data,
  children,
}: {
  data: UnrealizedPnlPoint[]
  children: ReactNode
}) {
  const formatDate = useFormatDate()
  const formatMoney = useFormatMoney()
  const formatPercentage = useFormatPercentage()
  return (
    <Surface variant="chart" layout="subgrid">
      <Layout spaceAfter="default">
        <Text as="h2" variant="label" tone="secondary">
          <Inline as="span" align="center">
            {i18n.t('ui.unrealizedpnlchart.grossUnrealizedPandlOverTime')}
            {children}
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
          <Inline as="div" flow="wrap" gap="relaxed">
            <Inline as="span" gap="compact">
              <Layout
                as="span"
                flow="inline"
                sizing="fixed"
                height="indicator"
                width="indicator"
              >
                <SeriesSwatch
                  tone={PORTFOLIO_CHART_TONES.performancePositive}
                  as="i"
                  shape="dot"
                />
              </Layout>
              {i18n.t('ui.unrealizedpnlchart.grossUnrealizedGain')}
            </Inline>
            <Inline as="span" gap="compact">
              <Layout
                as="span"
                flow="inline"
                sizing="fixed"
                height="indicator"
                width="indicator"
              >
                <SeriesSwatch
                  tone={PORTFOLIO_CHART_TONES.performanceNegative}
                  as="i"
                  shape="dot"
                />
              </Layout>
              {i18n.t('ui.unrealizedpnlchart.grossUnrealizedLoss')}
            </Inline>
            <Inline as="span" gap="compact">
              <Layout
                as="span"
                flow="inline"
                sizing="fixed"
                height="divider"
                width="icon"
              >
                <SeriesSwatch
                  tone={PORTFOLIO_CHART_TONES.returnRate}
                  as="i"
                  shape="centeredLine"
                />
              </Layout>
              {i18n.t('ui.unrealizedpnlchart.pandlCapitalPlaced')}
            </Inline>
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
