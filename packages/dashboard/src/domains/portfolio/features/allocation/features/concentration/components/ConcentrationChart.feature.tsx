import {
  BarChart,
  type BarShapeProps,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from 'recharts'

import { ScopedInfoTooltip } from '@/domains/portfolio/shared/components/kpis/ScopedInfoTooltip.feature'
import type { HoldingConcentration } from '@/domains/portfolio/shared/helpers/calculators/calculatePortfolioCharts'
import i18n from '@/i18n/i18n'
import { useFormatMoney } from '@/shared/helpers/formatters/useFormatMoney'
import { useFormatPercentage } from '@/shared/helpers/formatters/useFormatPercentage'
import { ChartGrid } from '@/shared/ui/ChartAxes.view'
import { ChartLabels } from '@/shared/ui/ChartLabels.view'
import { ChartRectangle } from '@/shared/ui/ChartRectangle.view'
import { ChartTooltip } from '@/shared/ui/ChartTooltip.view'
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
    <Surface variant="chart" className="p-4">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <Text
            as="h2"
            variant="label"
            tone="secondary"
            className="flex items-center"
          >
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
              scope={{ account: 'filterable', period: 'as-of', effectiveDate }}
            />
          </Text>
          <Text as="p" variant="caption" tone="subtle" className="mt-0.5">
            {description ??
              i18n.t('ui.concentrationchart.aggregatedAcrossAccounts')}
          </Text>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          {topTenSummary && (
            <Text as="div" align="right">
              <Text as="div" variant="tinyOverline" tone="subtle">
                {i18n.t('ui.concentrationchart.top10Total')}
              </Text>
              <Text
                as="div"
                variant="captionStrong"
                tone="secondary"
                numeric
                className="mt-0.5"
              >
                {formatMoney(topTenSummary.value, { style: 'full' })} ·{' '}
                {formatPercentage(topTenSummary.percentage)}
              </Text>
            </Text>
          )}
        </div>
      </div>
      <div className="overflow-x-auto">
        <div className="min-w-[620px]">
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
        </div>
      </div>
    </Surface>
  )
}

function LeadingHoldingBar(shapeProps: Partial<BarShapeProps>) {
  return (
    <ChartRectangle
      geometry={shapeProps}
      tone={shapeProps.index === 0 ? 'risk' : 'neutralSeries'}
    />
  )
}
