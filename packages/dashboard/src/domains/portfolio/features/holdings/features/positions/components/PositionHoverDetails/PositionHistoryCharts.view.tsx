import { AreaChart, LineChart, ResponsiveContainer, Tooltip } from 'recharts'

import i18n from '@/i18n/i18n'
import { useFormatMoney } from '@/shared/helpers/formatters/useFormatMoney'
import { ChartYAxis } from '@/shared/ui/ChartAxes.view'
import { ChartXAxis } from '@/shared/ui/ChartAxes.view'
import { ChartGrid } from '@/shared/ui/ChartAxes.view'
import { ChartLegend } from '@/shared/ui/ChartLabels.view'
import { SeriesArea } from '@/shared/ui/SeriesArea.view'
import { SeriesGradient } from '@/shared/ui/SeriesGradient.view'
import { SeriesLine } from '@/shared/ui/SeriesLine.view'
import { SeriesSwatch } from '@/shared/ui/Swatch.view'
import { Text } from '@/shared/ui/Text.view'

import { BuySellDot, BuySellDotUnit } from './BuySellDots.view'
import type { HoverChartDataPoint } from './helpers/calculators/buildHoverChartData'
import { TooltipPortfolio, TooltipUnit } from './hoverCharts.tooltips.view'

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
      <Text as="p" variant="caption" tone="muted" className="mb-1">
        {i18n.t('ui.hoverchart.positionValue')}
      </Text>
      <ResponsiveContainer width="100%" height={180}>
        <AreaChart
          data={chartData}
          margin={{ top: 4, right: 4, left: 4, bottom: 0 }}
        >
          <defs>
            <SeriesGradient id="gVal" profile="soft" tone="portfolioValue" />
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
            tone="costBasis"
            weight="fine"
            pattern="baseline"
            markers="hidden"
          />
          <SeriesArea
            type="monotone"
            dataKey="Value"
            name={i18n.t('ui.hoverchart.value')}
            tone="portfolioValue"
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
      <Text
        as="div"
        variant="caption"
        tone="subtle"
        className="flex gap-4 mt-1 mb-3 ml-2"
      >
        <span>
          <SeriesSwatch
            tone={'transactionBuy'}
            shape="dot"
            className="mr-1 inline-block h-2 w-2"
          />
          {i18n.t('ui.hoverchart.buy')}
        </span>
        <span>
          <SeriesSwatch
            tone={'transactionSell'}
            shape="dot"
            className="mr-1 inline-block h-2 w-2"
          />
          {i18n.t('ui.hoverchart.sell')}
        </span>
      </Text>

      {/* Chart 2: unit price — only when real market data is available */}
      {showUnitPrice && (
        <>
          <Text as="p" variant="caption" tone="muted" className="mb-1">
            {i18n.t('ui.hoverchart.unitPrice')}
          </Text>
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
                tone="returnRate"
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
