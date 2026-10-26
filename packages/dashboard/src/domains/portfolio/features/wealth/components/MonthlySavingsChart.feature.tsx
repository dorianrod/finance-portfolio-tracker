import {
  type BarShapeProps,
  ComposedChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'

import { MonthlyTooltip } from '@/domains/portfolio/features/wealth/components/WealthChartTooltips.view'
import type { TrailingSavingCapacityPoint } from '@/domains/portfolio/features/wealth/helpers/calculators/wealthCalculations'
import { ScopedInfoTooltip } from '@/domains/portfolio/shared/components/kpis/ScopedInfoTooltip.feature'
import { PORTFOLIO_CHART_TONES } from '@/domains/portfolio/shared/constants/portfolioChartTones'
import type { MonthlyOperationsByMonth } from '@/domains/portfolio/shared/types/monthlyOperation.type'
import i18n from '@/i18n/i18n'
import { useFormatDate } from '@/shared/helpers/formatters/useFormatDate'
import { useFormatMoney } from '@/shared/helpers/formatters/useFormatMoney'
import { ChartGrid, ChartXAxis, ChartYAxis } from '@/shared/ui/ChartAxes.view'
import { ChartRectangle } from '@/shared/ui/ChartRectangle.view'
import { ChartReference } from '@/shared/ui/ChartReference.view'
import type { ChartShapeProps } from '@/shared/ui/chartShape'
import { Inline, Layout } from '@/shared/ui/Layout.view'
import { SeriesBar } from '@/shared/ui/SeriesBar.view'
import { SeriesLine } from '@/shared/ui/SeriesLine.view'
import { Surface } from '@/shared/ui/Surface.view'
import { Text } from '@/shared/ui/Text.view'

import { MonthlySavingsLegend } from './MonthlySavingsLegend.view'

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
    <div className="flex-1">
      <Surface variant="chart">
        <Layout spaceAfter="default">
          <Text as="h2" variant="label" tone="muted">
            <Inline as="span" align="center">
              {i18n.t('ui.monthlysavingschart.monthlyWealthDrivers')}
              <ScopedInfoTooltip
                text={i18n.t(
                  'ui.monthlysavingschart.monthlyNetContributionsAndMarketPerformanceWithARolling',
                )}
                scope={{
                  account: 'filterable',
                  period: 'range-or-trailing-12m',
                }}
              />
            </Inline>
          </Text>
        </Layout>
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
              tickFormatter={(value) =>
                formatMoney(value, { style: 'compact' })
              }
              width={52}
            />
            <ChartYAxis
              yAxisId="right"
              orientation="right"
              tickFormatter={(value) =>
                formatMoney(value, { style: 'compact' })
              }
              width={52}
            />
            <Tooltip content={<MonthlyTooltip ops={ops} />} />
            <ChartReference yAxisId="left" y={0} kind="zero" />
            <SeriesBar
              yAxisId="left"
              dataKey="savings_delta"
              tone={PORTFOLIO_CHART_TONES.netContributions}
              corners="top"
            />
            <SeriesBar
              yAxisId="left"
              dataKey="perf_delta"
              tone={PORTFOLIO_CHART_TONES.performancePositive}
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
              tone={PORTFOLIO_CHART_TONES.netContributions}
              weight="regular"
              markers="hidden"
              hover="series"
            />
            <SeriesLine
              yAxisId="right"
              type="monotone"
              dataKey="rolling_perf_12m"
              tone={PORTFOLIO_CHART_TONES.performance}
              weight="regular"
              markers="hidden"
              hover="series"
            />
          </ComposedChart>
        </ResponsiveContainer>
        <MonthlySavingsLegend />
      </Surface>
    </div>
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
          ? PORTFOLIO_CHART_TONES.performancePositive
          : PORTFOLIO_CHART_TONES.performanceNegative
      }
    />
  )
}
