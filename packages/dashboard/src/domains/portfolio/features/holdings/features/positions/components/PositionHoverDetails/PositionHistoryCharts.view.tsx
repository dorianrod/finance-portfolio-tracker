import { AreaChart, LineChart, ResponsiveContainer, Tooltip } from 'recharts'

import { BuySellDot } from '@/domains/portfolio/features/holdings/features/positions/components/PositionHoverDetails/buySellDots/BuySellDot.view'
import { BuySellDotUnit } from '@/domains/portfolio/features/holdings/features/positions/components/PositionHoverDetails/buySellDots/BuySellDotUnit.view'
import type { HoverChartDataPoint } from '@/domains/portfolio/features/holdings/features/positions/components/PositionHoverDetails/helpers/calculators/buildHoverChartData/buildHoverChartData.types'
import { TooltipPortfolio } from '@/domains/portfolio/features/holdings/features/positions/components/PositionHoverDetails/hoverCharts.tooltips/TooltipPortfolio.view'
import { TooltipUnit } from '@/domains/portfolio/features/holdings/features/positions/components/PositionHoverDetails/hoverCharts.tooltips/TooltipUnit.view'
import { PORTFOLIO_CHART_TONES } from '@/domains/portfolio/shared/constants/portfolioChartTones'
import i18n from '@/i18n/i18n'
import { useFormatMoney } from '@/shared/helpers/formatters/useFormatMoney'
import { ChartGrid } from '@/shared/ui/chartAxes/ChartGrid.view'
import { ChartXAxis } from '@/shared/ui/chartAxes/ChartXAxis.view'
import { ChartYAxis } from '@/shared/ui/chartAxes/ChartYAxis.view'
import { ChartLegend } from '@/shared/ui/chartLabels/ChartLegend.view'
import { Inline } from '@/shared/ui/layout/Inline.view'
import { Layout } from '@/shared/ui/layout/Layout.view'
import { SeriesArea } from '@/shared/ui/SeriesArea.view'
import { SeriesGradient } from '@/shared/ui/SeriesGradient.view'
import { SeriesLine } from '@/shared/ui/SeriesLine.view'
import { SeriesSwatch } from '@/shared/ui/swatch/SeriesSwatch.view'
import { Text } from '@/shared/ui/Text.view'

export function PositionHistoryCharts({
  chartData,
  unitPriceDomain,
  showUnitPrice,
}: {
  chartData: HoverChartDataPoint[]
  unitPriceDomain: [number, number] | undefined
  showUnitPrice: boolean
}) {
  const formatMoney = useFormatMoney()
  return (
    <>
      {/* Chart 1: position value */}
      <Layout spaceAfter="compact">
        <Text as="p" variant="caption" tone="muted">
          {i18n.t('ui.hoverchart.positionValue')}
        </Text>
      </Layout>
      <ResponsiveContainer width="100%" height={180}>
        <AreaChart
          data={chartData}
          margin={{ top: 4, right: 4, left: 4, bottom: 0 }}
        >
          <defs>
            <SeriesGradient
              id="gVal"
              profile="soft"
              tone={PORTFOLIO_CHART_TONES.portfolioValue}
            />
          </defs>
          <ChartGrid />
          <ChartXAxis density="compact" axis dataKey="date" />
          <ChartYAxis
            density="compact"
            tickFormatter={(value) => formatMoney(value)}
            width={64}
          />
          <Tooltip content={<TooltipPortfolio />} />
          <ChartLegend />
          <SeriesArea
            type="monotone"
            dataKey="Cost basis"
            name={i18n.t('ui.hoverchart.costBasis')}
            tone={PORTFOLIO_CHART_TONES.costBasis}
            weight="fine"
            pattern="baseline"
            markers="hidden"
          />
          <SeriesArea
            type="monotone"
            dataKey="Value"
            name={i18n.t('ui.hoverchart.value')}
            tone={PORTFOLIO_CHART_TONES.portfolioValue}
            gradientId="gVal"
            weight="regular"
            hover="default"
          >
            <SeriesArea.Markers>
              <BuySellDot />
            </SeriesArea.Markers>
          </SeriesArea>
        </AreaChart>
      </ResponsiveContainer>

      {/* legend markers */}
      <Layout spaceBefore="compact" spaceAfter="default">
        <Text as="div" variant="caption" tone="subtle">
          <Inline as="div" gap="relaxed">
            <span>
              <Layout
                as="span"
                flow="inline"
                height="indicator"
                width="indicator"
              >
                <SeriesSwatch
                  tone={PORTFOLIO_CHART_TONES.transactionBuy}
                  shape="dot"
                />
              </Layout>
              {i18n.t('ui.hoverchart.buy')}
            </span>
            <span>
              <Layout
                as="span"
                flow="inline"
                height="indicator"
                width="indicator"
              >
                <SeriesSwatch
                  tone={PORTFOLIO_CHART_TONES.transactionSell}
                  shape="dot"
                />
              </Layout>
              {i18n.t('ui.hoverchart.sell')}
            </span>
          </Inline>
        </Text>
      </Layout>

      {/* Chart 2: unit price — only when real market data is available */}
      {showUnitPrice && (
        <>
          <Layout spaceAfter="compact">
            <Text as="p" variant="caption" tone="muted">
              {i18n.t('ui.hoverchart.unitPrice')}
            </Text>
          </Layout>
          <ResponsiveContainer width="100%" height={160}>
            <LineChart
              data={chartData}
              margin={{ top: 4, right: 4, left: 4, bottom: 0 }}
            >
              <ChartGrid />
              <ChartXAxis density="compact" axis dataKey="date" />
              <ChartYAxis
                density="compact"
                tickFormatter={(value) =>
                  formatMoney(value, { style: 'decimal' })
                }
                width={64}
                domain={unitPriceDomain}
              />
              <Tooltip content={<TooltipUnit />} />
              <SeriesLine
                type="monotone"
                dataKey="Unit price"
                name={i18n.t('ui.hoverchart.unitPrice')}
                tone={PORTFOLIO_CHART_TONES.returnRate}
                weight="regular"
                hover="default"
              >
                <SeriesLine.Markers>
                  <BuySellDotUnit />
                </SeriesLine.Markers>
              </SeriesLine>
            </LineChart>
          </ResponsiveContainer>
        </>
      )}
    </>
  )
}
