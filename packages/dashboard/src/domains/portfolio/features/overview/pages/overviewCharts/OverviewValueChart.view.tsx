import type { ReactNode } from 'react'
import { LineChart, ResponsiveContainer } from 'recharts'

import type { OverviewComparison } from '@/domains/portfolio/features/overview/helpers/calculators/buildOverviewComparison/buildOverviewComparison.types'
import { ValueTooltip } from '@/domains/portfolio/features/overview/pages/overviewChartDetails/ValueTooltip.view'
import { PORTFOLIO_CHART_TONES } from '@/domains/portfolio/shared/constants/portfolioChartTones'
import i18n from '@/i18n/i18n'
import { useFormatDate } from '@/shared/helpers/formatters/useFormatDate'
import { useFormatMoney } from '@/shared/helpers/formatters/useFormatMoney'
import { ChartGrid } from '@/shared/ui/chartAxes/ChartGrid.view'
import { ChartXAxis } from '@/shared/ui/chartAxes/ChartXAxis.view'
import { ChartYAxis } from '@/shared/ui/chartAxes/ChartYAxis.view'
import { ChartReference } from '@/shared/ui/chartReference/ChartReference.view'
import { ChartReferenceArea } from '@/shared/ui/chartReference/ChartReferenceArea.view'
import { ChartTooltip } from '@/shared/ui/ChartTooltip.view'
import { Inline } from '@/shared/ui/layout/Inline.view'
import { Layout } from '@/shared/ui/layout/Layout.view'
import { SeriesLine } from '@/shared/ui/SeriesLine.view'
import { Surface } from '@/shared/ui/Surface.view'
import { Text } from '@/shared/ui/Text.view'

import { OverviewValueLegend } from './OverviewValueLegend.view'

export function OverviewValueChartView({
  comparison,
  children,
}: {
  comparison: OverviewComparison
  children: ReactNode
}) {
  const formatDate = useFormatDate()
  const formatMoney = useFormatMoney()
  const chartData = comparison.valueHistory.map((point) => ({
    ...point,
    timestamp: point.date.getTime(),
    previousValue: point.window === 'previous' ? point.value : null,
    currentValue: point.window === 'current' ? point.value : null,
  }))
  const domain: [number, number] = [
    comparison.windows.previous.start.getTime(),
    comparison.windows.current.end.getTime(),
  ]
  const currentStart = comparison.windows.current.start.getTime()

  return (
    <div className="xl:col-span-2">
      <Surface as="section" variant="panel">
        <Inline
          as="div"
          flow="wrap"
          spaceAfter="spacious"
          align="start"
          justify="between"
          gap="default"
        >
          <div>
            <Text as="h3" variant="bodyStrong" tone="secondary">
              <Inline as="span" align="center">
                {i18n.t('ui.overviewcharts.portfolioValue')}
                {children}
              </Inline>
            </Text>
            <Layout spaceBefore="compact">
              <Text as="p" variant="caption" tone="subtle">
                {i18n.t(
                  'ui.overviewcharts.grossMarketValueAcrossThePreviousAndCurrentPeriods',
                )}
              </Text>
            </Layout>
          </div>
          <OverviewValueLegend />
        </Inline>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart
            data={chartData}
            margin={{ top: 6, right: 10, left: 0, bottom: 0 }}
          >
            <ChartGrid vertical={false} />
            <ChartReferenceArea
              x1={domain[0]}
              x2={currentStart}
              prominence="muted"
            />
            <ChartReferenceArea
              x1={currentStart}
              x2={domain[1]}
              prominence="highlighted"
            />
            <ChartReference x={currentStart} kind="selected" />
            <ChartXAxis
              density="compact"
              dataKey="timestamp"
              type="number"
              scale="time"
              domain={domain}
              tickFormatter={(value) =>
                formatDate(value, { style: 'dayMonthYear', timeZone: 'UTC' })
              }
              minTickGap={44}
            />
            <ChartYAxis
              tickFormatter={(value) =>
                formatMoney(value, { style: 'compact' })
              }
              width={52}
              domain={['auto', 'auto']}
            />
            <ChartTooltip highlight="line">
              <ValueTooltip />
            </ChartTooltip>
            <SeriesLine
              type="monotone"
              dataKey="previousValue"
              tone={PORTFOLIO_CHART_TONES.neutralSeries}
              weight="regular"
              markers="hidden"
              hover="default"
              motion="none"
            />
            <SeriesLine
              type="monotone"
              dataKey="currentValue"
              tone={PORTFOLIO_CHART_TONES.portfolioValue}
              weight="emphasized"
              markers="hidden"
              hover="default"
              motion="none"
            />
          </LineChart>
        </ResponsiveContainer>
      </Surface>
    </div>
  )
}
