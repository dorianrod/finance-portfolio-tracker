import {
  type BarShapeProps,
  ComposedChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'

import { ScopedInfoTooltip } from '@/domains/portfolio/shared/components/kpis/ScopedInfoTooltip.feature'
import { MonthlyTooltip } from '@/domains/portfolio/shared/components/PortfolioChartTooltips.view'
import type { TrailingSavingCapacityPoint } from '@/domains/portfolio/shared/helpers/calculators/calculatePortfolioCharts'
import type { MonthlyOperationsByMonth } from '@/domains/portfolio/shared/types/monthlyOperation.type'
import i18n from '@/i18n/i18n'
import { useFormatDate } from '@/shared/helpers/formatters/useFormatDate'
import { useFormatMoney } from '@/shared/helpers/formatters/useFormatMoney'
import { ChartGrid, ChartXAxis, ChartYAxis } from '@/shared/ui/ChartAxes.view'
import { ChartRectangle } from '@/shared/ui/ChartRectangle.view'
import { ChartReference } from '@/shared/ui/ChartReference.view'
import type { ChartShapeProps } from '@/shared/ui/chartShape'
import { Decorative } from '@/shared/ui/Controls.view'
import { SeriesBar } from '@/shared/ui/SeriesBar.view'
import { SeriesLine } from '@/shared/ui/SeriesLine.view'
import { Surface } from '@/shared/ui/Surface.view'
import { SeriesSwatch } from '@/shared/ui/Swatch.view'
import { Text } from '@/shared/ui/Text.view'

export function MonthlySavingsChart({
  data,
  ops,
}: {
  data: TrailingSavingCapacityPoint[]
  ops: MonthlyOperationsByMonth
}) {
  const formatDate = useFormatDate()
  const formatMoney = useFormatMoney()
  return (
    <Surface variant="chart" className="flex-1 p-4">
      <Text
        as="h2"
        variant="label"
        tone="muted"
        className="mb-3 flex items-center"
      >
        {i18n.t('ui.monthlysavingschart.monthlyWealthDrivers')}
        <ScopedInfoTooltip
          text={i18n.t(
            'ui.monthlysavingschart.monthlyNetContributionsAndMarketPerformanceWithARolling',
          )}
          scope={{ account: 'filterable', period: 'range-or-trailing-12m' }}
        />
      </Text>
      <ResponsiveContainer width="100%" height={220}>
        <ComposedChart
          data={data}
          margin={{ top: 4, right: 52, left: 0, bottom: 0 }}
          barGap={2}
        >
          <ChartGrid />
          <ChartXAxis
            dataKey="date"
            tickFormatter={(value) =>
              formatDate(value, { style: 'shortMonthShortYear' })
            }
          />
          <ChartYAxis
            yAxisId="left"
            tickFormatter={(value) => formatMoney(value, { style: 'compact' })}

            width={52}
          />
          <ChartYAxis
            yAxisId="right"
            orientation="right"
            tickFormatter={(value) => formatMoney(value, { style: 'compact' })}

            width={52}
          />
          <Tooltip content={<MonthlyTooltip ops={ops} />} />
          <ChartReference yAxisId="left" y={0} kind="zero" />
          <SeriesBar
            yAxisId="left"
            dataKey="savings_delta"
            tone="netContributions"
            corners="top"
          />
          <SeriesBar
            yAxisId="left"
            dataKey="perf_delta"
            tone="performancePositive"
            corners="top"
          >
            <SeriesBar.Shape>
              <MonthlyPerformanceBar />
            </SeriesBar.Shape>
          </SeriesBar>
          <SeriesLine
            yAxisId="right"
            type="monotone"
            dataKey="rolling_12m"
            tone="netContributions"
            weight="regular"
            markers="hidden"
            hover="series"
          />
          <SeriesLine
            yAxisId="right"
            type="monotone"
            dataKey="rolling_perf_12m"
            tone="performance"
            weight="regular"
            markers="hidden"
            hover="series"
          />
        </ComposedChart>
      </ResponsiveContainer>
      <Surface
        variant="captionFooter"
        tone="subtle"
        className="mt-3 grid grid-cols-2 gap-5 pt-3"
      >
        <div>
          <Text as="div" variant="eyebrow" tone="subtle" className="mb-2">
            {i18n.t('ui.monthlysavingschart.monthlyBars')}
          </Text>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <SeriesSwatch
                tone={'netContributions'}
                shape="bar"
                className="h-2.5 w-3"
              />
              <span>{i18n.t('ui.monthlysavingschart.netContributions')}</span>
            </div>
            <div className="flex items-center gap-2">
              <Decorative
                variant="swatchFrame"
                className="flex h-2.5 w-3 overflow-hidden"
              >
                <SeriesSwatch
                  tone={'performancePositive'}
                  as="i"
                  className="h-full w-1/2"
                />
                <SeriesSwatch
                  tone={'performanceNegative'}
                  as="i"
                  className="h-full w-1/2"
                />
              </Decorative>
              <span>{i18n.t('ui.monthlysavingschart.marketPerformance')}</span>
            </div>
          </div>
        </div>
        <div>
          <Text as="div" variant="eyebrow" tone="subtle" className="mb-2">
            {i18n.t('ui.monthlysavingschart.trailing12mLines')}
          </Text>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <SeriesSwatch tone={'netContributions'} className="h-0.5 w-4" />
              <span>{i18n.t('ui.monthlysavingschart.netContributions')}</span>
            </div>
            <div className="flex items-center gap-2">
              <SeriesSwatch tone={'performance'} className="h-0.5 w-4" />
              <span>{i18n.t('ui.monthlysavingschart.marketPerformance')}</span>
            </div>
          </div>
        </div>
      </Surface>
    </Surface>
  )
}

function MonthlyPerformanceBar(
  shapeProps: Partial<
    ChartShapeProps<BarShapeProps, TrailingSavingCapacityPoint>
  >,
) {
  const entry = shapeProps.payload
  if (!entry) return null
  return (
    <ChartRectangle
      geometry={shapeProps}
      tone={
        (entry.perf_delta ?? 0) >= 0
          ? 'performancePositive'
          : 'performanceNegative'
      }
    />
  )
}
