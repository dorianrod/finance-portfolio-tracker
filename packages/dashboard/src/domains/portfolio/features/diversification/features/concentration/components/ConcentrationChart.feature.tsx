import {
  BarChart,
  type BarShapeProps,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from 'recharts'

import { ScopedInfoTooltip } from '@/domains/portfolio/shared/components/kpis/ScopedInfoTooltip.feature'
import { PORTFOLIO_CHART_TONES } from '@/domains/portfolio/shared/constants/portfolioChartTones'
import type { HoldingConcentration } from '@/domains/portfolio/shared/helpers/calculators/calculatePortfolioCharts'
import i18n from '@/i18n/i18n'
import { useFormatMoney } from '@/shared/helpers/formatters/useFormatMoney'
import { useFormatPercentage } from '@/shared/helpers/formatters/useFormatPercentage'
import { ChartGrid } from '@/shared/ui/ChartAxes.view'
import { ChartLabels } from '@/shared/ui/ChartLabels.view'
import { ChartRectangle } from '@/shared/ui/ChartRectangle.view'
import { ChartTooltip } from '@/shared/ui/ChartTooltip.view'
import { Inline, Layout } from '@/shared/ui/Layout.view'
import { SeriesBar } from '@/shared/ui/SeriesBar.view'
import { Surface } from '@/shared/ui/Surface.view'
import { Text } from '@/shared/ui/Text.view'

import { ConcentrationTooltip } from './ConcentrationTooltip.view'
import { HOLDING_LABEL_WIDTH, HoldingLabelTick } from './HoldingLabelTick.view'

export function ConcentrationChart({
  data,
  topTenValue,
  topTenPct,
  description,
  effectiveDate,
}: {
  data: HoldingConcentration[]
  topTenValue?: number
  topTenPct?: number
  description?: string
  effectiveDate?: Date | null
}) {
  const formatMoney = useFormatMoney()
  const formatPercentage = useFormatPercentage()
  const height = Math.max(250, data.length * 30)
  const topTenSummary =
    topTenValue != null && topTenPct != null
      ? { percentage: topTenPct, value: topTenValue }
      : null
  return (
    <Surface variant="chart">
      <Inline
        as="div"
        spaceAfter="default"
        align="start"
        justify="between"
        gap="default"
      >
        <div>
          <Text as="h2" variant="label" tone="secondary">
            <Inline as="span" align="center">
              {i18n.t('ui.concentrationchart.largestHoldings')}
              <ScopedInfoTooltip
                // eslint-disable-next-line local/no-prop-drilling -- This feature owns the fallback copy and scope passed to the tooltip feature adapter.
                text={
                  description ??
                  i18n.t(
                    'ui.concentrationchart.largestPortfolioExposuresAggregatedAcrossAccounts',
                  )
                }
                // eslint-disable-next-line local/no-prop-drilling -- This feature owns the fallback copy and scope passed to the tooltip feature adapter.
                scope={{
                  account: 'filterable',
                  period: 'as-of',
                  effectiveDate,
                }}
              />
            </Inline>
          </Text>
          <Layout spaceBefore="compact">
            <Text as="p" variant="caption" tone="subtle">
              {description ??
                i18n.t('ui.concentrationchart.aggregatedAcrossAccounts')}
            </Text>
          </Layout>
        </div>
        <Inline as="div" sizing="fixed" align="center" gap="default">
          {topTenSummary && (
            <Text as="div" align="right">
              <Text as="div" variant="tinyOverline" tone="subtle">
                {i18n.t('ui.concentrationchart.top10Total')}
              </Text>
              <Layout spaceBefore="compact">
                <Text as="div" variant="captionStrong" tone="secondary" numeric>
                  {formatMoney(topTenSummary.value, { style: 'full' })} ·{' '}
                  {formatPercentage(topTenSummary.percentage)}
                </Text>
              </Layout>
            </Text>
          )}
        </Inline>
      </Inline>
      <Layout overflow="auto">
        <Layout>
          <ResponsiveContainer width="100%" height={height}>
            <BarChart
              layout="vertical"
              data={data}
              margin={{ top: 0, right: 50, left: 8, bottom: 0 }}
            >
              <ChartGrid horizontal={false} />
              <XAxis type="number" domain={[0, 'dataMax']} hide />
              <YAxis
                dataKey="label"
                type="category"
                tick={<HoldingLabelTick />}
                tickLine={false}
                axisLine={false}
                width={HOLDING_LABEL_WIDTH}
              />
              <ChartTooltip highlight="bar">
                <ConcentrationTooltip />
              </ChartTooltip>
              <SeriesBar dataKey="weight" corners="wideRight">
                <SeriesBar.Shape>
                  <LeadingHoldingBar />
                </SeriesBar.Shape>
                <ChartLabels
                  dataKey="weight"
                  position="right"
                  formatter={(value: unknown) =>
                    formatPercentage(Number(value))
                  }
                  density="standard"
                />
              </SeriesBar>
            </BarChart>
          </ResponsiveContainer>
        </Layout>
      </Layout>
    </Surface>
  )
}

function LeadingHoldingBar(shapeProps: Partial<BarShapeProps>) {
  return (
    <ChartRectangle
      geometry={shapeProps}
      tone={
        shapeProps.index === 0
          ? PORTFOLIO_CHART_TONES.risk
          : PORTFOLIO_CHART_TONES.neutralSeries
      }
    />
  )
}
